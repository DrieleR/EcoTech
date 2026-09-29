import { useCallback, useEffect, useState, type FormEvent } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { Check, Download } from "lucide-react"
import { criarInscricao } from "../api/inscricoes"
import { useAuth } from "../hooks/useAuth"
import { useDadosEvento } from "../hooks/useDadosEvento"
import { ETAPAS_INSCRICAO } from "../consts/inscricao"
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CARTAO } from "../consts/estilos"
import { formatarDataHora, formatarMoeda } from "../helpers/formatar"
import { baixarComprovante } from "../helpers/arquivos"
import { horario } from "../helpers/atividades"
import {
  DADOS_VAZIOS,
  limparDetalhes,
  validarDadosParticipante,
  validarSenha,
  type ErrosForm,
} from "../helpers/validacao"
import { CaixaSelecao, Campo, MensagemErro } from "../components/form/Campos"
import FormDadosParticipante from "../components/inscricao/FormDadosParticipante"
import SeletorMinicursos from "../components/inscricao/SeletorMinicursos"
import ResumoSelecao from "../components/inscricao/ResumoSelecao"
import Etapas from "../components/inscricao/Etapas"
import PagamentoPix from "../components/inscricao/PagamentoPix"
import { ResumoDados, SelosAcessibilidade } from "../components/inscricao/Leitura"
import type { DadosParticipante, Inscricao as InscricaoFeita } from "../types/inscricao"

export default function Inscricao() {
  const { usuario, iniciarSessao } = useAuth()
  const navigate = useNavigate()
  const { evento, atividades, erro: erroCarregar, recarregar } = useDadosEvento()

  const [etapa, setEtapa] = useState(0)
  const [dados, setDados] = useState<DadosParticipante>(DADOS_VAZIOS)
  const [senha, setSenha] = useState("")
  const [confirmacao, setConfirmacao] = useState("")
  const [aceite, setAceite] = useState(false)
  const [erros, setErros] = useState<ErrosForm>({})
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState("")
  const [inscricao, setInscricao] = useState<InscricaoFeita | null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [etapa])

  const aoPagar = useCallback((paga: InscricaoFeita) => {
    setInscricao(paga)
    setEtapa(3)
  }, [])

  // Quem já tem conta vai direto para a sua área (exceto logo após se inscrever)
  if (usuario && !inscricao) {
    return <Navigate to={usuario.perfil === "admin" ? "/admin" : "/minha-conta"} replace />
  }

  const irParaMinicursos = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const novosErros = { ...validarDadosParticipante(dados), ...validarSenha(senha, confirmacao) }
    if (!aceite) novosErros.aceite = "É preciso concordar para continuar."
    setErros(novosErros)
    if (Object.keys(novosErros).length > 0) {
      // Leva o foco ao primeiro campo com problema
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    setEtapa(1)
  }

  const alternar = (id: string) =>
    setSelecionados((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]))

  const concluir = async (ids: string[]) => {
    setEnviando(true)
    setErroEnvio("")
    try {
      const resposta = await criarInscricao({ participante: limparDetalhes(dados), senha, atividadesIds: ids })
      setInscricao(resposta.inscricao)
      iniciarSessao(resposta.sessao)
      // Com valor a pagar vai para o QR Code; gratuita vai direto à confirmação
      setEtapa(resposta.inscricao.status === "pendente" ? 2 : 3)
    } catch (err) {
      setErroEnvio(err instanceof Error ? err.message : "Não foi possível concluir a inscrição.")
      // As vagas podem ter mudado enquanto a pessoa escolhia
      recarregar()
    } finally {
      setEnviando(false)
    }
  }

  if (!evento) {
    return (
      <section className="min-h-[70vh] bg-eco-cream px-6 py-24 text-center">
        {erroCarregar ? <MensagemErro>{erroCarregar}</MensagemErro> : <p className="font-sora text-eco-gray">Carregando...</p>}
      </section>
    )
  }

  // ---------- Etapa 4: confirmação ----------
  if (etapa === 3 && inscricao) {
    const escolhidas = atividades.filter((a) => inscricao.atividadesIds.includes(a.id))
    return (
      <section className="min-h-[70vh] bg-eco-cream px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-eco-green-dark text-white">
            <Check size={34} strokeWidth={3} />
          </span>
          <h1 className="font-sora mt-6 text-3xl font-bold text-eco-blue sm:text-4xl">Inscrição confirmada!</h1>
          <p className="font-sora mt-3 text-eco-gray">
            Enviamos um e-mail para <span className="font-bold">{inscricao.participante.email}</span> com o
            comprovante e os detalhes do evento.
          </p>
          <p className="mt-6 inline-block rounded-full bg-eco-blue px-6 py-2.5 font-sora text-sm font-bold text-white">
            Nº da inscrição: {inscricao.numero}
          </p>

          <div className={`${CARTAO} mt-8 text-left`}>
            <h2 className="font-sora font-bold text-eco-blue">Seus dados</h2>
            <div className="mt-4">
              <ResumoDados inscricao={inscricao} />
            </div>

            <h2 className="font-sora mt-6 font-bold text-eco-blue">Minicursos</h2>
            {escolhidas.length ? (
              <ul className="mt-2 flex flex-col gap-1 font-sora text-sm text-eco-gray">
                {escolhidas.map((a) => (
                  <li key={a.id}>
                    <span className="font-bold text-eco-blue">{a.titulo}</span> — Dia {a.dia}, {horario(a)}, {a.local}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-sora mt-2 text-sm text-eco-gray">Nenhum minicurso escolhido.</p>
            )}

            <h2 className="font-sora mt-6 font-bold text-eco-blue">Acessibilidade solicitada</h2>
            <div className="mt-2">
              <SelosAcessibilidade inscricao={inscricao} />
            </div>

            <h2 className="font-sora mt-6 font-bold text-eco-blue">Comprovante de pagamento</h2>
            <dl className="mt-2 grid gap-1.5 rounded-xl bg-eco-blue-soft p-4 font-sora text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-eco-gray">Forma de pagamento</dt>
                <dd className="text-eco-blue">{inscricao.pagoEm ? "Pix" : "Sem cobrança"}</dd>
              </div>
              {inscricao.pagoEm && (
                <div className="flex justify-between gap-4">
                  <dt className="text-eco-gray">Pago em</dt>
                  <dd className="text-eco-blue">{formatarDataHora(inscricao.pagoEm)}</dd>
                </div>
              )}
              <div className="mt-1 flex justify-between gap-4 border-t border-eco-blue/15 pt-2 text-base font-bold text-eco-blue">
                <dt>Valor pago</dt>
                <dd>{formatarMoeda(inscricao.valorTotal)}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => navigate("/minha-conta")} className={BOTAO_PRIMARIO}>
              Ir para minha conta
            </button>
            <button
              type="button"
              onClick={() => baixarComprovante(inscricao, evento, atividades)}
              className={BOTAO_SECUNDARIO}
            >
              <Download size={16} />
              Baixar comprovante
            </button>
          </div>
        </div>
      </section>
    )
  }

  // ---------- Etapa 3: pagamento ----------
  if (etapa === 2 && inscricao) {
    return (
      <section className="min-h-[70vh] bg-eco-cream px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h1 className="font-sora text-4xl font-bold text-eco-blue lg:text-5xl">Pagamento</h1>
            <p className="font-sora mx-auto mt-4 max-w-xl text-eco-gray">
              Leia o QR Code com o celular para pagar e confirmar sua inscrição.
            </p>
            <Etapas etapas={ETAPAS_INSCRICAO} atual={2} />
          </div>
          <div className="mt-10">
            <PagamentoPix inscricao={inscricao} evento={evento} atividades={atividades} onPago={aoPagar} />
          </div>
          <p className="font-sora mt-6 text-center text-xs text-eco-gray">
            Sua vaga fica reservada. Se preferir, pague depois pela página Minha conta.
          </p>
        </div>
      </section>
    )
  }

  // ---------- Etapa 2: minicursos ----------
  if (etapa === 1) {
    return (
      <section className="min-h-[70vh] bg-eco-cream px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="font-sora text-4xl font-bold text-eco-blue lg:text-5xl">Escolha seus minicursos</h1>
            <p className="font-sora mx-auto mt-4 max-w-xl text-eco-gray">
              Escolha quantos minicursos quiser. As vagas são limitadas e garantidas por ordem de inscrição.
            </p>
            <Etapas etapas={ETAPAS_INSCRICAO} atual={1} />
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
            <SeletorMinicursos
              atividades={atividades}
              evento={evento}
              selecionados={selecionados}
              onAlternar={alternar}
            />
            <ResumoSelecao evento={evento} atividades={atividades} selecionados={selecionados}>
              {erroEnvio && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 font-sora text-xs text-red-700">
                  {erroEnvio}
                </p>
              )}
              <button
                type="button"
                disabled={enviando}
                onClick={() => concluir(selecionados)}
                className="rounded-full bg-white px-6 py-3 font-sora font-bold text-eco-blue hover:opacity-90 disabled:cursor-wait disabled:opacity-60 cursor-pointer"
              >
                {enviando ? "Enviando..." : "Continuar para o pagamento"}
              </button>
              <button
                type="button"
                disabled={enviando}
                onClick={() => setEtapa(0)}
                className="rounded-full border-[1.5px] border-white px-6 py-3 font-sora font-bold text-white hover:bg-white/10 cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={enviando}
                onClick={() => {
                  setSelecionados([])
                  concluir([])
                }}
                className="font-sora text-center text-xs text-white/80 underline hover:text-white cursor-pointer"
              >
                Pular — não quero participar de minicursos
              </button>
            </ResumoSelecao>
          </div>
        </div>
      </section>
    )
  }

  // ---------- Etapa 1: dados ----------
  return (
    <section className="min-h-[70vh] bg-eco-cream px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <h1 className="font-sora text-4xl font-bold text-eco-blue lg:text-5xl">Faça sua inscrição</h1>
          <p className="font-sora mx-auto mt-4 max-w-xl text-eco-gray">
            Garanta sua vaga no Encontro de {evento.nome}. A inscrição custa{" "}
            <span className="font-bold">{formatarMoeda(evento.valorInscricao)}</span> e leva menos de 2 minutos.
          </p>
          <Etapas etapas={ETAPAS_INSCRICAO} atual={0} />
        </div>

        <form noValidate onSubmit={irParaMinicursos} className={`${CARTAO} mt-8`}>
          <h2 className="font-sora text-xl font-bold text-eco-blue">Dados do participante</h2>
          <p className="font-sora mb-5 mt-1 text-[11px] text-eco-gray">Campos com * são obrigatórios.</p>

          <FormDadosParticipante dados={dados} onChange={setDados} erros={erros} />

          <h2 className="font-sora mt-8 text-lg font-bold text-eco-blue">Acesso à sua conta</h2>
          <p className="font-sora mt-1 text-xs text-eco-gray">
            Com seu e-mail e esta senha você entra em Minha conta para editar dados, trocar minicursos ou cancelar.
          </p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Campo
              label="Senha"
              type="password"
              required
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              erro={erros.senha}
              ajuda="Mínimo de 8 caracteres, com letras e números."
            />
            <Campo
              label="Confirmar senha"
              type="password"
              required
              autoComplete="new-password"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              erro={erros.confirmacao}
            />
          </div>

          <CaixaSelecao
            className="mt-6"
            checked={aceite}
            onChange={(e) => setAceite(e.target.checked)}
            aria-invalid={!!erros.aceite}
          >
            Concordo em receber comunicações sobre o evento e com o uso dos meus dados para a inscrição.
          </CaixaSelecao>
          {erros.aceite && <p className="font-sora mt-1 text-xs text-red-600">{erros.aceite}</p>}

          <div className="mt-8 flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
            <p className="font-sora text-xs text-eco-gray">
              Já se inscreveu?{" "}
              <Link to="/login" className="font-bold text-eco-blue underline">
                Entre na sua conta
              </Link>
            </p>
            <button type="submit" className={BOTAO_PRIMARIO}>
              Continuar para minicursos
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
