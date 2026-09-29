const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

export function formatarMoeda(valor: number) {
  return moeda.format(valor)
}

// Datas ficam no formato ISO "AAAA-MM-DD". Montamos a data com o fuso local
// para "2026-10-15" não virar dia 14 por causa do UTC.
export function paraData(iso: string) {
  const [ano, mes, dia] = iso.slice(0, 10).split("-").map(Number)
  return new Date(ano, mes - 1, dia)
}

export function formatarData(iso: string) {
  return paraData(iso).toLocaleDateString("pt-BR")
}

// Para instantes completos (ex.: "2026-09-29T14:03:00Z"), no fuso do navegador
export function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
}

export function formatarDiaMes(iso: string) {
  return paraData(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "long" })
}

export function formatarPeriodo(inicio: string, fim: string) {
  const a = paraData(inicio)
  const b = paraData(fim)
  const mes = b.toLocaleDateString("pt-BR", { month: "long" })
  if (a.getMonth() === b.getMonth()) return `${a.getDate()} a ${b.getDate()} de ${mes}`
  return `${formatarDiaMes(inicio)} a ${formatarDiaMes(fim)}`
}

// Data do "dia N" do evento, a partir da data de início
export function dataDoDia(dataInicio: string, dia: number) {
  const data = paraData(dataInicio)
  data.setDate(data.getDate() + dia - 1)
  return data.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })
}

// true enquanto hoje ainda não passou do prazo (o próprio dia conta)
export function dentroDoPrazo(prazoIso: string) {
  const fimDoPrazo = paraData(prazoIso)
  fimDoPrazo.setHours(23, 59, 59, 999)
  return Date.now() <= fimDoPrazo.getTime()
}

export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return "?"
  const primeira = partes[0][0]
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ""
  return (primeira + ultima).toUpperCase()
}

// Máscara simples: (91) 90000-0000
export function formatarTelefone(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ""
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
