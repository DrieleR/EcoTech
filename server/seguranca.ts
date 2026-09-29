import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"
import type { NextFunction, Request, Response } from "express"
import { pool, type Conexao } from "./db.ts"
import type { Perfil, Usuario } from "../src/types/auth.ts"

const scryptAsync = promisify(scrypt) as (senha: string, salt: Buffer, tamanho: number) => Promise<Buffer>

// ---------- senhas ----------

// Formato guardado: "scrypt$<salt>$<hash>" (hex). scrypt é lento de propósito,
// o que dificulta testar milhões de senhas se o banco vazar.
export async function gerarHashSenha(senha: string) {
  const salt = randomBytes(16)
  const hash = await scryptAsync(senha, salt, 64)
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`
}

// Hash de uma senha qualquer, usado quando o e-mail não existe: assim o login
// demora o mesmo tempo nos dois casos e não denuncia quais e-mails têm conta.
const HASH_FALSO = `scrypt$${"0".repeat(32)}$${"0".repeat(128)}`

export async function conferirSenha(senha: string, guardado: string | null) {
  const [, saltHex, hashHex] = (guardado ?? HASH_FALSO).split("$")
  const esperado = Buffer.from(hashHex, "hex")
  const calculado = await scryptAsync(senha, Buffer.from(saltHex, "hex"), 64)
  return guardado !== null && timingSafeEqual(esperado, calculado)
}

// ---------- tokens ----------

export const novoToken = () => randomBytes(32).toString("base64url")
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex")

const VALIDADE_SESSAO_DIAS = 7

export async function criarSessao(usuarioId: string, conexao: Conexao = pool) {
  const token = novoToken()
  await conexao.query(
    `insert into sessoes (token_hash, usuario_id, expira_em)
     values ($1, $2, now() + make_interval(days => $3))`,
    [hashToken(token), usuarioId, VALIDADE_SESSAO_DIAS]
  )
  return token
}

// ---------- autenticação das rotas ----------

export class ErroHttp extends Error {
  status: number
  constructor(status: number, mensagem: string) {
    super(mensagem)
    this.status = status
  }
}

declare module "express-serve-static-core" {
  interface Request {
    usuario?: Usuario
    tokenHash?: string
  }
}

// Lê o "Authorization: Bearer <token>" e descobre de quem é a sessão.
// O perfil vem sempre do banco, nunca do que o navegador diz.
export function exigirLogin(perfil?: Perfil) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1]
    if (!token) return next(new ErroHttp(401, "Sua sessão expirou. Entre novamente."))

    const tokenHash = hashToken(token)
    const { rows } = await pool.query<Usuario>(
      `select u.id, u.nome, u.email, u.perfil
         from sessoes s join usuarios u on u.id = s.usuario_id
        where s.token_hash = $1 and s.expira_em > now()`,
      [tokenHash]
    )
    const usuario = rows[0]
    if (!usuario) return next(new ErroHttp(401, "Sua sessão expirou. Entre novamente."))
    if (perfil && usuario.perfil !== perfil) return next(new ErroHttp(403, "Acesso não permitido."))

    req.usuario = usuario
    req.tokenHash = tokenHash
    next()
  }
}

// ---------- limite de tentativas ----------

// Conta pedidos numa janela de tempo. Por padrão a chave é o IP; dá para
// combinar com o e-mail (ex.: login) para proteger cada conta sem bloquear
// uma rede inteira — no evento, muita gente usa a mesma rede da universidade.
// Fica na memória do processo: serve para um servidor só. Com várias
// instâncias, trocar por Redis/banco.
export function limitarTentativas({
  maximo,
  janelaMin,
  porEmail = false,
}: {
  maximo: number
  janelaMin: number
  porEmail?: boolean
}) {
  const contagem = new Map<string, { total: number; zeraEm: number }>()
  return (req: Request, _res: Response, next: NextFunction) => {
    const agora = Date.now()
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : ""
    const chave = `${req.ip ?? "?"}${porEmail ? `|${email}` : ""}`

    // Limpeza simples para o mapa não crescer para sempre
    if (contagem.size > 10_000) {
      for (const [k, v] of contagem) if (v.zeraEm < agora) contagem.delete(k)
    }

    const atual = contagem.get(chave)
    if (!atual || atual.zeraEm < agora) {
      contagem.set(chave, { total: 1, zeraEm: agora + janelaMin * 60_000 })
      return next()
    }
    atual.total += 1
    if (atual.total > maximo) {
      return next(new ErroHttp(429, "Muitas tentativas. Aguarde um pouco e tente novamente."))
    }
    next()
  }
}
