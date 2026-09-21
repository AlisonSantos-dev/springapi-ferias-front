import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { extrairMensagemErro } from "../api/errors";
import { useAuth } from "../context/AuthContext";
import SolicitarFeriasForm from "../components/SolicitarFeriasForm";

export default function MinhasFerias() {
  const [periodos, setPeriodos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [erroAcao, setErroAcao] = useState("");

  const { nome, isCoordenador, logout } = useAuth();

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
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Minhas ferias</h1>
        <div>
          {nome && <span style={{ marginRight: "1rem" }}>Ola, {nome}</span>}
          {isCoordenador && (
            <Link to="/coordenador" style={{ marginRight: "1rem" }}>
              Painel do coordenador
            </Link>
          )}
          <button onClick={logout}>Sair</button>
        </div>
      </div>

      <SolicitarFeriasForm onSucesso={carregar} />

      {erroAcao && <p style={{ color: "red" }}>{erroAcao}</p>}
      {carregando && <p>Carregando...</p>}
      {erro && <p style={{ color: "red" }}>{erro}</p>}

      {!carregando && !erro && periodos.length === 0 && (
        <p>Voce ainda nao tem nenhum periodo de ferias cadastrado.</p>
      )}

      {!carregando && periodos.length > 0 && (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Inicio</th>
              <th>Fim</th>
              <th>Status</th>
              <th>Aprovado por</th>
              <th>Acao</th>
            </tr>
          </thead>
          <tbody>
            {periodos.map((p) => (
              <tr key={p.id}>
                <td>{p.dataInicio}</td>
                <td>{p.dataFim}</td>
                <td>{p.status}</td>
                <td>{p.aprovadoPorNome || "-"}</td>
                <td>
                  {p.status === "PENDENTE" && (
                    <button onClick={() => cancelar(p.id)}>Cancelar</button>
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
