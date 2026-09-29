import { isAxiosError } from "axios"

// Converte qualquer erro de requisição em um Error com mensagem para a tela.
// O backend pode mandar { mensagem: "..." } no corpo da resposta de erro.
export function erroDaApi(erro: unknown): Error {
  if (!isAxiosError(erro)) return erro instanceof Error ? erro : new Error("Algo deu errado.")

  const status = erro.response?.status
  const mensagem = (erro.response?.data as { mensagem?: string } | undefined)?.mensagem

  if (!erro.response) return new Error("Não foi possível conectar ao servidor. Tente novamente.", { cause: erro })
  if (status === 401) return new Error("Sua sessão expirou. Entre novamente.", { cause: erro })
  if (status === 403) return new Error("Acesso não permitido.", { cause: erro })
  if (status === 429) return new Error("Muitas tentativas. Aguarde um pouco e tente novamente.", { cause: erro })
  return new Error(mensagem ?? "Algo deu errado. Tente novamente.", { cause: erro })
}

// Envolve uma chamada HTTP para padronizar as mensagens de erro
export async function comTratamento<T>(chamada: () => Promise<T>): Promise<T> {
  try {
    return await chamada()
  } catch (erro) {
    throw erroDaApi(erro)
  }
}
