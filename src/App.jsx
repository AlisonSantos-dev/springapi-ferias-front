import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import MinhasFerias from "./pages/MinhasFerias";
import PainelCoordenador from "./pages/PainelCoordenador";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/minhas-ferias"
            element={
              <ProtectedRoute>
                <MinhasFerias />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordenador"
            element={
              <ProtectedRoute somenteCoordenador>
                <PainelCoordenador />
              </ProtectedRoute>
            }
          />
          {/* raiz redireciona pra minhas-ferias; se nao estiver logado,
              o ProtectedRoute manda pro /login sozinho */}
          <Route path="/" element={<Navigate to="/minhas-ferias" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
