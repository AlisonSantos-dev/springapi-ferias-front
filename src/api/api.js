import axios from "axios";

// Instancia central do axios. Todas as chamadas pra API do springapi-ferias
// devem usar essa instancia, em vez de axios.get/post direto - assim o token
// e a URL base ficam configurados em um so lugar.
//
// VITE_API_URL fica vazio em producao (front e back no mesmo dominio) e
// aponta pro backend local em desenvolvimento (http://localhost:8080).
// O /api no final bate com o prefixo que todos os endpoints do backend usam.
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ""}/api`,
});

// Antes de cada requisicao, anexa o token JWT guardado no localStorage
// (se existir) no header Authorization.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Chaves que o front guarda sobre a sessao (ver AuthContext).
const CHAVES_SESSAO = ["token", "nome", "role", "equipeId", "senhaTemporaria"];

// Se o backend responder 401, o token guardado nao vale mais (expirou, ou foi
// assinado com outra chave, por exemplo depois de um deploy). Limpa tudo e
// recarrega na tela de login, que entra de novo sozinha pela conta DB1.
//
// 403 NAO desloga: significa "voce entrou, mas nao pode fazer isso" (ex.: um
// colaborador tentando uma acao de coordenador). A tela mostra o erro.
//
// As chamadas da propria tela de login ficam de fora, senao um "senha
// errada" ou "sem conta DB1" recarregaria a pagina em loop.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = (error.config && error.config.url) || "";
    const chamadaDoLogin = url.startsWith("/login") || url.startsWith("/auth/sso") || url.startsWith("/auth/config");

    if (error.response && error.response.status === 401 && !chamadaDoLogin) {
      CHAVES_SESSAO.forEach((chave) => localStorage.removeItem(chave));
      if (window.location.pathname === "/login") {
        window.location.reload();
      } else {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
