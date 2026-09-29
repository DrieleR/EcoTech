import { useState, type FormEvent } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { CircleCheck, KeyRound } from "lucide-react"
import { redefinirSenha } from "../api/auth"
import { useAuth } from "../hooks/useAuth"
import { BOTAO_PRIMARIO } from "../consts/estilos"
import { validarSenha, type ErrosForm } from "../helpers/validacao"
import { Campo, MensagemErro } from "../components/form/Campos"
import CartaoAcesso from "../components/CartaoAcesso"

// Página aberta pelo link do e-mail: /redefinir-senha?token=...
export default function RedefinirSenha() {
  const [params] = useSearchParams()
  const token = params.get("token") ?? ""
  const { usuario, sair } = useAuth()

  const [senha, setSenha] = useState("")
  const [confirmacao, setConfirmacao] = useState("")
  const [erros, setErros] = useState<ErrosForm>({})
  const [erro, setErro] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [concluido, setConcluido] = useState(false)

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const novosErros = validarSenha(senha, confirmacao)
    setErros(novosErros)
    if (Object.keys(novosErros).length) return
    setErro("")
    setEnviando(true)
    try {
      await redefinirSenha(token, senha)
      // A troca derruba as sessões abertas; limpa também a deste navegador
      if (usuario) sair()
      setConcluido(true)
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível alterar a senha.")
    } finally {
      setEnviando(false)
    }
  }

  if (!token) {
    return (
      <CartaoAcesso
        icone={<KeyRound size={26} />}
        titulo="Link inválido"
        descricao={<p>Este link não funciona. Peça um novo para trocar sua senha.</p>}
      >
        <Link to="/esqueci-senha" className={`${BOTAO_PRIMARIO} w-full`}>
          Pedir novo link
        </Link>
      </CartaoAcesso>
    )
  }

  if (concluido) {
    return (
      <CartaoAcesso
        icone={<CircleCheck size={26} />}
        titulo="Senha alterada!"
        descricao={<p role="status">Agora é só entrar com a nova senha.</p>}
      >
        <Link to="/login" className={`${BOTAO_PRIMARIO} w-full`}>
          Ir para o login
        </Link>
      </CartaoAcesso>
    )
  }

  return (
    <CartaoAcesso
      icone={<KeyRound size={26} />}
      titulo="Crie uma nova senha"
      descricao={<p>Use pelo menos 8 caracteres, misturando letras e números.</p>}
    >
      <form noValidate onSubmit={enviar} className="flex flex-col gap-5">
        <Campo
          label="Nova senha"
          type="password"
          required
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          erro={erros.senha}
        />
        <Campo
          label="Confirmar nova senha"
          type="password"
          required
          autoComplete="new-password"
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          erro={erros.confirmacao}
        />
        <MensagemErro>
          {erro && (
            <>
              {erro}{" "}
              <Link to="/esqueci-senha" className="font-bold underline">
                Pedir novo link
              </Link>
            </>
          )}
        </MensagemErro>
        <button type="submit" disabled={enviando} className={`${BOTAO_PRIMARIO} py-3`}>
          {enviando ? "Salvando..." : "Salvar nova senha"}
        </button>
        <Link to="/login" className="text-center font-sora text-sm font-bold text-eco-blue underline">
          Voltar para o login
        </Link>
      </form>
    </CartaoAcesso>
  )
}
