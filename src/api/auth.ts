import { isAxiosError } from "axios"
import { get, post } from "./api"
import { axiosClient } from "./axiosClient"
import { comTratamento, erroDaApi } from "./erros"
import { lerSessao } from "../helpers/sessao"
import type { Credenciais, LoginResposta, Usuario } from "../types/auth"
import { USAR_MOCK } from "../mocks/mock"
import * as servidorMock from "../mocks/servidor"

// Enquanto o backend não existe, as chamadas usam o servidor simulado. O mock
// só liga em desenvolvimento (npm run dev) e com VITE_USE_MOCK=true no .env,
// para que as contas de teste nunca funcionem no site publicado.

// Mensagem única para qualquer falha de login: e-mail inexistente, senha
// errada ou conta bloqueada respondem igual, para ninguém descobrir quais
// e-mails têm conta (enumeração de usuários).
export const MSG_CREDENCIAIS_INVALIDAS = "Credenciais inválidas. Confira seu e-mail e senha."

export async function login(credenciais: Credenciais): Promise<LoginResposta> {
  if (USAR_MOCK) return servidorMock.login(credenciais.email, credenciais.senha)

  try {
    return await post<LoginResposta, Credenciais>("/auth/login", credenciais)
  } catch (erro) {
    if (isAxiosError(erro)) {
      const status = erro.response?.status
      if (status === 429) {
        throw new Error("Muitas tentativas. Aguarde um pouco e tente novamente.", { cause: erro })
      }
      if (status && status >= 400 && status < 500) {
        throw new Error(MSG_CREDENCIAIS_INVALIDAS, { cause: erro })
      }
      throw new Error("Não foi possível conectar ao servidor. Tente novamente.", { cause: erro })
    }
    throw erro
  }
}

// Confirma com o servidor quem é o dono do token salvo. É isso que define o
// perfil de verdade: editar o localStorage não transforma ninguém em admin.
export async function me(): Promise<Usuario> {
  if (USAR_MOCK) return servidorMock.me(lerSessao()?.token)
  return comTratamento(() => get<Usuario>("/auth/me"))
}

// Recebe o token porque a sessão local já foi apagada quando isso roda
export async function logout(token: string): Promise<void> {
  if (USAR_MOCK) return servidorMock.logout(token)
  await comTratamento(() =>
    axiosClient.post("/auth/logout", {}, { headers: { Authorization: `Bearer ${token}` } })
  )
}

// Sempre termina "com sucesso" para a tela mostrar a mesma mensagem genérica.
// Só falha de rede ou excesso de pedidos (429) aparecem como erro.
export async function solicitarRedefinicaoSenha(email: string): Promise<void> {
  if (USAR_MOCK) return servidorMock.solicitarRedefinicaoSenha(email)
  try {
    await post("/auth/esqueci-senha", { email })
  } catch (erro) {
    if (isAxiosError(erro) && erro.response && erro.response.status < 500 && erro.response.status !== 429) return
    throw erroDaApi(erro)
  }
}

export async function redefinirSenha(token: string, senha: string): Promise<void> {
  if (USAR_MOCK) return servidorMock.redefinirSenha(token, senha)
  try {
    await post("/auth/redefinir-senha", { token, senha })
  } catch (erro) {
    // 410 = link vencido ou já usado; outros erros (ex.: senha curta) mostram a mensagem da API
    if (isAxiosError(erro) && erro.response?.status === 410) {
      throw new Error("Este link expirou ou já foi usado. Peça um novo.", { cause: erro })
    }
    throw erroDaApi(erro)
  }
}
