// Cria uma conta de administrador (ou promove uma conta existente).
// A senha é digitada no terminal, sem aparecer na tela nem no histórico.
// Uso: npm run db:admin

import { createInterface } from "node:readline/promises"
import { stdin, stdout } from "node:process"
import { pool } from "../db.ts"
import { gerarHashSenha } from "../seguranca.ts"
import { TAMANHO_MINIMO_SENHA } from "../../src/consts/inscricao.ts"

const rl = createInterface({ input: stdin, output: stdout })

async function perguntarSenha(pergunta: string) {
  // Esconde o que é digitado trocando a saída por nada enquanto lê
  const escrever = stdout.write.bind(stdout)
  stdout.write(pergunta)
  ;(stdout as unknown as { write: () => boolean }).write = () => true
  const senha = await rl.question("")
  stdout.write = escrever
  stdout.write("\n")
  return senha
}

const nome = (await rl.question("Nome do administrador: ")).trim()
const email = (await rl.question("E-mail: ")).trim().toLowerCase()
const senha = await perguntarSenha(`Senha (mín. ${TAMANHO_MINIMO_SENHA} caracteres): `)
const confirmacao = await perguntarSenha("Confirme a senha: ")
rl.close()

if (!nome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Nome ou e-mail inválido.")
  process.exit(1)
}
if (senha.length < TAMANHO_MINIMO_SENHA || senha !== confirmacao) {
  console.error("Senha curta ou as duas senhas não coincidem.")
  process.exit(1)
}

await pool.query(
  `insert into usuarios (nome, email, perfil, senha_hash) values ($1, $2, 'admin', $3)
   on conflict (email) do update set perfil = 'admin', senha_hash = excluded.senha_hash, nome = excluded.nome`,
  [nome, email, await gerarHashSenha(senha)]
)
console.info(`✓ Administrador ${email} pronto. Entre pelo /login do site.`)
await pool.end()
