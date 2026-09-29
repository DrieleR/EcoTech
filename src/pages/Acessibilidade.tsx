import { COMPROMISSOS_ACESSIBILIDADE, RECURSOS_ACESSIBILIDADE } from "../consts/acessibilidade";

export default function Acessibilidade() {
  return (
    <section className="min-h-[70vh] bg-eco-cream px-6 py-24">
      <div className="mx-auto max-w-6xl text-center">
        <p className="font-sora text-sm font-extrabold uppercase tracking-widest text-eco-green-dark">
          Acessibilidade
        </p>
        <h1 className="font-sora mt-4 text-4xl font-bold text-eco-blue lg:text-5xl">
          Um evento para todas as pessoas
        </h1>
        <p className="font-sora mx-auto mt-6 max-w-2xl text-lg text-eco-gray">
          Acreditamos que a tecnologia só é sustentável quando é inclusiva.
          Por isso, o evento foi planejado para que qualquer pessoa possa
          participar das palestras, do minicurso e das exposições com
          autonomia e conforto.
        </p>

        {/* Cards dos recursos — "icon: Icon" renomeia para maiúscula
            para que o JSX trate o ícone como componente. */}
        <div className="mt-16 grid grid-cols-1 gap-8 text-left md:grid-cols-2 lg:grid-cols-3">
          {RECURSOS_ACESSIBILIDADE.map(({ imagem, alt, icon: Icon, titulo, descricao }) => (
            <article
              key={titulo}
              className="overflow-hidden rounded-3xl border-2 border-eco-blue bg-white"
            >
              <img
                src={imagem}
                alt={alt}
                className="h-56 w-full object-cover"
              />
              <div className="p-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-eco-blue px-4 py-2 text-sm font-extrabold text-white">
                  <Icon size={16} />
                  {titulo}
                </span>
                <p className="font-sora mt-5 text-eco-gray">{descricao}</p>
              </div>
            </article>
          ))}
        </div>

        {/* Card azul com os demais compromissos */}
        <div className="mt-10 rounded-3xl bg-eco-blue p-10">
          <h2 className="font-sora text-2xl font-bold text-white">
            Outros compromissos com você
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {COMPROMISSOS_ACESSIBILIDADE.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 font-sora font-bold text-white"
              >
                <Icon size={18} />
                {label}
              </span>
            ))}
          </div>
          <p className="font-sora mx-auto mt-8 max-w-2xl text-white/90">
            Precisa de algum outro recurso? Informe sua necessidade no momento
            da inscrição que nossa equipe organiza o atendimento com
            antecedência.
          </p>
        </div>
      </div>
    </section>
  );
}
