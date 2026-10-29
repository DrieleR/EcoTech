import { useEffect, useState } from "react"
import { listarEventosAnteriores } from "../../api/site"
import { CARTAO } from "../../consts/estilos"
import { MensagemErro } from "../form/Campos"
import type { EventoAnterior } from "../../types/site"

export default function AdminAnteriores() {
  const [lista, setLista] = useState<EventoAnterior[] | null>(null)
  const [erro, setErro] = useState("")

  useEffect(() => {
    listarEventosAnteriores().then(setLista).catch((e) => setErro(e instanceof Error ? e.message : "Erro ao carregar."))
  }, [])

  if (erro) return <MensagemErro>{erro}</MensagemErro>
  if (!lista) return <p className="font-sora text-eco-gray">Carregando...</p>
  if (!lista.length) return <p className="font-sora text-eco-gray">Nenhum evento encerrado ainda.</p>

  const dia = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("pt-BR")
  return (
    <div className="flex flex-col gap-4">
      {lista.map((e) => (
        <div key={e.id} className={CARTAO}>
          <h2 className="font-sora text-lg font-bold text-eco-blue">{e.nome}</h2>
          <p className="font-sora mt-1 text-sm text-eco-gray">{dia(e.dataInicio)} a {dia(e.dataFim)} · {e.local}</p>
          <p className="font-sora mt-3 text-xs text-eco-gray">
            {e.inscritos} inscritos · {e.atividades} atividades · encerrado em {new Date(e.encerradoEm).toLocaleDateString("pt-BR")}
          </p>
        </div>
      ))}
    </div>
  )
}
