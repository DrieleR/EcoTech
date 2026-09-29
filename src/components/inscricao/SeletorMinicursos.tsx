import { useState } from "react"
import { Check } from "lucide-react"
import { conflitam, esgotada, horario } from "../../helpers/atividades"
import { dataDoDia, formatarMoeda } from "../../helpers/formatar"
import type { AtividadeComVagas, DadosEvento } from "../../types/inscricao"

interface Props {
  atividades: AtividadeComVagas[]
  evento: DadosEvento
  selecionados: string[]
  onAlternar: (id: string) => void
  // Vagas que a pessoa já tinha antes de editar (não contam como esgotadas para ela)
  reservados?: string[]
}

const CHIP = "rounded-full bg-eco-blue-soft px-2.5 py-1 font-sora text-[11px] font-bold text-eco-blue"

export default function SeletorMinicursos({ atividades, evento, selecionados, onAlternar, reservados = [] }: Props) {
  const [diaFiltro, setDiaFiltro] = useState<number | null>(null)

  const dias = [...new Set(atividades.map((a) => a.dia))].sort((a, b) => a - b)
  const escolhidas = atividades.filter((a) => selecionados.includes(a.id))

  const filtros: { valor: number | null; label: string }[] = [
    { valor: null, label: "Todos os dias" },
    ...dias.map((d) => ({ valor: d, label: `Dia ${String(d).padStart(2, "0")}` })),
  ]

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {filtros.map((f) => (
          <button
            key={f.label}
            type="button"
            aria-pressed={diaFiltro === f.valor}
            onClick={() => setDiaFiltro(f.valor)}
            className={`rounded-full px-5 py-2 font-sora text-sm font-bold transition-colors cursor-pointer ${
              diaFiltro === f.valor
                ? "bg-eco-blue text-white"
                : "border-[1.5px] border-eco-blue text-eco-blue hover:bg-eco-blue/5"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {dias
        .filter((d) => diaFiltro === null || d === diaFiltro)
        .map((dia) => (
          <section key={dia} className="mt-8">
            <h2 className="font-sora text-lg font-bold text-eco-blue">
              Dia {String(dia).padStart(2, "0")} — {dataDoDia(evento.dataInicio, dia)}
            </h2>
            <div className="mt-3 flex flex-col gap-4">
              {atividades
                .filter((a) => a.dia === dia)
                .sort((a, b) => a.inicio.localeCompare(b.inicio))
                .map((a) => {
                  const marcada = selecionados.includes(a.id)
                  const semVagas = esgotada(a) && !reservados.includes(a.id)
                  const conflito = !marcada ? escolhidas.find((b) => conflitam(a, b)) : undefined
                  const bloqueada = !marcada && (semVagas || !!conflito)
                  const ocupacao = Math.min(100, (a.ocupadas / a.vagas) * 100)

                  return (
                    <label
                      key={a.id}
                      className={`block rounded-xl border p-4 transition-colors sm:p-5 ${
                        marcada
                          ? "border-2 border-eco-blue bg-eco-blue-soft/60"
                          : bloqueada
                            ? "cursor-not-allowed border-eco-blue/15 bg-eco-field"
                            : "cursor-pointer border-eco-blue bg-white hover:bg-eco-blue-soft/40"
                      }`}
                    >
                      <div className="flex gap-3">
                        <input
                          type="checkbox"
                          checked={marcada}
                          disabled={bloqueada}
                          onChange={() => onAlternar(a.id)}
                          className="peer sr-only"
                        />
                        <span
                          aria-hidden
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-[1.5px] peer-focus-visible:ring-2 peer-focus-visible:ring-eco-green ${
                            marcada ? "border-eco-blue bg-eco-blue text-white" : bloqueada ? "border-eco-blue/20 bg-eco-blue/5" : "border-eco-blue"
                          }`}
                        >
                          {marcada && <Check size={14} strokeWidth={3} />}
                        </span>

                        <div className={`min-w-0 flex-1 ${bloqueada ? "opacity-50" : ""}`}>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="font-sora font-bold text-eco-blue">{a.titulo}</p>
                              <p className="font-sora text-xs text-eco-gray">com {a.palestrante}</p>
                            </div>
                            <div className="w-full shrink-0 sm:w-36">
                              {semVagas ? (
                                <span className="float-right rounded-full bg-red-100 px-2.5 py-0.5 font-sora text-[11px] font-bold text-red-700">
                                  Esgotado
                                </span>
                              ) : (
                                <p className="text-right font-sora text-[11px] text-eco-gray">
                                  <span className="font-bold text-eco-blue">{a.vagas - a.ocupadas}</span> de {a.vagas} vagas livres
                                </p>
                              )}
                              <div className="clear-both mt-1.5 h-1.5 rounded-full bg-eco-blue-soft">
                                <div
                                  className={`h-full rounded-full ${semVagas ? "bg-eco-gray-light" : "bg-eco-blue"}`}
                                  style={{ width: `${ocupacao}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className={CHIP}>{horario(a)}</span>
                            <span className={CHIP}>{a.local}</span>
                            <span className={CHIP}>{a.nivel}</span>
                            <span className={`${CHIP} ${a.valor === 0 ? "bg-green-100 text-green-800" : ""}`}>
                              {a.valor === 0 ? "Incluso na inscrição" : `+ ${formatarMoeda(a.valor)}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {conflito && !semVagas && (
                        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 font-sora text-xs font-bold text-amber-800">
                          Mesmo dia e horário de “{conflito.titulo}”. Desmarque aquele para escolher este.
                        </p>
                      )}
                      {semVagas && !marcada && (
                        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 font-sora text-xs font-bold text-red-700">
                          As vagas acabaram.
                        </p>
                      )}                    </label>
                  )
                })}
            </div>
          </section>
        ))}

      {atividades.length === 0 && (
        <p className="mt-8 rounded-xl border border-dashed border-eco-blue/30 bg-white p-6 text-center font-sora text-sm text-eco-gray">
          Ainda não há minicursos cadastrados.
        </p>
      )}
    </div>
  )
}
