import type { Palestra } from "../types/palestra";

export const PALESTRAS: Palestra[] = [
  {
    slug: "abertura-oficial-do-evento",
    titulo: "Abertura Oficial do Evento",
    palestranteSlug: "comissao-organizadora",
    horario: "09:00 - 10:00",
    local: "SALA 05",
    resumo: "Recepção e apresentação da programação do EcoTech.",
    conteudo: [
      "Boas-vindas aos participantes",
      "Apresentação da comissão organizadora",
      "Panorama da programação dos dois dias de evento",
    ],
  },
  {
    slug: "desafios-da-tecnologia-na-metropole-amazonica",
    titulo: "Desafios da Tecnologia na Metrópole Amazônica",
    palestranteSlug: "anderson-costa",
    horario: "10:15 - 11:45",
    local: "SALA 05",
    resumo:
      "Um panorama dos principais desafios tecnológicos enfrentados por grandes centros urbanos na Amazônia.",
    conteudo: [
      "Infraestrutura de conectividade na região amazônica",
      "Desafios de escalabilidade em cidades em crescimento",
      "Estudos de caso de soluções tecnológicas locais",
    ],
  },
  {
    slug: "arquiteturas-para-startups-regionais",
    titulo: "Arquiteturas para startups regionais",
    palestranteSlug: "marco-reus",
    horario: "15:00 - 15:45",
    local: "SALA 02",
    resumo: "Boas práticas de arquitetura de software para startups em crescimento.",
    conteudo: [
      "Escolha de arquitetura conforme o estágio da startup",
      "Trade-offs entre monólitos e microsserviços",
      "Como evoluir a arquitetura sem travar o produto",
    ],
  },
];

export function getPalestraBySlug(slug: string) {
  return PALESTRAS.find((p) => p.slug === slug);
}