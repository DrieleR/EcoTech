import { useState } from "react"
import { ABAS_SOBRE, type AbaSobre } from "../consts/sobreEvento"
import Parceiros from "../components/Parceiros"
import Patrocinadores from "../components/Patrocinadores"
import SobreEvento from "../components/SobreEvento"

const Sobre = () => {
  const [abaAtiva, setAbaAtiva] = useState<AbaSobre>("sobre")

  return (
    <div className="bg-eco-cream">
      <nav
        role="tablist"
        aria-label="Seções da página Sobre"
        className="mx-auto flex max-w-6xl flex-wrap justify-center gap-3 px-6 pt-12"
      >
        {ABAS_SOBRE.map((aba) => (
          <button
            key={aba.id}
            role="tab"
            aria-selected={abaAtiva === aba.id}
            aria-controls="painel-sobre"
            onClick={() => setAbaAtiva(aba.id)}
            className={`font-sora rounded-full border-2 border-eco-blue px-5 py-2 text-sm font-bold transition-colors cursor-pointer ${
              abaAtiva === aba.id
                ? "bg-eco-blue text-white"
                : "text-eco-blue hover:bg-eco-blue/10"
            }`}
          >
            {aba.label}
          </button>
        ))}
      </nav>

      <div id="painel-sobre" role="tabpanel">
        {abaAtiva === "sobre" && <SobreEvento />}
        {abaAtiva === "parceiros" && <Parceiros />}
        {abaAtiva === "patrocinadores" && <Patrocinadores />}
      </div>
    </div>
  )
}

export default Sobre
