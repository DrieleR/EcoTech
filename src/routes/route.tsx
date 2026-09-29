import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import Home from "../pages/Home"
import Sobre from "../pages/Sobre"
import Cronograma from "../pages/Cronograma"
import Exposicoes from "../pages/Exposicoes"
import Local from "../pages/Local"
import Patrocinadores from "../components/Patrocinadores"
import Parceiros from "../components/Parceiros"
import Inscricao from "../pages/Inscricao"
import PerfilPalestrante from "../pages/PerfilPalestrante"
import Palestras from "../pages/Palestras"
import PerfilPalestra from "../pages/PerfilPalestras"
import Acessibilidade from "../pages/Acessibilidade"
import Login from "../pages/Login"
import EsqueciSenha from "../pages/EsqueciSenha"
import RedefinirSenha from "../pages/RedefinirSenha"
import MinhaConta from "../pages/MinhaConta"
import PagarInscricao from "../pages/PagarInscricao"
import SimularPagamento from "../pages/SimularPagamento"
import PainelAdmin from "../pages/PainelAdmin"
import RotaProtegida from "./RotaProtegida"

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
          <Route path="/acessibilidade" element={<Acessibilidade/>}/>
          <Route path="/inscricao" element={<Inscricao/>}/>
          <Route path="/palestrantes/:slug" element={<PerfilPalestrante/>}/>
          <Route path="/palestras" element={<Palestras/>}/>
          <Route path="/palestras/:slug" element={<PerfilPalestra/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/esqueci-senha" element={<EsqueciSenha/>}/>
          <Route path="/redefinir-senha" element={<RedefinirSenha/>}/>
          <Route
            path="/minha-conta"
            element={<RotaProtegida perfil="participante"><MinhaConta/></RotaProtegida>}
          />
          <Route
            path="/minha-conta/pagamento"
            element={<RotaProtegida perfil="participante"><PagarInscricao/></RotaProtegida>}
          />
          <Route path="/pagamento/simular" element={<SimularPagamento/>}/>
          <Route path="/minha-inscricao" element={<Navigate to="/minha-conta" replace/>}/>
          <Route
            path="/admin"
            element={<RotaProtegida perfil="admin"><PainelAdmin/></RotaProtegida>}
          />
        </Routes>
      </main>
      {!isHome && <Footer/>}
    </>
  )
}

export default AppRoutes