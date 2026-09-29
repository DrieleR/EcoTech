import pg from "pg"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não definida. Coloque a URL do Neon no arquivo .env.")
}

// Por padrão o pg converte "date" em Date (com fuso) e "numeric" em string.
// Aqui: date continua "AAAA-MM-DD" e numeric vira número.
pg.types.setTypeParser(pg.types.builtins.DATE, (valor) => valor)
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (valor) => Number(valor))

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 })

export type Conexao = pg.Pool | pg.PoolClient

// Roda várias consultas como uma coisa só: ou tudo dá certo, ou nada muda
export async function transacao<T>(fn: (cliente: pg.PoolClient) => Promise<T>): Promise<T> {
  const cliente = await pool.connect()
  try {
    await cliente.query("begin")
    const resultado = await fn(cliente)
    await cliente.query("commit")
    return resultado
  } catch (erro) {
    await cliente.query("rollback")
    throw erro
  } finally {
    cliente.release()
  }
}
