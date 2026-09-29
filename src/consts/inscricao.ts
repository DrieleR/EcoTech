import type { Categoria, CampoCategoria, RecursoAcessibilidade } from "../types/inscricao"

export const CATEGORIAS: Categoria[] = ["Estudante", "Professor", "Profissional"]

// Bloco de dados extra que aparece conforme a categoria escolhida
export const CAMPOS_CATEGORIA: Record<
  Categoria,
  { titulo: string; campos: { chave: CampoCategoria; label: string; placeholder: string }[] }
> = {
  Estudante: {
    titulo: "Dados do estudante",
    campos: [
      { chave: "instituicao", label: "Instituição de ensino", placeholder: "Ex.: UEPA, UFPA, IFPA..." },
      { chave: "curso", label: "Curso ou ano escolar", placeholder: "Ex.: Eng. de Software ou 3º ano do ensino médio" },
    ],
  },
  Professor: {
    titulo: "Dados do professor",
    campos: [
      { chave: "instituicao", label: "Instituição onde leciona", placeholder: "Ex.: UEPA, UFPA, IFPA..." },
      { chave: "area", label: "Área ou disciplina", placeholder: "Ex.: Engenharia de Software" },
    ],
  },
  Profissional: {
    titulo: "Dados do profissional",
    campos: [
      { chave: "empresa", label: "Empresa ou organização", placeholder: "Ex.: Nome da empresa" },
      { chave: "cargo", label: "Cargo ou função", placeholder: "Ex.: Desenvolvedora back-end" },
    ],
  },
}

export const OPCOES_ACESSIBILIDADE: { id: RecursoAcessibilidade; label: string }[] = [
  { id: "interprete-libras", label: "Intérprete de Libras" },
  { id: "cadeira-de-rodas", label: "Acesso para cadeira de rodas" },
  { id: "acompanhante", label: "Levarei acompanhante" },
  { id: "fonte-ampliada", label: "Material em fonte ampliada" },
  { id: "lugar-reservado", label: "Lugar reservado próximo ao palco" },
]

export const ROTULO_RECURSO = Object.fromEntries(
  OPCOES_ACESSIBILIDADE.map((o) => [o.id, o.label])
) as Record<RecursoAcessibilidade, string>

export const ETAPAS_INSCRICAO = ["Seus dados", "Minicursos", "Pagamento", "Confirmação"]

export const TAMANHO_MINIMO_SENHA = 8
