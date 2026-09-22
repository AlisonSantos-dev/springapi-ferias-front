import { useState } from "react";
import api from "../api/api";
import { extrairMensagemErro } from "../api/errors";

export default function SolicitarFeriasForm({ onSucesso }) {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      await api.post("/ferias", { dataInicio, dataFim });
      setDataInicio("");
      setDataFim("");
      onSucesso();
    } catch (err) {
      setErro(extrairMensagemErro(err, "Nao foi possivel solicitar as ferias."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="card">
      <h2>Solicitar ferias</h2>
      <form onSubmit={handleSubmit}>
        <div className="field-row">
          <div className="field">
            <label htmlFor="dataInicio">Inicio</label>
            <input
              id="dataInicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="dataFim">Fim</label>
            <input
              id="dataFim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? "Enviando..." : "Solicitar"}
          </button>
        </div>

        {erro && <div className="alert alert-error">{erro}</div>}
      </form>
    </div>
  );
}
