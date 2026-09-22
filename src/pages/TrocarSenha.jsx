import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { extrairMensagemErro } from "../api/errors";
import { useAuth } from "../context/AuthContext";

export default function TrocarSenha() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas nao coincidem.");
      return;
    }

    setEnviando(true);
    try {
      await api.patch("/colaboradores/senha", { senhaAtual, novaSenha });
      // o token atual ainda carrega a marca de "senha temporaria" antiga -
      // a forma mais simples de atualizar isso e pedir login de novo
      logout();
      navigate("/login?senhaAlterada=1");
    } catch (err) {
      setErro(extrairMensagemErro(err, "Nao foi possivel trocar a senha."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-stack">
        <div className="brand">
          <div className="brand-mark">Solicitacao de Ferias</div>
          <div className="brand-sub">Suporte ANYMARKET</div>
        </div>

        <div className="card login-card">
          <h1>Trocar senha</h1>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "-0.5rem" }}>
            Sua senha foi definida por outra pessoa. Escolha uma nova senha antes de continuar.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="field" style={{ marginBottom: "1rem" }}>
              <label htmlFor="senhaAtual">Senha atual</label>
              <input
                id="senhaAtual"
                type="password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                required
              />
            </div>

            <div className="field" style={{ marginBottom: "1rem" }}>
              <label htmlFor="novaSenha">Nova senha</label>
              <input
                id="novaSenha"
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <div className="field" style={{ marginBottom: "1.25rem" }}>
              <label htmlFor="confirmarSenha">Confirmar nova senha</label>
              <input
                id="confirmarSenha"
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                minLength={6}
                required
              />
            </div>

            {erro && <div className="alert alert-error">{erro}</div>}

            <button type="submit" className="btn btn-primary" disabled={enviando} style={{ width: "100%" }}>
              {enviando ? "Salvando..." : "Salvar e continuar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
