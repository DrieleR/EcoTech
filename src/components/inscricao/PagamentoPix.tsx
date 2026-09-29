import { useCallback, useEffect, useState } from "react"
import QRCode from "qrcode"
import { RefreshCw, Smartphone } from "lucide-react"
import { minhaInscricao, obterCobranca, simularPagamento } from "../../api/inscricoes"
import { BOTAO_SECUNDARIO, CARTAO } from "../../consts/estilos"
import { formatarMoeda } from "../../helpers/formatar"
import { MensagemErro } from "../form/Campos"
import type { AtividadeEvento, DadosEvento, Inscricao } from "../../types/inscricao"

interface Props {
  inscricao: Inscricao
  evento: DadosEvento
  atividades: AtividadeEvento[]
  onPago: (inscricao: Inscricao) => void
}

const INTERVALO_CONSULTA_MS = 3000

const PASSOS = [
  "Abra a câmera ou o app do seu banco no celular.",
  "Aponte para o QR Code ao lado.",
  "Pronto! Esta tela avança sozinha quando o pagamento for aprovado.",
]

export default function PagamentoPix({ inscricao, evento, atividades, onPago }: Props) {
  const [qr, setQr] = useState("")
  const [url, setUrl] = useState("")
  const [erro, setErro] = useState("")
  const [simulando, setSimulando] = useState(false)

  const gerarCobranca = useCallback(async () => {
    setErro("")
    setQr("")
    try {
      const cobranca = await obterCobranca()
      setUrl(cobranca.url)
      setQr(await QRCode.toDataURL(cobranca.url, { width: 260, margin: 1, color: { dark: "#03285b" } }))
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível gerar o QR Code.")
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- gera o QR ao abrir a tela
    gerarCobranca()
  }, [gerarCobranca])

  // Pergunta ao servidor, de tempos em tempos, se o pagamento já caiu
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const atual = await minhaInscricao()
        if (atual?.status === "confirmada") onPago(atual)
      } catch {
        // Falha pontual de rede: tenta de novo na próxima volta
      }
    }, INTERVALO_CONSULTA_MS)
    return () => clearInterval(id)
  }, [onPago])

  // Atalho só em desenvolvimento, para testar sem celular
  const simularAqui = async () => {
    setSimulando(true)
    try {
      await simularPagamento(new URL(url).searchParams.get("token") ?? "")
      const atual = await minhaInscricao()
      if (atual) onPago(atual)
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível simular o pagamento.")
    } finally {
      setSimulando(false)
    }
  }

  const escolhidas = atividades.filter((a) => inscricao.atividadesIds.includes(a.id))

  return (
    <div className={`${CARTAO} grid gap-8 md:grid-cols-[auto_1fr] md:items-start`}>
      <div className="flex flex-col items-center">
        <div className="flex h-[272px] w-[272px] items-center justify-center rounded-2xl border-2 border-eco-blue bg-white p-1.5">
          {qr ? (
            <img src={qr} alt="QR Code para pagar a inscrição" className="h-full w-full" />
          ) : (
            <span className="font-sora text-sm text-eco-gray">{erro ? "QR Code indisponível" : "Gerando QR Code..."}</span>
          )}
        </div>
        <p role="status" className="mt-4 flex items-center gap-2 font-sora text-sm font-bold text-eco-blue">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75 motion-reduce:hidden" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
          </span>
          Aguardando pagamento...
        </p>
        <button type="button" onClick={gerarCobranca} className="mt-3 inline-flex items-center gap-1.5 font-sora text-xs font-bold text-eco-blue underline cursor-pointer">
          <RefreshCw size={12} />
          Gerar novo QR Code
        </button>
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        <div>
          <h2 className="font-sora text-lg font-bold text-eco-blue">Como pagar</h2>
          <ol className="mt-3 flex flex-col gap-2.5">
            {PASSOS.map((passo, i) => (
              <li key={passo} className="flex items-start gap-3 font-sora text-sm text-eco-gray">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-eco-blue font-bold text-white text-xs">
                  {i + 1}
                </span>
                <span className="pt-0.5">{passo}</span>
              </li>
            ))}
          </ol>
        </div>

        <dl className="flex flex-col gap-1.5 rounded-xl bg-eco-blue-soft p-4 font-sora text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-eco-gray">Inscrição no evento</dt>
            <dd className="text-eco-blue">{formatarMoeda(evento.valorInscricao)}</dd>
          </div>
          {escolhidas.map((a) => (
            <div key={a.id} className="flex justify-between gap-4">
              <dt className="min-w-0 truncate text-eco-gray">{a.titulo}</dt>
              <dd className="shrink-0 text-eco-blue">{a.valor ? formatarMoeda(a.valor) : "Incluso"}</dd>
            </div>
          ))}
          <div className="mt-1 flex justify-between gap-4 border-t border-eco-blue/15 pt-2 text-base font-bold text-eco-blue">
            <dt>Total</dt>
            <dd>{formatarMoeda(inscricao.valorTotal)}</dd>
          </div>
        </dl>

        <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 font-sora text-xs text-amber-900">
          <Smartphone size={16} className="mt-0.5 shrink-0" />
          <span>
            <strong>Pagamento de teste:</strong> nenhum valor é cobrado. Ler o QR Code aprova a inscrição na hora. O
            celular precisa estar no mesmo Wi-Fi que este computador.
          </span>
        </p>

        <MensagemErro>{erro}</MensagemErro>

        {import.meta.env.DEV && url && (
          <button type="button" disabled={simulando} onClick={simularAqui} className={`${BOTAO_SECUNDARIO} self-start`}>
            {simulando ? "Simulando..." : "Sem celular? Simular pagamento aqui"}
          </button>
        )}
      </div>
    </div>
  )
}
