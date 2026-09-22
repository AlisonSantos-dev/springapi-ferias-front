import { useEffect, useState } from "react";
import api from "../api/api";
import { extrairMensagemErro } from "../api/errors";

export default function CadastrarColaboradorForm({ onSucesso }) {
  const [aberto, setAberto] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState("COLABORADOR");
  const [equipeId, setEquipeId] = useState("");
  const [equipes, setEquipes] = useState([]);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    api
      .get("/equipes")
      .then((response) => {
        setEquipes(response.data);
        if (response.data.length > 0 && !equipeId) {
          setEquipeId(String(response.data[0].id));
        }
      })
      .catch(() => setErro("Nao foi possivel carregar as equipes."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  function limparCampos() {
    setNome("");
    setEmail("");
    setSenha("");
    setRole("COLABORADOR");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");
    setSucesso("");
    setEnviando(true);

    try {
      const response = await api.post("/colaboradores", { nome, email, senha, role, equipeId });
      setSucesso(`${response.data.nome} cadastrado como ${response.data.role}.`);
      limparCampos();
      if (onSucesso) onSucesso();
    } catch (err) {
      setErro(extrairMensagemErro(err, "Nao foi possivel cadastrar esse colaborador."));
    } finally {
      setEnviando(false);
    }
  }

  if (!aberto) {
    return (
      <div className="card">
        <button className="btn btn-ghost" onClick={() => setAberto(true)}>
          + Cadastrar colaborador ou coordenador
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Cadastrar colaborador ou coordenador</h3>
      <form onSubmit={handleSubmit}>
        <div className="field-row" style={{ marginBottom: "1rem" }}>
          <div className="field">
            <label htmlFor="nomeNovo">Nome</label>
            <input id="nomeNovo" type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>

          <div className="field">
            <label htmlFor="emailNovo">Email</label>
            <input
              id="emailNovo"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="senhaNova">Senha</label>
            <input
              id="senhaNova"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              minLength={6}
              required
            />
          </div>
        </div>

        <div className="field-row" style={{ marginBottom: "1rem" }}>
          <div className="field">
            <label htmlFor="roleNova">Papel</label>
            <select id="roleNova" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="COLABORADOR">Colaborador</option>
              <option value="COORDENADOR">Coordenador</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="equipeNova">Equipe</label>
            <select id="equipeNova" value={equipeId} onChange={(e) => setEquipeId(e.target.value)}>
              {equipes.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {erro && <div className="alert alert-error">{erro}</div>}
        {sucesso && <p style={{ color: "var(--color-aprovado)", fontSize: "0.9rem" }}>{sucesso}</p>}

        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? "Cadastrando..." : "Cadastrar"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginLeft: "0.5rem" }}
          onClick={() => setAberto(false)}
        >
          Fechar
        </button>
      </form>
    </div>
  );
}
