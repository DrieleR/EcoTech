import { get, post, put } from "./api"
import { comTratamento } from "./erros"
import { lerSessao } from "../helpers/sessao"
import type { LoginResposta, Usuario } from "../types/auth"
import type {
  AtividadeComVagas,
  CobrancaPix,
  DadosEvento,
  DadosParticipante,
  Inscricao,
  NovaInscricao,
} from "../types/inscricao"
import { USAR_MOCK } from "../mocks/mock"
import * as servidorMock from "../mocks/servidor"

const token = () => lerSessao()?.token

// ---------- público ----------

export function obterEvento(): Promise<DadosEvento> {
  if (USAR_MOCK) return servidorMock.obterEvento()
  return comTratamento(() => get<DadosEvento>("/evento"))
}

export function listarAtividades(): Promise<AtividadeComVagas[]> {
  if (USAR_MOCK) return servidorMock.listarAtividades()
  return comTratamento(() => get<AtividadeComVagas[]>("/atividades"))
}

// Cria a conta e a inscrição de uma vez; a resposta já traz a sessão
export function criarInscricao(nova: NovaInscricao): Promise<{ sessao: LoginResposta; inscricao: Inscricao }> {
  if (USAR_MOCK) return servidorMock.criarInscricao(nova)
  return comTratamento(() => post("/inscricoes", nova))
}

// ---------- participante logado ----------

export function minhaInscricao(): Promise<Inscricao | null> {
  if (USAR_MOCK) return servidorMock.minhaInscricao(token())
  return comTratamento(() => get<Inscricao | null>("/minha-inscricao"))
}

export function atualizarMeusDados(dados: DadosParticipante): Promise<{ inscricao: Inscricao; usuario: Usuario }> {
  if (USAR_MOCK) return servidorMock.atualizarMeusDados(token(), dados)
  return comTratamento(() => put("/minha-inscricao/dados", dados))
}

export function trocarAtividades(atividadesIds: string[]): Promise<Inscricao> {
  if (USAR_MOCK) return servidorMock.trocarAtividades(token(), atividadesIds)
  return comTratamento(() => put("/minha-inscricao/atividades", { atividadesIds }))
}

export function cancelarInscricao(): Promise<Inscricao> {
  if (USAR_MOCK) return servidorMock.cancelarInscricao(token())
  return comTratamento(() => post("/minha-inscricao/cancelar", {}))
}

// ---------- pagamento ----------

// Gera (ou renova) o QR Code de pagamento da inscrição pendente
export function obterCobranca(): Promise<CobrancaPix> {
  if (USAR_MOCK) return servidorMock.obterCobranca(token())
  return comTratamento(() => get<CobrancaPix>("/minha-inscricao/pagamento"))
}

// Chamado pela página aberta ao ler o QR Code. Enquanto não há um provedor
// de Pix de verdade, isso aprova o pagamento na hora.
export function simularPagamento(tokenPix: string): Promise<{ numero: string; valor: number }> {
  if (USAR_MOCK) return servidorMock.simularPagamento(tokenPix)
  return comTratamento(() => post("/pagamentos/simular", { token: tokenPix }))
}
