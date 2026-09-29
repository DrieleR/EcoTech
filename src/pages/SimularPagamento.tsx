import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { CircleCheck, CircleX, Loader } from "lucide-react"
import { simularPagamento } from "../api/inscricoes"
import { formatarMoeda } from "../helpers/formatar"
import CartaoAcesso from "../components/CartaoAcesso"

// Página aberta no celular ao ler o QR Code (/pagamento/simular?token=...).
// Enquanto não há Pix de verdade, abrir esta página já aprova o pagamento.
export default function SimularPagamento() {
  const [params] = useSearchParams()
  const [estado, setEstado] = useState<"processando" | "pago" | "erro">("processando")
  const [mensagem, setMensagem] = useState("")
  // Em desenvolvimento o React roda o efeito duas vezes; o link só vale uma
  const jaEnviado = useRef(false)

  useEffect(() => {
    if (jaEnviado.current) return
    jaEnviado.current = true
    simularPagamento(params.get("token") ?? "")
      .then((r) => {
        setMensagem(`Inscrição ${r.numero} • ${formatarMoeda(r.valor)}`)
        setEstado("pago")
      })
      .catch((e) => {
        setMensagem(e instanceof Error ? e.message : "Não foi possível aprovar o pagamento.")
        setEstado("erro")
      })
  }, [params])

  if (estado === "processando") {
    return (
      <CartaoAcesso icone={<Loader size={26} className="animate-spin" />} titulo="Processando pagamento" descricao={<p>Só um instante...</p>}>
        <p className="font-sora text-center text-sm text-eco-gray">Não feche esta página.</p>
      </CartaoAcesso>
    )
  }

  if (estado === "erro") {
    return (
      <CartaoAcesso icone={<CircleX size={26} />} titulo="Pagamento não concluído" descricao={<p>{mensagem}</p>}>
        <p className="font-sora text-center text-sm text-eco-gray">
          Na tela do computador, clique em “Gerar novo QR Code” e leia de novo.
        </p>
      </CartaoAcesso>
    )
  }

  return (
    <CartaoAcesso icone={<CircleCheck size={26} />} titulo="Pagamento aprovado!" descricao={<p role="status">{mensagem}</p>}>
      <p className="font-sora text-center text-sm text-eco-gray">
        Pode voltar para a tela do computador: ela vai avançar sozinha para a confirmação.
      </p>
    </CartaoAcesso>
  )
}
