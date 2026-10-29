import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogIn, LogOut, Menu, X } from "lucide-react";
import { useSite } from "../hooks/useSite";
import { useAuth } from "../hooks/useAuth";
import ecoLogo from '../assets/exo_logo_branca.png'


const NavBar = () => {
    const [open, setOpen] = useState<boolean>(false)
    const { usuario, sair } = useAuth()
    const { site } = useSite()
    const links = site.menu.filter((i) => i.visivel).map((i) => ({ to: i.to, label: i.rotulo }))
    const navigate = useNavigate()

    // Link da área logada: participante vai para a inscrição, admin para o painel
    const areaLogada = usuario?.perfil === "admin"
      ? { to: "/admin", label: "Painel" }
      : { to: "/minha-conta", label: "Minha conta" }

    const fazerLogout = () => {
      sair()
      setOpen(false)
      navigate("/")
    }
  return (
   <header className="sticky top-0 z-50 w-full bg-eco-blue">
      <div className="mx-auto flex w-full min-w-0 max-w-7xl items-center justify-between gap-8 px-6 py-4 lg:gap-12 lg:px-8">
        {/* Logo + nome do evento */}
        <div className="flex min-w-0 shrink items-center gap-3">
          <img src={site.logoUrl || ecoLogo} alt="Logo ESA" className="h-9 w-9 shrink-0" />
          <span className="min-w-0 truncate whitespace-nowrap font-inter text-lg font-black leading-none text-eco-cream-light">
            <span className="sm:hidden">EcoTech</span>
           
          </span>
        </div>

        {/* Menu para telas médias/grandes */}
        <nav className="hidden shrink-0 items-center gap-10 xl:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              // NavLink recebe uma função no className: ela roda de novo a
              // cada navegação e nos diz se este link é o da página atual
              // (isActive), permitindo destacar com um sublinhado. O tipo
              // `{ isActive: boolean }` vem embutido no react-router-dom.
              className={({ isActive }) =>
                `font-inter border-y-2 py-2 text-[16px] font-bold text-white transition-opacity hover:opacity-80 ${
                  isActive ? "border-t-transparent border-b-white" : "border-transparent"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          {usuario ? (
            <div className="flex items-center gap-6">
              <NavLink
                to={areaLogada.to}
                className={({ isActive }) =>
                  `font-inter border-y-2 py-2 text-[16px] font-bold text-white transition-opacity hover:opacity-80 ${
                    isActive ? "border-t-transparent border-b-white" : "border-transparent"
                  }`
                }
              >
                {areaLogada.label}
              </NavLink>
              <button
                onClick={fazerLogout}
                className="inline-flex items-center gap-2 rounded-full border-2 border-white px-4 py-1.5 font-inter font-bold text-white hover:bg-white/10 cursor-pointer"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 font-inter font-bold text-eco-blue hover:opacity-90"
            >
              <LogIn size={16} />
              Entrar
            </NavLink>
          )}
        </nav>

        {/* Botão hamburger, visível só em telas pequenas */}
        <button
          className="shrink-0 text-white xl:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Menu mobile: só renderiza a lista quando "open" é true */}
      {open && (
        <nav className="flex flex-col gap-1 bg-eco-blue-dark px-6 pb-4 xl:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 font-inter text-white ${
                  isActive ? "bg-white/10 font-bold" : ""
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          {usuario ? (
            <>
              <NavLink
                to={areaLogada.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 font-inter text-white ${
                    isActive ? "bg-white/10 font-bold" : ""
                  }`
                }
              >
                {areaLogada.label}
              </NavLink>
              <button
                onClick={fazerLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-left font-inter text-white cursor-pointer"
              >
                <LogOut size={16} />
                Sair
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 font-inter font-bold text-white ${
                  isActive ? "bg-white/10" : ""
                }`
              }
            >
              <LogIn size={16} />
              Entrar
            </NavLink>
          )}
        </nav>
      )}
    </header>
  )
}

export default NavBar