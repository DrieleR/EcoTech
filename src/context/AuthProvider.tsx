import { useEffect, useState, type ReactNode } from "react"
import { login, logout, me } from "../api/auth"
import { lerSessao, limparSessao, salvarSessao } from "../helpers/sessao"
import type { Credenciais, LoginResposta, Usuario } from "../types/auth"
import { AuthContext } from "./AuthContext"

export function AuthProvider({ children }: { children: ReactNode }) {
  // Recupera a sessão salva para o usuário continuar logado ao recarregar
  const [usuario, setUsuario] = useState<Usuario | null>(() => lerSessao()?.usuario ?? null)

  // O que está no localStorage pode ter sido alterado à mão. Ao abrir o site,
  // perguntamos ao servidor quem é o dono do token e usamos a resposta dele.
  useEffect(() => {
    const sessao = lerSessao()
    if (!sessao) return
    me()
      .then((confirmado) => {
        salvarSessao({ ...sessao, usuario: confirmado })
        setUsuario(confirmado)
      })
      .catch(() => {
        limparSessao()
        setUsuario(null)
      })
  }, [])

  const iniciarSessao = (sessao: LoginResposta) => {
    salvarSessao(sessao)
    setUsuario(sessao.usuario)
  }

  const entrar = async (credenciais: Credenciais) => {
    const sessao = await login(credenciais)
    iniciarSessao(sessao)
    return sessao.usuario
  }

  const atualizarUsuario = (novo: Usuario) => {
    const sessao = lerSessao()
    if (sessao) salvarSessao({ ...sessao, usuario: novo })
    setUsuario(novo)
  }

  const sair = () => {
    // Apaga a sessão local na hora e avisa o servidor para invalidar o token
    const token = lerSessao()?.token
    limparSessao()
    setUsuario(null)
    if (token) logout(token).catch(() => {})
  }

  return (
    <AuthContext.Provider value={{ usuario, entrar, iniciarSessao, atualizarUsuario, sair }}>
      {children}
    </AuthContext.Provider>
  )
}
