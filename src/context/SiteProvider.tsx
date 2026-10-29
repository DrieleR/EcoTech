import { useEffect, useState, type ReactNode } from "react"
import { obterSite } from "../api/site"
import { obterSobre } from "../api/sobre"
import { SOBRE_PADRAO } from "../consts/sobre"
import type { ConfigSobre } from "../types/sobre"
import { SITE_PADRAO } from "../consts/site"
import { variaveisCss } from "../helpers/site"
import { SiteContext } from "./SiteContext"
import type { SiteResposta } from "../types/site"

// Carrega a configuração do evento e aplica as cores no site inteiro.
// Enquanto carrega (ou se falhar), vale o visual padrão.
export function SiteProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<SiteResposta>({ ...SITE_PADRAO, status: "ativo", dataInicio: "2026-10-15" })

  const [sobre, setSobre] = useState<ConfigSobre>(SOBRE_PADRAO)

  useEffect(() => {
    obterSite().then(setSite).catch(() => {})
    obterSobre().then(setSobre).catch(() => {})
  }, [])

  useEffect(() => {
    const vars = variaveisCss(site) as Record<string, string>
    for (const [nome, valor] of Object.entries(vars)) document.documentElement.style.setProperty(nome, valor)
  }, [site])

  return <SiteContext.Provider value={{ site, atualizarSite: setSite, sobre, atualizarSobre: setSobre }}>{children}</SiteContext.Provider>
}
