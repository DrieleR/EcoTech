import type { ReactNode } from "react"
import { LogOut } from "lucide-react"
import { iniciais } from "../helpers/formatar"

interface Item {
  id: string
  label: string
  icon?: ReactNode
}

interface Props {
  nome: string
  email: string
  selo: string
  itens: Item[]
  ativo: string
  onSelecionar: (id: string) => void
  onSair: () => void
}

// Cartão azul da lateral com avatar e menu (conta do participante e admin)
export default function PainelLateral({ nome, email, selo, itens, ativo, onSelecionar, onSair }: Props) {
  return (
    <aside className="rounded-2xl bg-eco-blue p-5 text-white lg:sticky lg:top-24">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-eco-blue-soft font-sora text-xl font-bold text-eco-blue">
          {iniciais(nome)}
        </span>
        <p className="font-sora mt-3 font-bold">{nome}</p>
        <p className="font-sora mt-1 break-all text-[11px] text-white/70">{email}</p>
        <span className="mt-3 rounded-full bg-white/15 px-3 py-1 font-sora text-[11px] font-bold">{selo}</span>
      </div>

      <nav className="mt-5 flex flex-col gap-1 border-t border-white/15 pt-4" aria-label="Seções">
        {itens.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={ativo === item.id ? "page" : undefined}
            onClick={() => onSelecionar(item.id)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left font-sora text-sm font-bold transition-colors cursor-pointer ${
              ativo === item.id ? "bg-white text-eco-blue" : "text-white hover:bg-white/10"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onSair}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-left font-sora text-sm text-white/80 hover:bg-white/10 cursor-pointer"
        >
          <LogOut size={16} />
          Sair da conta
        </button>
      </nav>
    </aside>
  )
}
