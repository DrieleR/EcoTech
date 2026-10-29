import type { ConfigSobre, Entidade } from "../types/sobre"

// Sem import.meta.env: também é lido pelo servidor (Node)
const e = (id: string, nome: string, logo: string): Entidade => ({ id, nome, logo })

export const SOBRE_PADRAO: ConfigSobre = {
  titulo: "Um encontro para quem constrói software na região",
  texto:
    "O EcoTech nasce como o primeiro evento de engenharia de software e meio ambiente voltado à realidade amazônica: conectividade limitada, dados ambientais, times distribuídos e desafios que raramente aparecem nos grandes centros. A proposta é reunir estudantes, pesquisadoras e profissionais para discutir prática, arquitetura e sustentabilidade a partir daqui.",
  itens: [
    { titulo: "Quando", descricao: "De 15 a 16 de outubro, com atividades das 9h às 15h45. Uma programação pensada para você montar sua agenda e aproveitar o que mais interessa." },
    { titulo: "Onde", descricao: "Na UEPA — Campus Ananindeua, ao lado da Usina da Paz no Icuí-Guajará. Realização da Universidade do Estado do Pará em parceria com grupos de pesquisa e extensão." },
    { titulo: "Palestrantes", descricao: "Profissionais que vivem a engenharia de software na Amazônia, falando de testes automatizados, cloud native, arquitetura para startups e os desafios da tecnologia na região." },
    { titulo: "Formato", descricao: "Palestras, minicursos práticos em laboratório e mostras de artigos, pôsteres e projetos. Você ouve, coloca a mão no código e conhece o que está sendo produzido aqui." },
    { titulo: "Para quem", descricao: "Estudantes de computação e áreas afins, profissionais e toda a comunidade tech local. Um espaço para ampliar sua rede, encontrar parceiros e se inspirar." },
  ],
  parceiros: [
    e("ufpa", "UFPA", "/logos/ufpa.jpg"),
    e("ifpa", "IFPA", "/logos/ifpa.jpg"),
    e("devsnorte", "DevsNorte", "/logos/devsnorte.svg"),
    e("sebrae", "Sebrae", "/logos/sebrae.png"),
    e("pctguama", "Parque de Ciência e Tecnologia do Guamá", "/logos/pctguama.png"),
    e("institutoatlantico", "Instituto Atlântico", "/logos/institutoatlantico.png"),
  ],
  patrocinadores: {
    master: [e("vale", "Vale", "/logos/vale.png")],
    ouro: [
      e("google", "Google", "/logos/google.png"),
      e("microsoft", "Microsoft", "/logos/microsoft.png"),
      e("petrobras", "Petrobras", "/logos/petrobras.png"),
    ],
    prata: [
      e("aws", "Amazon Web Services", "/logos/aws.png"),
      e("ibm", "IBM", "/logos/ibm.png"),
      e("nubank", "Nubank", "/logos/nubank.png"),
      e("equatorial", "Equatorial Energia", "/logos/equatorial.png"),
      e("hotmart", "Hotmart", "/logos/hotmart.png"),
    ],
  },
}
