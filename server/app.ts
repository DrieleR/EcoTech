import express, { type NextFunction, type Request, type Response } from "express"
import cors from "cors"
import helmet from "helmet"
import { ErroHttp } from "./seguranca.ts"
import { rotasAuth } from "./rotas/auth.ts"
import { rotasPagamento, rotasPublicas, rotasParticipante } from "./rotas/inscricoes.ts"
import { rotasAdmin } from "./rotas/admin.ts"

export const app = express()

// Atrás de um proxy (Render, Railway, Vercel...), usa o IP real do visitante
// no limite de tentativas
app.set("trust proxy", 1)
app.use(helmet())
// Em dev o Vite repassa /api para cá (mesma origem). CORS só é necessário se
// o front for publicado em outro domínio: informe-o em FRONTEND_URL.
if (process.env.FRONTEND_URL) app.use(cors({ origin: process.env.FRONTEND_URL }))
// A personalização do site leva imagens (data URL): limite maior só nesta rota
app.use(["/api/admin/site", "/api/admin/sobre"], express.json({ limit: "3mb" }))
app.use(express.json({ limit: "50kb" }))

const api = express.Router()
api.use("/auth", rotasAuth)
api.use("/minha-inscricao", rotasParticipante)
api.use("/admin", rotasAdmin)
api.use("/pagamentos", rotasPagamento)
api.use(rotasPublicas)
api.use((_req, _res, next) => next(new ErroHttp(404, "Rota não encontrada.")))
app.use("/api", api)

// Erros conhecidos viram { mensagem } com o status certo; o resto vira 500
// sem detalhes para o navegador (o detalhe fica só no log do servidor).
// O Express só reconhece o tratador de erros se ele tiver os 4 parâmetros
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((erro: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (erro instanceof ErroHttp) {
    res.status(erro.status).json({ mensagem: erro.message })
    return
  }
  if (erro instanceof SyntaxError && "body" in erro) {
    res.status(400).json({ mensagem: "Dados inválidos." })
    return
  }
  console.error(erro)
  res.status(500).json({ mensagem: "Algo deu errado. Tente novamente." })
})
