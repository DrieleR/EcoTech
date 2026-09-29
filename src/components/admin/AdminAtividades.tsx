import { useState, type FormEvent } from "react"
import { Pencil, Plus, Trash } from "lucide-react"
import { excluirAtividade, salvarAtividade, type AtividadeForm } from "../../api/admin"
import { BOTAO_PERIGO, BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CARTAO } from "../../consts/estilos"
import { dataDoDia, formatarMoeda } from "../../helpers/formatar"
import { horario } from "../../helpers/atividades"
import { Campo, MensagemErro, MensagemSucesso, Selecao } from "../form/Campos"
import Modal from "../Modal"
import type { AtividadeComVagas, DadosEvento, Nivel, TipoAtividadeInscricao } from "../../types/inscricao"

const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado", "Todos os níveis"]
const TIPOS: TipoAtividadeInscricao[] = ["Minicurso", "Oficina"]

const NOVA: AtividadeForm = {
  titulo: "",
  tipo: "Minicurso",
  palestrante: "",
  dia: 1,
  inicio: "09:00",
  fim: "11:00",
  local: "",
  nivel: "Iniciante",
  vagas: 30,
  valor: 0,
}

interface Props {
  atividades: AtividadeComVagas[]
  evento: DadosEvento
  onAlterar: () => Promise<void>
}

export default function AdminAtividades({ atividades, evento, onAlterar }: Props) {
  const [form, setForm] = useState<AtividadeForm | null>(null)
  const [excluindo, setExcluindo] = useState<AtividadeComVagas | null>(null)
  const [erro, setErro] = useState("")
  const [aviso, setAviso] = useState("")
  const [salvando, setSalvando] = useState(false)

  // Quantidade de dias do evento, para o seletor de "Dia"
  const totalDias =
    Math.round((new Date(evento.dataFim).getTime() - new Date(evento.dataInicio).getTime()) / 86_400_000) + 1

  const alterar = <K extends keyof AtividadeForm>(campo: K, valor: AtividadeForm[K]) =>
    setForm((f) => (f ? { ...f, [campo]: valor } : f))

  const abrir = (atividade?: AtividadeComVagas) => {
    setErro("")
    setAviso("")
    if (!atividade) return setForm({ ...NOVA })
    // "ocupadas" é calculado pelo servidor, não faz parte do formulário
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ocupadas, ...dados } = atividade
    setForm(dados)
  }

  const salvar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form) return
    setSalvando(true)
    setErro("")
    try {
      await salvarAtividade({ ...form, titulo: form.titulo.trim(), palestrante: form.palestrante.trim(), local: form.local.trim() })
      await onAlterar()
      setAviso(form.id ? "Atividade atualizada." : "Atividade criada.")
      setForm(null)
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível salvar.")
    } finally {
      setSalvando(false)
    }
  }

  const confirmarExclusao = async () => {
    if (!excluindo) return
    setSalvando(true)
    setErro("")
    try {
      await excluirAtividade(excluindo.id)
      await onAlterar()
      setAviso("Atividade excluída.")
      setExcluindo(null)
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível excluir.")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <article className={CARTAO}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-sora text-lg font-bold text-eco-blue">Minicursos e oficinas</h2>
          <p className="font-sora mt-1 text-xs text-eco-gray">
            Atividades com vagas que o participante escolhe na inscrição. Valor 0 = incluso na inscrição de{" "}
            {formatarMoeda(evento.valorInscricao)}.
          </p>
        </div>
        <button type="button" onClick={() => abrir()} className={BOTAO_PRIMARIO}>
          <Plus size={16} />
          Nova atividade
        </button>
      </div>

      <div className="mt-4">
        <MensagemSucesso>{aviso}</MensagemSucesso>
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {[...atividades]
          .sort((a, b) => a.dia - b.dia || a.inicio.localeCompare(b.inicio))
          .map((a) => (
            <li
              key={a.id}
              className="flex flex-col gap-3 rounded-xl border border-eco-blue/20 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-sora font-bold text-eco-blue">
                  {a.titulo} <span className="font-normal text-eco-gray">· {a.tipo}</span>
                </p>
                <p className="font-sora mt-1 text-xs text-eco-gray">
                  com {a.palestrante} • Dia {a.dia} ({dataDoDia(evento.dataInicio, a.dia)}) • {horario(a)} • {a.local} • {a.nivel}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <div className="text-right font-sora text-xs">
                  <p className="font-bold text-eco-blue">{a.valor ? formatarMoeda(a.valor) : "Incluso"}</p>
                  <p className={a.ocupadas >= a.vagas ? "font-bold text-red-700" : "text-eco-gray"}>
                    {a.ocupadas}/{a.vagas} vagas
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => abrir(a)}
                  aria-label={`Editar ${a.titulo}`}
                  className="rounded-full p-2 text-eco-blue hover:bg-eco-blue/10 cursor-pointer"
                >
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErro("")
                    setAviso("")
                    setExcluindo(a)
                  }}
                  aria-label={`Excluir ${a.titulo}`}
                  className="rounded-full p-2 text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  <Trash size={18} />
                </button>
              </div>
            </li>
          ))}
        {atividades.length === 0 && (
          <li className="rounded-xl border border-dashed border-eco-blue/30 p-6 text-center font-sora text-sm text-eco-gray">
            Nenhuma atividade cadastrada.
          </li>
        )}
      </ul>

      <Modal
        aberto={!!form}
        titulo={form?.id ? "Editar atividade" : "Nova atividade"}
        largura="max-w-2xl"
        onFechar={() => !salvando && setForm(null)}
      >
        {form && (
          <form onSubmit={salvar} className="flex flex-col gap-4">
            <Campo label="Título" required value={form.titulo} onChange={(e) => alterar("titulo", e.target.value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Selecao
                label="Tipo"
                value={form.tipo}
                onChange={(e) => alterar("tipo", e.target.value as TipoAtividadeInscricao)}
                opcoes={TIPOS.map((t) => ({ valor: t, label: t }))}
              />
              <Campo
                label="Quem ministra"
                required
                value={form.palestrante}
                onChange={(e) => alterar("palestrante", e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Selecao
                label="Dia"
                value={String(form.dia)}
                onChange={(e) => alterar("dia", Number(e.target.value))}
                opcoes={Array.from({ length: Math.max(1, totalDias) }, (_, i) => ({
                  valor: String(i + 1),
                  label: `Dia ${i + 1} — ${dataDoDia(evento.dataInicio, i + 1)}`,
                }))}
              />
              <Campo label="Início" type="time" required value={form.inicio} onChange={(e) => alterar("inicio", e.target.value)} />
              <Campo label="Término" type="time" required value={form.fim} onChange={(e) => alterar("fim", e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Local" required value={form.local} onChange={(e) => alterar("local", e.target.value)} placeholder="Ex.: LAB INFO" />
              <Selecao
                label="Nível"
                value={form.nivel}
                onChange={(e) => alterar("nivel", e.target.value as Nivel)}
                opcoes={NIVEIS.map((n) => ({ valor: n, label: n }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo
                label="Vagas"
                type="number"
                min={1}
                required
                value={form.vagas}
                onChange={(e) => alterar("vagas", Number(e.target.value))}
              />
              <Campo
                label="Valor (R$)"
                type="number"
                min={0}
                step="0.01"
                required
                value={form.valor}
                onChange={(e) => alterar("valor", Number(e.target.value))}
                ajuda="Use 0 para incluir no valor da inscrição."
              />
            </div>
            <MensagemErro>{erro}</MensagemErro>
            <div className="flex flex-wrap justify-end gap-3">
              <button type="button" disabled={salvando} onClick={() => setForm(null)} className={BOTAO_SECUNDARIO}>
                Cancelar
              </button>
              <button type="submit" disabled={salvando} className={BOTAO_PRIMARIO}>
                {salvando ? "Salvando..." : "Salvar atividade"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal aberto={!!excluindo} titulo="Excluir atividade?" onFechar={() => !salvando && setExcluindo(null)}>
        <p className="font-sora text-sm text-eco-gray">
          “{excluindo?.titulo}” deixará de aparecer na inscrição. Atividades com inscritos não podem ser excluídas.
        </p>
        <div className="mt-4">
          <MensagemErro>{erro}</MensagemErro>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" disabled={salvando} onClick={() => setExcluindo(null)} className={BOTAO_SECUNDARIO}>
            Cancelar
          </button>
          <button type="button" disabled={salvando} onClick={confirmarExclusao} className={BOTAO_PERIGO}>
            {salvando ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </Modal>
    </article>
  )
}
