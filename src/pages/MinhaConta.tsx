import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import { CircleCheck, CircleX, Clock, Download, QrCode } from "lucide-react"
import { atualizarMeusDados, cancelarInscricao, minhaInscricao, trocarAtividades } from "../api/inscricoes"
import { useAuth } from "../hooks/useAuth"
import { useDadosEvento } from "../hooks/useDadosEvento"
import { BOTAO_PERIGO, BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CARTAO, SELO } from "../consts/estilos"
import { dentroDoPrazo, formatarData, formatarMoeda, formatarPeriodo } from "../helpers/formatar"
import { calcularTotal, horario } from "../helpers/atividades"
import { baixarComprovante } from "../helpers/arquivos"
import { limparDetalhes, validarDadosParticipante, type ErrosForm } from "../helpers/validacao"
import { MensagemErro, MensagemSucesso } from "../components/form/Campos"
import FormDadosParticipante from "../components/inscricao/FormDadosParticipante"
import SeletorMinicursos from "../components/inscricao/SeletorMinicursos"
import ResumoSelecao from "../components/inscricao/ResumoSelecao"
import PainelLateral from "../components/PainelLateral"
import Modal from "../components/Modal"
import type { DadosParticipante, Inscricao } from "../types/inscricao"

const SECOES = [
  { id: "inscricao", label: "Minha inscrição" },
  { id: "minicursos", label: "Minicursos" },
  { id: "dados", label: "Meus dados" },
]

function Bloco({ titulo, valor }: { titulo: string; valor: ReactNode }) {
  return (
    <div className="rounded-lg bg-eco-blue-soft px-3 py-2.5">
      <p className="font-sora text-[10px] text-eco-gray">{titulo}</p>
      <p className="font-sora mt-0.5 text-sm font-bold text-eco-blue">{valor}</p>
    </div>
  )
}

export default function MinhaConta() {
  const { usuario, sair, atualizarUsuario } = useAuth()
  const navigate = useNavigate()
  const { evento, atividades, recarregar } = useDadosEvento()

  const [inscricao, setInscricao] = useState<Inscricao | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erroCarregar, setErroCarregar] = useState("")
  const [secao, setSecao] = useState("inscricao")

  // Meus dados
  const [dados, setDados] = useState<DadosParticipante | null>(null)
  const [erros, setErros] = useState<ErrosForm>({})
  const [salvando, setSalvando] = useState(false)
  const [msgDados, setMsgDados] = useState({ erro: "", ok: "" })

  // Minicursos
  const [editandoMinicursos, setEditandoMinicursos] = useState(false)
  const [selecao, setSelecao] = useState<string[]>([])
  const [msgMinicursos, setMsgMinicursos] = useState({ erro: "", ok: "" })

  // Cancelamento
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false)
  const [erroCancelar, setErroCancelar] = useState("")
  const [processando, setProcessando] = useState(false)

  useEffect(() => {
    minhaInscricao()
      .then((i) => {
        setInscricao(i)
        setDados(i?.participante ?? null)
      })
      .catch((e) => setErroCarregar(e instanceof Error ? e.message : "Não foi possível carregar sua inscrição."))
      .finally(() => setCarregando(false))
  }, [])

  const irPara = (id: string) => {
    setSecao(id)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const fazerLogout = () => {
    sair()
    navigate("/")
  }

  if (carregando || !evento) {
    return (
      <section className="min-h-[70vh] bg-eco-cream px-6 py-24 text-center">
        <p className="font-sora text-eco-gray">Carregando...</p>
      </section>
    )
  }

  if (!inscricao || !dados || !usuario) {
    return (
      <section className="min-h-[70vh] bg-eco-cream px-6 py-24">
        <div className="mx-auto max-w-xl text-center">
          <MensagemErro>{erroCarregar || "Não encontramos uma inscrição nesta conta."}</MensagemErro>
          <Link to="/" className={`${BOTAO_SECUNDARIO} mt-6`}>
            Voltar ao início
          </Link>
        </div>
      </section>
    )
  }

  const confirmada = inscricao.status === "confirmada"
  const pendente = inscricao.status === "pendente"
  const podeTrocar = confirmada && dentroDoPrazo(evento.prazoTrocaAtividades)
  const podeCancelar = inscricao.status !== "cancelada" && dentroDoPrazo(evento.dataInicio)
  const temReembolso = dentroDoPrazo(evento.prazoReembolso)
  const escolhidas = atividades.filter((a) => inscricao.atividadesIds.includes(a.id))
  const dadosAlterados = JSON.stringify(dados) !== JSON.stringify(inscricao.participante)

  const salvarDados = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const novosErros = validarDadosParticipante(dados)
    setErros(novosErros)
    setMsgDados({ erro: "", ok: "" })
    if (Object.keys(novosErros).length) return
    setSalvando(true)
    try {
      const resposta = await atualizarMeusDados(limparDetalhes(dados))
      setInscricao(resposta.inscricao)
      setDados(resposta.inscricao.participante)
      atualizarUsuario(resposta.usuario)
      setMsgDados({ erro: "", ok: "Dados atualizados." })
    } catch (err) {
      setMsgDados({ erro: err instanceof Error ? err.message : "Não foi possível salvar.", ok: "" })
    } finally {
      setSalvando(false)
    }
  }

  const abrirTrocaMinicursos = () => {
    setSelecao(inscricao.atividadesIds)
    setMsgMinicursos({ erro: "", ok: "" })
    recarregar()
    setEditandoMinicursos(true)
  }

  const salvarMinicursos = async () => {
    setProcessando(true)
    setMsgMinicursos({ erro: "", ok: "" })
    try {
      const atualizada = await trocarAtividades(selecao)
      setInscricao(atualizada)
      await recarregar()
      setEditandoMinicursos(false)
      setMsgMinicursos({ erro: "", ok: "Minicursos atualizados." })
    } catch (err) {
      setMsgMinicursos({ erro: err instanceof Error ? err.message : "Não foi possível salvar.", ok: "" })
      recarregar()
    } finally {
      setProcessando(false)
    }
  }

  const confirmarCancelamento = async () => {
    setProcessando(true)
    setErroCancelar("")
    try {
      setInscricao(await cancelarInscricao())
      setConfirmandoCancelamento(false)
      recarregar()
    } catch (err) {
      setErroCancelar(err instanceof Error ? err.message : "Não foi possível cancelar.")
    } finally {
      setProcessando(false)
    }
  }

  return (
    <section className="min-h-[70vh] bg-eco-cream px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-sora text-3xl font-bold text-eco-blue sm:text-4xl">
          Olá, {usuario.nome.split(" ")[0]}!
        </h1>
        <p className="font-sora mt-2 text-eco-gray">
          Veja e atualize seus dados e acompanhe sua inscrição no evento.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr] lg:items-start">
          <PainelLateral
            nome={usuario.nome}
            email={usuario.email}
            selo={inscricao.participante.categoria}
            itens={SECOES}
            ativo={secao}
            onSelecionar={irPara}
            onSair={fazerLogout}
          />

          <div className="flex min-w-0 flex-col gap-6">
            {/* ---------- Minha inscrição ---------- */}
            <article id="inscricao" className={`${CARTAO} scroll-mt-24`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-sora text-xl font-bold text-eco-blue">Minha inscrição</h2>
                {confirmada ? (
                  <span className={`${SELO} bg-green-100 text-green-800`}>
                    <CircleCheck size={12} /> Inscrição confirmada
                  </span>
                ) : pendente ? (
                  <span className={`${SELO} bg-amber-100 text-amber-800`}>
                    <Clock size={12} /> Aguardando pagamento
                  </span>
                ) : (
                  <span className={`${SELO} bg-red-100 text-red-700`}>
                    <CircleX size={12} /> Inscrição cancelada
                  </span>
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <Bloco titulo="Nº da inscrição" valor={inscricao.numero} />
                <Bloco titulo="Data da inscrição" valor={formatarData(inscricao.criadaEm)} />
                <Bloco titulo="Evento" valor={formatarPeriodo(evento.dataInicio, evento.dataFim)} />
                <Bloco titulo="Valor total" valor={formatarMoeda(inscricao.valorTotal)} />
              </div>

              {pendente && (
                <p className="font-sora mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Sua vaga está reservada, mas a inscrição só é confirmada depois do pagamento.
                </p>
              )}

              {inscricao.status === "cancelada" && (
                <p className="font-sora mt-4 rounded-lg bg-eco-blue-soft px-4 py-3 text-sm text-eco-blue">
                  Cancelada em {formatarData(inscricao.canceladaEm ?? "")}.{" "}
                  {inscricao.reembolso
                    ? `O reembolso de ${formatarMoeda(inscricao.valorTotal)} foi solicitado e será processado pela organização.`
                    : inscricao.pagoEm
                      ? "O cancelamento foi feito depois do prazo de reembolso, então o valor não será devolvido."
                      : "A inscrição foi cancelada antes do pagamento, então não há valor a devolver."}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                {pendente ? (
                  <button type="button" onClick={() => navigate("/minha-conta/pagamento")} className={BOTAO_PRIMARIO}>
                    <QrCode size={16} />
                    Pagar agora
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => baixarComprovante(inscricao, evento, atividades)}
                    className={BOTAO_PRIMARIO}
                  >
                    <Download size={16} />
                    Baixar comprovante
                  </button>
                )}
                {podeCancelar && (
                  <button
                    type="button"
                    onClick={() => {
                      setErroCancelar("")
                      setConfirmandoCancelamento(true)
                    }}
                    className={BOTAO_SECUNDARIO}
                  >
                    Cancelar inscrição
                  </button>
                )}
              </div>
              {confirmada && (
                <p className="font-sora mt-3 text-[11px] text-eco-gray">
                  Cancelamentos até {formatarData(evento.prazoReembolso)} têm reembolso integral.
                </p>
              )}
            </article>

            {/* ---------- Minicursos ---------- */}
            <article id="minicursos" className={`${CARTAO} scroll-mt-24`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-sora text-xl font-bold text-eco-blue">Minicursos</h2>
                {podeTrocar && (
                  <button type="button" onClick={abrirTrocaMinicursos} className={BOTAO_SECUNDARIO}>
                    Alterar minicursos
                  </button>
                )}
              </div>
              {escolhidas.length ? (
                <ul className="mt-4 flex flex-col gap-3">
                  {escolhidas.map((a) => (
                    <li key={a.id} className="rounded-lg border border-eco-blue/15 bg-eco-blue-soft/50 px-4 py-3">
                      <p className="font-sora font-bold text-eco-blue">{a.titulo}</p>
                      <p className="font-sora mt-0.5 text-xs text-eco-gray">
                        com {a.palestrante} • Dia {String(a.dia).padStart(2, "0")} • {horario(a)} • {a.local}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="font-sora mt-4 text-sm text-eco-gray">Você não escolheu nenhum minicurso.</p>
              )}
              <div className="mt-3">
                <MensagemSucesso>{msgMinicursos.ok}</MensagemSucesso>
              </div>
              {pendente && (
                <p className="font-sora mt-3 text-[11px] text-eco-gray">
                  Depois do pagamento você poderá trocar seus minicursos.
                </p>
              )}
              {confirmada && (
                <p className="font-sora mt-3 text-[11px] text-eco-gray">
                  {podeTrocar
                    ? `Você pode trocar seus minicursos até ${formatarData(evento.prazoTrocaAtividades)}.`
                    : "O prazo para trocar minicursos terminou."}
                </p>
              )}
            </article>

            {/* ---------- Meus dados ---------- */}
            <form id="dados" noValidate onSubmit={salvarDados} className={`${CARTAO} scroll-mt-24`}>
              <h2 className="font-sora text-xl font-bold text-eco-blue">Meus dados</h2>
              <p className="font-sora mb-5 mt-1 text-[11px] text-eco-gray">
                Mantenha suas informações atualizadas para receber o certificado corretamente.
              </p>
              <FormDadosParticipante dados={dados} onChange={setDados} erros={erros} mostrarSelos={false} />

              <div className="mt-5 flex flex-col gap-3">
                <MensagemErro>{msgDados.erro}</MensagemErro>
                <MensagemSucesso>{msgDados.ok}</MensagemSucesso>
              </div>
              <div className="mt-5 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  disabled={!dadosAlterados || salvando}
                  onClick={() => {
                    setDados(inscricao.participante)
                    setErros({})
                    setMsgDados({ erro: "", ok: "" })
                  }}
                  className={BOTAO_SECUNDARIO}
                >
                  Descartar
                </button>
                <button type="submit" disabled={!dadosAlterados || salvando} className={BOTAO_PRIMARIO}>
                  {salvando ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Modal
        aberto={confirmandoCancelamento}
        titulo="Cancelar inscrição?"
        onFechar={() => !processando && setConfirmandoCancelamento(false)}
      >
        <div className="flex flex-col gap-3 font-sora text-sm text-eco-gray">
          <p>Sua vaga no evento e nos minicursos será liberada. Esta ação não pode ser desfeita.</p>
          <p className="rounded-lg bg-eco-blue-soft px-4 py-3 text-eco-blue">
            {pendente
              ? "Como o pagamento ainda não foi feito, não há valor a devolver."
              : temReembolso
              ? `Como você está cancelando até ${formatarData(evento.prazoReembolso)}, terá reembolso integral de ${formatarMoeda(inscricao.valorTotal)}.`
              : `O prazo de reembolso terminou em ${formatarData(evento.prazoReembolso)}. O valor pago não será devolvido.`}
          </p>
          <MensagemErro>{erroCancelar}</MensagemErro>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            disabled={processando}
            onClick={() => setConfirmandoCancelamento(false)}
            className={BOTAO_SECUNDARIO}
          >
            Manter inscrição
          </button>
          <button type="button" disabled={processando} onClick={confirmarCancelamento} className={BOTAO_PERIGO}>
            {processando ? "Cancelando..." : "Cancelar inscrição"}
          </button>
        </div>
      </Modal>

      <Modal
        aberto={editandoMinicursos}
        titulo="Alterar minicursos"
        largura="max-w-5xl"
        onFechar={() => !processando && setEditandoMinicursos(false)}
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
          <SeletorMinicursos
            atividades={atividades}
            evento={evento}
            selecionados={selecao}
            reservados={inscricao.atividadesIds}
            onAlternar={(id) =>
              setSelecao((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]))
            }
          />
          <ResumoSelecao evento={evento} atividades={atividades} selecionados={selecao}>
            {calcularTotal(evento, atividades, selecao) !== inscricao.valorTotal && (
              <p className="rounded-lg bg-white/10 px-3 py-2 font-sora text-xs">
                O valor da sua inscrição passará de {formatarMoeda(inscricao.valorTotal)} para{" "}
                {formatarMoeda(calcularTotal(evento, atividades, selecao))}.
              </p>
            )}
            {msgMinicursos.erro && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 font-sora text-xs text-red-700">
                {msgMinicursos.erro}
              </p>
            )}
            <button
              type="button"
              disabled={processando}
              onClick={salvarMinicursos}
              className="rounded-full bg-white px-6 py-3 font-sora font-bold text-eco-blue hover:opacity-90 disabled:opacity-60 cursor-pointer"
            >
              {processando ? "Salvando..." : "Salvar minicursos"}
            </button>
            <button
              type="button"
              disabled={processando}
              onClick={() => setEditandoMinicursos(false)}
              className="rounded-full border-[1.5px] border-white px-6 py-3 font-sora font-bold text-white hover:bg-white/10 cursor-pointer"
            >
              Voltar
            </button>
          </ResumoSelecao>
        </div>
      </Modal>
    </section>
  )
}
