import { useState } from "react";
import { FILTRO_PARA_CATEGORIA, CORES_TAG, FILTROS, TRABALHOS } from "../consts/exposicoes";
import { type Filtro } from "../types/exposicoes";

export default function Exposicoes() {
  const [filtroAtivo, setFiltroAtivo] = useState<Filtro>("Todos");

  const categoriaFiltro = FILTRO_PARA_CATEGORIA[filtroAtivo];

  // Se a categoria do filtro for null (opção "Todos"), mostramos tudo;
  // senão, comparamos com a categoria de cada trabalho.
  const trabalhosFiltrados = TRABALHOS.filter(
    (t) => categoriaFiltro === null || t.categoria === categoriaFiltro
  );

  return (
    <section className="min-h-[70vh] bg-eco-cream px-6 py-24">
      <div className="mx-auto max-w-6xl text-center">
        <h1 className="font-sora text-4xl font-bold text-eco-blue lg:text-5xl">
          Exposições
        </h1>
        <p className="font-sora mt-4 text-lg text-eco-gray">
          Confira os trabalhos, artigos e projetos apresentados durante o
          evento.
        </p>

        {/* Botões de filtro */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
        {FILTROS.map((filtro) => {
            const ativo = filtroAtivo === filtro;
            return (
            <button
                key={filtro}
                onClick={() => setFiltroAtivo(filtro)}
                className={`rounded-full px-6 py-2 font-sora text-sm font-bold transition-colors duration-200 ${
                ativo
                    ? "text-white shadow-sm"
                    : "border-[1.5px] border-eco-blue text-eco-blue hover:bg-eco-blue/10"
                } hover:cursor-pointer`}
                style={ativo ? { backgroundColor: "#0B4F9E" } : undefined}
            >
                {filtro}
            </button>
            );
        })}
        </div>

        {/* Grid de cards — re-renderiza automaticamente sempre que
            "trabalhosFiltrados" muda, porque o array vem de "filter"
            aplicado a "filtroAtivo" (estado). */}
        <div className="mt-12 grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
          {trabalhosFiltrados.map((t) => (
            <article
              key={t.titulo}
              className="rounded-2xl border border-gray-300 bg-white p-3"
            >
              <div className="relative h-48 overflow-hidden rounded-xl bg-[#ebf0f7]">
                <img
                  src={t.imagem}
                  alt={t.alt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <span
                  className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold text-white shadow-sm ${
                    CORES_TAG[t.categoria]
                  }`}
                >
                  {t.categoria}
                </span>
              </div>

              <h3 className="font-sora mt-4 text-base font-bold text-eco-blue">
                {t.titulo}
              </h3>
              <p className="mt-1 text-xs text-eco-gray">{t.autores}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
