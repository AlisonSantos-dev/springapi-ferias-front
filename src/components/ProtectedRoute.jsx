import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Envolve uma rota que exige login. Se nao tiver token, manda pro /login.
// Se somenteCoordenador for true, tambem exige role COORDENADOR - caso
// contrario redireciona pra /minhas-ferias (o backend ja bloqueia essas
// rotas via @PreAuthorize, isso aqui e so pra nao nem mostrar a tela).
export default function ProtectedRoute({ children, somenteCoordenador = false }) {
  const { isAuthenticated, isCoordenador } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (somenteCoordenador && !isCoordenador) {
    return <Navigate to="/minhas-ferias" replace />;
  }

  return children;
}
