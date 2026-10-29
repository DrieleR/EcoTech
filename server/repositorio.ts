// Consultas usadas por mais de uma rota. Convertem as linhas do banco
// (snake_case) para os mesmos tipos que o front-end já usa.

import { pool, type Conexao } from "./db.ts"
import { SITE_PADRAO } from "../src/consts/site.ts"
import { SOBRE_PADRAO } from "../src/consts/sobre.ts"
import type { ConfigSobre } from "../src/types/sobre.ts"
import type { ConfigSite, SiteResposta } from "../src/types/site.ts"
import type { AtividadeComVagas, DadosEvento, Inscricao } from "../src/types/inscricao.ts"

export async function obterEvento(conexao: Conexao = pool): Promise<DadosEvento> {
  const { rows } = await conexao.query(`
    select nome, data_inicio as "dataInicio", data_fim as "dataFim", horario, local,
           valor_inscricao as "valorInscricao", inclui_na_inscricao as "incluiNaInscricao",
           prazo_troca_atividades as "prazoTrocaAtividades",
           prazo_reembolso as "prazoReembolso"
      from evento where id = 1`)
  if (!rows[0]) throw new Error("Dados do evento não cadastrados. Rode npm run db:setup.")
  return rows[0]
}

// Vagas: inscrições pendentes também seguram a vaga enquanto aguardam o pagamento
// "trava" = true bloqueia as linhas até o fim da transação, para duas pessoas
// não pegarem a última vaga ao mesmo tempo
export async function listarAtividades(conexao: Conexao = pool, trava = false): Promise<AtividadeComVagas[]> {
  const { rows } = await conexao.query(`
    select a.id, a.titulo, a.tipo, a.palestrante, a.dia,
           to_char(a.inicio, 'HH24:MI') as inicio, to_char(a.fim, 'HH24:MI') as fim,
           a.local, a.nivel, a.vagas, a.valor,
           (select count(*)::int
              from inscricao_atividades ia join inscricoes i on i.id = ia.inscricao_id
             where ia.atividade_id = a.id and i.status in ('pendente', 'confirmada')) as ocupadas
      from atividades a
     order by a.dia, a.inicio
     ${trava ? "for update of a" : ""}`)
  return rows
}

const SELECT_INSCRICAO = `
  select i.id, i.numero, i.usuario_id as "usuarioId", i.criada_em as "criadaEm", i.status,
         i.cancelada_em as "canceladaEm", i.reembolso, i.pago_em as "pagoEm", i.valor_total as "valorTotal",
         json_build_object(
           'nome', u.nome, 'email', u.email, 'telefone', i.telefone, 'categoria', i.categoria,
           'detalhes', i.detalhes, 'pcd', i.pcd, 'recursos', i.recursos, 'outroRecurso', i.outro_recurso
         ) as participante,
         coalesce(
           (select array_agg(ia.atividade_id::text) from inscricao_atividades ia where ia.inscricao_id = i.id),
           '{}'
         ) as "atividadesIds"
    from inscricoes i join usuarios u on u.id = i.usuario_id`

// timestamptz vem como Date; o front espera texto ISO
function paraInscricao(linha: Record<string, unknown>): Inscricao {
  const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : undefined)
  return {
    ...(linha as unknown as Inscricao),
    criadaEm: iso(linha.criadaEm)!,
    canceladaEm: iso(linha.canceladaEm),
    pagoEm: iso(linha.pagoEm),
    reembolso: (linha.reembolso as boolean | null) ?? undefined,
  }
}

export async function inscricaoDoUsuario(usuarioId: string, conexao: Conexao = pool) {
  const { rows } = await conexao.query(`${SELECT_INSCRICAO} where i.usuario_id = $1`, [usuarioId])
  return rows[0] ? paraInscricao(rows[0]) : null
}

export async function todasInscricoes() {
  const { rows } = await pool.query(`${SELECT_INSCRICAO} order by i.criada_em desc`)
  return rows.map(paraInscricao)
}

export async function salvarAtividadesDaInscricao(conexao: Conexao, inscricaoId: string, ids: string[]) {
  await conexao.query("delete from inscricao_atividades where inscricao_id = $1", [inscricaoId])
  if (ids.length) {
    await conexao.query(
      `insert into inscricao_atividades (inscricao_id, atividade_id)
       select $1, unnest($2::uuid[])`,
      [inscricaoId, ids]
    )
  }
}

// Marca a inscrição como paga. Hoje é chamada pelo pagamento simulado; quando
// houver um provedor de Pix de verdade, o webhook dele chama esta mesma função.
export async function confirmarPagamento(conexao: Conexao, inscricaoId: string) {
  const { rowCount } = await conexao.query(
    `update inscricoes set status = 'confirmada', pago_em = now(), pagamento_token_hash = null
      where id = $1 and status = 'pendente'`,
    [inscricaoId]
  )
  return rowCount === 1
}

// Configuração do site: o que o admin salvou, completado com os padrões
export async function obterSite(conexao: Conexao = pool): Promise<SiteResposta> {
  const { rows } = await conexao.query(`select site, status, data_inicio as "dataInicio" from evento where id = 1`)
  if (!rows[0]) throw new Error("Dados do evento não cadastrados. Rode npm run db:setup.")
  const salvo = (rows[0].site ?? {}) as Partial<ConfigSite>
  return { ...SITE_PADRAO, ...salvo, status: rows[0].status, dataInicio: rows[0].dataInicio }
}

export async function eventoEncerrado(conexao: Conexao = pool) {
  const { rows } = await conexao.query("select status from evento where id = 1")
  return rows[0]?.status === "encerrado"
}

export async function obterSobre(conexao: Conexao = pool): Promise<ConfigSobre> {
  const { rows } = await conexao.query("select sobre from evento where id = 1")
  return { ...SOBRE_PADRAO, ...(rows[0]?.sobre ?? {}) }
}
