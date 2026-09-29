import { useState, type FormEvent } from "react"
import { atualizarEvento } from "../../api/admin"
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CARTAO } from "../../consts/estilos"
import { Campo, MensagemErro, MensagemSucesso } from "../form/Campos"
import type { DadosEvento } from "../../types/inscricao"

interface Props {
  evento: DadosEvento
  onSalvo: (evento: DadosEvento) => void
}

export default function AdminEvento({ evento, onSalvo }: Props) {
  const [form, setForm] = useState<DadosEvento>(evento)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState({ erro: "", ok: "" })

  const alterado = JSON.stringify(form) !== JSON.stringify(evento)

  const alterar = <K extends keyof DadosEvento>(campo: K, valor: DadosEvento[K]) => {
    setForm((f) => ({ ...f, [campo]: valor }))
    setMsg({ erro: "", ok: "" })
  }

  const salvar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSalvando(true)
    setMsg({ erro: "", ok: "" })
    try {
      const salvo = await atualizarEvento({ ...form, nome: form.nome.trim(), local: form.local.trim() })
      onSalvo(salvo)
      setForm(salvo)
      setMsg({ erro: "", ok: "Dados do evento atualizados." })
    } catch (err) {
      setMsg({ erro: err instanceof Error ? err.message : "Não foi possível salvar.", ok: "" })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={salvar} className={`${CARTAO} flex flex-col gap-6`}>
      <div>
        <h2 className="font-sora text-lg font-bold text-eco-blue">Dados do evento</h2>
        <p className="font-sora mt-1 text-xs text-eco-gray">
          Estas informações aparecem na inscrição, na conta do participante e no comprovante.
        </p>
      </div>

      <fieldset className="flex flex-col gap-4">
        <legend className="font-sora mb-3 text-sm font-bold text-eco-blue">Informações gerais</legend>
        <Campo label="Nome do evento" required value={form.nome} onChange={(e) => alterar("nome", e.target.value)} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo label="Data de início" type="date" required value={form.dataInicio} onChange={(e) => alterar("dataInicio", e.target.value)} />
          <Campo label="Data de término" type="date" required value={form.dataFim} onChange={(e) => alterar("dataFim", e.target.value)} />
          <Campo label="Horário" required value={form.horario} onChange={(e) => alterar("horario", e.target.value)} placeholder="Ex.: 9h às 15h45" />
        </div>
        <Campo label="Local" required value={form.local} onChange={(e) => alterar("local", e.target.value)} />
      </fieldset>

      <fieldset className="flex flex-col gap-4 rounded-xl bg-eco-blue-soft p-4 sm:p-5">
        <legend className="sr-only">Valores e regras</legend>
        <p className="font-sora text-sm font-bold text-eco-blue">Valores e regras da inscrição</p>
        <Campo
          label="Valor da inscrição (R$)"
          type="number"
          min={0}
          step="0.01"
          required
          value={form.valorInscricao}
          onChange={(e) => alterar("valorInscricao", Number(e.target.value))}
          className="[&_input]:bg-white sm:max-w-xs"
        />
        <Campo
          label="O que a inscrição inclui"
          required
          value={form.incluiNaInscricao}
          onChange={(e) => alterar("incluiNaInscricao", e.target.value)}
          className="[&_input]:bg-white"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            label="Prazo para trocar minicursos"
            type="date"
            required
            max={form.dataInicio}
            value={form.prazoTrocaAtividades}
            onChange={(e) => alterar("prazoTrocaAtividades", e.target.value)}
            className="[&_input]:bg-white"
          />
          <Campo
            label="Prazo para reembolso"
            type="date"
            required
            max={form.dataInicio}
            value={form.prazoReembolso}
            onChange={(e) => alterar("prazoReembolso", e.target.value)}
            ajuda="Quem cancelar até esta data recebe o valor de volta."
            className="[&_input]:bg-white"
          />
        </div>
      </fieldset>

      <MensagemErro>{msg.erro}</MensagemErro>
      <MensagemSucesso>{msg.ok}</MensagemSucesso>

      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" disabled={!alterado || salvando} onClick={() => setForm(evento)} className={BOTAO_SECUNDARIO}>
          Descartar
        </button>
        <button type="submit" disabled={!alterado || salvando} className={BOTAO_PRIMARIO}>
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </form>
  )
}
