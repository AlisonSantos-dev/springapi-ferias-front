// Extrai uma mensagem de erro legivel de uma resposta de erro do axios.
// O backend (ResourceExceptionHandler) sempre devolve um StandardError com
// um campo "message" - usamos ele quando existir, senao caimos num texto
// generico.
export function extrairMensagemErro(err, fallback = "Ocorreu um erro. Tente novamente.") {
  if (err.response && err.response.data && err.response.data.message) {
    return err.response.data.message;
  }
  return fallback;
}
