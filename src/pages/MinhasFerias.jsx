import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { extrairMensagemErro } from "../api/errors";
import { useAuth } from "../context/AuthContext";
import { montarLinkEmailDp, DP_PORTAL_URL } from "../utils/emailDp";
import SolicitarFeriasForm from "../components/SolicitarFeriasForm";
import Topbar from "../components/Topbar";
import StatusBadge from "../components/StatusBadge";
import AvisoConflito from "../components/AvisoConflito";
import PeriodosDaEquipe from "../components/PeriodosDaEquipe";
import CalendarioEquipe from "../components/CalendarioEquipe";

// "2026-12-21" -> "21/12/2026"
function dataBr(iso) {
  return iso.split("-").reverse().join("/");
}

// o backend manda o momento em UTC ("2026-10-17T14:00:00Z");
// o navegador converte para o horario de quem esta vendo
function dataHoraBr(instante) {
  return new Date(instante).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MinhasFerias() {
  const [periodos, setPeriodos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [erroAcao, setErroAcao] = useState("");

  const { isCoordenador, equipeId, nome, logout } = useAuth();

  const carregar = useCallback(() => {
    setCarregando(true);
    api
      .get("/ferias/meus")
      .then((response) => setPeriodos(response.data))
      .catch(() => setErro("Nao foi possivel carregar seus periodos de ferias."))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function cancelar(id) {
    setErroAcao("");
    try {
      await api.delete(`/ferias/${id}`);
      carregar();
    } catch (err) {
      setErroAcao(extrairMensagemErro(err, "Nao foi possivel cancelar esse periodo."));
    }
  }

  // O link mailto (href do botao) abre o Outlook da pessoa; ao mesmo tempo
  // avisamos o backend que ela abriu o envio, pra registrar a data.
  async function marcarEnviadoAoDp(id) {
    setErroAcao("");
    try {
      await api.patch(`/ferias/${id}/enviado-dp`);
      carregar();
    } catch (err) {
      setErroAcao(extrairMensagemErro(err, "O e-mail abriu, mas nao foi possivel registrar o envio ao DP."));
    }
  }

  function linkEmailDp(p) {
    return montarLinkEmailDp({ nome: nome || "", dataInicio: p.dataInicio, dataFim: p.dataFim });
  }

  // aprovadas que ainda nao foram enviadas ao DP
  const aguardandoDp = periodos.filter((p) => p.status === "APROVADO" && !p.enviadoDpEm);

  return (
    <div className="page">
      <Topbar title="Minhas ferias">
        {isCoordenador && <Link to="/coordenador">Painel do coordenador</Link>}
        <button className="btn btn-ghost" onClick={logout}>
          Sair
        </button>
      </Topbar>

      {aguardandoDp.map((p) => (
        <div key={`aviso-dp-${p.id}`} className="alert alert-info">
          Suas ferias de {dataBr(p.dataInicio)} a {dataBr(p.dataFim)} foram aprovadas
          {p.aprovadoPorNome ? ` por ${p.aprovadoPorNome}` : ""}. Agora falta enviar a solicitacao ao DP.
          <div className="dp-acoes">
            <a className="btn btn-primary" href={linkEmailDp(p)} onClick={() => marcarEnviadoAoDp(p.id)}>
              Enviar ao DP
            </a>
            <a className="dp-link" href={DP_PORTAL_URL} target="_blank" rel="noopener noreferrer">
              ou abra pelo portal do DP
            </a>
          </div>
        </div>
      ))}

      <SolicitarFeriasForm onSucesso={carregar} />

      {equipeId && <CalendarioEquipe />}
      {equipeId && <PeriodosDaEquipe />}

      {erroAcao && <div className="alert alert-error">{erroAcao}</div>}
      {erro && <div className="alert alert-error">{erro}</div>}
      {carregando && <p className="empty-state">Carregando...</p>}

      {!carregando && !erro && periodos.length === 0 && (
        <p className="empty-state">Voce ainda nao solicitou nenhum periodo de ferias.</p>
      )}

      {!carregando && periodos.length > 0 && (
        <table className="list">
          <thead>
            <tr>
              <th>Inicio</th>
              <th>Fim</th>
              <th>Status</th>
              <th>Aprovado por</th>
              <th>DP</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {periodos.map((p) => (
              <tr key={p.id}>
                <td>{p.dataInicio}</td>
                <td>{p.dataFim}</td>
                <td>
                  <StatusBadge status={p.status} />
                  {p.conflitoComEquipe && <AvisoConflito colegas={p.colegasConflitantes} />}
                </td>
                <td>{p.aprovadoPorNome || "-"}</td>
                <td>
                  {p.status !== "APROVADO" && "-"}
                  {p.status === "APROVADO" && !p.enviadoDpEm && (
                    <a className="btn btn-primary" href={linkEmailDp(p)} onClick={() => marcarEnviadoAoDp(p.id)}>
                      Enviar ao DP
                    </a>
                  )}
                  {p.status === "APROVADO" && p.enviadoDpEm && (
                    <div className="dp-enviado">
                      Enviado em {dataHoraBr(p.enviadoDpEm)}
                      <a className="dp-link" href={linkEmailDp(p)} onClick={() => marcarEnviadoAoDp(p.id)}>
                        Reenviar
                      </a>
                    </div>
                  )}
                </td>
                <td>
                  {p.status === "PENDENTE" && (
                    <button className="btn btn-ghost" onClick={() => cancelar(p.id)}>
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
