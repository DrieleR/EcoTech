export type TemplateSite = "classico" | "moderno" | "minimalista"

export interface ItemMenu {
  id: string
  rotulo: string
  to: string
  visivel: boolean
}

// Tudo que o admin edita na identidade e na página inicial
export interface ConfigSite {
  titulo: string
  descricao: string
  dataExibicao: string
  localExibicao: string
  template: TemplateSite
  corPrimaria: string
  corSecundaria: string
  corFundo: string
  // Imagem em data URL; "" = usa a imagem padrão do projeto
  logoUrl: string
  bannerUrl: string
  menu: ItemMenu[]
}

export type StatusEvento = "ativo" | "encerrado"

export interface SiteResposta extends ConfigSite {
  status: StatusEvento
  dataInicio: string
}

export interface EventoAnterior {
  id: string
  nome: string
  encerradoEm: string
  dataInicio: string
  dataFim: string
  local: string
  inscritos: number
  atividades: number
}
