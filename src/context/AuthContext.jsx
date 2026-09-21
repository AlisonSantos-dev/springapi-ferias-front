import { createContext, useContext, useState } from "react";
import api from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [nome, setNome] = useState(() => localStorage.getItem("nome"));
  const [role, setRole] = useState(() => localStorage.getItem("role"));

  async function login(email, senha) {
    const response = await api.post("/login", { email, senha });
    const novoToken = response.data.token;

    localStorage.setItem("token", novoToken);
    setToken(novoToken);

    // O nome e a role vem dentro do token (claims "nome" e "role"),
    // decodificamos so a parte do meio do JWT (payload em base64) pra
    // exibir/usar na tela sem precisar de outra chamada a API.
    try {
      const payload = JSON.parse(atob(novoToken.split(".")[1]));
      localStorage.setItem("nome", payload.nome || "");
      localStorage.setItem("role", payload.role || "");
      setNome(payload.nome || "");
      setRole(payload.role || "");
    } catch {
      // se por algum motivo nao der pra decodificar, segue sem esses dados
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("nome");
    localStorage.removeItem("role");
    setToken(null);
    setNome(null);
    setRole(null);
  }

  const value = {
    token,
    nome,
    role,
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
