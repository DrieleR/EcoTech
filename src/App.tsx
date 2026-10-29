import { BrowserRouter } from "react-router-dom"
import AppRoutes from "./routes/route"
import { AuthProvider } from "./context/AuthProvider"
import { SiteProvider } from "./context/SiteProvider"

function App() {
  return (
    <BrowserRouter>
      <SiteProvider>
        <AuthProvider>
          <AppRoutes/>
        </AuthProvider>
      </SiteProvider>
    </BrowserRouter>
  )
}

export default App
