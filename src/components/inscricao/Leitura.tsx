import type { ReactNode } from "react"
import { CAMPOS_CATEGORIA, ROTULO_RECURSO } from "../../consts/inscricao"
import type { Inscricao } from "../../types/inscricao"

// Campo só de leitura, com a mesma cara de um input desabilitado
export function CampoLeitura({ label, valor }: { label: string; valor: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-sora text-xs font-bold text-eco-blue">{label}</span>
      <span className="rounded-lg border border-eco-blue/15 bg-eco-blue-soft px-4 py-3 font-sora text-sm text-eco-gray">
        {valor || "—"}
      </span>
    </div>
  )
}

export function SelosAcessibilidade({ inscricao }: { inscricao: Inscricao }) {
  const p = inscricao.participante
  if (!p.pcd) return <p className="font-sora text-sm text-eco-gray">Nenhum recurso solicitado.</p>
  return (
    <div className="flex flex-wrap gap-2">
      {p.recursos.map((r) => (
        <span key={r} className="rounded-full bg-eco-blue px-3 py-1 font-sora text-[11px] font-bold text-white">
          {ROTULO_RECURSO[r]}
        </span>
      ))}
      {p.outroRecurso && (
        <span className="rounded-full bg-eco-blue px-3 py-1 font-sora text-[11px] font-bold text-white">
          {p.outroRecurso}
        </span>
      )}
    </div>
  )
}

// Nome, categoria e os campos específicos da categoria
export function ResumoDados({ inscricao }: { inscricao: Inscricao }) {
  const p = inscricao.participante
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <CampoLeitura label="Nome" valor={p.nome} />
      <CampoLeitura label="Categoria" valor={p.categoria} />
      {CAMPOS_CATEGORIA[p.categoria].campos.map((c) => (
        <CampoLeitura key={c.chave} label={c.label} valor={p.detalhes[c.chave]} />
      ))}
    </div>
  )
}
