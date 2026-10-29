import { MapPin } from "lucide-react"
import Countdown from "./Countdown"
import logoPadrao from "../assets/exo_logo_branca.png"
import type { ConfigSite } from "../types/site"

interface Props {
  config: ConfigSite
  dataInicio: string
  onVerProgramacao?: () => void
}

const Chip = ({ children, escuro }: { children: React.ReactNode; escuro?: boolean }) => (
  <span
    className={`inline-flex items-center gap-2 rounded-full border-2 px-5 py-2 text-sm font-extrabold ${
      escuro ? "border-eco-blue/20 bg-eco-blue/5 text-eco-blue" : "border-white/20 bg-white/10"
    }`}
  >
    {children}
  </span>
)

const Onda = () => (
  <svg className="absolute bottom-0 left-0 h-32 w-full text-eco-cream" viewBox="0 0 1440 120" preserveAspectRatio="none">
    <path fill="currentColor" d="M0,64 C240,120 480,0 720,32 C960,64 1200,120 1440,64 L1440,120 L0,120 Z" />
  </svg>
)

// Home do evento. Também usada (em miniatura) na pré-visualização do admin.
export default function HomeView({ config, dataInicio, onVerProgramacao }: Props) {
  const logo = config.logoUrl || logoPadrao
  const contagem = `${dataInicio}T09:00:00`
  const chips = (escuro?: boolean) => (
    <div className="flex flex-wrap gap-2">
      <Chip escuro={escuro}>
        <MapPin size={16} />
        {config.localExibicao}
      </Chip>
      <Chip escuro={escuro}>{config.dataExibicao}</Chip>
    </div>
  )

  if (config.template === "minimalista") {
    return (
      <section className="bg-eco-cream px-6 py-24 text-eco-blue">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <img src={logo} alt="" className="h-20 w-20 rounded-full bg-eco-blue object-contain p-2" />
          <div className="mt-8">{chips(true)}</div>
          <h1 className="font-sora mt-8 text-3xl font-extrabold leading-tight lg:text-5xl">{config.titulo}</h1>
          <p className="font-sora mt-6 max-w-xl text-base text-eco-gray sm:text-lg">{config.descricao}</p>
          <button
            onClick={onVerProgramacao}
            className="font-sora mt-8 cursor-pointer rounded-full border-2 border-eco-blue px-8 py-3 text-lg font-bold hover:bg-eco-blue hover:text-white"
          >
            Ver Programação
          </button>
          <div className="mt-12">
            <Countdown targetDate={contagem} variant="light" />
          </div>
        </div>
      </section>
    )
  }

  if (config.template === "moderno") {
    return (
      <section className="grid bg-eco-cream lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-20 text-eco-blue lg:px-16">
          {chips(true)}
          <h1 className="font-sora mt-8 text-3xl font-extrabold leading-tight lg:text-4xl">{config.titulo}</h1>
          <p className="font-sora mt-6 max-w-xl text-base text-eco-gray sm:text-lg">{config.descricao}</p>
          <div className="mt-8">
            <button
              onClick={onVerProgramacao}
              className="font-sora cursor-pointer rounded-full bg-eco-green px-8 py-3 text-lg font-bold text-eco-blue hover:opacity-90"
            >
              Ver Programação
            </button>
          </div>
        </div>
        <div
          className="flex flex-col items-center justify-center gap-8 bg-eco-blue bg-cover bg-center px-6 py-16 text-white"
          style={config.bannerUrl ? { backgroundImage: `linear-gradient(color-mix(in srgb, var(--color-eco-blue) 75%, transparent), color-mix(in srgb, var(--color-eco-blue) 75%, transparent)), url(${config.bannerUrl})` } : undefined}
        >
          <img src={logo} alt="" className="h-56 w-56 object-contain" />
          <Countdown targetDate={contagem} variant="dark" />
        </div>
      </section>
    )
  }

  // clássico
  return (
    <section
      className="relative overflow-hidden bg-eco-blue bg-cover bg-center pb-24 pt-16 text-white lg:pb-30"
      style={config.bannerUrl ? { backgroundImage: `linear-gradient(color-mix(in srgb, var(--color-eco-blue) 85%, transparent), color-mix(in srgb, var(--color-eco-blue) 85%, transparent)), url(${config.bannerUrl})` } : undefined}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          {chips()}
          <h1 className="font-sora mt-8 text-3xl font-extrabold leading-tight lg:text-4xl">{config.titulo}</h1>
          <p className="font-sora mt-6 max-w-xl text-base text-eco-cream-light sm:text-lg">{config.descricao}</p>
          <div className="mt-8">
            <button
              onClick={onVerProgramacao}
              className="font-sora cursor-pointer rounded-full border-2 border-white bg-transparent px-8 py-3 text-lg font-bold text-white hover:text-eco-green"
            >
              Ver Programação
            </button>
          </div>
        </div>
        <div className="hidden flex-col items-center justify-center gap-8 lg:flex">
          <img src={logo} alt="" className="h-72 w-72 object-contain" />
          <Countdown targetDate={contagem} variant="dark" />
        </div>
      </div>
      <Onda />
    </section>
  )
}
