import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ITENS_EVENTO } from "../consts/sobreEvento"

const Sobre = () => {
  const [indiceAtivo, setIndiceAtivo] = useState(0)

  const irParaAnterior = () => {
    setIndiceAtivo((atual) =>
      atual === 0 ? ITENS_EVENTO.length - 1 : atual - 1
    )
  }

  const irParaProximo = () => {
    setIndiceAtivo((atual) =>
      atual === ITENS_EVENTO.length - 1 ? 0 : atual + 1
    )
  }

  return (
    <section className="min-h-[70vh] bg-eco-cream px-6 py-24">
      <div className="mx-auto grid w-full min-w-0 max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="font-sora text-sm font-extrabold uppercase tracking-widest text-eco-green-dark">
            Sobre o evento
          </p>
          <h1 className="font-sora mt-4 text-3xl font-bold leading-tight text-eco-blue sm:text-4xl lg:text-5xl">
            Um encontro para quem constrói software na região
          </h1>
          <p className="font-sora mt-6 text-lg text-eco-gray">
            O EcoTech nasce como o primeiro evento de engenharia de software e
            meio ambiente voltado à realidade amazônica: conectividade
            limitada, dados ambientais, times distribuídos e desafios que
            raramente aparecem nos grandes centros. A proposta é reunir
            estudantes, pesquisadoras e profissionais para discutir prática,
            arquitetura e sustentabilidade a partir daqui.
          </p>
        </div>

        <div className="relative min-w-0 rounded-3xl bg-eco-blue px-6 py-8 sm:px-10 sm:py-10">
            <div className="min-w-0 overflow-hidden">
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${indiceAtivo * 100}%)` }}
                >
                    {ITENS_EVENTO.map((item) => (
                    <div key={item.titulo} className="w-full shrink-0">
                        <p className="font-sora text-2xl text-center font-extrabold tracking-wide text-eco-green">
                        {item.titulo.toUpperCase()}
                        </p>
                        <p className="font-sora mt-4 min-h-24 text-lg font-semibold text-white">
                        {item.descricao}
                        </p>
                    </div>
                    ))}
                </div>
            </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={irParaAnterior}
              aria-label="Item anterior"
              className="rounded-full border-2 border-white/30 p-2 text-white hover:border-eco-green hover:text-eco-green cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex gap-2">
              {ITENS_EVENTO.map((item, index) => (
                <button
                  key={item.titulo}
                  onClick={() => setIndiceAtivo(index)}
                  aria-label={`Ir para ${item.titulo}`}
                  className={`h-2.5 w-2.5 rounded-full transition-colors cursor-pointer ${
                    index === indiceAtivo ? "bg-eco-green" : "bg-white/30"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={irParaProximo}
              aria-label="Próximo item"
              className="rounded-full border-2 border-white/30 p-2 text-white hover:border-eco-green hover:text-eco-green cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Sobre
