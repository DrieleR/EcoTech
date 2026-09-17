import { ExternalLink } from "lucide-react";
import { PASSOS_INSCRICAO, LINK_INSCRICAO } from "../consts/inscricao";

export default function Inscricao() {
  return (
    <section className="min-h-[70vh] bg-eco-cream px-6 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-sora text-4xl font-bold text-eco-blue lg:text-5xl">
          Como se inscrever
        </h1>
        <p className="font-sora mx-auto mt-6 max-w-2xl text-lg text-eco-gray">
          As inscrições são feitas em um formulário externo. Siga o passo a
          passo abaixo e clique no botão para ser redirecionado.
        </p>

        <div className="mt-16 flex flex-col gap-6 text-left">
          {PASSOS_INSCRICAO.map((passo) => (
            <div
              key={passo.numero}
              className="flex items-start gap-5 rounded-2xl border-2 border-eco-blue/15 bg-white p-6"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-eco-blue font-sora font-bold text-white">
                {passo.numero}
              </span>
              <div>
                <h3 className="font-sora text-lg font-bold text-eco-blue">
                  {passo.titulo}
                </h3>
                <p className="font-sora mt-1 text-eco-gray">
                  {passo.descricao}
                </p>
              </div>
            </div>
          ))}
        </div>

        <a
          href={LINK_INSCRICAO}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-12 inline-flex items-center gap-2 rounded-full bg-eco-blue px-8 py-4 font-sora text-lg font-bold text-white hover:opacity-90"
        >
          Ir para o formulário de inscrição
          <ExternalLink size={20} />
        </a>
      </div>
    </section>
  );
}