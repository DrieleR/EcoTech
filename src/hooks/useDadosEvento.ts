import { useCallback, useEffect, useState } from "react"
import { listarAtividades, obterEvento } from "../api/inscricoes"
import type { AtividadeComVagas, DadosEvento } from "../types/inscricao"

// Carrega os dados do evento e as atividades com vagas atualizadas
export function useDadosEvento() {
  const [evento, setEvento] = useState<DadosEvento | null>(null)
  const [atividades, setAtividades] = useState<AtividadeComVagas[]>([])
  const [erro, setErro] = useState("")

  const recarregar = useCallback(async () => {
    try {
      const [ev, ats] = await Promise.all([obterEvento(), listarAtividades()])
      setEvento(ev)
      setAtividades(ats)
      setErro("")
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível carregar os dados do evento.")
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial dos dados
    recarregar()
  }, [recarregar])

  return { evento, atividades, erro, recarregar, setEvento, setAtividades }
}
