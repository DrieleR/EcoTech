import { useEffect, useId, useRef, type ReactNode } from "react"
import { X } from "lucide-react"

interface ModalProps {
  aberto: boolean
  titulo: string
  onFechar: () => void
  children: ReactNode
  largura?: string
}

// Usa o <dialog> nativo: ele já prende o foco dentro do modal, fecha com Esc
// e devolve o foco para quem abriu.
export default function Modal({ aberto, titulo, onFechar, children, largura = "max-w-lg" }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const idTitulo = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (aberto && !dialog.open) dialog.showModal()
    if (!aberto && dialog.open) dialog.close()
  }, [aberto])

  return (
    <dialog
      ref={ref}
      // Esc não fecha sozinho: quem manda é o estado "aberto", para o modal
      // não sumir no meio de uma ação (ex.: enquanto salva)
      onCancel={(e) => {
        e.preventDefault()
        onFechar()
      }}
      aria-labelledby={idTitulo}
      className={`m-auto w-[calc(100%-2rem)] ${largura} rounded-2xl border border-eco-blue bg-white p-0 backdrop:bg-eco-blue-dark/60`}
    >
      {aberto && (
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2 id={idTitulo} className="font-sora text-xl font-bold text-eco-blue">
              {titulo}
            </h2>
            <button
              type="button"
              onClick={onFechar}
              aria-label="Fechar"
              className="rounded-full p-1 text-eco-blue hover:bg-eco-blue/10 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
          <div className="mt-5">{children}</div>
        </div>
      )}
    </dialog>
  )
}
