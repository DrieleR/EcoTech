// Cria as tabelas e, se o banco estiver vazio, cadastra os dados iniciais do
// evento e das atividades. Pode rodar de novo sem apagar nada.
// Uso: npm run db:setup

import { readFile } from "node:fs/promises"
import { pool } from "../db.ts"
import { ATIVIDADES_MOCK, EVENTO_MOCK } from "../../src/mocks/dadosIniciais.ts"

const schema = await readFile(new URL("./schema.sql", import.meta.url), "utf8")
await pool.query(schema)
console.info("✓ Tabelas criadas/atualizadas")

const e = EVENTO_MOCK
const evento = await pool.query(
  `insert into evento (id, nome, data_inicio, data_fim, horario, local, valor_inscricao, inclui_na_inscricao,
                       prazo_troca_atividades, prazo_reembolso)
   values (1, $1, $2, $3, $4, $5, $6, $7, $8, $9)
   on conflict (id) do nothing`,
  [e.nome, e.dataInicio, e.dataFim, e.horario, e.local, e.valorInscricao, e.incluiNaInscricao,
   e.prazoTrocaAtividades, e.prazoReembolso]
)
console.info(evento.rowCount ? "✓ Dados do evento cadastrados" : "• Dados do evento já existiam")

const { rows } = await pool.query("select count(*)::int as total from atividades")
if (rows[0].total === 0) {
  for (const a of ATIVIDADES_MOCK) {
    await pool.query(
      `insert into atividades (titulo, tipo, palestrante, dia, inicio, fim, local, nivel, vagas, valor)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [a.titulo, a.tipo, a.palestrante, a.dia, a.inicio, a.fim, a.local, a.nivel, a.vagas, a.valor]
    )
  }
  console.info(`✓ ${ATIVIDADES_MOCK.length} atividades cadastradas`)
} else {
  console.info("• Atividades já existiam")
}

const admins = await pool.query("select count(*)::int as total from usuarios where perfil = 'admin'")
if (admins.rows[0].total === 0) {
  console.info("\n⚠ Nenhum administrador ainda. Crie um com: npm run db:admin")
}

await pool.end()
