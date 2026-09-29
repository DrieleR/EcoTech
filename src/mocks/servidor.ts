// "Servidor" falso usado enquanto o backend (Neon/Postgres) não existe.
// Cada função aqui corresponde a um endpoint da API e aplica as mesmas
// regras que o backend real vai precisar aplicar: senha com hash, resposta
// única para login inválido, checagem de perfil pelo token (e não pelo que
// está salvo no navegador) e validação de vagas/horários.
// Os dados ficam no localStorage para sobreviver a um recarregamento.

import type { LoginResposta, Perfil, Usuario } from "../types/auth"
import type {
  AtividadeComVagas,
  AtividadeEvento,
  DadosEvento,
  DadosParticipante,
  Inscricao,
  NovaInscricao,
} from "../types/inscricao"
import { calcularTotal, validarSelecao } from "../helpers/atividades"
import { dentroDoPrazo } from "../helpers/formatar"
import { TAMANHO_MINIMO_SENHA } from "../consts/inscricao"
import { ATIVIDADES_MOCK, EVENTO_MOCK, INSCRITOS_MOCK, USUARIOS_MOCK } from "./mock"

interface UsuarioBanco extends Usuario {
  salt: string
  senhaHash: string
}

interface Banco {
  usuarios: UsuarioBanco[]
  inscricoes: Inscricao[]
  atividades: AtividadeEvento[]
  evento: DadosEvento
  tokens: Record<string, string>
  // Pedidos de nova senha: hash do token do link -> dono e validade
  redefinicoes?: Record<string, { usuarioId: string; expiraEm: number }>
  // Cobranças Pix: token do QR Code -> id da inscrição
  cobrancas?: Record<string, string>
  sequencia: number
}

// Mude a versão quando o formato dos dados mudar, para descartar dados antigos
const CHAVE_BANCO = "ecotech:mock-banco:v1"
const MSG_CREDENCIAIS = "Credenciais inválidas. Confira seu e-mail e senha."
const MSG_SESSAO = "Sua sessão expirou. Entre novamente."
const VALIDADE_LINK_MS = 30 * 60 * 1000

// ---------- infraestrutura ----------

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function gerarHash(senha: string, salt: string) {
  const bytes = new TextEncoder().encode(`${salt}:${senha}`)
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("")
}

const novoId = () => crypto.randomUUID()
const normalizarEmail = (email: string) => email.trim().toLowerCase()
const numeroInscricao = (ano: number, seq: number) => `ESA-${ano}-${String(seq).padStart(4, "0")}`

async function criarBancoInicial(): Promise<Banco> {
  const usuarios: UsuarioBanco[] = []
  for (const u of USUARIOS_MOCK) {
    const salt = novoId()
    usuarios.push({ id: u.id, nome: u.nome, email: u.email, perfil: u.perfil, salt, senhaHash: await gerarHash(u.senha, salt) })
  }

  const evento = { ...EVENTO_MOCK }
  const inscricoes: Inscricao[] = INSCRITOS_MOCK.map((item, i) => {
    let usuario = usuarios.find((u) => u.email === item.participante.email)
    if (!usuario) {
      // Inscritos de exemplo sem senha: hash vazio nunca bate com nenhum login
      usuario = { id: novoId(), nome: item.participante.nome, email: item.participante.email, perfil: "participante", salt: "", senhaHash: "" }
      usuarios.push(usuario)
    }
    return {
      id: novoId(),
      numero: numeroInscricao(2026, 136 + i),
      usuarioId: usuario.id,
      criadaEm: item.criadaEm,
      status: "confirmada",
      pagoEm: item.criadaEm,
      participante: item.participante,
      atividadesIds: item.atividadesIds,
      valorTotal: calcularTotal(evento, ATIVIDADES_MOCK, item.atividadesIds),
    }
  })

  return {
    usuarios,
    inscricoes,
    atividades: ATIVIDADES_MOCK.map((a) => ({ ...a })),
    evento,
    tokens: {},
    sequencia: 136 + inscricoes.length,
  }
}

let cache: Banco | null = null

async function banco(): Promise<Banco> {
  if (cache) return cache
  try {
    const salvo = localStorage.getItem(CHAVE_BANCO)
    if (salvo) cache = JSON.parse(salvo) as Banco
  } catch {
    cache = null
  }
  if (!cache) {
    cache = await criarBancoInicial()
    salvar()
  }
  return cache
}

function salvar() {
  try {
    localStorage.setItem(CHAVE_BANCO, JSON.stringify(cache))
  } catch {
    // sem armazenamento: os dados duram só até recarregar a página
  }
}

// Simula a latência da rede em todas as chamadas
async function chamada<T>(fn: (db: Banco) => T | Promise<T>): Promise<T> {
  await esperar(400)
  const db = await banco()
  const resultado = await fn(db)
  salvar()
  // Cópia profunda: quem chama não pode alterar o "banco" por referência
  return structuredClone(resultado)
}

function usuarioDoToken(db: Banco, token: string | undefined, perfil?: Perfil) {
  const id = token ? db.tokens[token] : undefined
  const usuario = db.usuarios.find((u) => u.id === id)
  if (!usuario) throw new Error(MSG_SESSAO)
  // O perfil vem do banco, nunca do navegador
  if (perfil && usuario.perfil !== perfil) throw new Error("Acesso não permitido.")
  return usuario
}

const publico = ({ id, nome, email, perfil }: UsuarioBanco): Usuario => ({ id, nome, email, perfil })

function comVagas(db: Banco): AtividadeComVagas[] {
  return db.atividades.map((a) => ({
    ...a,
    // Pendentes também seguram a vaga enquanto aguardam o pagamento
    ocupadas: db.inscricoes.filter((i) => i.status !== "cancelada" && i.atividadesIds.includes(a.id)).length,
  }))
}

function validarParticipante(dados: DadosParticipante) {
  if (!dados.nome.trim()) throw new Error("Informe o nome completo.")
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())) throw new Error("Informe um e-mail válido.")
  if (dados.telefone.replace(/\D/g, "").length < 10) throw new Error("Informe um telefone válido.")
}

function inscricaoAtiva(db: Banco, usuarioId: string) {
  const inscricao = db.inscricoes.find((i) => i.usuarioId === usuarioId)
  if (!inscricao) throw new Error("Inscrição não encontrada.")
  return inscricao
}

// ---------- autenticação ----------

export function login(email: string, senha: string): Promise<LoginResposta> {
  return chamada(async (db) => {
    const usuario = db.usuarios.find((u) => u.email === normalizarEmail(email))
    // Calcula o hash mesmo quando o e-mail não existe, para o tempo de
    // resposta não denunciar quais e-mails têm conta.
    const hash = await gerarHash(senha, usuario?.salt ?? "salt-inexistente")
    if (!usuario || !usuario.senhaHash || usuario.senhaHash !== hash) {
      throw new Error(MSG_CREDENCIAIS)
    }
    const token = novoId()
    db.tokens[token] = usuario.id
    return { token, usuario: publico(usuario) }
  })
}

// Responde sempre do mesmo jeito, exista ou não uma conta com o e-mail.
// O único lugar onde a diferença aparece é a caixa de entrada do dono.
export function solicitarRedefinicaoSenha(email: string): Promise<void> {
  return chamada(async (db) => {
    const usuario = db.usuarios.find((u) => u.email === normalizarEmail(email))
    const token = novoId()
    // Faz o mesmo trabalho nos dois casos, para o tempo não denunciar nada
    const hash = await gerarHash(token, "redefinicao")
    if (!usuario) return

    db.redefinicoes ??= {}
    db.redefinicoes[hash] = { usuarioId: usuario.id, expiraEm: Date.now() + VALIDADE_LINK_MS }
    // Simula o e-mail: no backend real isso vai para a caixa de entrada
    console.info(
      `[mock] E-mail de redefinição para ${usuario.email}: ${location.origin}/redefinir-senha?token=${token}`
    )
  })
}

export function redefinirSenha(token: string, senha: string): Promise<void> {
  return chamada(async (db) => {
    if (senha.length < TAMANHO_MINIMO_SENHA) {
      throw new Error(`A senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`)
    }
    const hash = await gerarHash(token, "redefinicao")
    const pedido = db.redefinicoes?.[hash]
    const usuario = db.usuarios.find((u) => u.id === pedido?.usuarioId)
    if (!pedido || !usuario || pedido.expiraEm < Date.now()) {
      throw new Error("Este link expirou ou já foi usado. Peça um novo.")
    }

    usuario.salt = novoId()
    usuario.senhaHash = await gerarHash(senha, usuario.salt)
    // O link só vale uma vez, e as sessões abertas com a senha antiga caem
    delete db.redefinicoes![hash]
    for (const [t, id] of Object.entries(db.tokens)) {
      if (id === usuario.id) delete db.tokens[t]
    }
  })
}

export function me(token: string | undefined): Promise<Usuario> {
  return chamada((db) => publico(usuarioDoToken(db, token)))
}

export function logout(token: string | undefined) {
  return chamada((db) => {
    if (token) delete db.tokens[token]
  })
}

// ---------- público ----------

export function obterEvento() {
  return chamada((db) => db.evento)
}

export function listarAtividades() {
  return chamada((db) => comVagas(db))
}

export function criarInscricao(nova: NovaInscricao): Promise<{ sessao: LoginResposta; inscricao: Inscricao }> {
  return chamada(async (db) => {
    const email = normalizarEmail(nova.participante.email)
    validarParticipante(nova.participante)
    if (nova.senha.length < TAMANHO_MINIMO_SENHA) {
      throw new Error(`A senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`)
    }
    if (db.usuarios.some((u) => u.email === email)) {
      throw new Error("Não foi possível concluir a inscrição com este e-mail. Se você já se inscreveu, entre na sua conta.")
    }
    const erro = validarSelecao(comVagas(db), nova.atividadesIds)
    if (erro) throw new Error(erro)

    const salt = novoId()
    const usuario: UsuarioBanco = {
      id: novoId(),
      nome: nova.participante.nome.trim(),
      email,
      perfil: "participante",
      salt,
      senhaHash: await gerarHash(nova.senha, salt),
    }
    db.usuarios.push(usuario)

    db.sequencia += 1
    const inscricao: Inscricao = {
      id: novoId(),
      numero: numeroInscricao(new Date().getFullYear(), db.sequencia),
      usuarioId: usuario.id,
      criadaEm: new Date().toISOString(),
      participante: { ...nova.participante, email, nome: usuario.nome },
      atividadesIds: nova.atividadesIds,
      valorTotal: calcularTotal(db.evento, db.atividades, nova.atividadesIds),
      status: "pendente",
    }
    // Inscrição gratuita não passa pelo pagamento
    if (inscricao.valorTotal === 0) inscricao.status = "confirmada"
    db.inscricoes.push(inscricao)

    const token = novoId()
    db.tokens[token] = usuario.id
    return { sessao: { token, usuario: publico(usuario) }, inscricao }
  })
}

// ---------- participante ----------

export function minhaInscricao(token: string | undefined) {
  return chamada((db) => {
    const usuario = usuarioDoToken(db, token, "participante")
    return db.inscricoes.find((i) => i.usuarioId === usuario.id) ?? null
  })
}

export function atualizarMeusDados(token: string | undefined, dados: DadosParticipante) {
  return chamada((db) => {
    const usuario = usuarioDoToken(db, token, "participante")
    const inscricao = inscricaoAtiva(db, usuario.id)
    validarParticipante(dados)

    const email = normalizarEmail(dados.email)
    if (email !== usuario.email && db.usuarios.some((u) => u.email === email)) {
      throw new Error("Não foi possível usar este e-mail. Tente outro.")
    }
    usuario.nome = dados.nome.trim()
    usuario.email = email
    inscricao.participante = { ...dados, nome: usuario.nome, email }
    return { inscricao, usuario: publico(usuario) }
  })
}

export function trocarAtividades(token: string | undefined, ids: string[]) {
  return chamada((db) => {
    const usuario = usuarioDoToken(db, token, "participante")
    const inscricao = inscricaoAtiva(db, usuario.id)
    if (inscricao.status === "cancelada") throw new Error("Esta inscrição foi cancelada.")
    if (inscricao.status === "pendente") throw new Error("Conclua o pagamento antes de trocar os minicursos.")
    if (!dentroDoPrazo(db.evento.prazoTrocaAtividades)) throw new Error("O prazo para trocar minicursos terminou.")

    const erro = validarSelecao(comVagas(db), ids, inscricao.atividadesIds)
    if (erro) throw new Error(erro)

    inscricao.atividadesIds = ids
    inscricao.valorTotal = calcularTotal(db.evento, db.atividades, ids)
    return inscricao
  })
}

// ---------- pagamento (simulado) ----------

export function obterCobranca(token: string | undefined) {
  return chamada((db) => {
    const usuario = usuarioDoToken(db, token, "participante")
    const inscricao = inscricaoAtiva(db, usuario.id)
    if (inscricao.status !== "pendente") throw new Error("Esta inscrição não tem pagamento pendente.")
    db.cobrancas = Object.fromEntries(Object.entries(db.cobrancas ?? {}).filter(([, id]) => id !== inscricao.id))
    const tokenPix = novoId()
    db.cobrancas[tokenPix] = inscricao.id
    return { valor: inscricao.valorTotal, url: `${location.origin}/pagamento/simular?token=${tokenPix}` }
  })
}

export function simularPagamento(tokenPix: string) {
  return chamada((db) => {
    const inscricao = db.inscricoes.find((i) => i.id === db.cobrancas?.[tokenPix] && i.status === "pendente")
    if (!inscricao) throw new Error("Este QR Code não é mais válido. Gere um novo na tela de pagamento.")
    inscricao.status = "confirmada"
    inscricao.pagoEm = new Date().toISOString()
    delete db.cobrancas![tokenPix]
    return { numero: inscricao.numero, valor: inscricao.valorTotal }
  })
}

export function cancelarInscricao(token: string | undefined) {
  return chamada((db) => {
    const usuario = usuarioDoToken(db, token, "participante")
    const inscricao = inscricaoAtiva(db, usuario.id)
    if (inscricao.status === "cancelada") throw new Error("Esta inscrição já foi cancelada.")
    if (!dentroDoPrazo(db.evento.dataInicio)) throw new Error("Não é possível cancelar depois do início do evento.")

    inscricao.status = "cancelada"
    inscricao.canceladaEm = new Date().toISOString()
    // Só há reembolso se a pessoa chegou a pagar e cancelou dentro do prazo
    inscricao.reembolso = !!inscricao.pagoEm && dentroDoPrazo(db.evento.prazoReembolso)
    return inscricao
  })
}

// ---------- administrador ----------

export function listarInscritos(token: string | undefined) {
  return chamada((db) => {
    usuarioDoToken(db, token, "admin")
    return [...db.inscricoes].sort((a, b) => b.criadaEm.localeCompare(a.criadaEm))
  })
}

export function salvarAtividade(token: string | undefined, atividade: Omit<AtividadeEvento, "id"> & { id?: string }) {
  return chamada((db) => {
    usuarioDoToken(db, token, "admin")
    if (!atividade.titulo.trim()) throw new Error("Informe o título da atividade.")
    if (atividade.inicio >= atividade.fim) throw new Error("O horário de término precisa ser depois do início.")
    if (atividade.vagas < 1) throw new Error("Informe pelo menos 1 vaga.")
    if (atividade.valor < 0) throw new Error("O valor não pode ser negativo.")

    if (atividade.id) {
      const existente = db.atividades.find((a) => a.id === atividade.id)
      if (!existente) throw new Error("Atividade não encontrada.")
      const ocupadas = comVagas(db).find((a) => a.id === atividade.id)!.ocupadas
      if (atividade.vagas < ocupadas) {
        throw new Error(`Já existem ${ocupadas} inscritos nesta atividade; as vagas não podem ser menores que isso.`)
      }
      Object.assign(existente, atividade)
      return existente
    }
    const nova = { ...atividade, id: novoId() }
    db.atividades.push(nova)
    return nova
  })
}

export function excluirAtividade(token: string | undefined, id: string) {
  return chamada((db) => {
    usuarioDoToken(db, token, "admin")
    const usada = db.inscricoes.some((i) => i.status !== "cancelada" && i.atividadesIds.includes(id))
    if (usada) throw new Error("Há inscritos nesta atividade. Remova as inscrições antes de excluí-la.")
    db.atividades = db.atividades.filter((a) => a.id !== id)
  })
}

export function atualizarEvento(token: string | undefined, evento: DadosEvento) {
  return chamada((db) => {
    usuarioDoToken(db, token, "admin")
    if (!evento.nome.trim()) throw new Error("Informe o nome do evento.")
    if (evento.dataFim < evento.dataInicio) throw new Error("A data de término precisa ser depois do início.")
    if (evento.prazoReembolso > evento.dataInicio) throw new Error("O prazo de reembolso precisa ser antes do evento.")
    if (evento.valorInscricao < 0) throw new Error("O valor da inscrição não pode ser negativo.")
    db.evento = evento
    return db.evento
  })
}
