import type { ReactNode } from "react"

interface Props {
  icone?: ReactNode
  titulo: string
  descricao: ReactNode
  children: ReactNode
}

// Cartão centralizado das telas de acesso (login, esqueci e redefinir senha):
// topo azul com a mensagem principal e, embaixo, o formulário.
export default function CartaoAcesso({ icone, titulo, descricao, children }: Props) {
  return (
    <section className="min-h-[70vh] bg-eco-cream px-6 py-16 lg:py-20">
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-eco-blue bg-white shadow-xl shadow-eco-blue/10">
        <header className="bg-eco-blue px-8 pb-8 pt-10 text-center text-white">
          {icone && (
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-eco-green">
              {icone}
            </span>
          )}
          <h1 className="font-sora text-2xl font-bold">{titulo}</h1>
          <div className="font-sora mx-auto mt-2 max-w-xs text-sm text-white/80">{descricao}</div>
        </header>
        <div className="px-8 py-8 sm:px-10">{children}</div>
      </div>
    </section>
  )
}
