import type { AtividadeComVagas, AtividadeEvento, DadosEvento } from "../types/inscricao"

const emMinutos = (hora: string) => {
  const [h, m] = hora.split(":").map(Number)
  return h * 60 + m
}

// Duas atividades conflitam quando são no mesmo dia e os horários se sobrepõem
export function conflitam(a: AtividadeEvento, b: AtividadeEvento) {
  return (
    a.id !== b.id &&
    a.dia === b.dia &&
    emMinutos(a.inicio) < emMinutos(b.fim) &&
    emMinutos(b.inicio) < emMinutos(a.fim)
  )
}

export function esgotada(atividade: AtividadeComVagas) {
  return atividade.ocupadas >= atividade.vagas
}

export function calcularTotal(evento: DadosEvento, atividades: AtividadeEvento[], ids: string[]) {
  const extras = atividades
    .filter((a) => ids.includes(a.id))
    .reduce((soma, a) => soma + a.valor, 0)
  return evento.valorInscricao + extras
}

// Mesmas regras usadas na tela e no "servidor": não há limite de quantidade,
// só conflito de horário (mesmo dia) e vagas. Retorna a mensagem do primeiro
// problema encontrado, ou null.
export function validarSelecao(atividades: AtividadeComVagas[], ids: string[], idsJaReservados: string[] = []) {
  if (new Set(ids).size !== ids.length) return "Atividade repetida na seleção."

  const escolhidas = ids.map((id) => atividades.find((a) => a.id === id))
  if (escolhidas.some((a) => !a)) return "Uma das atividades escolhidas não existe mais."

  for (const a of escolhidas as AtividadeComVagas[]) {
    // Quem já tinha a vaga não perde por causa da própria reserva
    if (!idsJaReservados.includes(a.id) && esgotada(a)) {
      return `As vagas de "${a.titulo}" acabaram.`
    }
    const outra = (escolhidas as AtividadeComVagas[]).find((b) => conflitam(a, b))
    if (outra) return `"${a.titulo}" e "${outra.titulo}" são no mesmo dia e horário.`
  }
  return null
}

export function horario(a: AtividadeEvento) {
  return `${a.inicio} – ${a.fim}`
}
