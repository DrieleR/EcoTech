export type Categoria = "Estudante" | "Professor" | "Profissional"

export type RecursoAcessibilidade =
  | "interprete-libras"
  | "cadeira-de-rodas"
  | "acompanhante"
  | "fonte-ampliada"
  | "lugar-reservado"

// Campos que mudam conforme a categoria escolhida
export type CampoCategoria = "instituicao" | "curso" | "area" | "empresa" | "cargo"

export interface DadosParticipante {
  nome: string
  email: string
  telefone: string
  categoria: Categoria
  detalhes: Partial<Record<CampoCategoria, string>>
  pcd: boolean
  recursos: RecursoAcessibilidade[]
  outroRecurso: string
}

// "pendente" = inscrição feita, aguardando o pagamento
export type StatusInscricao = "pendente" | "confirmada" | "cancelada"

export interface Inscricao {
  id: string
  numero: string
  usuarioId: string
  criadaEm: string
  status: StatusInscricao
  canceladaEm?: string
  reembolso?: boolean
  pagoEm?: string
  participante: DadosParticipante
  atividadesIds: string[]
  valorTotal: number
}

export type TipoAtividadeInscricao = "Minicurso" | "Oficina"
export type Nivel = "Iniciante" | "Intermediário" | "Avançado" | "Todos os níveis"

// Atividades com vagas que o participante escolhe na inscrição.
// As palestras já estão incluídas no valor da inscrição.
export interface AtividadeEvento {
  id: string
  titulo: string
  tipo: TipoAtividadeInscricao
  palestrante: string
  dia: number
  inicio: string
  fim: string
  local: string
  nivel: Nivel
  vagas: number
  valor: number
}

export interface AtividadeComVagas extends AtividadeEvento {
  ocupadas: number
}

export interface DadosEvento {
  nome: string
  dataInicio: string
  dataFim: string
  horario: string
  local: string
  valorInscricao: number
  incluiNaInscricao: string
  prazoTrocaAtividades: string
  prazoReembolso: string
}

export interface NovaInscricao {
  participante: DadosParticipante
  senha: string
  atividadesIds: string[]
}

// Dados para a tela de pagamento: o QR Code aponta para "url"
export interface CobrancaPix {
  valor: number
  url: string
}
