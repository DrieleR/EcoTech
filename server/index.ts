// Prazos como "até 10/10" são contados no horário de Belém, não no do servidor
process.env.TZ = "America/Belem"

const { app } = await import("./app.ts")

const porta = Number(process.env.PORT ?? 3000)
app.listen(porta, () => {
  console.info(`API rodando em http://localhost:${porta}/api`)
})
