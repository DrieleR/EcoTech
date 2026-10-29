import { useContext } from "react"
import { SiteContext } from "../context/SiteContext"

export function useSite() {
  const contexto = useContext(SiteContext)
  if (!contexto) throw new Error("useSite precisa estar dentro de <SiteProvider>")
  return contexto
}
