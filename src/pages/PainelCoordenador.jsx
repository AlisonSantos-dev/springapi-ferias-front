import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { extrairMensagemErro } from "../api/errors";
import { useAuth } from "../context/AuthContext";

export default function PainelCoordenador() {
  const [equipes, setEquipes] = useState([]);
  const [equipeSelecionada, setEquipeSelecionada] = useState("");
  const [periodos, setPeriodos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [erroAcao, setErroAcao] = useState("");

  const { nome, logout } = useAuth();

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
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Painel do coordenador</h1>
        <div>
          {nome && <span style={{ marginRight: "1rem" }}>Ola, {nome}</span>}
          <Link to="/minhas-ferias" style={{ marginRight: "1rem" }}>
            Minhas ferias
          </Link>
          <button onClick={logout}>Sair</button>
        </div>
      </div>

      <div style={{ margin: "1rem 0" }}>
        <label>
          Equipe:{" "}
          <select
            value={equipeSelecionada}
            onChange={(e) => setEquipeSelecionada(e.target.value)}
          >
            {equipes.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.nome}
              </option>
            ))}
          </select>
        </label>
      </div>

      {erroAcao && <p style={{ color: "red" }}>{erroAcao}</p>}
      {erro && <p style={{ color: "red" }}>{erro}</p>}
      {carregando && <p>Carregando...</p>}

      {!carregando && periodos.length === 0 && <p>Nenhum periodo de ferias registrado nessa equipe.</p>}

      {!carregando && periodos.length > 0 && (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Solicitante</th>
              <th>Inicio</th>
              <th>Fim</th>
              <th>Status</th>
              <th>Acao</th>
            </tr>
          </thead>
          <tbody>
            {periodos.map((p) => (
              <tr key={p.id}>
                <td>{p.solicitanteNome}</td>
                <td>{p.dataInicio}</td>
                <td>{p.dataFim}</td>
                <td>{p.status}</td>
                <td>
                  {p.status === "PENDENTE" && (
                    <>
                      <button onClick={() => aprovar(p.id)} style={{ marginRight: "0.5rem" }}>
                        Aprovar
                      </button>
                      <button onClick={() => rejeitar(p.id)}>Rejeitar</button>
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
