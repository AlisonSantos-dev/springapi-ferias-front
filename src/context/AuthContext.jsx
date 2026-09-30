import { createContext, useContext, useEffect, useState } from "react";
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

  // Ao abrir o app com um token guardado, confere com o backend se ele ainda
  // vale. Se nao valer, o backend responde 401 e o interceptor do api.js
  // limpa tudo e manda pro login. Sem isso, um token antigo (de outro
  // ambiente ou com senha temporaria) deixaria a pessoa presa numa tela.
  useEffect(() => {
    if (localStorage.getItem("token")) {
      api.get("/auth/sessao").catch(() => {});
    }
  }, []);

  // Guarda o JWT e os dados do colaborador que vem dentro dele (claims).
  // Usado tanto pelo login por senha (dev) quanto pelo login pela conta DB1.
  function aplicarToken(novoToken) {
    localStorage.setItem("token", novoToken);
    setToken(novoToken);

    // Os dados do colaborador vem dentro do token (claims), decodificamos
    // so a parte do meio do JWT (payload em base64) pra usar na tela sem
    // precisar de outra chamada a API.
    try {
      const base64 = novoToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      // TextDecoder mantem os acentos do nome (atob sozinho embaralha UTF-8)
      const payload = JSON.parse(new TextDecoder().decode(bytes));
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

  // Login por email e senha (so existe no perfil dev).
  async function login(email, senha) {
    const response = await api.post("/login", { email, senha });
    aplicarToken(response.data.token);
  }

  // Login pela conta Microsoft da DB1. Quem ja fez o login de verdade foi o
  // portal; o backend so le a identidade que o portal entregou.
  // Devolve a resposta do backend:
  //   { status: "AUTENTICADO", token }            -> ja entrou
  //   { status: "CADASTRO_PENDENTE", nome, email } -> precisa escolher a equipe
  async function entrarComContaDb1() {
    const response = await api.get("/auth/sso");
    if (response.data.status === "AUTENTICADO") {
      sessionStorage.removeItem("saiu");
      aplicarToken(response.data.token);
    }
    return response.data;
  }

  // Primeiro acesso de quem entrou com a conta DB1 e ainda nao existia no sistema.
  async function concluirPrimeiroAcesso(equipeIdEscolhida) {
    const response = await api.post("/auth/sso/primeiro-acesso", { equipeId: equipeIdEscolhida });
    sessionStorage.removeItem("saiu");
    aplicarToken(response.data.token);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("nome");
    localStorage.removeItem("role");
    localStorage.removeItem("equipeId");
    localStorage.removeItem("senhaTemporaria");
    // marca que a pessoa saiu de proposito: sem isso, a tela de login
    // entraria de novo sozinha pela conta DB1 no mesmo instante
    sessionStorage.setItem("saiu", "1");
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
    entrarComContaDb1,
    concluirPrimeiroAcesso,
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
