import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react"

const estiloInput =
  "w-full rounded-lg border border-eco-blue/15 bg-eco-field px-4 py-3 font-sora text-sm text-eco-blue outline-none placeholder:text-eco-gray-light/70 focus:border-eco-blue disabled:opacity-60"

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  erro?: string
  ajuda?: ReactNode
}

// Label + input no padrão do Figma. "required" também põe o asterisco.
export function Campo({ label, erro, ajuda, required, className = "", ...props }: CampoProps) {
  const id = useId()
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="font-sora text-xs font-bold text-eco-blue">
        {label}
        {required && " *"}
      </label>
      <input
        id={id}
        required={required}
        aria-invalid={!!erro}
        aria-describedby={erro ? `${id}-erro` : undefined}
        className={`${estiloInput} ${erro ? "border-red-400" : ""}`}
        {...props}
      />
      {ajuda && !erro && <p className="font-sora text-[11px] text-eco-gray">{ajuda}</p>}
      {erro && (
        <p id={`${id}-erro`} className="font-sora text-xs text-red-600">
          {erro}
        </p>
      )}
    </div>
  )
}

interface SelecaoProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  opcoes: { valor: string; label: string }[]
}

export function Selecao({ label, opcoes, required, className = "", ...props }: SelecaoProps) {
  const id = useId()
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="font-sora text-xs font-bold text-eco-blue">
        {label}
        {required && " *"}
      </label>
      <select id={id} required={required} className={estiloInput} {...props}>
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

interface GrupoPillsProps<T extends string> {
  legenda: string
  nome: string
  opcoes: { valor: T; label: string }[]
  valor: T | null
  onChange: (valor: T) => void
  required?: boolean
}

// Radios com cara de pílula (Categoria, Sim/Não). Continuam sendo radios
// de verdade por baixo, então setas do teclado e leitores de tela funcionam.
export function GrupoPills<T extends string>({ legenda, nome, opcoes, valor, onChange, required }: GrupoPillsProps<T>) {
  return (
    <fieldset>
      <legend className="font-sora text-xs font-bold text-eco-blue">
        {legenda}
        {required && " *"}
      </legend>
      <div className="mt-2 flex flex-wrap gap-3">
        {opcoes.map((o) => {
          const ativo = valor === o.valor
          return (
            <label
              key={o.valor}
              className={`flex min-w-28 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-[1.5px] border-eco-blue px-5 py-2.5 font-sora text-sm font-bold transition-colors has-focus-visible:ring-2 has-focus-visible:ring-eco-green sm:max-w-44 ${
                ativo ? "bg-eco-blue text-white" : "bg-white text-eco-blue hover:bg-eco-blue/5"
              }`}
            >
              <input
                type="radio"
                name={nome}
                value={o.valor}
                checked={ativo}
                required={required}
                onChange={() => onChange(o.valor)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border-[1.5px] ${
                  ativo ? "border-white" : "border-eco-blue"
                }`}
              >
                {ativo && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              {o.label}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

interface CaixaSelecaoProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  children: ReactNode
}

export function CaixaSelecao({ children, className = "", ...props }: CaixaSelecaoProps) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 font-sora text-xs text-eco-blue ${className}`}>
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-eco-blue"
        {...props}
      />
      <span>{children}</span>
    </label>
  )
}

// Caixa azul-clara usada para os blocos condicionais do formulário
export function Painel({ titulo, selo, children }: { titulo: string; selo?: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-eco-blue/10 bg-eco-blue-soft p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-sora text-sm font-bold text-eco-blue">{titulo}</h3>
        {selo && (
          <span className="rounded-full bg-eco-blue px-2.5 py-0.5 font-sora text-[10px] font-bold text-white">
            {selo}
          </span>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

export function MensagemErro({ children }: { children: ReactNode }) {
  if (!children) return null
  return (
    <p role="alert" className="font-sora rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
      {children}
    </p>
  )
}

export function MensagemSucesso({ children }: { children: ReactNode }) {
  if (!children) return null
  return (
    <p role="status" className="font-sora rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
      {children}
    </p>
  )
}
