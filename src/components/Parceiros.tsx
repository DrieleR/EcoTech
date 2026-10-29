import { useSite } from "../hooks/useSite"
import { CardPatrocinador } from "../shared/CardPatrocinador"

const Parceiros = () => {
  const { sobre } = useSite()
  return (
    <section className="min-h-[70vh] bg-eco-cream px-6 py-24">
      <div className="mx-auto max-w-6xl text-center">
        <h1 className="font-sora text-4xl font-bold text-eco-blue lg:text-5xl">
          Parceiros
        </h1>
        <p className="font-sora mt-4 text-lg text-eco-gray">
          Empresas e instituições que tornam esse encontro possível.
        </p>

        <p className="font-sora mt-14 text-left text-sm font-extrabold tracking-[2px] text-eco-blue">
          PARCEIROS
        </p>

        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {sobre.parceiros.map((p) => (
            <CardPatrocinador key={p.id} nome={p.nome} logo={p.logo} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Parceiros