import { CAMPOS_CATEGORIA, TAMANHO_MINIMO_SENHA } from "../consts/inscricao"
import type { DadosParticipante } from "../types/inscricao"

export type ErrosForm = Partial<Record<string, string>>

export const emailValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

export function validarDadosParticipante(dados: DadosParticipante): ErrosForm {
  const erros: ErrosForm = {}
  if (dados.nome.trim().split(/\s+/).length < 2) erros.nome = "Informe nome e sobrenome."
  if (!emailValido(dados.email)) erros.email = "Informe um e-mail válido."
  if (dados.telefone.replace(/\D/g, "").length < 10) erros.telefone = "Informe um telefone com DDD."

  for (const campo of CAMPOS_CATEGORIA[dados.categoria].campos) {
    if (!dados.detalhes[campo.chave]?.trim()) erros[campo.chave] = "Campo obrigatório."
  }

  if (dados.pcd && dados.recursos.length === 0 && !dados.outroRecurso.trim()) {
    erros.recursos = "Marque pelo menos um recurso ou descreva em \"Outro\"."
  }
  return erros
}

export function validarSenha(senha: string, confirmacao: string): ErrosForm {
  const erros: ErrosForm = {}
  if (senha.length < TAMANHO_MINIMO_SENHA) {
    erros.senha = `Use pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`
  } else if (!/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
    erros.senha = "Use letras e números."
  }
  if (confirmacao !== senha) erros.confirmacao = "As senhas não coincidem."
  return erros
}

// Mantém só os campos da categoria escolhida (ao trocar de Estudante para
// Profissional, por exemplo, "curso" não deve ir junto)
export function limparDetalhes(dados: DadosParticipante): DadosParticipante {
  const chaves = CAMPOS_CATEGORIA[dados.categoria].campos.map((c) => c.chave)
  const detalhes = Object.fromEntries(
    chaves.map((chave) => [chave, dados.detalhes[chave]?.trim() ?? ""])
  )
  return {
    ...dados,
    nome: dados.nome.trim(),
    email: dados.email.trim().toLowerCase(),
    detalhes,
    recursos: dados.pcd ? dados.recursos : [],
    outroRecurso: dados.pcd ? dados.outroRecurso.trim() : "",
  }
}

export const DADOS_VAZIOS: DadosParticipante = {
  nome: "",
  email: "",
  telefone: "",
  categoria: "Estudante",
  detalhes: {},
  pcd: false,
  recursos: [],
  outroRecurso: "",
}
