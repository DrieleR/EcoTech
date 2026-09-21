import { Link } from "react-router-dom";
import { PALESTRAS } from "../consts/palestras";
import { getPalestranteBySlug } from "../consts/palestrantes";

const Palestras = () => {
  return (
    <section className="min-h-[70vh] bg-eco-cream px-6 py-24">
      <div className="mx-auto max-w-6xl text-center">
        <h1 className="font-sora text-4xl font-bold text-eco-blue lg:text-5xl">
          Palestras
        </h1>
        <p className="font-sora mt-4 text-lg text-eco-gray">
          Conheça as palestras do evento e o conteúdo abordado em cada uma.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
          {PALESTRAS.map((palestra) => {
            const palestrante = getPalestranteBySlug(palestra.palestranteSlug);
            return (
              <Link
                key={palestra.slug}
                to={`/palestras/${palestra.slug}`}
                className="rounded-2xl border border-gray-300 bg-white p-5 transition-shadow hover:shadow-md"
              >
                <span className="font-sora text-xs font-bold text-eco-gray">
                  {palestra.horario} · {palestra.local}
                </span>
                <h3 className="font-sora mt-2 text-base font-bold text-eco-blue">
                  {palestra.titulo}
                </h3>
                <p className="mt-2 text-sm text-eco-gray">{palestra.resumo}</p>
                {palestrante && (
                  <p className="font-sora mt-3 text-xs font-bold text-eco-blue">
                    {palestrante.nome}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Palestras;