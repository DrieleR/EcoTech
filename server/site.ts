import { networkInterfaces } from "node:os"
import type { Request } from "express"

// Endereço do site para montar links (QR Code de pagamento, e-mails).
// Em produção, defina FRONTEND_URL. Em desenvolvimento, se o site foi aberto
// em "localhost", trocamos pelo IP da máquina na rede: assim o celular, no
// mesmo Wi-Fi, consegue abrir o link do QR Code.
export function urlDoSite(req?: Request) {
  if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL.replace(/\/$/, "")

  const host = req?.headers.host ?? "localhost:5173"
  const [nome, porta = "5173"] = host.split(":")
  if (nome !== "localhost" && nome !== "127.0.0.1") return `http://${host}`

  // Ignora redes virtuais (Docker, VirtualBox, VPN...) para achar o Wi-Fi/cabo
  const virtual = /^(docker|br-|veth|virbr|vmnet|vboxnet|tun|tap|tailscale|zt|wg)/
  const ipDaRede = Object.entries(networkInterfaces())
    .filter(([nome]) => !virtual.test(nome))
    .flatMap(([, lista]) => lista ?? [])
    .find((i) => i.family === "IPv4" && !i.internal)?.address
  return `http://${ipDaRede ?? "localhost"}:${porta}`
}
