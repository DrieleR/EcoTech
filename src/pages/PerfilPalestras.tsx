import { Link, useParams } from "react-router-dom";
import { getPalestraBySlug } from "../consts/palestras";
import { getPalestranteBySlug } from "../consts/palestrantes";

const PerfilPalestra = () => {
  const { slug } = useParams<{ slug: string }>();
  const palestra = slug ? getPalestraBySlug(slug) : undefined;
  const palestrante = palestra ? getPalestranteBySlug(palestra.palestranteSlug) : undefined;

  if (!palestra) {
    return (
      <section className="min-h-[70vh] bg-eco-cream px-6 py-24 text-center">
        <h1 className="font-sora text-3xl font-bold text-eco-blue">
          Palestra não encontrada
        </h1>
        <Link
          to="/palestras"
          className="font-sora mt-6 inline-block font-bold text-eco-blue underline"
        >
          Voltar às palestras
        </Link>
      </section>
    );
  }

  return (
    <section className="min-h-[70vh] bg-eco-cream px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/palestras"
          className="font-sora text-sm font-bold text-eco-blue hover:opacity-80"
        >
          ← Voltar às palestras
        </Link>

        <div className="mt-6 rounded-3xl bg-white p-8 shadow-sm sm:p-12">
          <span className="font-sora text-xs font-bold text-eco-gray">
            {palestra.horario} · {palestra.local}
          </span>
          <h1 className="font-sora mt-2 text-2xl font-bold text-eco-blue sm:text-3xl">
            {palestra.titulo}
          </h1>

          {palestrante && (
            <Link
              to={`/palestrantes/${palestrante.slug}`}
              className="font-sora mt-2 inline-block text-sm font-bold text-eco-blue underline"
            >
              {palestrante.nome}
            </Link>
          )}

          <p className="font-sora mt-6 text-base text-eco-gray">
            {palestra.resumo}
          </p>

          <h2 className="font-sora mt-8 text-sm font-extrabold uppercase tracking-widest text-eco-blue">
            Conteúdo abordado
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-eco-gray">
            {palestra.conteudo.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default PerfilPalestra;