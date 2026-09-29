import { CAMPOS_CATEGORIA, CATEGORIAS, OPCOES_ACESSIBILIDADE } from "../../consts/inscricao"
import { formatarTelefone } from "../../helpers/formatar"
import type { ErrosForm } from "../../helpers/validacao"
import type { DadosParticipante, RecursoAcessibilidade } from "../../types/inscricao"
import { CaixaSelecao, Campo, GrupoPills, Painel } from "../form/Campos"

interface Props {
  dados: DadosParticipante
  onChange: (dados: DadosParticipante) => void
  erros: ErrosForm
  // Na conta do participante os selos de "aparece só para..." não fazem sentido
  mostrarSelos?: boolean
}

// Campos compartilhados entre a inscrição (etapa 1) e "Meus dados" na conta
export default function FormDadosParticipante({ dados, onChange, erros, mostrarSelos = true }: Props) {
  const alterar = <K extends keyof DadosParticipante>(campo: K, valor: DadosParticipante[K]) =>
    onChange({ ...dados, [campo]: valor })

  const blocoCategoria = CAMPOS_CATEGORIA[dados.categoria]

  const alternarRecurso = (id: RecursoAcessibilidade) =>
    alterar(
      "recursos",
      dados.recursos.includes(id) ? dados.recursos.filter((r) => r !== id) : [...dados.recursos, id]
    )

  return (
    <div className="flex flex-col gap-5">
      <Campo
        label="Nome completo"
        required
        autoComplete="name"
        placeholder="Digite seu nome completo"
        value={dados.nome}
        onChange={(e) => alterar("nome", e.target.value)}
        erro={erros.nome}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo
          label="E-mail"
          type="email"
          required
          autoComplete="email"
          placeholder="seuemail@exemplo.com"
          value={dados.email}
          onChange={(e) => alterar("email", e.target.value)}
          erro={erros.email}
        />
        <Campo
          label="Telefone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="numeric"
          placeholder="(91) 90000-0000"
          value={dados.telefone}
          onChange={(e) => alterar("telefone", formatarTelefone(e.target.value))}
          erro={erros.telefone}
        />
      </div>

      <GrupoPills
        legenda="Categoria"
        nome="categoria"
        required
        opcoes={CATEGORIAS.map((c) => ({ valor: c, label: c }))}
        valor={dados.categoria}
        onChange={(c) => alterar("categoria", c)}
      />

      <Painel titulo={blocoCategoria.titulo} selo={mostrarSelos ? `Aparece só para ${dados.categoria}` : undefined}>
        <div className="grid gap-4 sm:grid-cols-2">
          {blocoCategoria.campos.map((campo) => (
            <Campo
              key={`${dados.categoria}-${campo.chave}`}
              label={campo.label}
              required
              placeholder={campo.placeholder}
              value={dados.detalhes[campo.chave] ?? ""}
              onChange={(e) => alterar("detalhes", { ...dados.detalhes, [campo.chave]: e.target.value })}
              erro={erros[campo.chave]}
              className="[&_input]:bg-white"
            />
          ))}
        </div>
      </Painel>

      <div>
        <h2 className="font-sora text-lg font-bold text-eco-blue">Acessibilidade</h2>
        <div className="mt-3">
          <GrupoPills
            legenda="Você é uma pessoa com deficiência (PcD)?"
            nome="pcd"
            required
            opcoes={[
              { valor: "sim", label: "Sim" },
              { valor: "nao", label: "Não" },
            ]}
            valor={dados.pcd ? "sim" : "nao"}
            onChange={(v) => alterar("pcd", v === "sim")}
          />
        </div>
      </div>

      {dados.pcd && (
        <Painel titulo="Solicitação de acessibilidade" selo={mostrarSelos ? "Aparece ao marcar Sim" : undefined}>
          <fieldset aria-describedby={erros.recursos ? "erro-recursos" : undefined}>
            <legend className="font-sora text-xs font-bold text-eco-blue">Quais recursos você precisa?</legend>
            <div className="mt-3 flex flex-col gap-3">
              {OPCOES_ACESSIBILIDADE.map((opcao) => (
                <CaixaSelecao
                  key={opcao.id}
                  checked={dados.recursos.includes(opcao.id)}
                  onChange={() => alternarRecurso(opcao.id)}
                >
                  {opcao.label}
                </CaixaSelecao>
              ))}
            </div>
          </fieldset>
          <Campo
            label="Outro (opcional)"
            value={dados.outroRecurso}
            onChange={(e) => alterar("outroRecurso", e.target.value)}
            maxLength={200}
            className="mt-4 [&_input]:bg-white"
          />
          {erros.recursos && (
            <p id="erro-recursos" className="font-sora mt-2 text-xs text-red-600">
              {erros.recursos}
            </p>
          )}
          <p className="font-sora mt-4 text-[11px] text-eco-gray">
            Seus dados de acessibilidade são sigilosos. Só a equipe organizadora tem acesso a eles, e eles
            serão usados apenas para preparar o evento.
          </p>
        </Painel>
      )}
    </div>
  )
}
