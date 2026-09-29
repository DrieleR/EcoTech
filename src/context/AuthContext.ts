import { createContext } from "react"
import type { Credenciais, LoginResposta, Usuario } from "../types/auth"

export interface AuthContextValor {
  usuario: Usuario | null
  entrar: (credenciais: Credenciais) => Promise<Usuario>
  // Usado quando a sessão nasce fora do login (ex.: ao concluir a inscrição)
  iniciarSessao: (sessao: LoginResposta) => void
  atualizarUsuario: (usuario: Usuario) => void
  sair: () => void
}

export const AuthContext = createContext<AuthContextValor | null>(null)
