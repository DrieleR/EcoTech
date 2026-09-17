import { CardPatrocinador } from "../shared/CardPatrocinador"
import { master, ouro, prata } from "../types/patrocinador"

const Patrocinadores = () => {
  return (
    <section className='min-h-[70vh] bg-eco-cream px-6 py-24'>
        <div className="mx-auto max-w-6xl text-center">
            <h1 className="font-sora text-4xl font-bold text-eco-blue lg:text-5xl">
                Patrocinadores
            </h1>
            <p className="font-sora mt-4 text-lg text-eco-gray">
                Empresas e instituições que tornam esse encontro possível.
            </p>

            <p className="font-sora mt-14 text-left text-sm font-extrabold tracking-[2px] text-eco-blue">
                PATROCINADORES
            </p>

            <div className="mt-4 flex justify-center">
                <div className="w-full max-w-md">
                    <CardPatrocinador nome={master.nome} logo={master.logo} size="big"/>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
               {ouro.map((p) => (
                    <CardPatrocinador key={p.nome} nome={p.nome} logo={p.logo}/>
               ))}
            </div>

             <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-5">
               {prata.map((p) => (
                    <CardPatrocinador key={p.nome} nome={p.nome} logo={p.logo}/>
               ))}
            </div>
        </div>
    </section>
  )
}

export default Patrocinadores