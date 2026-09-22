import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Envolve uma rota que exige login. Se nao tiver token, manda pro /login.
// Se senhaTemporaria for true, forca a ida pro /trocar-senha antes de
// liberar qualquer outra tela (exceto a propria /trocar-senha, que usa
// forcarTrocaSenha=false pra nao entrar em loop).
// Se somenteCoordenador for true, tambem exige role COORDENADOR - caso
// contrario redireciona pra /minhas-ferias (o backend ja bloqueia essas
// rotas via @PreAuthorize, isso aqui e so pra nao nem mostrar a tela).
export default function ProtectedRoute({ children, somenteCoordenador = false, forcarTrocaSenha = true }) {
  const { isAuthenticated, isCoordenador, senhaTemporaria } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (forcarTrocaSenha && senhaTemporaria) {
    return <Navigate to="/trocar-senha" replace />;
  }

  if (somenteCoordenador && !isCoordenador) {
    return <Navigate to="/minhas-ferias" replace />;
  }

  return children;
}
