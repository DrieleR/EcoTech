import type { ConfigSite } from "../types/site"

// Sem import.meta.env: também é lido pelo servidor (Node)
export const ROTAS_CONHECIDAS = [
  { to: "/", rotulo: "Início" },
  { to: "/sobre", rotulo: "Sobre" },
  { to: "/cronograma", rotulo: "Cronograma" },
  { to: "/palestras", rotulo: "Palestras" },
  { to: "/exposicoes", rotulo: "Exposições" },
  { to: "/local", rotulo: "Local" },
  { to: "/acessibilidade", rotulo: "Acessibilidade" },
  { to: "/patrocinadores", rotulo: "Patrocinadores" },
  { to: "/parceiros", rotulo: "Parceiros" },
  { to: "/inscricao", rotulo: "Inscrição" },
]

export const SITE_PADRAO: ConfigSite = {
  titulo: "Primeiro Encontro de tecnologia pensado a partir da Amazônia",
  descricao:
    "Dois dias de palestras, minicurso e trocas entre estudantes, pesquisadores e profissionais que constroem tecnologia na região — e para ela.",
  dataExibicao: "15 a 16 de Outubro",
  localExibicao: "Ananindeua, Pará",
  template: "classico",
  corPrimaria: "#03285b",
  corSecundaria: "#a8cf45",
  corFundo: "#f4efe6",
  logoUrl: "",
  bannerUrl: "",
  menu: ROTAS_CONHECIDAS.filter((r) => r.to !== "/patrocinadores" && r.to !== "/parceiros").map((r) => ({
    id: r.to === "/" ? "inicio" : r.to.slice(1),
    rotulo: r.rotulo,
    to: r.to,
    visivel: true,
  })),
}
