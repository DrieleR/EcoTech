import { useEffect, useState, type FormEvent } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { LogIn } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { MSG_CREDENCIAIS_INVALIDAS } from "../api/auth"
import { Campo, MensagemErro } from "../components/form/Campos"
import { BOTAO_PRIMARIO } from "../consts/estilos"
import CartaoAcesso from "../components/CartaoAcesso"
import type { Perfil } from "../types/auth"

const DESTINO_PADRAO: Record<Perfil, string> = {
  participante: "/minha-conta",
  admin: "/admin",
}

// Depois de algumas falhas seguidas, o botão fica bloqueado por um tempo.
// Vale para qualquer e-mail, existente ou não, então não revela nada.
// É só uma camada extra: o limite de tentativas de verdade fica no backend.
const MAX_TENTATIVAS = 5
const ESPERA_SEGUNDOS = 30

export default function Login() {
  const { usuario, entrar } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Quando vem de uma rota protegida, a RotaProtegida informa a origem
  const estado = location.state as { de?: string; perfil?: Perfil } | null

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [falhas, setFalhas] = useState(0)
  const [bloqueadoAte, setBloqueadoAte] = useState(0)
  const [agora, setAgora] = useState(() => Date.now())

  const restante = Math.max(0, Math.ceil((bloqueadoAte - agora) / 1000))

  // Relógio só enquanto há bloqueio, para a contagem regressiva aparecer
  useEffect(() => {
    if (!bloqueadoAte) return
    const id = setInterval(() => {
      const t = Date.now()
      setAgora(t)
      if (t >= bloqueadoAte) {
        setBloqueadoAte(0)
        setErro("")
      }
    }, 1000)
    return () => clearInterval(id)
  }, [bloqueadoAte])

  // Quem já está logado não precisa ver o formulário
  if (usuario && !carregando) {
    return <Navigate to={DESTINO_PADRAO[usuario.perfil]} replace />
  }

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (restante > 0) return
    setErro("")
    setCarregando(true)
    try {
      const logado = await entrar({ email, senha })
      // O perfil vem da conta: admin cai no painel, participante na sua conta
      const destino =
        estado?.de && estado.perfil === logado.perfil ? estado.de : DESTINO_PADRAO[logado.perfil]
      navigate(destino, { replace: true })
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : MSG_CREDENCIAIS_INVALIDAS
      const total = falhas + 1
      setFalhas(total)
      setSenha("")
      if (total >= MAX_TENTATIVAS) {
        const t = Date.now()
        setAgora(t)
        setBloqueadoAte(t + ESPERA_SEGUNDOS * 1000)
        setFalhas(0)
        setErro("Muitas tentativas seguidas. Aguarde um pouco e tente de novo.")
      } else {
        setErro(mensagem)
      }
      setCarregando(false)
    }
  }

  return (
    <CartaoAcesso
      titulo="Acesse sua conta"
      descricao={<p>Entre com o mesmo e-mail e senha que você cadastrou na inscrição.</p>}
    >
      <form onSubmit={enviar} className="flex flex-col gap-5">
        <Campo
          label="E-mail"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seuemail@exemplo.com"
        />
        <div className="flex flex-col gap-2">
          <Campo
            label="Senha"
            type="password"
            required
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <Link to="/esqueci-senha" className="self-end font-sora text-xs font-bold text-eco-blue underline">
            Esqueceu a senha?
          </Link>
        </div>

        <MensagemErro>{erro}</MensagemErro>

        <button type="submit" disabled={carregando || restante > 0} className={`${BOTAO_PRIMARIO} py-3`}>
          <LogIn size={18} />
          {carregando ? "Entrando..." : restante > 0 ? `Aguarde ${restante}s` : "Entrar"}
        </button>

        <p className="font-sora border-t border-eco-blue/10 pt-5 text-center text-sm text-eco-gray">
          Ainda não se inscreveu?{" "}
          <Link to="/inscricao" className="font-bold text-eco-blue underline">
            Faça sua inscrição
          </Link>
        </p>
      </form>
    </CartaoAcesso>
  )
}
