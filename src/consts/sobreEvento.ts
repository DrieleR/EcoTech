export const ITENS_EVENTO = [
  {
    titulo: "Quando",
    descricao:
      "De 15 a 16 de outubro, com atividades das 9h às 15h45. Uma programação pensada para você montar sua agenda e aproveitar o que mais interessa.",
  },
  {
    titulo: "Onde",
    descricao:
      "Na UEPA — Campus Ananindeua, ao lado da Usina da Paz no Icuí-Guajará. Realização da Universidade do Estado do Pará em parceria com grupos de pesquisa e extensão.",
  },
  {
    titulo: "Palestrantes",
    descricao:
      "Profissionais que vivem a engenharia de software na Amazônia, falando de testes automatizados, cloud native, arquitetura para startups e os desafios da tecnologia na região.",
  },
  {
    titulo: "Formato",
    descricao:
      "Palestras, minicursos práticos em laboratório e mostras de artigos, pôsteres e projetos. Você ouve, coloca a mão no código e conhece o que está sendo produzido aqui.",
  },
  {
    titulo: "Para quem",
    descricao:
      "Estudantes de computação e áreas afins, profissionais e toda a comunidade tech local. Um espaço para ampliar sua rede, encontrar parceiros e se inspirar.",
  },
]

export type AbaSobre = "sobre" | "parceiros" | "patrocinadores"

export const ABAS_SOBRE: { id: AbaSobre; label: string }[] = [
  { id: "sobre", label: "Sobre o evento" },
  { id: "parceiros", label: "Parceiros" },
  { id: "patrocinadores", label: "Patrocinadores" },
]
