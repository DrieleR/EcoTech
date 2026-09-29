import type { AtividadeEvento, DadosEvento } from "../types/inscricao"

// Dados iniciais do evento e dos minicursos. Usados pelo mock e pelo
// "npm run db:setup", que os grava no banco quando ele está vazio.
// Não usa import.meta.env, para poder ser lido também pelo servidor (Node).

export const EVENTO_MOCK: DadosEvento = {
  nome: "Engenharia de Software na Amazônia",
  dataInicio: "2026-10-15",
  dataFim: "2026-10-16",
  horario: "9h às 15h45",
  local: "UEPA — Campus Ananindeua, Rod. BR-316, Ananindeua – PA",
  valorInscricao: 50,
  incluiNaInscricao: "Todas as palestras, as exposições e o material do evento.",
  prazoTrocaAtividades: "2026-10-10",
  prazoReembolso: "2026-10-08",
}

export const ATIVIDADES_MOCK: AtividadeEvento[] = [
  { id: "a1", titulo: "Testes Automatizados na prática", tipo: "Minicurso", palestrante: "Italo Di Paolo", dia: 1, inicio: "13:15", fim: "15:00", local: "LAB INFO", nivel: "Intermediário", vagas: 30, valor: 30 },
  { id: "a2", titulo: "Introdução a Cloud Native", tipo: "Minicurso", palestrante: "Jorge Hermes", dia: 1, inicio: "13:15", fim: "15:00", local: "SALA 03", nivel: "Iniciante", vagas: 30, valor: 30 },
  { id: "a3", titulo: "Python para dados ambientais", tipo: "Minicurso", palestrante: "Carla Monteiro", dia: 1, inicio: "09:00", fim: "11:00", local: "LAB 02", nivel: "Iniciante", vagas: 25, valor: 25 },
  { id: "a4", titulo: "Git e GitHub para equipes", tipo: "Oficina", palestrante: "Rafael Lima", dia: 2, inicio: "09:00", fim: "11:00", local: "LAB INFO", nivel: "Iniciante", vagas: 30, valor: 0 },
  { id: "a5", titulo: "Acessibilidade em interfaces web", tipo: "Minicurso", palestrante: "Beatriz Nunes", dia: 2, inicio: "14:00", fim: "16:00", local: "SALA 05", nivel: "Todos os níveis", vagas: 4, valor: 20 },
]
