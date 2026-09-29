// Preenche o banco com participantes e minicursos fictícios para testes.
// Os participantes usam e-mails @exemplo.com e não têm senha (não entram no site).
// Uso:    npm run db:popular
// Limpar: npm run db:popular -- --limpar

import { pool, transacao } from "../db.ts"
import { listarAtividades, obterEvento, salvarAtividadesDaInscricao } from "../repositorio.ts"
import { calcularTotal, validarSelecao } from "../../src/helpers/atividades.ts"
import type { AtividadeEvento, Categoria, RecursoAcessibilidade } from "../../src/types/inscricao.ts"

const DOMINIO = "@exemplo.com"

const MINICURSOS: Omit<AtividadeEvento, "id">[] = [
  { titulo: "Introdução ao React", tipo: "Minicurso", palestrante: "Lucas Barbosa", dia: 1, inicio: "09:00", fim: "11:00", local: "LAB INFO", nivel: "Iniciante", vagas: 30, valor: 30 },
  { titulo: "Design de interfaces acessíveis no Figma", tipo: "Oficina", palestrante: "Juliana Castro", dia: 1, inicio: "14:00", fim: "15:45", local: "SALA 02", nivel: "Todos os níveis", vagas: 20, valor: 0 },
  { titulo: "Docker na prática", tipo: "Minicurso", palestrante: "Pedro Henrique Sá", dia: 2, inicio: "10:00", fim: "12:00", local: "LAB 01", nivel: "Intermediário", vagas: 20, valor: 35 },
  { titulo: "Banco de dados com PostgreSQL", tipo: "Minicurso", palestrante: "Ana Paula Moraes", dia: 2, inicio: "13:15", fim: "15:00", local: "LAB 02", nivel: "Iniciante", vagas: 25, valor: 25 },
]

type Status = "confirmada" | "pendente" | "cancelada"

interface Pessoa {
  nome: string
  categoria: Categoria
  detalhes: Record<string, string>
  recursos?: RecursoAcessibilidade[]
  outro?: string
  // Início dos títulos dos minicursos escolhidos
  minicursos: string[]
  status?: Status
  diasAtras: number
}

const PESSOAS: Pessoa[] = [
  { nome: "Camila Rodrigues Santos", categoria: "Estudante", detalhes: { instituicao: "UEPA", curso: "Engenharia de Software" }, minicursos: ["Introdução ao React", "Git e GitHub"], diasAtras: 14 },
  { nome: "Gabriel Ferreira Lima", categoria: "Estudante", detalhes: { instituicao: "UFPA", curso: "Ciência da Computação" }, minicursos: ["Testes Automatizados", "Docker"], diasAtras: 13 },
  { nome: "Larissa Monteiro Alves", categoria: "Profissional", detalhes: { empresa: "Norte Dev", cargo: "Desenvolvedora front-end" }, recursos: ["interprete-libras"], minicursos: ["Design de interfaces", "Acessibilidade em interfaces"], diasAtras: 12 },
  { nome: "Mateus Souza Pinheiro", categoria: "Estudante", detalhes: { instituicao: "IFPA", curso: "Análise e Desenvolvimento de Sistemas" }, minicursos: ["Python", "Introdução a Cloud Native", "Banco de dados"], diasAtras: 12 },
  { nome: "Beatriz Cardoso Nunes", categoria: "Professor", detalhes: { instituicao: "UEPA", area: "Engenharia de Software" }, minicursos: ["Testes Automatizados"], diasAtras: 11 },
  { nome: "Rafael Tavares Costa", categoria: "Estudante", detalhes: { instituicao: "UNAMA", curso: "Sistemas de Informação" }, recursos: ["cadeira-de-rodas", "acompanhante"], minicursos: ["Git e GitHub", "Banco de dados"], diasAtras: 10 },
  { nome: "Isabela Moraes Quaresma", categoria: "Estudante", detalhes: { instituicao: "UEPA", curso: "Engenharia de Software" }, minicursos: ["Introdução ao React", "Design de interfaces", "Docker"], diasAtras: 9 },
  { nome: "Thiago Brito Farias", categoria: "Profissional", detalhes: { empresa: "Amazônia Dados", cargo: "Engenheiro de dados" }, minicursos: ["Python", "Banco de dados"], status: "pendente", diasAtras: 8 },
  { nome: "Juliana Batista Rocha", categoria: "Estudante", detalhes: { instituicao: "UFRA", curso: "Sistemas de Informação" }, recursos: ["fonte-ampliada"], outro: "Prefiro sentar perto da tela.", minicursos: ["Acessibilidade em interfaces"], diasAtras: 7 },
  { nome: "Felipe Nascimento Cruz", categoria: "Estudante", detalhes: { instituicao: "Escola Estadual Paes de Carvalho", curso: "3º ano do ensino médio" }, minicursos: ["Introdução ao React"], diasAtras: 6 },
  { nome: "Amanda Silva Guimarães", categoria: "Professor", detalhes: { instituicao: "IFPA", area: "Programação" }, minicursos: ["Docker", "Introdução a Cloud Native"], status: "cancelada", diasAtras: 6 },
  { nome: "Lucas Oliveira Maia", categoria: "Estudante", detalhes: { instituicao: "UFPA", curso: "Engenharia da Computação" }, minicursos: [], status: "pendente", diasAtras: 4 },
  { nome: "Mariana Costa Reis", categoria: "Profissional", detalhes: { empresa: "Prefeitura de Ananindeua", cargo: "Analista de TI" }, recursos: ["lugar-reservado"], minicursos: ["Git e GitHub", "Testes Automatizados"], diasAtras: 3 },
  { nome: "Pedro Lucas Araújo", categoria: "Estudante", detalhes: { instituicao: "UEPA", curso: "Engenharia de Software" }, minicursos: ["Python", "Docker", "Banco de dados"], diasAtras: 2 },
  { nome: "Sofia Almeida Correa", categoria: "Estudante", detalhes: { instituicao: "Cesupa", curso: "Ciência da Computação" }, minicursos: ["Design de interfaces"], status: "pendente", diasAtras: 1 },
]

const emailDe = (nome: string) =>
  nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(" ")
    .filter((_, i, partes) => i === 0 || i === partes.length - 1)
    .join(".") + DOMINIO

if (process.argv.includes("--limpar")) {
  const usuarios = await pool.query(`delete from usuarios where email like $1 and perfil = 'participante'`, [`%${DOMINIO}`])
  const atividades = await pool.query(
    `delete from atividades a where a.titulo = any($1)
       and not exists (select 1 from inscricao_atividades ia where ia.atividade_id = a.id)`,
    [MINICURSOS.map((m) => m.titulo)]
  )
  console.info(`✓ Removidos ${usuarios.rowCount} participantes fictícios e ${atividades.rowCount} minicursos`)
  await pool.end()
  process.exit(0)
}

// ---------- minicursos ----------
let novos = 0
for (const m of MINICURSOS) {
  const { rowCount } = await pool.query(
    `insert into atividades (titulo, tipo, palestrante, dia, inicio, fim, local, nivel, vagas, valor)
     select $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      where not exists (select 1 from atividades where titulo = $1)`,
    [m.titulo, m.tipo, m.palestrante, m.dia, m.inicio, m.fim, m.local, m.nivel, m.vagas, m.valor]
  )
  novos += rowCount ?? 0
}
console.info(`✓ ${novos} minicursos novos (${MINICURSOS.length - novos} já existiam)`)

// ---------- participantes ----------
let criados = 0
for (const p of PESSOAS) {
  const email = emailDe(p.nome)
  const criou = await transacao(async (db) => {
    const conta = await db.query(
      `insert into usuarios (nome, email, criado_em) values ($1, $2, now() - make_interval(days => $3))
       on conflict (email) do nothing returning id`,
      [p.nome, email, p.diasAtras]
    )
    if (!conta.rows[0]) return false

    const evento = await obterEvento(db)
    const atividades = await listarAtividades(db, true)
    const ids = p.minicursos.map((inicio) => {
      const a = atividades.find((x) => x.titulo.startsWith(inicio))
      if (!a) throw new Error(`Minicurso "${inicio}" não encontrado`)
      return a.id
    })
    const erro = validarSelecao(atividades, ids)
    if (erro) throw new Error(`${p.nome}: ${erro}`)

    const status = p.status ?? "confirmada"
    const pago = status !== "pendente"
    const numero = await db.query("select nextval('inscricoes_numero_seq') as n")
    const { rows } = await db.query(
      `insert into inscricoes (numero, usuario_id, criada_em, status, pago_em, cancelada_em, reembolso,
                               telefone, categoria, detalhes, pcd, recursos, outro_recurso, valor_total)
       values ($1, $2, now() - make_interval(days => $3), $4,
               case when $5 then now() - make_interval(days => $3) + interval '6 minutes' end,
               case when $4 = 'cancelada' then now() - interval '1 day' end,
               case when $4 = 'cancelada' then true end,
               $6, $7, $8, $9, $10, $11, $12)
       returning id`,
      [
        `ESA-${new Date().getFullYear()}-${String(numero.rows[0].n).padStart(4, "0")}`,
        conta.rows[0].id,
        p.diasAtras,
        status,
        pago,
        `(91) 9${String(8100 + criados * 37).padStart(4, "0")}-${String(1000 + criados * 413).slice(-4)}`,
        p.categoria,
        p.detalhes,
        !!(p.recursos?.length || p.outro),
        p.recursos ?? [],
        p.outro ?? "",
        calcularTotal(evento, atividades, ids),
      ]
    )
    await salvarAtividadesDaInscricao(db, rows[0].id, ids)
    return true
  })
  if (criou) criados += 1
}
console.info(`✓ ${criados} participantes criados (${PESSOAS.length - criados} já existiam)`)

const resumo = await pool.query(
  `select status, count(*)::int as total from inscricoes group by status order by status`
)
console.info("Inscrições no banco:", resumo.rows.map((r) => `${r.status}: ${r.total}`).join(" · "))
await pool.end()
