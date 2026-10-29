import { createContext } from "react"
import type { SiteResposta } from "../types/site"
import type { ConfigSobre } from "../types/sobre"

export interface SiteContextoValor {
  site: SiteResposta
  atualizarSite: (site: SiteResposta) => void
  sobre: ConfigSobre
  atualizarSobre: (sobre: ConfigSobre) => void
}

export const SiteContext = createContext<SiteContextoValor | null>(null)
