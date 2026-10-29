import { get, put } from "./api"
import { comTratamento } from "./erros"
import { SOBRE_PADRAO } from "../consts/sobre"
import { USAR_MOCK } from "../mocks/mock"
import type { ConfigSobre } from "../types/sobre"

// No modo mock não há servidor: a configuração vive só na memória da página
let sobreMock: ConfigSobre = SOBRE_PADRAO

export function obterSobre(): Promise<ConfigSobre> {
  if (USAR_MOCK) return Promise.resolve(sobreMock)
  return comTratamento(() => get<ConfigSobre>("/sobre"))
}

export function salvarSobre(config: ConfigSobre): Promise<ConfigSobre> {
  if (USAR_MOCK) return Promise.resolve((sobreMock = config))
  return comTratamento(() => put<ConfigSobre>("/admin/sobre", config))
}
