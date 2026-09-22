import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { extrairMensagemErro } from "../api/errors";
import { useAuth } from "../context/AuthContext";
import Topbar from "../components/Topbar";
import StatusBadge from "../components/StatusBadge";
import AvisoConflito from "../components/AvisoConflito";
import CadastrarColaboradorForm from "../components/CadastrarColaboradorForm";

export default function PainelCoordenador() {
  const [equipes, setEquipes] = useState([]);
  const [equipeSelecionada, setEquipeSelecionada] = useState("");
  const [periodos, setPeriodos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [erroAcao, setErroAcao] = useState("");

  const { logout } = useAuth();

  useEffect(() => {
    api
      .get("/equipes")
      .then((response) => {
        setEquipes(response.data);
        if (response.data.length > 0) {
          setEquipeSelecionada(String(response.data[0].id));
        }
      })
      .catch(() => setErro("Nao foi possivel carregar as equipes."));
  }, []);

  const carregarPeriodos = useCallback(() => {
    if (!equipeSelecionada) return;
    setCarregando(true);
    api
      .get(`/ferias/equipe/${equipeSelecionada}`)
      .then((response) => setPeriodos(response.data))
      .catch(() => setErro("Nao foi possivel carregar os periodos dessa equipe."))
      .finally(() => setCarregando(false));
  }, [equipeSelecionada]);

  useEffect(() => {
    carregarPeriodos();
  }, [carregarPeriodos]);

  async function aprovar(id) {
    setErroAcao("");
    try {
      await api.patch(`/ferias/${id}/aprovar`);
      carregarPeriodos();
    } catch (err) {
      setErroAcao(extrairMensagemErro(err, "Nao foi possivel aprovar esse periodo."));
    }
  }

  async function rejeitar(id) {
    setErroAcao("");
    try {
      await api.patch(`/ferias/${id}/rejeitar`);
      carregarPeriodos();
    } catch (err) {
      setErroAcao(extrairMensagemErro(err, "Nao foi possivel rejeitar esse periodo."));
    }
  }

  return (
    <div className="page">
      <Topbar title="Painel do coordenador">
        <Link to="/minhas-ferias">Minhas ferias</Link>
        <button className="btn btn-ghost" onClick={logout}>
          Sair
        </button>
      </Topbar>

      <CadastrarColaboradorForm />

      <div className="card">
        <div className="field">
          <label htmlFor="equipe">Equipe</label>
          <select
            id="equipe"
            value={equipeSelecionada}
            onChange={(e) => setEquipeSelecionada(e.target.value)}
          >
            {equipes.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {erroAcao && <div className="alert alert-error">{erroAcao}</div>}
      {erro && <div className="alert alert-error">{erro}</div>}
      {carregando && <p className="empty-state">Carregando...</p>}

      {!carregando && periodos.length === 0 && (
        <p className="empty-state">Nenhum periodo de ferias registrado nessa equipe.</p>
      )}

      {!carregando && periodos.length > 0 && (
        <table className="list">
          <thead>
            <tr>
              <th>Solicitante</th>
              <th>Inicio</th>
              <th>Fim</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {periodos.map((p) => (
              <tr key={p.id}>
                <td>{p.solicitanteNome}</td>
                <td>{p.dataInicio}</td>
                <td>{p.dataFim}</td>
                <td>
                  <StatusBadge status={p.status} />
                  {p.conflitoComEquipe && <AvisoConflito colegas={p.colegasConflitantes} />}
                </td>
                <td>
                  {p.status === "PENDENTE" && (
                    <>
                      <button className="btn btn-approve" onClick={() => aprovar(p.id)} style={{ marginRight: "0.5rem" }}>
                        Aprovar
                      </button>
                      <button className="btn btn-reject" onClick={() => rejeitar(p.id)}>
                        Rejeitar
                      </button>
                    </>
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
