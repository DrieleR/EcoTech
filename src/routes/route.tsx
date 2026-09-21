import { Route, Routes, useLocation } from "react-router-dom"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import Home from "../pages/Home"
import Sobre from "../pages/Sobre"
import Cronograma from "../pages/Cronograma"
import Exposicoes from "../pages/Exposicoes"
import Local from "../pages/Local"
import Patrocinadores from "../pages/Patrocinadores"
import Parceiros from "../pages/Parceiros"
import Inscricao from "../pages/Inscricao"
import PerfilPalestrante from "../pages/PerfilPalestrante"
import Palestras from "../pages/Palestras"
import PerfilPalestra from "../pages/PerfilPalestras"

function AppRoutes() {
  const location = useLocation()
  const isHome = location.pathname === "/"

  return (
    <>
      <NavBar/>
      <main className="w-full min-w-0 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/sobre" element={<Sobre/>}/>
          <Route path="/cronograma" element={<Cronograma/>}/>
          <Route path="/exposicoes" element={<Exposicoes/>}/>
          <Route path="/local" element={<Local/>}/>
          <Route path="/patrocinadores" element={<Patrocinadores/>}/>
          <Route path="/parceiros" element={<Parceiros/>}/>
          <Route path="/inscricao" element={<Inscricao/>}/>
          <Route path="/palestrantes/:slug" element={<PerfilPalestrante/>}/>
          <Route path="/palestras" element={<Palestras/>}/>
          <Route path="/palestras/:slug" element={<PerfilPalestra/>}/>
        </Routes>
      </main>
      {!isHome && <Footer/>}
    </>
  )
}

export default AppRoutes