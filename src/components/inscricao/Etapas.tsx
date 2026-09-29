import { Fragment } from "react"
import { Check } from "lucide-react"

// Indicador "1 Seus dados — 2 Minicursos — 3 Confirmação"
export default function Etapas({ etapas, atual }: { etapas: string[]; atual: number }) {
  return (
    <ol className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-2 sm:gap-3" aria-label="Etapas da inscrição">
      {etapas.map((nome, i) => {
        const concluida = i < atual
        const ativa = i === atual
        return (
          <Fragment key={nome}>
            {i > 0 && (
              <li aria-hidden className={`h-0.5 flex-1 ${concluida || ativa ? "bg-eco-green-dark" : "bg-eco-blue/15"}`} />
            )}
            <li className="flex shrink-0 items-center gap-2" aria-current={ativa ? "step" : undefined}>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full font-sora text-xs font-bold ${
                  concluida
                    ? "bg-eco-green-dark text-white"
                    : ativa
                      ? "bg-eco-blue text-white"
                      : "border-[1.5px] border-eco-blue/30 bg-white text-eco-blue"
                }`}
              >
                {concluida ? <Check size={14} strokeWidth={3} /> : i + 1}
              </span>
              <span className={`hidden font-sora text-xs font-bold sm:inline ${ativa ? "text-eco-blue" : "text-eco-gray"}`}>
                {nome}
                {concluida && <span className="sr-only"> (concluída)</span>}
              </span>
            </li>
          </Fragment>
        )
      })}
    </ol>
  )
}
