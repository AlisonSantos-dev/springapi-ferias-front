import { useEffect, useState } from "react";
import api from "../api/api";
import StatusBadge from "./StatusBadge";

// Lista geral (todas as equipes juntas), nao so a do colaborador logado.
export default function PeriodosDaEquipe() {
  const [periodos, setPeriodos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    api
      .get("/ferias/todos")
      .then((response) => setPeriodos(response.data))
      .catch(() => setErro("Nao foi possivel carregar os periodos."))
      .finally(() => setCarregando(false));
  }, []);

  // so mostra periodos ainda relevantes (PENDENTE ou APROVADO) pra dar
  // visibilidade de quem ja esta ou vai estar de ferias
  const relevantes = periodos.filter((p) => p.status !== "REJEITADO");

  return (
    <div className="card">
      <h3>Ferias do suporte</h3>

      {carregando && <p className="empty-state">Carregando...</p>}
      {erro && <div className="alert alert-error">{erro}</div>}

      {!carregando && !erro && relevantes.length === 0 && (
        <p className="empty-state">Ninguem tem ferias pendentes ou aprovadas no momento.</p>
      )}

      {!carregando && relevantes.length > 0 && (
        <table className="list">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Equipe</th>
              <th>Inicio</th>
              <th>Fim</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {relevantes.map((p) => (
              <tr key={p.id}>
                <td>{p.solicitanteNome}</td>
                <td>{p.equipeNome}</td>
                <td>{p.dataInicio}</td>
                <td>{p.dataFim}</td>
                <td>
                  <StatusBadge status={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
