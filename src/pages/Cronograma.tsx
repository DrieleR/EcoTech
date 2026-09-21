import { useState } from "react"
import { Link } from "react-router-dom";
import { PROGRAMACAO } from "../consts/cronograma";
import { Badge } from "../helpers/badge";
import { getPalestranteByNome } from "../consts/palestrantes";

const Cronograma = () => {
    const [diaAtivo, setDiaAtivo] = useState<1 | 2>(1);
    const itensDoDia = PROGRAMACAO.filter((item) => item.dia === diaAtivo);

    
  return (
    <section className="min-h-[70vh] bg-eco-cream px-6 py-24">
      <div className="mx-auto max-w-6xl text-center">
        <h1 className="font-sora text-3xl font-bold text-eco-blue sm:text-4xl lg:text-5xl">
          Cronograma do Evento
        </h1>
        <p className="font-sora mt-4 text-lg text-eco-gray">
          Confira as palestras e minicursos dos dois dias de apresentação
        </p>

        {/* Abas Dia 1 / Dia 2 */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {([1, 2] as const).map((dia) => (
            <button
              key={dia}
              onClick={() => setDiaAtivo(dia)}
              className={`rounded-full px-6 py-3 font-sora font-bold transition-colors sm:px-8 ${
                diaAtivo === dia
                  ? "bg-eco-blue text-white"
                  : "border border-eco-blue text-eco-blue"
              } hover:cursor-pointer`}
            >
              DIA - 0{dia}
            </button>
          ))}
        </div>

        {/* Tabela responsiva: em telas grandes vira uma tabela com colunas
            alinhadas; em telas pequenas cada linha "quebra" em cartão. */}
        <div className="mt-10 overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="hidden bg-eco-blue px-8 py-4 font-sora text-sm font-extrabold uppercase tracking-widest text-white lg:grid lg:grid-cols-[140px_1fr_180px_120px_120px]">
            <span>Horário</span>
            <span>Atividade</span>
            <span>Palestrante</span>
            <span>Local</span>
            <span>Tipo</span>
          </div>

          {itensDoDia.map((item, index) => (
            <div
              key={`${item.horario}-${item.atividade}`}
              className={`grid grid-cols-1 gap-2 px-6 py-5 text-left font-sora text-sm font-bold text-eco-blue sm:px-8 lg:grid-cols-[140px_1fr_180px_120px_120px] lg:items-center ${
                index % 2 === 0 ? "bg-gray-100/60" : "bg-white"
              }`}
            >
              <span>{item.horario}</span>
              <span className="text-black">{item.atividade}</span>
              <span className="text-black">
                <span className="text-eco-blue lg:hidden">Palestrante: </span>
                {(() => {
                  const palestrante = getPalestranteByNome(item.palestrante);
                  return palestrante ? (
                    <Link
                      to={`/palestrantes/${palestrante.slug}`}
                      className="underline decoration-eco-blue/40 underline-offset-2 hover:text-eco-blue"
                    >
                      {item.palestrante}
                    </Link>
                  ) : (
                    item.palestrante
                  );
                })()}
              </span>
              <span className="text-black">
                <span className="text-eco-blue lg:hidden">Local: </span>
                {item.local}
              </span>
              <span>
                <Badge tipo={item.tipo} />
              </span>
            </div>
          ))}
        </div>

        {/* Legenda */}
        <div className="mt-6 flex justify-center gap-6 text-sm font-bold text-eco-blue">
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-eco-blue" />
            Palestra
          </span>
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-eco-green-dark" />
            Minicurso
          </span>
        </div>
      </div>
    </section>
  )
}

export default Cronograma