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
    <form onSubmit={handleSubmit} style={{ margin: "1rem 0", padding: "1rem", border: "1px solid #ccc" }}>
      <h3 style={{ marginTop: 0 }}>Solicitar ferias</h3>

      <label style={{ marginRight: "1rem" }}>
        Inicio:{" "}
        <input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          required
        />
      </label>

      <label style={{ marginRight: "1rem" }}>
        Fim:{" "}
        <input
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          required
        />
      </label>

      <button type="submit" disabled={enviando}>
        {enviando ? "Enviando..." : "Solicitar"}
      </button>

      {erro && <p style={{ color: "red" }}>{erro}</p>}
    </form>
  );
}
