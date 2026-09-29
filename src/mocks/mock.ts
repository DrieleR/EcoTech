import type { Perfil } from "../types/auth"
import type { DadosParticipante } from "../types/inscricao"
import { ATIVIDADES_MOCK, EVENTO_MOCK } from "./dadosIniciais"

export { ATIVIDADES_MOCK, EVENTO_MOCK }

export const USAR_MOCK = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === "true"

// Contas de teste. A senha só existe aqui; no "banco" do mock ela é
// guardada como hash, como o backend real deve fazer.
export const USUARIOS_MOCK: { id: string; nome: string; email: string; senha: string; perfil: Perfil }[] = [
  {
    id: "1",
    nome: "Participante Teste",
    email: "participante@ecotech.com",
    senha: "123456",
    perfil: "participante",
  },
  {
    id: "2",
    nome: "Admin EcoTech",
    email: "admin@ecotech.com",
    senha: "admin123",
    perfil: "admin",
  },
]

// Inscrições de exemplo para o painel do administrador ter o que mostrar.
// O primeiro item é a do "Participante Teste".
export const INSCRITOS_MOCK: { participante: DadosParticipante; atividadesIds: string[]; criadaEm: string }[] = [
  {
    participante: { nome: "Participante Teste", email: "participante@ecotech.com", telefone: "(91) 98765-4321", categoria: "Estudante", detalhes: { instituicao: "Universidade do Estado do Pará", curso: "Engenharia de Software" }, pcd: true, recursos: ["interprete-libras", "cadeira-de-rodas"], outroRecurso: "" },
    atividadesIds: ["a1"],
    criadaEm: "2026-09-22T14:10:00",
  },
  {
    participante: { nome: "Marina Lobato", email: "marina.lobato@email.com", telefone: "(91) 99111-2233", categoria: "Estudante", detalhes: { instituicao: "UFPA", curso: "Ciência da Computação" }, pcd: false, recursos: [], outroRecurso: "" },
    atividadesIds: ["a1", "a5"],
    criadaEm: "2026-09-18T09:25:00",
  },
  {
    participante: { nome: "João Pedro Farias", email: "jp.farias@email.com", telefone: "(91) 98222-3344", categoria: "Profissional", detalhes: { empresa: "Norte Dev", cargo: "Desenvolvedor back-end" }, pcd: false, recursos: [], outroRecurso: "" },
    atividadesIds: ["a2", "a5"],
    criadaEm: "2026-09-19T18:40:00",
  },
  {
    participante: { nome: "Luiza Cardoso", email: "luiza.cardoso@email.com", telefone: "(91) 98333-4455", categoria: "Professor", detalhes: { instituicao: "IFPA", area: "Engenharia de Software" }, pcd: true, recursos: ["fonte-ampliada", "lugar-reservado"], outroRecurso: "" },
    atividadesIds: ["a3", "a5"],
    criadaEm: "2026-09-20T11:05:00",
  },
  {
    participante: { nome: "Rafael Quaresma", email: "rafael.q@email.com", telefone: "(91) 98444-5566", categoria: "Estudante", detalhes: { instituicao: "UEPA", curso: "Engenharia de Software" }, pcd: true, recursos: ["acompanhante"], outroRecurso: "Preciso de intervalos curtos a cada hora." },
    atividadesIds: ["a4", "a5"],
    criadaEm: "2026-09-21T16:30:00",
  },
  {
    participante: { nome: "Bianca Tavares", email: "bianca.tavares@email.com", telefone: "(91) 98555-6677", categoria: "Profissional", detalhes: { empresa: "Amazônia Dados", cargo: "Analista de dados" }, pcd: false, recursos: [], outroRecurso: "" },
    atividadesIds: ["a3"],
    criadaEm: "2026-09-23T08:15:00",
  },
  {
    participante: { nome: "Carlos Eduardo Pinheiro", email: "cadu.pinheiro@email.com", telefone: "(91) 98666-7788", categoria: "Estudante", detalhes: { instituicao: "UNAMA", curso: "Sistemas de Informação" }, pcd: false, recursos: [], outroRecurso: "" },
    atividadesIds: [],
    criadaEm: "2026-09-24T19:50:00",
  },
]
