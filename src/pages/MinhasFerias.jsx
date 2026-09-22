import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { extrairMensagemErro } from "../api/errors";
import { useAuth } from "../context/AuthContext";
import SolicitarFeriasForm from "../components/SolicitarFeriasForm";
import Topbar from "../components/Topbar";
import StatusBadge from "../components/StatusBadge";
import AvisoConflito from "../components/AvisoConflito";
import PeriodosDaEquipe from "../components/PeriodosDaEquipe";
import CalendarioEquipe from "../components/CalendarioEquipe";

export default function MinhasFerias() {
  const [periodos, setPeriodos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [erroAcao, setErroAcao] = useState("");

  const { isCoordenador, equipeId, logout } = useAuth();

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

  return (
    <div className="page">
      <Topbar title="Minhas ferias">
        {isCoordenador && <Link to="/coordenador">Painel do coordenador</Link>}
        <button className="btn btn-ghost" onClick={logout}>
          Sair
        </button>
      </Topbar>

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
