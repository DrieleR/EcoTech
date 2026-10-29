import { useNavigate } from "react-router-dom"
import HomeView from "../components/HomeView"
import { useSite } from "../hooks/useSite"

const Home = () => {
  const navigate = useNavigate()
  const { site } = useSite()
  return <HomeView config={site} dataInicio={site.dataInicio} onVerProgramacao={() => navigate("/cronograma")} />
}

export default Home
