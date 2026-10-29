import { get, post, put } from "./api"
import { comTratamento } from "./erros"
import { SITE_PADRAO } from "../consts/site"
import { USAR_MOCK } from "../mocks/mock"
import type { ConfigSite, EventoAnterior, SiteResposta } from "../types/site"

// No modo mock não há servidor: a configuração vive só na memória da página
let siteMock: SiteResposta = { ...SITE_PADRAO, status: "ativo", dataInicio: "2026-10-15" }

export function obterSite(): Promise<SiteResposta> {
  if (USAR_MOCK) return Promise.resolve(siteMock)
  return comTratamento(() => get<SiteResposta>("/site"))
}

export function salvarSite(config: ConfigSite): Promise<SiteResposta> {
  if (USAR_MOCK) return Promise.resolve((siteMock = { ...siteMock, ...config }))
  return comTratamento(() => put<SiteResposta>("/admin/site", config))
}

export function encerrarEvento(): Promise<SiteResposta> {
  if (USAR_MOCK) return Promise.resolve((siteMock = { ...siteMock, status: "encerrado" }))
  return comTratamento(() => post<SiteResposta>("/admin/evento/encerrar", {}))
}

export function listarEventosAnteriores(): Promise<EventoAnterior[]> {
  if (USAR_MOCK) return Promise.resolve([])
  return comTratamento(() => get<EventoAnterior[]>("/admin/eventos-anteriores"))
}
