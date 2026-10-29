import { Router } from "express"
import { z } from "zod"
import { pool, transacao } from "../db.ts"
import { ErroHttp, exigirLogin } from "../seguranca.ts"
import { eventoEncerrado, listarAtividades, obterSite, obterSobre, todasInscricoes } from "../repositorio.ts"
import { esquemaAtividade, esquemaEvento, esquemaSite, esquemaSobre, validar } from "../validacao.ts"

// Todas as rotas daqui exigem uma sessão de administrador
export const rotasAdmin = Router()
rotasAdmin.use(exigirLogin("admin"))

// ":id" precisa ser um UUID; sem isso o Postgres responderia com erro 500
rotasAdmin.param("id", (_req, _res, next, id) => {
  next(z.uuid().safeParse(id).success ? undefined : new ErroHttp(404, "Atividade não encontrada."))
})

rotasAdmin.get("/inscritos", async (_req, res) => {
  res.json(await todasInscricoes())
})

const COLUNAS_ATIVIDADE = `id, titulo, tipo, palestrante, dia, to_char(inicio, 'HH24:MI') as inicio,
  to_char(fim, 'HH24:MI') as fim, local, nivel, vagas, valor`

rotasAdmin.post("/atividades", async (req, res) => {
  const a = validar(esquemaAtividade, req.body)
  const { rows } = await pool.query(
    `insert into atividades (titulo, tipo, palestrante, dia, inicio, fim, local, nivel, vagas, valor)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning ${COLUNAS_ATIVIDADE}`,
    [a.titulo, a.tipo, a.palestrante, a.dia, a.inicio, a.fim, a.local, a.nivel, a.vagas, a.valor]
  )
  res.status(201).json(rows[0])
})

rotasAdmin.put("/atividades/:id", async (req, res) => {
  const a = validar(esquemaAtividade, req.body)
  const atual = (await listarAtividades()).find((x) => x.id === req.params.id)
  if (!atual) throw new ErroHttp(404, "Atividade não encontrada.")
  if (a.vagas < atual.ocupadas) {
    throw new ErroHttp(409, `Já existem ${atual.ocupadas} inscritos nesta atividade; as vagas não podem ser menores que isso.`)
  }
  const { rows } = await pool.query(
    `update atividades set titulo = $1, tipo = $2, palestrante = $3, dia = $4, inicio = $5, fim = $6,
            local = $7, nivel = $8, vagas = $9, valor = $10
      where id = $11 returning ${COLUNAS_ATIVIDADE}`,
    [a.titulo, a.tipo, a.palestrante, a.dia, a.inicio, a.fim, a.local, a.nivel, a.vagas, a.valor, req.params.id]
  )
  res.json(rows[0])
})

rotasAdmin.delete("/atividades/:id", async (req, res) => {
  const { rows } = await pool.query(
    `select exists (select 1 from inscricao_atividades ia join inscricoes i on i.id = ia.inscricao_id
                     where ia.atividade_id = $1 and i.status in ('pendente', 'confirmada')) as usada`,
    [req.params.id]
  )
  if (rows[0].usada) throw new ErroHttp(409, "Há inscritos nesta atividade. Remova as inscrições antes de excluí-la.")

  // Tira a atividade das inscrições canceladas antes de apagar
  await pool.query("delete from inscricao_atividades where atividade_id = $1", [req.params.id])
  await pool.query("delete from atividades where id = $1", [req.params.id])
  res.status(204).end()
})

rotasAdmin.put("/evento", async (req, res) => {
  const e = validar(esquemaEvento, req.body)
  const { rows } = await pool.query(
    `update evento set nome = $1, data_inicio = $2, data_fim = $3, horario = $4, local = $5,
            valor_inscricao = $6, inclui_na_inscricao = $7,
            prazo_troca_atividades = $8, prazo_reembolso = $9
      where id = 1
      returning nome, data_inicio as "dataInicio", data_fim as "dataFim", horario, local,
                valor_inscricao as "valorInscricao", inclui_na_inscricao as "incluiNaInscricao",
                prazo_troca_atividades as "prazoTrocaAtividades", prazo_reembolso as "prazoReembolso"`,
    [e.nome, e.dataInicio, e.dataFim, e.horario, e.local, e.valorInscricao, e.incluiNaInscricao,
     e.prazoTrocaAtividades, e.prazoReembolso]
  )
  res.json(rows[0])
})

rotasAdmin.put("/site", async (req, res) => {
  const site = validar(esquemaSite, req.body)
  await pool.query("update evento set site = $1 where id = 1", [JSON.stringify(site)])
  res.json(await obterSite())
})

// Arquiva o evento (guarda um resumo) e fecha as inscrições. Não apaga nada.
rotasAdmin.post("/evento/encerrar", async (_req, res) => {
  await transacao(async (db) => {
    if (await eventoEncerrado(db)) throw new ErroHttp(409, "O evento já está encerrado.")
    await db.query(
      `insert into eventos_anteriores (nome, data_inicio, data_fim, local, inscritos, atividades, site)
       select e.nome, e.data_inicio, e.data_fim, e.local,
              (select count(*)::int from inscricoes where status <> 'cancelada'),
              (select count(*)::int from atividades), e.site
         from evento e where e.id = 1`
    )
    await db.query("update evento set status = 'encerrado' where id = 1")
  })
  res.json(await obterSite())
})

rotasAdmin.get("/eventos-anteriores", async (_req, res) => {
  const { rows } = await pool.query(
    `select id, nome, encerrado_em as "encerradoEm", data_inicio as "dataInicio", data_fim as "dataFim",
            local, inscritos, atividades
       from eventos_anteriores order by encerrado_em desc`
  )
  res.json(rows.map((r) => ({ ...r, encerradoEm: r.encerradoEm.toISOString() })))
})

rotasAdmin.put("/sobre", async (req, res) => {
  const sobre = validar(esquemaSobre, req.body)
  await pool.query("update evento set sobre = $1 where id = 1", [JSON.stringify(sobre)])
  res.json(await obterSobre())
})
