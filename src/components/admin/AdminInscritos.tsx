import { useEffect, useMemo, useState } from "react"
import { Accessibility, Download, Eye, Search } from "lucide-react"
import { listarInscritos } from "../../api/admin"
import { CATEGORIAS, OPCOES_ACESSIBILIDADE } from "../../consts/inscricao"
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CARTAO, SELO } from "../../consts/estilos"
import { exportarInscritosCsv } from "../../helpers/arquivos"
import { formatarData, formatarMoeda } from "../../helpers/formatar"
import { horario } from "../../helpers/atividades"
import { CaixaSelecao, MensagemErro, Selecao } from "../form/Campos"
import { ResumoDados, SelosAcessibilidade } from "../inscricao/Leitura"
import Modal from "../Modal"
import type { AtividadeEvento, Inscricao } from "../../types/inscricao"

function Indicador({ titulo, valor }: { titulo: string; valor: string | number }) {
  return (
    <div className="rounded-xl border border-eco-blue bg-white px-4 py-3">
      <p className="font-sora text-[11px] text-eco-gray">{titulo}</p>
      <p className="font-sora mt-1 text-2xl font-bold text-eco-blue">{valor}</p>
    </div>
  )
}

function SeloStatus({ inscricao }: { inscricao: Inscricao }) {
  if (inscricao.status === "confirmada") return <span className={`${SELO} bg-green-100 text-green-800`}>Confirmada</span>
  if (inscricao.status === "pendente") return <span className={`${SELO} bg-amber-100 text-amber-800`}>Aguardando pagamento</span>
  return (
    <span className={`${SELO} bg-red-100 text-red-700`}>
      {inscricao.reembolso ? "Cancelada · reembolso" : "Cancelada"}
    </span>
  )
}

export default function AdminInscritos({ atividades }: { atividades: AtividadeEvento[] }) {
  const [inscritos, setInscritos] = useState<Inscricao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")

  const [busca, setBusca] = useState("")
  const [categoria, setCategoria] = useState("")
  const [status, setStatus] = useState("")
  const [soAcessibilidade, setSoAcessibilidade] = useState(false)
  const [detalhe, setDetalhe] = useState<Inscricao | null>(null)

  useEffect(() => {
    listarInscritos()
      .then(setInscritos)
      .catch((e) => setErro(e instanceof Error ? e.message : "Não foi possível carregar os inscritos."))
      .finally(() => setCarregando(false))
  }, [])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return inscritos.filter((i) => {
      const p = i.participante
      if (termo && ![p.nome, p.email, i.numero].some((t) => t.toLowerCase().includes(termo))) return false
      if (categoria && p.categoria !== categoria) return false
      if (status && i.status !== status) return false
      if (soAcessibilidade && !p.pcd) return false
      return true
    })
  }, [inscritos, busca, categoria, status, soAcessibilidade])

  const confirmadas = inscritos.filter((i) => i.status === "confirmada")
  const pendentes = inscritos.filter((i) => i.status === "pendente")
  // Quem vai ao evento: confirmadas + pendentes (a vaga já está reservada)
  const comAcessibilidade = [...confirmadas, ...pendentes].filter((i) => i.participante.pcd)
  // Arrecadação: tudo que foi pago e não teve reembolso
  const arrecadado = inscritos
    .filter((i) => i.pagoEm && !i.reembolso)
    .reduce((soma, i) => soma + i.valorTotal, 0)

  // Quantas pessoas precisam de cada recurso, para a organização se preparar
  const porRecurso = OPCOES_ACESSIBILIDADE.map((o) => ({
    ...o,
    total: comAcessibilidade.filter((i) => i.participante.recursos.includes(o.id)).length,
  }))
  const outros = comAcessibilidade.filter((i) => i.participante.outroRecurso)

  const nomeAtividade = (id: string) => atividades.find((a) => a.id === id)?.titulo ?? "Atividade removida"

  if (carregando) return <p className="font-sora text-eco-gray">Carregando inscritos...</p>
  if (erro) return <MensagemErro>{erro}</MensagemErro>

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Indicador titulo="Inscrições confirmadas" valor={confirmadas.length} />
        <Indicador titulo="Pedem acessibilidade" valor={comAcessibilidade.length} />
        <Indicador titulo="Aguardando pagamento" valor={pendentes.length} />
        <Indicador titulo="Arrecadação" valor={formatarMoeda(arrecadado)} />
      </div>

      <article className={CARTAO}>
        <h2 className="flex items-center gap-2 font-sora text-lg font-bold text-eco-blue">
          <Accessibility size={20} />
          Acessibilidade necessária
        </h2>
        <p className="font-sora mt-1 text-xs text-eco-gray">Entre as inscrições confirmadas e aguardando pagamento.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {porRecurso.map((r) => (
            <span
              key={r.id}
              className={`rounded-full px-3 py-1.5 font-sora text-xs font-bold ${
                r.total ? "bg-eco-blue text-white" : "bg-eco-blue-soft text-eco-gray"
              }`}
            >
              {r.label}: {r.total}
            </span>
          ))}
          <span
            className={`rounded-full px-3 py-1.5 font-sora text-xs font-bold ${
              outros.length ? "bg-eco-blue text-white" : "bg-eco-blue-soft text-eco-gray"
            }`}
          >
            Outros pedidos: {outros.length}
          </span>
        </div>
      </article>

      <article className={CARTAO}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-sora text-lg font-bold text-eco-blue">Lista de inscritos</h2>
          <button
            type="button"
            disabled={filtrados.length === 0}
            onClick={() => exportarInscritosCsv(filtrados, atividades)}
            className={BOTAO_PRIMARIO}
          >
            <Download size={16} />
            Exportar CSV ({filtrados.length})
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_180px_180px] md:items-end">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="busca-inscritos" className="font-sora text-xs font-bold text-eco-blue">
              Buscar
            </label>
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-eco-gray" />
              <input
                id="busca-inscritos"
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Nome, e-mail ou nº da inscrição"
                className="w-full rounded-lg border border-eco-blue/15 bg-eco-field py-3 pl-9 pr-4 font-sora text-sm text-eco-blue outline-none focus:border-eco-blue"
              />
            </div>
          </div>
          <Selecao
            label="Categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            opcoes={[{ valor: "", label: "Todas" }, ...CATEGORIAS.map((c) => ({ valor: c, label: c }))]}
          />
          <Selecao
            label="Situação"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            opcoes={[
              { valor: "", label: "Todas" },
              { valor: "confirmada", label: "Confirmadas" },
              { valor: "pendente", label: "Aguardando pagamento" },
              { valor: "cancelada", label: "Canceladas" },
            ]}
          />
        </div>
        <CaixaSelecao className="mt-4" checked={soAcessibilidade} onChange={(e) => setSoAcessibilidade(e.target.checked)}>
          Mostrar só quem pediu acessibilidade
        </CaixaSelecao>

        <div className="mt-5 overflow-x-auto rounded-xl border border-eco-blue/15">
          <table className="w-full min-w-[760px] text-left font-sora text-sm">
            <thead className="bg-eco-blue-soft text-xs text-eco-blue">
              <tr>
                <th scope="col" className="px-4 py-3">Inscrito</th>
                <th scope="col" className="px-4 py-3">Categoria</th>
                <th scope="col" className="px-4 py-3">Minicursos</th>
                <th scope="col" className="px-4 py-3">Acessibilidade</th>
                <th scope="col" className="px-4 py-3">Valor</th>
                <th scope="col" className="px-4 py-3">Situação</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-eco-blue/10">
              {filtrados.map((i) => (
                <tr key={i.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-bold text-eco-blue">{i.participante.nome}</p>
                    <p className="text-xs text-eco-gray">{i.participante.email}</p>
                    <p className="text-[11px] text-eco-gray-light">{i.numero}</p>
                  </td>
                  <td className="px-4 py-3 text-eco-gray">{i.participante.categoria}</td>
                  <td className="px-4 py-3 text-xs text-eco-gray">
                    {i.atividadesIds.length ? i.atividadesIds.map(nomeAtividade).join(", ") : "—"}
                  </td>
                  <td className="max-w-56 px-4 py-3">
                    <SelosAcessibilidade inscricao={i} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-eco-blue">{formatarMoeda(i.valorTotal)}</td>
                  <td className="px-4 py-3"><SeloStatus inscricao={i} /></td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setDetalhe(i)}
                      aria-label={`Ver detalhes de ${i.participante.nome}`}
                      className="rounded-full p-2 text-eco-blue hover:bg-eco-blue/10 cursor-pointer"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-eco-gray">
                    Nenhuma inscrição encontrada com esses filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      <Modal aberto={!!detalhe} titulo={detalhe?.participante.nome ?? ""} largura="max-w-2xl" onFechar={() => setDetalhe(null)}>
        {detalhe && (
          <div className="flex flex-col gap-5 font-sora text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold text-eco-blue">{detalhe.numero}</span>
              <SeloStatus inscricao={detalhe} />
              <span className="text-xs text-eco-gray">Inscrito em {formatarData(detalhe.criadaEm)}</span>
            </div>
            <div className="grid gap-1 text-eco-gray">
              <p><span className="font-bold text-eco-blue">E-mail:</span> {detalhe.participante.email}</p>
              <p><span className="font-bold text-eco-blue">Telefone:</span> {detalhe.participante.telefone}</p>
            </div>
            <ResumoDados inscricao={detalhe} />
            <div>
              <h3 className="font-bold text-eco-blue">Acessibilidade</h3>
              <div className="mt-2"><SelosAcessibilidade inscricao={detalhe} /></div>
            </div>
            <div>
              <h3 className="font-bold text-eco-blue">Minicursos</h3>
              <ul className="mt-2 flex flex-col gap-1 text-eco-gray">
                {detalhe.atividadesIds.length === 0 && <li>Nenhum.</li>}
                {detalhe.atividadesIds.map((id) => {
                  const a = atividades.find((x) => x.id === id)
                  return <li key={id}>{a ? `${a.titulo} — Dia ${a.dia}, ${horario(a)}` : "Atividade removida"}</li>
                })}
              </ul>
            </div>
            <p className="flex justify-between border-t border-eco-blue/15 pt-3 font-bold text-eco-blue">
              <span>Valor total</span>
              <span>{formatarMoeda(detalhe.valorTotal)}</span>
            </p>
            <button type="button" onClick={() => setDetalhe(null)} className={`${BOTAO_SECUNDARIO} self-end`}>
              Fechar
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
