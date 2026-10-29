import { useEffect, useRef, useState, type FormEvent } from "react"
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react"
import { encerrarEvento, salvarSite } from "../../api/site"
import { ROTAS_CONHECIDAS } from "../../consts/site"
import { BOTAO_PERIGO, BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CARTAO } from "../../consts/estilos"
import SeletorImagem from "./SeletorImagem"
import { variaveisCss } from "../../helpers/site"
import { Campo, MensagemErro, MensagemSucesso } from "../form/Campos"
import HomeView from "../HomeView"
import type { ConfigSite, ItemMenu, SiteResposta, TemplateSite } from "../../types/site"

interface Props {
  site: SiteResposta
  onSalvo: (site: SiteResposta) => void
}

const TEMPLATES: { id: TemplateSite; nome: string }[] = [
  { id: "classico", nome: "Clássico" },
  { id: "moderno", nome: "Moderno" },
  { id: "minimalista", nome: "Minimalista" },
]

const LARGURA_PREVIA = 1200

// Home em tamanho real, reduzida para caber na coluna
function Previa({ config, dataInicio }: { config: ConfigSite; dataInicio: string }) {
  const caixa = useRef<HTMLDivElement>(null)
  const [escala, setEscala] = useState(0.3)
  useEffect(() => {
    const el = caixa.current
    if (!el) return
    const obs = new ResizeObserver(() => setEscala(el.clientWidth / LARGURA_PREVIA))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={caixa} className="w-full overflow-hidden rounded-xl border border-eco-blue/15" style={{ height: 640 * escala }}>
      <div
        inert
        style={{ ...variaveisCss(config), width: LARGURA_PREVIA, transform: `scale(${escala})`, transformOrigin: "top left" }}
      >
        <HomeView config={config} dataInicio={dataInicio} />
      </div>
    </div>
  )
}

export default function AdminSite({ site, onSalvo }: Props) {
  const { status, dataInicio, ...inicial } = site
  const [form, setForm] = useState<ConfigSite>(inicial)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState({ erro: "", ok: "" })

  const encerrado = status === "encerrado"
  const alterado = JSON.stringify(form) !== JSON.stringify(inicial)
  const alterar = <K extends keyof ConfigSite>(campo: K, valor: ConfigSite[K]) => {
    setForm((f) => ({ ...f, [campo]: valor }))
    setMsg({ erro: "", ok: "" })
  }
  const alterarItem = (i: number, parcial: Partial<ItemMenu>) =>
    alterar("menu", form.menu.map((item, j) => (j === i ? { ...item, ...parcial } : item)))
  const mover = (i: number, d: -1 | 1) => {
    const menu = [...form.menu]
    ;[menu[i], menu[i + d]] = [menu[i + d], menu[i]]
    alterar("menu", menu)
  }
  const disponiveis = ROTAS_CONHECIDAS.filter((r) => !form.menu.some((m) => m.to === r.to))

  const salvar = async (e: FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    setMsg({ erro: "", ok: "" })
    try {
      const salvo = await salvarSite(form)
      onSalvo(salvo)
      setMsg({ erro: "", ok: "Alterações salvas. O site já foi atualizado." })
    } catch (err) {
      setMsg({ erro: err instanceof Error ? err.message : "Não foi possível salvar.", ok: "" })
    } finally {
      setSalvando(false)
    }
  }

  const encerrar = async () => {
    if (!window.confirm("Encerrar o evento? As inscrições serão fechadas e o evento irá para \"Eventos anteriores\".")) return
    try {
      onSalvo(await encerrarEvento())
    } catch (err) {
      setMsg({ erro: err instanceof Error ? err.message : "Não foi possível encerrar.", ok: "" })
    }
  }

  return (
    <form onSubmit={salvar} className="grid gap-6 xl:grid-cols-[1fr_360px] xl:items-start">
      <div className="flex min-w-0 flex-col gap-6">
        <div className={`${CARTAO} flex flex-col gap-4`}>
          <div>
            <h2 className="font-sora text-lg font-bold text-eco-blue">Conteúdo da página</h2>
            <p className="font-sora mt-1 text-xs text-eco-gray">Textos exibidos na tela inicial.</p>
          </div>
          <Campo label="Título principal" required value={form.titulo} onChange={(e) => alterar("titulo", e.target.value)} />
          <Campo label="Descrição" required value={form.descricao} onChange={(e) => alterar("descricao", e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Data" required value={form.dataExibicao} onChange={(e) => alterar("dataExibicao", e.target.value)} ajuda="Texto livre, ex.: 15 a 16 de Outubro. A contagem usa a data de início do evento." />
            <Campo label="Local" required value={form.localExibicao} onChange={(e) => alterar("localExibicao", e.target.value)} />
          </div>
        </div>

        <div className={CARTAO}>
          <h2 className="font-sora text-lg font-bold text-eco-blue">Template da página</h2>
          <div role="radiogroup" aria-label="Template" className="mt-4 grid gap-3 sm:grid-cols-3">
            {TEMPLATES.map((t) => (
              <label key={t.id} className={`font-sora flex cursor-pointer items-center gap-2 rounded-xl border-2 p-4 text-sm font-bold text-eco-blue ${form.template === t.id ? "border-eco-blue bg-eco-blue-soft" : "border-eco-blue/15"}`}>
                <input type="radio" name="template" checked={form.template === t.id} onChange={() => alterar("template", t.id)} />
                {t.nome}
              </label>
            ))}
          </div>
        </div>

        <div className={CARTAO}>
          <h2 className="font-sora text-lg font-bold text-eco-blue">Cores da página</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {([["corPrimaria", "Cor primária"], ["corSecundaria", "Cor secundária"], ["corFundo", "Cor de fundo"]] as const).map(([campo, rotulo]) => (
              <label key={campo} className="flex cursor-pointer items-center gap-3 rounded-xl bg-eco-field p-3">
                <input type="color" value={form[campo]} onChange={(e) => alterar(campo, e.target.value)} className="h-10 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
                <span className="font-sora text-xs font-bold text-eco-blue">{rotulo}<br /><span className="font-normal text-eco-gray">{form[campo].toUpperCase()}</span></span>
              </label>
            ))}
          </div>
        </div>

        <div className={`${CARTAO} flex flex-col gap-3`}>
          <h2 className="font-sora text-lg font-bold text-eco-blue">Imagens</h2>
          <SeletorImagem rotulo="Logo" valor={form.logoUrl} maxLado={512} onChange={(v) => alterar("logoUrl", v)} onErro={(m) => setMsg({ erro: m, ok: "" })} />
          <SeletorImagem rotulo="Banner" valor={form.bannerUrl} maxLado={1600} onChange={(v) => alterar("bannerUrl", v)} onErro={(m) => setMsg({ erro: m, ok: "" })} />
        </div>

        <div className={`${CARTAO} flex flex-col gap-3`}>
          <div>
            <h2 className="font-sora text-lg font-bold text-eco-blue">Itens do menu</h2>
            <p className="font-sora mt-1 text-xs text-eco-gray">Ative, oculte, renomeie e reordene as seções do topo.</p>
          </div>
          {form.menu.map((item, i) => (
            <div key={item.id} className="flex items-center gap-2 rounded-xl bg-eco-field p-2">
              <div className="flex flex-col">
                <button type="button" aria-label="Subir" disabled={i === 0} onClick={() => mover(i, -1)} className="cursor-pointer text-eco-gray disabled:opacity-30"><ArrowUp size={14} /></button>
                <button type="button" aria-label="Descer" disabled={i === form.menu.length - 1} onClick={() => mover(i, 1)} className="cursor-pointer text-eco-gray disabled:opacity-30"><ArrowDown size={14} /></button>
              </div>
              <input aria-label={`Nome do item ${item.to}`} value={item.rotulo} onChange={(e) => alterarItem(i, { rotulo: e.target.value })} className={`font-sora min-w-0 flex-1 rounded-lg border border-eco-blue/15 bg-white px-3 py-2 text-sm text-eco-blue ${item.visivel ? "" : "opacity-50"}`} />
              <label className="font-sora flex cursor-pointer items-center gap-2 text-xs font-bold text-eco-blue">
                <input type="checkbox" role="switch" checked={item.visivel} onChange={(e) => alterarItem(i, { visivel: e.target.checked })} />
                {item.visivel ? "Visível" : "Oculto"}
              </label>
              <button type="button" aria-label={`Remover ${item.rotulo}`} onClick={() => alterar("menu", form.menu.filter((_, j) => j !== i))} className="cursor-pointer p-1 text-red-700"><Trash2 size={16} /></button>
            </div>
          ))}
          {disponiveis.length > 0 && (
            <select
              aria-label="Adicionar item"
              value=""
              onChange={(e) => {
                const r = disponiveis.find((d) => d.to === e.target.value)
                if (r) alterar("menu", [...form.menu, { id: `${r.to.slice(1) || "inicio"}-${Date.now()}`, rotulo: r.rotulo, to: r.to, visivel: true }])
              }}
              className={`${BOTAO_SECUNDARIO} self-start`}
            >
              <option value="">+ Adicionar item</option>
              {disponiveis.map((r) => <option key={r.to} value={r.to}>{r.rotulo}</option>)}
            </select>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-24">
        <div className={`${CARTAO} !p-5`}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-sora text-lg font-bold text-eco-blue">Pré-visualização</h2>
            <span className={`font-sora rounded-full px-3 py-1 text-[11px] font-bold ${encerrado ? "bg-red-100 text-red-700" : "bg-green-100 text-eco-green-dark"}`}>{encerrado ? "Encerrado" : "Ativo"}</span>
          </div>
          <Previa config={form} dataInicio={dataInicio} />
        </div>

        <MensagemErro>{msg.erro}</MensagemErro>
        <MensagemSucesso>{msg.ok}</MensagemSucesso>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={!alterado || salvando} className={BOTAO_PRIMARIO}>{salvando ? "Salvando..." : "Salvar alterações"}</button>
          <button type="button" disabled={!alterado || salvando} onClick={() => setForm(inicial)} className={BOTAO_SECUNDARIO}>Descartar</button>
          {!encerrado && <button type="button" onClick={encerrar} className={BOTAO_PERIGO}>Encerrar evento</button>}
        </div>
      </div>
    </form>
  )
}
