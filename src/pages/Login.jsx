import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import { extrairMensagemErro } from "../api/errors";

// Tela de entrada. Existem duas formas de entrar, e o backend diz quais estao
// ligadas neste ambiente (GET /api/auth/config):
//
// - Conta DB1 (producao): o portal ja fez o login com a conta Microsoft antes
//   da pessoa chegar aqui, entao a tela entra sozinha. Se for o primeiro
//   acesso, so pede pra escolher a equipe.
// - Email e senha (dev, no seu IntelliJ): o formulario de sempre.
export default function Login() {
  const [config, setConfig] = useState(null);
  const [etapa, setEtapa] = useState("verificando"); // verificando | entrando | primeiro-acesso | pronto
  const [erroSso, setErroSso] = useState("");

  // primeiro acesso pela conta DB1
  const [pendente, setPendente] = useState(null); // { nome, email }
  const [equipes, setEquipes] = useState([]);
  const [equipeEscolhida, setEquipeEscolhida] = useState("");
  const [salvandoEquipe, setSalvandoEquipe] = useState(false);
  const [erroPrimeiroAcesso, setErroPrimeiroAcesso] = useState("");

  // login por senha
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const { login, entrarComContaDb1, concluirPrimeiroAcesso, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const senhaAlterada = searchParams.get("senhaAlterada") === "1";

  // evita rodar a verificacao duas vezes (o StrictMode do React faz isso em dev)
  const jaVerificou = useRef(false);

  useEffect(() => {
    if (jaVerificou.current) return;
    jaVerificou.current = true;

    api
      .get("/auth/config")
      .then((response) => response.data)
      .catch(() => ({ ssoHabilitado: false, senhaHabilitada: true }))
      .then((cfg) => {
        setConfig(cfg);
        const saiuDeProposito = sessionStorage.getItem("saiu") === "1";
        if (cfg.ssoHabilitado && !saiuDeProposito) {
          entrarPelaContaDb1();
        } else {
          setEtapa("pronto");
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function entrarPelaContaDb1() {
    setErroSso("");
    setEtapa("entrando");
    try {
      const resultado = await entrarComContaDb1();
      if (resultado.status === "AUTENTICADO") {
        navigate("/minhas-ferias", { replace: true });
        return;
      }
      // CADASTRO_PENDENTE: pessoa nova, precisa escolher a equipe
      setPendente({ nome: resultado.nome, email: resultado.email });
      const response = await api.get("/equipes");
      setEquipes(response.data);
      if (response.data.length > 0) {
        setEquipeEscolhida(String(response.data[0].id));
      }
      setEtapa("primeiro-acesso");
    } catch (err) {
      setErroSso(extrairMensagemErro(err, "Nao foi possivel entrar com a conta DB1. Tente novamente."));
      setEtapa("pronto");
    }
  }

  async function handlePrimeiroAcesso(event) {
    event.preventDefault();
    setErroPrimeiroAcesso("");
    setSalvandoEquipe(true);
    try {
      await concluirPrimeiroAcesso(equipeEscolhida);
      navigate("/minhas-ferias", { replace: true });
    } catch (err) {
      setErroPrimeiroAcesso(extrairMensagemErro(err, "Nao foi possivel concluir seu primeiro acesso."));
    } finally {
      setSalvandoEquipe(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await login(email, senha);
      navigate("/minhas-ferias");
    } catch (err) {
      // 401/403 = credenciais erradas; qualquer outra coisa (CORS, servidor
      // fora do ar...) nao pode aparecer como "senha errada"
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setErro("Email ou senha invalidos.");
      } else {
        setErro("Nao foi possivel fazer login. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  }

  if (isAuthenticated && etapa !== "entrando") {
    return <Navigate to="/minhas-ferias" replace />;
  }

  const marca = (
    <div className="brand">
      <div className="brand-mark">Solicitação de Férias</div>
      <div className="brand-sub">Suporte ANYMARKET</div>
    </div>
  );

  if (etapa === "verificando" || etapa === "entrando") {
    return (
      <div className="login-page">
        <div className="login-stack">
          {marca}
          <div className="card login-card">
            <p>{etapa === "entrando" ? "Entrando com sua conta DB1..." : "Carregando..."}</p>
          </div>
        </div>
      </div>
    );
  }

  if (etapa === "primeiro-acesso" && pendente) {
    return (
      <div className="login-page">
        <div className="login-stack">
          {marca}
          <div className="card login-card">
            <h1>Primeiro acesso</h1>
            <p style={{ fontSize: "0.9rem", marginTop: "-0.5rem" }}>
              Olá, <strong>{pendente.nome}</strong>! Você entrou com a conta <strong>{pendente.email}</strong>.
              Para começar, escolha a sua equipe.
            </p>
            <form onSubmit={handlePrimeiroAcesso}>
              <div className="field" style={{ marginBottom: "1.25rem" }}>
                <label htmlFor="equipe">Equipe</label>
                <select
                  id="equipe"
                  value={equipeEscolhida}
                  onChange={(e) => setEquipeEscolhida(e.target.value)}
                  required
                >
                  {equipes.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.nome}
                    </option>
                  ))}
                </select>
              </div>

              {erroPrimeiroAcesso && <div className="alert alert-error">{erroPrimeiroAcesso}</div>}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={salvandoEquipe || !equipeEscolhida}
                style={{ width: "100%" }}
              >
                {salvandoEquipe ? "Salvando..." : "Começar a usar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const ssoHabilitado = config && config.ssoHabilitado;
  const senhaHabilitada = config && config.senhaHabilitada;

  return (
    <div className="login-page">
      <div className="login-stack">
        {marca}

        <div className="card login-card">
          <h1>Entrar</h1>

          {ssoHabilitado && (
            <>
              <button type="button" className="btn btn-primary" onClick={entrarPelaContaDb1} style={{ width: "100%" }}>
                Entrar com a conta DB1
              </button>
              {erroSso && (
                <div className="alert alert-error" style={{ marginTop: "1rem" }}>
                  {erroSso}
                </div>
              )}
            </>
          )}

          {ssoHabilitado && senhaHabilitada && (
            <p style={{ textAlign: "center", margin: "1rem 0", fontSize: "0.85rem" }}>ou</p>
          )}

          {senhaHabilitada && (
            <>
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
            </>
          )}

          {!ssoHabilitado && !senhaHabilitada && (
            <div className="alert alert-error">
              Nenhuma forma de login está ativa neste ambiente. Verifique o perfil do Spring configurado no servidor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
