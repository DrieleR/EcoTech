import { z } from "zod"
import { CAMPOS_CATEGORIA, CATEGORIAS, OPCOES_ACESSIBILIDADE, TAMANHO_MINIMO_SENHA } from "../src/consts/inscricao.ts"
import { ErroHttp } from "./seguranca.ts"

// Tudo que chega do navegador passa por aqui antes de tocar no banco.
// As regras são as mesmas das telas, mas o servidor não confia nelas.

const texto = (max: number) => z.string().trim().max(max)

export const esquemaEmail = z.string().trim().toLowerCase().max(254).regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Informe um e-mail válido.")

export const esquemaSenha = z
  .string()
  .min(TAMANHO_MINIMO_SENHA, `A senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`)
  .max(200)

export const esquemaParticipante = z
  .object({
    nome: texto(120).min(3, "Informe o nome completo."),
    email: esquemaEmail,
    telefone: texto(20).refine((t) => t.replace(/\D/g, "").length >= 10, "Informe um telefone com DDD."),
    categoria: z.enum(CATEGORIAS as [string, ...string[]]),
    detalhes: z.record(z.string(), texto(120)),
    pcd: z.boolean(),
    recursos: z.array(z.enum(OPCOES_ACESSIBILIDADE.map((o) => o.id) as [string, ...string[]])).max(10),
    outroRecurso: texto(200),
  })
  .transform((dados) => {
    // Guarda só os campos da categoria escolhida
    const campos = CAMPOS_CATEGORIA[dados.categoria as keyof typeof CAMPOS_CATEGORIA].campos
    const detalhes = Object.fromEntries(campos.map((c) => [c.chave, dados.detalhes[c.chave] ?? ""]))
    return {
      ...dados,
      detalhes,
      recursos: dados.pcd ? [...new Set(dados.recursos)] : [],
      outroRecurso: dados.pcd ? dados.outroRecurso : "",
    }
  })
  .superRefine((dados, ctx) => {
    if (Object.values(dados.detalhes).some((v) => !v)) {
      ctx.addIssue({ code: "custom", message: "Preencha os dados da sua categoria." })
    }
  })

const esquemaIds = z.array(z.uuid()).max(20)

export const esquemaNovaInscricao = z.object({
  participante: esquemaParticipante,
  senha: esquemaSenha,
  atividadesIds: esquemaIds,
})

export const esquemaTrocaAtividades = z.object({ atividadesIds: esquemaIds })

const hora = z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido.")
const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.")

export const esquemaAtividade = z
  .object({
    titulo: texto(150).min(1, "Informe o título da atividade."),
    tipo: z.enum(["Minicurso", "Oficina"]),
    palestrante: texto(120).min(1, "Informe quem ministra."),
    dia: z.number().int().min(1).max(30),
    inicio: hora,
    fim: hora,
    local: texto(80).min(1, "Informe o local."),
    nivel: z.enum(["Iniciante", "Intermediário", "Avançado", "Todos os níveis"]),
    vagas: z.number().int().min(1, "Informe pelo menos 1 vaga.").max(10000),
    valor: z.number().min(0, "O valor não pode ser negativo.").max(100000),
  })
  .refine((a) => a.inicio < a.fim, "O horário de término precisa ser depois do início.")

export const esquemaEvento = z
  .object({
    nome: texto(150).min(1, "Informe o nome do evento."),
    dataInicio: data,
    dataFim: data,
    horario: texto(60).min(1),
    local: texto(200).min(1),
    valorInscricao: z.number().min(0, "O valor da inscrição não pode ser negativo.").max(100000),
    incluiNaInscricao: texto(300).min(1),
    prazoTrocaAtividades: data,
    prazoReembolso: data,
  })
  .refine((e) => e.dataFim >= e.dataInicio, "A data de término precisa ser depois do início.")
  .refine((e) => e.prazoReembolso <= e.dataInicio, "O prazo de reembolso precisa ser antes do evento.")

// Valida e devolve os dados limpos; se algo estiver errado, responde 400
// com a primeira mensagem, que a tela mostra para a pessoa.
export function validar<T>(esquema: z.ZodType<T>, dados: unknown): T {
  const resultado = esquema.safeParse(dados)
  if (!resultado.success) {
    throw new ErroHttp(400, resultado.error.issues[0]?.message ?? "Dados inválidos.")
  }
  return resultado.data
}
