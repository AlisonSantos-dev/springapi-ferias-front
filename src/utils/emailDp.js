// Monta o e-mail de solicitação de férias para o DP.
// O app não envia nada: ele só abre o Outlook do próprio colaborador já preenchido.

const DP_EMAIL = "dp@db1.com.br";
const EMAILS_EM_COPIA = ["mateus.seron@db1.com.br", "elaine.ciolari@db1.com.br"];

export const DP_PORTAL_URL = "https://dp.db1group.com/";

const UM_DIA_MS = 24 * 60 * 60 * 1000;

// A API devolve as datas como "2026-12-21". Não usar new Date("2026-12-21"):
// isso é lido como meia-noite em UTC e, no horário de Brasília, vira 20/12.
function paraDataLocal(dataIso) {
  const [ano, mes, dia] = dataIso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function formatarData(data) {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${data.getFullYear()}`;
}

// Conta o primeiro e o último dia: 21/12 até 04/01 = 15 dias.
function contarDias(inicio, fim) {
  return Math.round((fim - inicio) / UM_DIA_MS) + 1;
}

function diaSeguinte(data) {
  const retorno = new Date(data);
  retorno.setDate(retorno.getDate() + 1);
  return retorno;
}

function saudacao(agora = new Date()) {
  const hora = agora.getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export function montarLinkEmailDp({ nome, dataInicio, dataFim }) {
  const inicio = paraDataLocal(dataInicio);
  const fim = paraDataLocal(dataFim);
  const dias = contarDias(inicio, fim);

  const assunto = `Solicitação de férias - ${nome} - ${formatarData(inicio)} a ${formatarData(fim)}`;

  const corpo = [
    `${saudacao()} pessoal, tudo bem?`,
    "",
    `Conforme alinhamento com a coordenação do time de Suporte ANYMARKET, solicito por gentileza ` +
      `o período de férias de ${dias} dias, do dia ${formatarData(inicio)} até ${formatarData(fim)}, ` +
      `retornando no dia ${formatarData(diaSeguinte(fim))}.`,
    "",
    "Atenciosamente,",
    nome,
  ].join("\r\n");

  const cc = EMAILS_EM_COPIA.join(",");

  return (
    `mailto:${DP_EMAIL}` +
    `?cc=${encodeURIComponent(cc)}` +
    `&subject=${encodeURIComponent(assunto)}` +
    `&body=${encodeURIComponent(corpo)}`
  );
}
