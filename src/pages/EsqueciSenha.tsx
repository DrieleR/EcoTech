import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { KeyRound, MailCheck } from "lucide-react"
import { solicitarRedefinicaoSenha } from "../api/auth"
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO } from "../consts/estilos"
import { emailValido } from "../helpers/validacao"
import { Campo, MensagemErro } from "../components/form/Campos"
import CartaoAcesso from "../components/CartaoAcesso"

export default function EsqueciSenha() {
  const [email, setEmail] = useState("")
  const [erro, setErro] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [enviadoPara, setEnviadoPara] = useState("")

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!emailValido(email)) {
      setErro("Informe um e-mail válido.")
      return
    }
    setErro("")
    setEnviando(true)
    try {
      await solicitarRedefinicaoSenha(email.trim())
      setEnviadoPara(email.trim())
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível enviar agora. Tente novamente.")
    } finally {
      setEnviando(false)
    }
  }

  // Mesma tela para qualquer e-mail: não dizemos se existe conta ou não
  if (enviadoPara) {
    return (
      <CartaoAcesso
        icone={<MailCheck size={26} />}
        titulo="Confira seu e-mail"
        descricao={
          <p role="status">
            Se existir uma conta com <span className="font-bold text-white">{enviadoPara}</span>, você vai receber um
            link para criar uma nova senha.
          </p>
        }
      >
        <p className="font-sora rounded-xl bg-eco-blue-soft px-4 py-3 text-xs text-eco-blue">
          O link vale por 30 minutos. Não chegou? Olhe também a caixa de spam.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link to="/login" className={BOTAO_PRIMARIO}>
            Voltar para o login
          </Link>
          <button type="button" onClick={() => setEnviadoPara("")} className={BOTAO_SECUNDARIO}>
            Usar outro e-mail
          </button>
        </div>
      </CartaoAcesso>
    )
  }

  return (
    <CartaoAcesso
      icone={<KeyRound size={26} />}
      titulo="Esqueceu a senha?"
      descricao={
        <p>Digite o e-mail da sua inscrição. Vamos enviar um link para você criar uma nova senha.</p>
      }
    >
      <form noValidate onSubmit={enviar} className="flex flex-col gap-5">
        <Campo
          label="E-mail"
          type="email"
          required
          autoComplete="email"
          placeholder="seuemail@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <MensagemErro>{erro}</MensagemErro>
        <button type="submit" disabled={enviando} className={`${BOTAO_PRIMARIO} py-3`}>
          {enviando ? "Enviando..." : "Enviar link"}
        </button>
        <Link to="/login" className="text-center font-sora text-sm font-bold text-eco-blue underline">
          Voltar para o login
        </Link>
      </form>
    </CartaoAcesso>
  )
}
