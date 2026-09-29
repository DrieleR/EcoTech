import { Router } from "express"
import { z } from "zod"
import { pool, transacao } from "../db.ts"
import { enviarEmail } from "../email.ts"
import { urlDoSite } from "../site.ts"
import {
  ErroHttp,
  conferirSenha,
  criarSessao,
  exigirLogin,
  gerarHashSenha,
  hashToken,
  limitarTentativas,
  novoToken,
} from "../seguranca.ts"
import { esquemaSenha, validar } from "../validacao.ts"

export const rotasAuth = Router()

// Mesma resposta para e-mail inexistente, senha errada ou conta sem senha
const CREDENCIAIS_INVALIDAS = new ErroHttp(401, "Credenciais inválidas. Confira seu e-mail e senha.")
const VALIDADE_LINK_MIN = 30

// Aceita qualquer texto no login: um e-mail "mal formatado" também deve
// receber "credenciais inválidas", sem uma mensagem diferente.
const esquemaLogin = z.object({ email: z.string().max(254), senha: z.string().max(200) })

rotasAuth.post(
  "/login",
  limitarTentativas({ maximo: 200, janelaMin: 15 }),
  limitarTentativas({ maximo: 10, janelaMin: 15, porEmail: true }),
  async (req, res) => {
    const { email, senha } = validar(esquemaLogin, req.body)
    const { rows } = await pool.query(
      "select id, nome, email, perfil, senha_hash from usuarios where email = $1",
      [email.trim().toLowerCase()]
    )
    const conta = rows[0]
    // Confere a senha mesmo sem conta, para o tempo de resposta ser igual
    const senhaOk = await conferirSenha(senha, conta?.senha_hash ?? null)
    if (!conta || !senhaOk) throw CREDENCIAIS_INVALIDAS

    const token = await criarSessao(conta.id)
    res.json({ token, usuario: { id: conta.id, nome: conta.nome, email: conta.email, perfil: conta.perfil } })
  }
)

rotasAuth.get("/me", exigirLogin(), (req, res) => {
  res.json(req.usuario)
})

rotasAuth.post("/logout", exigirLogin(), async (req, res) => {
  await pool.query("delete from sessoes where token_hash = $1", [req.tokenHash])
  res.status(204).end()
})

// Sempre 204, exista ou não a conta. A diferença só aparece na caixa de
// entrada de quem é dono do e-mail.
rotasAuth.post(
  "/esqueci-senha",
  limitarTentativas({ maximo: 100, janelaMin: 15 }),
  limitarTentativas({ maximo: 3, janelaMin: 15, porEmail: true }),
  (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : ""
    // Responde antes de consultar o banco: assim o tempo de resposta é o mesmo
    // com ou sem conta, e o trabalho de verdade segue em segundo plano.
    res.status(204).end()
    enviarLinkRedefinicao(email).catch((erro) => console.error("[esqueci-senha] Falha:", erro))
  }
)

async function enviarLinkRedefinicao(email: string) {
  const { rows } = await pool.query("select id, email from usuarios where email = $1", [email])
  const conta = rows[0]
  if (!conta) return

  const token = novoToken()
  await pool.query(
    `insert into redefinicoes_senha (token_hash, usuario_id, expira_em)
     values ($1, $2, now() + make_interval(mins => $3))`,
    [hashToken(token), conta.id, VALIDADE_LINK_MIN]
  )
  const link = `${urlDoSite()}/redefinir-senha?token=${token}`
  await enviarEmail(
    conta.email,
    "Crie uma nova senha",
    `Recebemos um pedido para trocar a senha da sua conta.\nAbra o link em até ${VALIDADE_LINK_MIN} minutos:\n${link}\n\nSe não foi você, ignore este e-mail.`
  )
}

rotasAuth.post("/redefinir-senha", limitarTentativas({ maximo: 50, janelaMin: 15 }), async (req, res) => {
  const { token, senha } = validar(z.object({ token: z.string().max(200), senha: esquemaSenha }), req.body)
  const hash = await gerarHashSenha(senha)

  await transacao(async (db) => {
    // "delete ... returning" usa o link e já o invalida numa tacada só
    const { rows } = await db.query(
      "delete from redefinicoes_senha where token_hash = $1 and expira_em > now() returning usuario_id",
      [hashToken(token)]
    )
    const usuarioId = rows[0]?.usuario_id
    if (!usuarioId) throw new ErroHttp(410, "Este link expirou ou já foi usado. Peça um novo.")

    await db.query("update usuarios set senha_hash = $1 where id = $2", [hash, usuarioId])
    // Derruba as sessões abertas com a senha antiga e outros links pendentes
    await db.query("delete from sessoes where usuario_id = $1", [usuarioId])
    await db.query("delete from redefinicoes_senha where usuario_id = $1", [usuarioId])
  })
  res.status(204).end()
})
