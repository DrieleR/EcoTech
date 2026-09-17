import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { links } from "../consts/navbar";
import ecoLogo from '../assets/exo_logo_branca.png'


const NavBar = () => {
    const [open, setOpen] = useState<boolean>(false)
  return (
   <header className="sticky top-0 z-50 w-full bg-eco-blue">
      <div className="mx-auto flex w-full min-w-0 max-w-7xl items-center justify-between gap-8 px-6 py-4 lg:gap-12 lg:px-8">
        {/* Logo + nome do evento */}
        <div className="flex min-w-0 items-center gap-3">
          <img src={ecoLogo} alt="Logo ESA" className="h-6 w-6 shrink-0" />
          <span className="font-inter text-lg font-black leading-none text-eco-cream-light">
            <span className="sm:hidden">EcoTech</span>
            <span className="hidden sm:inline">Engenharia de Software na Amazônia</span>
          </span>
        </div>

        {/* Menu para telas médias/grandes */}
        <nav className="hidden items-center gap-10 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              // NavLink recebe uma função no className: ela roda de novo a
              // cada navegação e nos diz se este link é o da página atual
              // (isActive), permitindo destacar com um sublinhado. O tipo
              // `{ isActive: boolean }` vem embutido no react-router-dom.
              className={({ isActive }) =>
                `font-inter pb-2 text-[16px] font-bold text-white transition-opacity hover:opacity-80 ${
                  isActive ? "border-b-2 border-white" : "border-b-2 border-transparent"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Botão hamburger, visível só em telas pequenas */}
        <button
          className="shrink-0 text-white lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Menu mobile: só renderiza a lista quando "open" é true */}
      {open && (
        <nav className="flex flex-col gap-1 bg-esa-blue-dark px-6 pb-4 lg:hidden">
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
        </nav>
      )}
    </header>
  )
}

export default NavBar