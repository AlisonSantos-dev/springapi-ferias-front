import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const senhaAlterada = searchParams.get("senhaAlterada") === "1";

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await login(email, senha);
      navigate("/minhas-ferias");
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setErro("Email ou senha invalidos.");
      } else {
        setErro("Nao foi possivel fazer login. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-stack">
        <div className="brand">
          <div className="brand-mark">Solicitação de Férias</div>
          <div className="brand-sub">Suporte ANYMARKET</div>
        </div>

        <div className="card login-card">
          <h1>Entrar</h1>
          {senhaAlterada && (
            <p style={{ color: "var(--color-aprovado)", fontSize: "0.85rem", marginTop: "-0.5rem" }}>
              Senha alterada! Entre com sua nova senha.
            </p>
          )}
          <form onSubmit={handleSubmit}>
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

          <div className="field" style={{ marginBottom: "1.25rem" }}>
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {erro && <div className="alert alert-error">{erro}</div>}

          <button type="submit" className="btn btn-primary" disabled={carregando} style={{ width: "100%" }}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
          Ainda nao tem conta? <Link to="/cadastro">Criar conta</Link>
        </p>
        </div>
      </div>
    </div>
  );
}
