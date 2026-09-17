import { TRANSPORTES } from "../consts/transporte";
import { MapPin } from "lucide-react";
import plantaCampus from "../assets/planta-campus.png";

export default function Local() {
  return (
    <section className="min-h-[70vh] bg-eco-cream px-6 py-24">
      <div className="mx-auto max-w-6xl text-center">
        <h1 className="font-sora text-4xl font-bold text-eco-blue lg:text-5xl">
          Onde o evento acontece
        </h1>
        <p className="font-sora mx-auto mt-6 max-w-2xl text-lg text-eco-gray">
          Confira o endereço completo, o mapa e as opções de acesso até a
          UEPA — Campus Ananindeua durante os dias do evento.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-8 text-left lg:grid-cols-2">
          {/* Card azul com o endereço */}
          <div className="rounded-3xl bg-eco-blue p-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-extrabold text-white">
              <MapPin size={16} />
              Ananindeua, Pará
            </span>

            <h2 className="font-sora mt-6 text-2xl font-bold text-white">
              Universidade do Estado do Pará
            </h2>
            <p className="font-sora mt-5 text-white/90">
              Campus Ananindeua — Rod. BR-316, s/n
              <br />
              Ananindeua – PA, CEP 67030-005
            </p>
            <p className="font-sora mt-5 text-sm text-white/70">
              Evento presencial • 15 a 18 de Outubro
            </p>

            <a
              href="https://www.google.com/maps/place/UEPA+-+Universidade+do+Estado+do+Par%C3%A1+-+Campus+XXII+Ananindeua/@-1.3442883,-48.4106319,17z/data=!3m1!4b1!4m6!3m5!1s0x92a46142af21ed2d:0x7fa4f155a5eecf6c!8m2!3d-1.3442937!4d-48.408057!16s%2Fg%2F11kbwx6wfn?entry=ttu&g_ep=EgoyMDI2MDkxNS4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block rounded-full bg-white px-6 py-3 font-sora font-bold text-eco-blue cursor-pointer"
            >
              Ver no mapa
            </a>
          </div>

          <div className="overflow-hidden rounded-3xl border-2 border-eco-blue bg-white">
            <img
              src={plantaCampus}
              alt="Planta arquitetônica genérica do campus universitário"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Pílulas de transporte — desestruturamos "icon" renomeando
            para "Icon" (maiúscula), porque no JSX apenas identificadores
            que começam com letra maiúscula são tratados como componente. */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {TRANSPORTES.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-eco-blue px-6 py-3 font-sora font-bold text-eco-blue"
            >
              <Icon size={18} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}