import type { ReactNode } from "react"
import { calcularTotal, horario } from "../../helpers/atividades"
import { formatarData, formatarMoeda } from "../../helpers/formatar"
import type { AtividadeEvento, DadosEvento } from "../../types/inscricao"

interface Props {
  evento: DadosEvento
  atividades: AtividadeEvento[]
  selecionados: string[]
  children: ReactNode
}

// Cartão azul "Sua seleção" ao lado da lista de minicursos
export default function ResumoSelecao({ evento, atividades, selecionados, children }: Props) {
  const escolhidas = atividades.filter((a) => selecionados.includes(a.id))
  const extras = escolhidas.reduce((soma, a) => soma + a.valor, 0)

  return (
    <aside className="rounded-2xl bg-eco-blue p-6 text-white lg:sticky lg:top-24">
      <h2 className="font-sora text-xl font-bold">Sua seleção</h2>
      <p className="font-sora mt-1 text-xs text-white/80" aria-live="polite">
        {escolhidas.length === 1 ? "1 minicurso escolhido" : `${escolhidas.length} minicursos escolhidos`}
      </p>

      <ul className="mt-5 flex flex-col gap-2">
        {escolhidas.map((a) => (
          <li key={a.id} className="rounded-lg bg-white/10 px-4 py-3">
            <p className="font-sora text-sm font-bold">{a.titulo}</p>
            <p className="font-sora mt-0.5 text-[11px] text-white/70">
              Dia {String(a.dia).padStart(2, "0")} • {horario(a)} • {a.local}
            </p>
          </li>
        ))}
        {escolhidas.length === 0 && (
          <li className="rounded-lg border border-dashed border-white/30 px-4 py-3 font-sora text-xs text-white/70">
            Marque os minicursos que quiser fazer. Eles são opcionais.
          </li>
        )}
      </ul>

      <dl className="mt-5 flex flex-col gap-1.5 border-t border-white/15 pt-4 font-sora text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-white/80">Inscrição no evento</dt>
          <dd>{formatarMoeda(evento.valorInscricao)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-white/80">Minicursos</dt>
          <dd>{formatarMoeda(extras)}</dd>
        </div>
        <div className="mt-1 flex justify-between gap-4 text-base font-bold">
          <dt>Total</dt>
          <dd>{formatarMoeda(calcularTotal(evento, atividades, selecionados))}</dd>
        </div>
      </dl>
      <p className="font-sora mt-2 text-[11px] text-white/70">
        A inscrição inclui: {evento.incluiNaInscricao}
      </p>

      <p className="font-sora mt-4 text-[11px] text-white/70">
        Minicursos no mesmo dia e horário não podem ser escolhidos juntos. Você pode trocar sua escolha até{" "}
        {formatarData(evento.prazoTrocaAtividades)} na página Minha conta.
      </p>

      <div className="mt-5 flex flex-col gap-3">{children}</div>
    </aside>
  )
}
