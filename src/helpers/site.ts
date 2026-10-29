import type { CSSProperties } from "react"
import type { ConfigSite } from "../types/site"

// As cores do tema (Tailwind v4) são variáveis CSS; trocar o valor muda o site todo
export function variaveisCss(c: Pick<ConfigSite, "corPrimaria" | "corSecundaria" | "corFundo">) {
  return {
    "--color-eco-blue": c.corPrimaria,
    "--color-eco-blue-dark": `color-mix(in srgb, ${c.corPrimaria} 70%, black)`,
    "--color-eco-blue-soft": `color-mix(in srgb, ${c.corPrimaria} 8%, white)`,
    "--color-eco-green": c.corSecundaria,
    "--color-eco-cream": c.corFundo,
    "--color-eco-cream-light": `color-mix(in srgb, ${c.corFundo} 50%, white)`,
  } as CSSProperties
}
