import { Router } from "express"
import { pool, transacao } from "../db.ts"
import {
  ErroHttp,
  criarSessao,
  exigirLogin,
  gerarHashSenha,
  hashToken,
  limitarTentativas,
  novoToken,
} from "../seguranca.ts"
import { urlDoSite } from "../site.ts"
import {
  confirmarPagamento,
  eventoEncerrado,
  obterSite,
  obterSobre,
  inscricaoDoUsuario,
  listarAtividades,
  obterEvento,
  salvarAtividadesDaInscricao,
} from "../repositorio.ts"
import { esquemaNovaInscricao, esquemaParticipante, esquemaTrocaAtividades, validar } from "../validacao.ts"
import { calcularTotal, validarSelecao } from "../../src/helpers/atividades.ts"
import { dentroDoPrazo } from "../../src/helpers/formatar.ts"

// ---------- público ----------

export const rotasPublicas = Router()

rotasPublicas.get("/evento", async (_req, res) => {
  res.json(await obterEvento())
})

rotasPublicas.get("/site", async (_req, res) => {
  res.json(await obterSite())
})

rotasPublicas.get("/sobre", async (_req, res) => {
  res.json(await obterSobre())
})

rotasPublicas.get("/atividades", async (_req, res) => {
  res.json(await listarAtividades())
})

// Cria a conta e a inscrição juntas e já devolve a sessão
rotasPublicas.post("/inscricoes", limitarTentativas({ maximo: 300, janelaMin: 60 }), async (req, res) => {
  const { participante, senha, atividadesIds } = validar(esquemaNovaInscricao, req.body)
  const senhaHash = await gerarHashSenha(senha)

  const resultado = await transacao(async (db) => {
    if (await eventoEncerrado(db)) throw new ErroHttp(409, "As inscrições deste evento foram encerradas.")
    const evento = await obterEvento(db)
    // Trava as atividades para ninguém pegar a última vaga ao mesmo tempo
    const atividades = await listarAtividades(db, true)
    const erro = validarSelecao(atividades, atividadesIds)
    if (erro) throw new ErroHttp(409, erro)

    const conta = await db.query(
      `insert into usuarios (nome, email, senha_hash) values ($1, $2, $3)
       on conflict (email) do nothing
       returning id, nome, email, perfil`,
      [participante.nome, participante.email, senhaHash]
    )
    const usuario = conta.rows[0]
    if (!usuario) {
      throw new ErroHttp(
        409,
        "Não foi possível concluir a inscrição com este e-mail. Se você já se inscreveu, entre na sua conta."
      )
    }

    const numero = await db.query("select nextval('inscricoes_numero_seq') as n")
    const valorTotal = calcularTotal(evento, atividades, atividadesIds)
    // Com valor a pagar, a inscrição espera o pagamento; se for gratuita, já confirma
    const { rows } = await db.query(
      `insert into inscricoes (numero, usuario_id, telefone, categoria, detalhes, pcd, recursos, outro_recurso,
                               valor_total, status)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning id`,
      [
        `ESA-${new Date().getFullYear()}-${String(numero.rows[0].n).padStart(4, "0")}`,
        usuario.id,
        participante.telefone,
        participante.categoria,
        participante.detalhes,
        participante.pcd,
        participante.recursos,
        participante.outroRecurso,
        valorTotal,
        valorTotal > 0 ? "pendente" : "confirmada",
      ]
    )
    await salvarAtividadesDaInscricao(db, rows[0].id, atividadesIds)

    const token = await criarSessao(usuario.id, db)
    return { sessao: { token, usuario }, inscricao: await inscricaoDoUsuario(usuario.id, db) }
  })

  res.status(201).json(resultado)
})

// ---------- participante logado ----------

export const rotasParticipante = Router()
rotasParticipante.use(exigirLogin("participante"))

async function inscricaoOu404(usuarioId: string) {
  const inscricao = await inscricaoDoUsuario(usuarioId)
  if (!inscricao) throw new ErroHttp(404, "Inscrição não encontrada.")
  return inscricao
}

rotasParticipante.get("/", async (req, res) => {
  res.json(await inscricaoDoUsuario(req.usuario!.id))
})

// Gera a cobrança da inscrição pendente. Cada chamada cria um token novo
// (o QR anterior deixa de valer); no banco fica só o hash dele.
rotasParticipante.get("/pagamento", async (req, res) => {
  const inscricao = await inscricaoOu404(req.usuario!.id)
  if (inscricao.status !== "pendente") throw new ErroHttp(409, "Esta inscrição não tem pagamento pendente.")

  const token = novoToken()
  await pool.query("update inscricoes set pagamento_token_hash = $1 where id = $2", [hashToken(token), inscricao.id])
  res.json({ valor: inscricao.valorTotal, url: `${urlDoSite(req)}/pagamento/simular?token=${token}` })
})

rotasParticipante.put("/dados", async (req, res) => {
  const dados = validar(esquemaParticipante, req.body)
  const usuarioId = req.usuario!.id
  await inscricaoOu404(usuarioId)

  const usuario = await transacao(async (db) => {
    const conta = await db.query(
      `update usuarios set nome = $1, email = $2 where id = $3
         and not exists (select 1 from usuarios where email = $2 and id <> $3)
       returning id, nome, email, perfil`,
      [dados.nome, dados.email, usuarioId]
    )
    if (!conta.rows[0]) throw new ErroHttp(409, "Não foi possível usar este e-mail. Tente outro.")

    await db.query(
      `update inscricoes set telefone = $1, categoria = $2, detalhes = $3, pcd = $4, recursos = $5, outro_recurso = $6
        where usuario_id = $7`,
      [dados.telefone, dados.categoria, dados.detalhes, dados.pcd, dados.recursos, dados.outroRecurso, usuarioId]
    )
    return conta.rows[0]
  })

  res.json({ inscricao: await inscricaoDoUsuario(usuarioId), usuario })
})

rotasParticipante.put("/atividades", async (req, res) => {
  const { atividadesIds } = validar(esquemaTrocaAtividades, req.body)
  const usuarioId = req.usuario!.id

  await transacao(async (db) => {
    const inscricao = await inscricaoDoUsuario(usuarioId, db)
    if (!inscricao) throw new ErroHttp(404, "Inscrição não encontrada.")
    if (inscricao.status === "cancelada") throw new ErroHttp(409, "Esta inscrição foi cancelada.")
    if (inscricao.status === "pendente") {
      throw new ErroHttp(409, "Conclua o pagamento antes de trocar os minicursos.")
    }

    const evento = await obterEvento(db)
    if (!dentroDoPrazo(evento.prazoTrocaAtividades)) {
      throw new ErroHttp(409, "O prazo para trocar minicursos terminou.")
    }

    const atividades = await listarAtividades(db, true)
    const erro = validarSelecao(atividades, atividadesIds, inscricao.atividadesIds)
    if (erro) throw new ErroHttp(409, erro)

    await salvarAtividadesDaInscricao(db, inscricao.id, atividadesIds)
    await db.query("update inscricoes set valor_total = $1 where id = $2", [
      calcularTotal(evento, atividades, atividadesIds),
      inscricao.id,
    ])
  })

  res.json(await inscricaoDoUsuario(usuarioId))
})

rotasParticipante.post("/cancelar", async (req, res) => {
  const usuarioId = req.usuario!.id
  const inscricao = await inscricaoOu404(usuarioId)
  if (inscricao.status === "cancelada") throw new ErroHttp(409, "Esta inscrição já foi cancelada.")

  const evento = await obterEvento()
  if (!dentroDoPrazo(evento.dataInicio)) {
    throw new ErroHttp(409, "Não é possível cancelar depois do início do evento.")
  }

  // Só há reembolso se a pessoa chegou a pagar e cancelou dentro do prazo
  await pool.query(
    `update inscricoes set status = 'cancelada', cancelada_em = now(), pagamento_token_hash = null,
            reembolso = $1
      where id = $2`,
    [!!inscricao.pagoEm && dentroDoPrazo(evento.prazoReembolso), inscricao.id]
  )
  res.json(await inscricaoDoUsuario(usuarioId))
})

// ---------- pagamento simulado ----------

// Página aberta pelo QR Code no celular. Enquanto não há um provedor de Pix,
// ler o QR já aprova o pagamento. SÓ liga com PAGAMENTO_SIMULADO=true:
// em produção isso deixaria qualquer um se inscrever sem pagar.
export const rotasPagamento = Router()

rotasPagamento.post("/simular", limitarTentativas({ maximo: 60, janelaMin: 15 }), async (req, res) => {
  if (process.env.PAGAMENTO_SIMULADO !== "true") throw new ErroHttp(404, "Rota não encontrada.")
  const token = typeof req.body?.token === "string" ? req.body.token : ""

  const resultado = await transacao(async (db) => {
    const { rows } = await db.query(
      "select id, numero, valor_total from inscricoes where pagamento_token_hash = $1 and status = 'pendente' for update",
      [hashToken(token)]
    )
    const inscricao = rows[0]
    if (!inscricao || !(await confirmarPagamento(db, inscricao.id))) {
      throw new ErroHttp(410, "Este QR Code não é mais válido. Gere um novo na tela de pagamento.")
    }
    return { numero: inscricao.numero, valor: inscricao.valor_total }
  })
  res.json(resultado)
})
