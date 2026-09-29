import { ROTULO_RECURSO } from "../consts/inscricao"
import { formatarData, formatarDataHora, formatarMoeda, formatarPeriodo } from "./formatar"
import type { AtividadeEvento, DadosEvento, Inscricao } from "../types/inscricao"

export function textoSituacao(i: Inscricao) {
  if (i.status === "confirmada") return "Confirmada"
  if (i.status === "pendente") return "Aguardando pagamento"
  return i.reembolso ? "Cancelada (reembolso)" : "Cancelada"
}

function baixar(nome: string, conteudo: string, tipo: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }))
  const link = document.createElement("a")
  link.href = url
  link.download = nome
  link.click()
  URL.revokeObjectURL(url)
}

export function textoAcessibilidade(inscricao: Inscricao) {
  const p = inscricao.participante
  if (!p.pcd) return ""
  return [...p.recursos.map((r) => ROTULO_RECURSO[r]), p.outroRecurso].filter(Boolean).join(", ")
}

export function baixarComprovante(inscricao: Inscricao, evento: DadosEvento, atividades: AtividadeEvento[]) {
  const p = inscricao.participante
  const escolhidas = atividades.filter((a) => inscricao.atividadesIds.includes(a.id))
  const linhas = [
    "COMPROVANTE DE INSCRIÇÃO",
    evento.nome,
    `${formatarPeriodo(evento.dataInicio, evento.dataFim)} • ${evento.horario}`,
    evento.local,
    "",
    `Nº da inscrição: ${inscricao.numero}`,
    `Situação: ${textoSituacao(inscricao)}`,
    `Data da inscrição: ${formatarData(inscricao.criadaEm)}`,
    "",
    `Nome: ${p.nome}`,
    `E-mail: ${p.email}`,
    `Categoria: ${p.categoria}`,
    "",
    "Minicursos:",
    ...(escolhidas.length
      ? escolhidas.map((a) => `  - ${a.titulo} (Dia ${a.dia}, ${a.inicio}–${a.fim}, ${a.local})`)
      : ["  Nenhum"]),
    "",
    `Inscrição no evento: ${formatarMoeda(evento.valorInscricao)}`,
    `Total: ${formatarMoeda(inscricao.valorTotal)}`,
    inscricao.pagoEm
      ? `Pagamento: Pix, aprovado em ${formatarDataHora(inscricao.pagoEm)}`
      : `Pagamento: ${inscricao.status === "pendente" ? "pendente" : "não se aplica"}`,
  ]
  baixar(`comprovante-${inscricao.numero}.txt`, linhas.join("\n"), "text/plain;charset=utf-8")
}

// CSV com ";" e BOM para o Excel em português abrir com acentos e colunas certas
export function exportarInscritosCsv(inscricoes: Inscricao[], atividades: AtividadeEvento[]) {
  const celula = (valor: string | number) => {
    let texto = String(valor)
    // Evita "injeção de fórmula": um nome como "=HYPERLINK(...)" viraria
    // fórmula ao abrir no Excel. O apóstrofo faz a célula ser só texto.
    if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`
    return `"${texto.replace(/"/g, '""')}"`
  }
  const cabecalho = [
    "Nº", "Nome", "E-mail", "Telefone", "Categoria", "Instituição/Empresa", "Curso/Área/Cargo",
    "PcD", "Acessibilidade", "Minicursos", "Valor total", "Situação", "Pago em", "Data da inscrição",
  ]
  const linhas = inscricoes.map((i) => {
    const p = i.participante
    const d = p.detalhes
    return [
      i.numero,
      p.nome,
      p.email,
      p.telefone,
      p.categoria,
      d.instituicao ?? d.empresa ?? "",
      d.curso ?? d.area ?? d.cargo ?? "",
      p.pcd ? "Sim" : "Não",
      textoAcessibilidade(i),
      atividades.filter((a) => i.atividadesIds.includes(a.id)).map((a) => a.titulo).join(", "),
      formatarMoeda(i.valorTotal),
      textoSituacao(i),
      i.pagoEm ? formatarDataHora(i.pagoEm) : "",
      formatarData(i.criadaEm),
    ].map(celula).join(";")
  })
  const hoje = new Date().toISOString().slice(0, 10)
  baixar(`inscritos-${hoje}.csv`, "\uFEFF" + [cabecalho.map(celula).join(";"), ...linhas].join("\r\n"), "text/csv;charset=utf-8")
}
