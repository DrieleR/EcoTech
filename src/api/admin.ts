import { del, get, post, put } from "./api"
import { comTratamento } from "./erros"
import { lerSessao } from "../helpers/sessao"
import type { AtividadeEvento, DadosEvento, Inscricao } from "../types/inscricao"
import { USAR_MOCK } from "../mocks/mock"
import * as servidorMock from "../mocks/servidor"

// Todas as rotas /admin precisam ser protegidas no backend: o servidor
// confere pelo token se a conta é de administrador antes de responder.

const token = () => lerSessao()?.token

export type AtividadeForm = Omit<AtividadeEvento, "id"> & { id?: string }

export function listarInscritos(): Promise<Inscricao[]> {
  if (USAR_MOCK) return servidorMock.listarInscritos(token())
  return comTratamento(() => get<Inscricao[]>("/admin/inscritos"))
}

export function salvarAtividade(atividade: AtividadeForm): Promise<AtividadeEvento> {
  if (USAR_MOCK) return servidorMock.salvarAtividade(token(), atividade)
  const { id, ...dados } = atividade
  return comTratamento(() =>
    id ? put<AtividadeEvento>(`/admin/atividades/${id}`, dados) : post<AtividadeEvento>("/admin/atividades", dados)
  )
}

export function excluirAtividade(id: string): Promise<void> {
  if (USAR_MOCK) return servidorMock.excluirAtividade(token(), id)
  return comTratamento(() => del<void>(`/admin/atividades/${id}`))
}

export function atualizarEvento(evento: DadosEvento): Promise<DadosEvento> {
  if (USAR_MOCK) return servidorMock.atualizarEvento(token(), evento)
  return comTratamento(() => put<DadosEvento>("/admin/evento", evento))
}
