export type Perfil = "participante" | "admin"

export interface Usuario {
  id: string
  nome: string
  email: string
  perfil: Perfil
}

// O login não recebe perfil: quem decide se a conta é de admin ou de
// participante é o servidor, a partir da própria conta.
export interface Credenciais {
  email: string
  senha: string
}

// Formato esperado da resposta de POST /auth/login
export interface LoginResposta {
  token: string
  usuario: Usuario
}
