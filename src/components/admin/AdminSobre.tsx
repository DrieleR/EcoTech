import { useState, type FormEvent } from "react"
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react"
import { salvarSobre } from "../../api/sobre"
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CARTAO } from "../../consts/estilos"
import { lerImagem } from "../../helpers/imagem"
import { Campo, MensagemErro, MensagemSucesso } from "../form/Campos"
import type { ConfigSobre, Entidade } from "../../types/sobre"

interface Props {
  sobre: ConfigSobre
  onSalvo: (sobre: ConfigSobre) => void
}

const novoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

function mover<T>(lista: T[], i: number, d: -1 | 1): T[] {
  const nova = [...lista]
  ;[nova[i], nova[i + d]] = [nova[i + d], nova[i]]
  return nova
}

function Setas({ i, total, onMover, onRemover, nome }: { i: number; total: number; onMover: (d: -1 | 1) => void; onRemover: () => void; nome: string }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button type="button" aria-label={`Subir ${nome}`} disabled={i === 0} onClick={() => onMover(-1)} className="cursor-pointer text-eco-gray disabled:opacity-30"><ArrowUp size={14} /></button>
      <button type="button" aria-label={`Descer ${nome}`} disabled={i === total - 1} onClick={() => onMover(1)} className="cursor-pointer text-eco-gray disabled:opacity-30"><ArrowDown size={14} /></button>
      <button type="button" aria-label={`Remover ${nome}`} onClick={onRemover} className="cursor-pointer p-1 text-red-700"><Trash2 size={16} /></button>
    </div>
  )
}

// Lista de parceiros ou patrocinadores de um nível, com logo
function ListaEntidades({ titulo, lista, max, onChange, onErro }: {
  titulo: string; lista: Entidade[]; max?: number; onChange: (l: Entidade[]) => void; onErro: (m: string) => void
}) {
  const alterar = (i: number, p: Partial<Entidade>) => onChange(lista.map((x, j) => (j === i ? { ...x, ...p } : x)))
  return (
    <div className="flex flex-col gap-2">
      <p className="font-sora text-sm font-bold text-eco-blue">{titulo}</p>
      {lista.map((en, i) => (
        <div key={en.id} className="flex items-center gap-2 rounded-xl bg-eco-field p-2">
          <div className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded bg-eco-blue-soft">
            {en.logo ? <img src={en.logo} alt="" className="max-h-full max-w-full object-contain" /> : <span className="font-sora text-[10px] text-eco-gray">LOGO</span>}
          </div>
          <input aria-label={`Nome (${titulo})`} value={en.nome} onChange={(e) => alterar(i, { nome: e.target.value })} className="font-sora min-w-0 flex-1 rounded-lg border border-eco-blue/15 bg-white px-3 py-2 text-sm text-eco-blue" />
          <label className="font-sora cursor-pointer text-xs font-bold text-eco-blue underline">
            Logo
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={async (e) => {
              const f = e.target.files?.[0]
              e.target.value = ""
              if (!f) return
              try { alterar(i, { logo: await lerImagem(f, 300) }) } catch (err) { onErro(err instanceof Error ? err.message : "Imagem inválida.") }
            }} />
          </label>
          <Setas i={i} total={lista.length} nome={en.nome} onMover={(d) => onChange(mover(lista, i, d))} onRemover={() => onChange(lista.filter((_, j) => j !== i))} />
        </div>
      ))}
      {(!max || lista.length < max) && (
        <button type="button" onClick={() => onChange([...lista, { id: novoId(), nome: "", logo: "" }])} className={`${BOTAO_SECUNDARIO} self-start`}>+ Adicionar</button>
      )}
    </div>
  )
}

export default function AdminSobre({ sobre, onSalvo }: Props) {
  const [form, setForm] = useState<ConfigSobre>(sobre)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState({ erro: "", ok: "" })

  const alterado = JSON.stringify(form) !== JSON.stringify(sobre)
  const alterar = <K extends keyof ConfigSobre>(campo: K, valor: ConfigSobre[K]) => {
    setForm((f) => ({ ...f, [campo]: valor }))
    setMsg({ erro: "", ok: "" })
  }
  const alterarPatro = (nivel: keyof ConfigSobre["patrocinadores"], lista: Entidade[]) =>
    alterar("patrocinadores", { ...form.patrocinadores, [nivel]: lista })
  const erro = (m: string) => setMsg({ erro: m, ok: "" })

  const salvar = async (e: FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    setMsg({ erro: "", ok: "" })
    try {
      const salvo = await salvarSobre(form)
      onSalvo(salvo)
      setForm(salvo)
      setMsg({ erro: "", ok: "Página Sobre atualizada." })
    } catch (err) {
      setMsg({ erro: err instanceof Error ? err.message : "Não foi possível salvar.", ok: "" })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-6">
      <div className={`${CARTAO} flex flex-col gap-4`}>
        <h2 className="font-sora text-lg font-bold text-eco-blue">Sobre o evento</h2>
        <Campo label="Título" required value={form.titulo} onChange={(e) => alterar("titulo", e.target.value)} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sobre-texto" className="font-sora text-xs font-bold text-eco-blue">Texto *</label>
          <textarea id="sobre-texto" required rows={5} maxLength={1500} value={form.texto} onChange={(e) => alterar("texto", e.target.value)} className="font-sora w-full rounded-lg border border-eco-blue/15 bg-eco-field px-4 py-3 text-sm text-eco-blue outline-none focus:border-eco-blue" />
        </div>
      </div>

      <div className={`${CARTAO} flex flex-col gap-3`}>
        <div>
          <h2 className="font-sora text-lg font-bold text-eco-blue">Carrossel de informações</h2>
          <p className="font-sora mt-1 text-xs text-eco-gray">Quando, Onde, Formato... Cada item é um slide.</p>
        </div>
        {form.itens.map((item, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl bg-eco-field p-3">
            <div className="flex items-center gap-2">
              <input aria-label="Título do item" value={item.titulo} onChange={(e) => alterar("itens", form.itens.map((x, j) => (j === i ? { ...x, titulo: e.target.value } : x)))} className="font-sora min-w-0 flex-1 rounded-lg border border-eco-blue/15 bg-white px-3 py-2 text-sm font-bold text-eco-blue" />
              <Setas i={i} total={form.itens.length} nome={item.titulo} onMover={(d) => alterar("itens", mover(form.itens, i, d))} onRemover={() => alterar("itens", form.itens.filter((_, j) => j !== i))} />
            </div>
            <textarea aria-label="Descrição do item" rows={3} maxLength={500} value={item.descricao} onChange={(e) => alterar("itens", form.itens.map((x, j) => (j === i ? { ...x, descricao: e.target.value } : x)))} className="font-sora w-full rounded-lg border border-eco-blue/15 bg-white px-3 py-2 text-sm text-eco-blue" />
          </div>
        ))}
        <button type="button" onClick={() => alterar("itens", [...form.itens, { titulo: "", descricao: "" }])} className={`${BOTAO_SECUNDARIO} self-start`}>+ Adicionar item</button>
      </div>

      <div className={`${CARTAO} flex flex-col gap-5`}>
        <h2 className="font-sora text-lg font-bold text-eco-blue">Parceiros</h2>
        <ListaEntidades titulo="Parceiros" lista={form.parceiros} onChange={(l) => alterar("parceiros", l)} onErro={erro} />
      </div>

      <div className={`${CARTAO} flex flex-col gap-5`}>
        <h2 className="font-sora text-lg font-bold text-eco-blue">Patrocinadores</h2>
        <ListaEntidades titulo="Master (1)" max={1} lista={form.patrocinadores.master} onChange={(l) => alterarPatro("master", l)} onErro={erro} />
        <ListaEntidades titulo="Ouro" lista={form.patrocinadores.ouro} onChange={(l) => alterarPatro("ouro", l)} onErro={erro} />
        <ListaEntidades titulo="Prata" lista={form.patrocinadores.prata} onChange={(l) => alterarPatro("prata", l)} onErro={erro} />
      </div>

      <MensagemErro>{msg.erro}</MensagemErro>
      <MensagemSucesso>{msg.ok}</MensagemSucesso>
      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" disabled={!alterado || salvando} onClick={() => setForm(sobre)} className={BOTAO_SECUNDARIO}>Descartar</button>
        <button type="submit" disabled={!alterado || salvando} className={BOTAO_PRIMARIO}>{salvando ? "Salvando..." : "Salvar alterações"}</button>
      </div>
    </form>
  )
}
