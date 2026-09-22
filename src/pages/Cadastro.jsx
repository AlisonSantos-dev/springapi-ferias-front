import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { extrairMensagemErro } from "../api/errors";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [equipeId, setEquipeId] = useState("");
  const [equipes, setEquipes] = useState([]);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/equipes")
      .then((response) => {
        setEquipes(response.data);
        if (response.data.length > 0) {
          setEquipeId(String(response.data[0].id));
        }
      })
      .catch(() => setErro("Nao foi possivel carregar as equipes. Tente novamente mais tarde."));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      await api.post("/colaboradores/cadastro", { nome, email, senha, equipeId });
      setSucesso(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setErro(extrairMensagemErro(err, "Nao foi possivel criar sua conta."));
    } finally {
      setEnviando(false);
    }
  }

  if (sucesso) {
    return (
      <div className="login-page">
        <div className="login-stack">
          <div className="brand">
            <div className="brand-mark">Solicitacao de Ferias</div>
            <div className="brand-sub">Suporte ANYMARKET</div>
          </div>
          <div className="card login-card">
            <p>Conta criada! Redirecionando para o login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-stack">
        <div className="brand">
          <div className="brand-mark">Solicitacao de Ferias</div>
          <div className="brand-sub">Suporte ANYMARKET</div>
        </div>

        <div className="card login-card">
          <h1>Criar conta</h1>
          <form onSubmit={handleSubmit}>
            <div className="field" style={{ marginBottom: "1rem" }}>
              <label htmlFor="nome">Nome</label>
              <input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>

            <div className="field" style={{ marginBottom: "1rem" }}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field" style={{ marginBottom: "1rem" }}>
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <div className="field" style={{ marginBottom: "1.25rem" }}>
              <label htmlFor="equipe">Equipe</label>
              <select id="equipe" value={equipeId} onChange={(e) => setEquipeId(e.target.value)} required>
                {equipes.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.nome}
                  </option>
                ))}
              </select>
            </div>

            {erro && <div className="alert alert-error">{erro}</div>}

            <button type="submit" className="btn btn-primary" disabled={enviando} style={{ width: "100%" }}>
              {enviando ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <p style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
            Ja tem conta? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
