import { Link, useParams } from "react-router-dom";
import { getPalestranteBySlug } from "../consts/palestrantes";

const PerfilPalestrante = () => {
  const { slug } = useParams<{ slug: string }>();
  const palestrante = slug ? getPalestranteBySlug(slug) : undefined;

  if (!palestrante) {
    return (
      <section className="min-h-[70vh] bg-eco-cream px-6 py-24 text-center">
        <h1 className="font-sora text-3xl font-bold text-eco-blue">
          Palestrante não encontrado
        </h1>
        <Link
          to="/cronograma"
          className="font-sora mt-6 inline-block font-bold text-eco-blue underline"
        >
          Voltar ao cronograma
        </Link>
      </section>
    );
  }

  return (
    <section className="min-h-[70vh] bg-eco-cream px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/cronograma"
          className="font-sora text-sm font-bold text-eco-blue hover:opacity-80"
        >
          ← Voltar ao cronograma
        </Link>

        <div className="mt-6 flex flex-col items-center gap-6 rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[#ebf0f7] text-3xl font-bold text-eco-gray-light">
            {palestrante.foto ? (
              <img
                src={palestrante.foto}
                alt={palestrante.nome}
                className="h-full w-full object-cover"
              />
            ) : (
              palestrante.nome.charAt(0)
            )}
          </div>

          <div>
            <h1 className="font-sora text-2xl font-bold text-eco-blue sm:text-3xl">
              {palestrante.nome}
            </h1>
            <p className="font-sora mt-1 text-sm font-bold text-eco-gray">
              {palestrante.cargo}
              {palestrante.empresa !== "-" && ` · ${palestrante.empresa}`}
            </p>
          </div>

          <p className="font-sora max-w-xl text-base text-eco-gray">
            {palestrante.bio}
          </p>

          {palestrante.linkedin && (
            <a
              href={palestrante.linkedin}
              target="_blank"
              rel="noreferrer"
              className="font-sora font-bold text-eco-blue underline"
            >
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default PerfilPalestrante;