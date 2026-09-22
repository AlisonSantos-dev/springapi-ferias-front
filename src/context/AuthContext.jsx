import { createContext, useContext, useState } from "react";
import api from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [nome, setNome] = useState(() => localStorage.getItem("nome"));
  const [role, setRole] = useState(() => localStorage.getItem("role"));
  const [equipeId, setEquipeId] = useState(() => localStorage.getItem("equipeId"));
  const [senhaTemporaria, setSenhaTemporaria] = useState(
    () => localStorage.getItem("senhaTemporaria") === "true"
  );

  async function login(email, senha) {
    const response = await api.post("/login", { email, senha });
    const novoToken = response.data.token;

    localStorage.setItem("token", novoToken);
    setToken(novoToken);

    // Os dados do colaborador vem dentro do token (claims), decodificamos
    // so a parte do meio do JWT (payload em base64) pra usar na tela sem
    // precisar de outra chamada a API.
    try {
      const payload = JSON.parse(atob(novoToken.split(".")[1]));
      localStorage.setItem("nome", payload.nome || "");
      localStorage.setItem("role", payload.role || "");
      localStorage.setItem("equipeId", payload.equipeId || "");
      localStorage.setItem("senhaTemporaria", String(!!payload.senhaTemporaria));
      setNome(payload.nome || "");
      setRole(payload.role || "");
      setEquipeId(payload.equipeId || "");
      setSenhaTemporaria(!!payload.senhaTemporaria);
    } catch {
      // se por algum motivo nao der pra decodificar, segue sem esses dados
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("nome");
    localStorage.removeItem("role");
    localStorage.removeItem("equipeId");
    localStorage.removeItem("senhaTemporaria");
    setToken(null);
    setNome(null);
    setRole(null);
    setEquipeId(null);
    setSenhaTemporaria(false);
  }

  const value = {
    token,
    nome,
    role,
    equipeId,
    senhaTemporaria,
    isCoordenador: role === "COORDENADOR",
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de um AuthProvider");
  }
  return context;
}
