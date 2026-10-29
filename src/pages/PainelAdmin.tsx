import { useNavigate, useSearchParams } from "react-router-dom"
import { CalendarCog, History, Info, LayoutTemplate, ListChecks, Users } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { useDadosEvento } from "../hooks/useDadosEvento"
import PainelLateral from "../components/PainelLateral"
import AdminInscritos from "../components/admin/AdminInscritos"
import AdminAtividades from "../components/admin/AdminAtividades"
import AdminSite from "../components/admin/AdminSite"
import AdminSobre from "../components/admin/AdminSobre"
import AdminAnteriores from "../components/admin/AdminAnteriores"
import { useSite } from "../hooks/useSite"
import AdminEvento from "../components/admin/AdminEvento"
import { MensagemErro } from "../components/form/Campos"

const SECOES = [
  { id: "inscritos", label: "Inscritos", icon: <Users size={16} />, descricao: "Acompanhe quem se inscreveu, os pedidos de acessibilidade e exporte a lista." },
  { id: "atividades", label: "Atividades", icon: <ListChecks size={16} />, descricao: "Cadastre minicursos e oficinas, com vagas e valores." },
  { id: "site", label: "Página inicial", icon: <LayoutTemplate size={16} />, descricao: "Edite textos, template, cores, imagens e menu do site. As alterações aparecem assim que você salvar." },
  { id: "sobre", label: "Página Sobre", icon: <Info size={16} />, descricao: "Edite o texto, o carrossel, os parceiros e os patrocinadores." },
  { id: "evento", label: "Evento", icon: <CalendarCog size={16} />, descricao: "Edite datas, local, valor da inscrição e prazos." },
  { id: "anteriores", label: "Eventos anteriores", icon: <History size={16} />, descricao: "Eventos já encerrados." },
]

export default function PainelAdmin() {
  const { usuario, sair } = useAuth()
  const navigate = useNavigate()
  const { site, atualizarSite, sobre, atualizarSobre } = useSite()
  const { evento, atividades, erro, recarregar, setEvento } = useDadosEvento()
  // A seção fica na URL (?secao=...) para sobreviver a um recarregamento
  const [params, setParams] = useSearchParams()
  const secao = SECOES.find((s) => s.id === params.get("secao")) ?? SECOES[0]

  const fazerLogout = () => {
    sair()
    navigate("/")
  }

  return (
    <section className="min-h-[70vh] bg-eco-cream px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <p className="font-sora text-sm font-extrabold uppercase tracking-widest text-eco-green-dark">
          Painel do administrador
        </p>
        <h1 className="font-sora mt-2 text-3xl font-bold text-eco-blue sm:text-4xl">{secao.label}</h1>
        <p className="font-sora mt-2 text-eco-gray">{secao.descricao}</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr] lg:items-start">
          <PainelLateral
            nome={usuario?.nome ?? ""}
            email={usuario?.email ?? ""}
            selo="Administrador"
            itens={SECOES}
            ativo={secao.id}
            onSelecionar={(id) => setParams({ secao: id })}
            onSair={fazerLogout}
          />

          <div className="min-w-0">
            {erro && <MensagemErro>{erro}</MensagemErro>}
            {!evento && !erro && secao.id !== "site" && secao.id !== "sobre" && secao.id !== "anteriores" && <p className="font-sora text-eco-gray">Carregando...</p>}
            {evento && secao.id === "inscritos" && <AdminInscritos atividades={atividades} />}
            {evento && secao.id === "atividades" && (
              <AdminAtividades atividades={atividades} evento={evento} onAlterar={recarregar} />
            )}
            {secao.id === "site" && <AdminSite key={JSON.stringify(site)} site={site} onSalvo={atualizarSite} />}
            {secao.id === "sobre" && <AdminSobre sobre={sobre} onSalvo={atualizarSobre} />}
            {secao.id === "anteriores" && <AdminAnteriores />}
            {evento && secao.id === "evento" && <AdminEvento evento={evento} onSalvo={setEvento} />}
          </div>
        </div>
      </div>
    </section>
  )
}
