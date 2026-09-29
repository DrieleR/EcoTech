import { useCallback, useEffect, useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { minhaInscricao } from "../api/inscricoes"
import { useDadosEvento } from "../hooks/useDadosEvento"
import PagamentoPix from "../components/inscricao/PagamentoPix"
import { MensagemErro } from "../components/form/Campos"
import type { Inscricao } from "../types/inscricao"

// "Pagar agora" da conta: para quem fez a inscrição e saiu antes de pagar
export default function PagarInscricao() {
  const navigate = useNavigate()
  const { evento, atividades } = useDadosEvento()
  const [inscricao, setInscricao] = useState<Inscricao | null>(null)
  const [erro, setErro] = useState("")

  useEffect(() => {
    minhaInscricao()
      .then(setInscricao)
      .catch((e) => setErro(e instanceof Error ? e.message : "Não foi possível carregar sua inscrição."))
  }, [])

  const aoPagar = useCallback(() => navigate("/minha-conta", { replace: true }), [navigate])

  if (inscricao && inscricao.status !== "pendente") return <Navigate to="/minha-conta" replace />

  return (
    <section className="min-h-[70vh] bg-eco-cream px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <Link to="/minha-conta" className="inline-flex items-center gap-1.5 font-sora text-sm font-bold text-eco-blue hover:underline">
          <ArrowLeft size={16} />
          Voltar para minha conta
        </Link>
        <h1 className="font-sora mt-4 text-4xl font-bold text-eco-blue">Pagamento</h1>
        <p className="font-sora mt-2 text-eco-gray">Leia o QR Code com o celular para confirmar sua inscrição.</p>
        <div className="mt-8">
          {erro && <MensagemErro>{erro}</MensagemErro>}
          {!erro && (!inscricao || !evento) && <p className="font-sora text-eco-gray">Carregando...</p>}
          {inscricao && evento && (
            <PagamentoPix inscricao={inscricao} evento={evento} atividades={atividades} onPago={aoPagar} />
          )}
        </div>
      </div>
    </section>
  )
}
