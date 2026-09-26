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

// Se o backend responder 401/403 (token invalido, expirado ou sem permissao),
// limpa o token guardado. A tela que consome isso decide o que fazer
// (redirecionar pro login, mostrar mensagem, etc).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // por enquanto so limpa o token; o tratamento de UI vem no passo 2
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default api;
