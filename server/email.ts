// Envio de e-mails. Ainda não há um provedor configurado (Resend, SMTP...),
// então em desenvolvimento a mensagem aparece no terminal do servidor.
// Quando escolherem o provedor, basta trocar o corpo desta função.
export async function enviarEmail(para: string, assunto: string, texto: string) {
  if (process.env.NODE_ENV === "production") {
    // Não escrever links de senha no log de produção
    console.warn(`[e-mail] Provedor de e-mail não configurado; mensagem "${assunto}" não foi enviada.`)
    return
  }
  console.info(`\n📧 [e-mail simulado] Para: ${para}\nAssunto: ${assunto}\n${texto}\n`)
}
