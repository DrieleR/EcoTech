import type { Palestrante } from "../types/palestrante";

export const PALESTRANTES: Palestrante[] = [
  {
    slug: "comissao-organizadora",
    nome: "Comissão Organizadora",
    cargo: "Organização",
    empresa: "EcoTech",
    bio: "Responsável pelo planejamento e realização do evento EcoTech - Engenharia de Software na Amazônia.",
  },
  {
    slug: "anderson-costa",
    nome: "Anderson Costa",
    cargo: "Palestrante",
    empresa: "-",
    bio: "Especialista em tecnologia com foco nos desafios de inovação na Amazônia.",
  },
  {
    slug: "italo-di-paolo",
    nome: "Italo Di Paolo",
    cargo: "Palestrante",
    empresa: "-",
    bio: "Profissional dedicado a testes automatizados e qualidade de software.",
  },
  {
    slug: "jorge-hermes",
    nome: "Jorge Hermes",
    cargo: "Palestrante",
    empresa: "-",
    bio: "Atua com arquiteturas Cloud Native e infraestrutura moderna de software.",
  },
  {
    slug: "marco-reus",
    nome: "Marco Reus",
    cargo: "Palestrante",
    empresa: "-",
    bio: "Trabalha com arquitetura de software voltada a startups regionais.",
  },
];

export function getPalestranteBySlug(slug: string) {
  return PALESTRANTES.find((p) => p.slug === slug);
}

export function getPalestranteByNome(nome: string) {
  return PALESTRANTES.find((p) => p.nome === nome);
}