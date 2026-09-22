import { useEffect, useMemo, useState } from "react";
import api from "../api/api";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const MESES = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatarData(date) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function gerarGradeDoMes(referencia) {
  const ano = referencia.getFullYear();
  const mes = referencia.getMonth();

  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();

  const celulas = [];
  for (let i = 0; i < primeiroDiaSemana; i++) {
    celulas.push(null);
  }
  for (let dia = 1; dia <= totalDias; dia++) {
    celulas.push(new Date(ano, mes, dia));
  }
  return celulas;
}

// Calendario com a visao geral (todas as equipes juntas), nao so a do
// colaborador logado.
export default function CalendarioEquipe() {
  const [referencia, setReferencia] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });
  const [periodos, setPeriodos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    api
      .get("/ferias/todos")
      .then((response) => setPeriodos(response.data.filter((p) => p.status !== "REJEITADO")))
      .catch(() => setErro("Nao foi possivel carregar o calendario."))
      .finally(() => setCarregando(false));
  }, []);

  const celulas = useMemo(() => gerarGradeDoMes(referencia), [referencia]);

  function periodosNoDia(data) {
    if (!data) return [];
    const dataStr = formatarData(data);
    return periodos.filter((p) => p.dataInicio <= dataStr && dataStr <= p.dataFim);
  }

  function mudarMes(delta) {
    setReferencia((atual) => new Date(atual.getFullYear(), atual.getMonth() + delta, 1));
  }

  return (
    <div className="card">
      <div className="calendario-header">
        <button type="button" className="btn btn-ghost" onClick={() => mudarMes(-1)}>
          {"<"}
        </button>
        <h3 style={{ margin: 0 }}>
          {MESES[referencia.getMonth()]} {referencia.getFullYear()}
        </h3>
        <button type="button" className="btn btn-ghost" onClick={() => mudarMes(1)}>
          {">"}
        </button>
      </div>

      {carregando && <p className="empty-state">Carregando...</p>}
      {erro && <div className="alert alert-error">{erro}</div>}

      {!carregando && !erro && (
        <>
          <div className="calendario-grid calendario-semana">
            {DIAS_SEMANA.map((d) => (
              <div key={d} className="calendario-dia-semana">
                {d}
              </div>
            ))}
          </div>

          <div className="calendario-grid">
            {celulas.map((data, idx) => {
              if (!data) {
                return <div key={`vazio-${idx}`} className="calendario-dia calendario-dia-vazio" />;
              }
              const doDia = periodosNoDia(data);
              return (
                <div key={data.toISOString()} className="calendario-dia">
                  <span className="calendario-numero">{data.getDate()}</span>
                  <div className="calendario-tags">
                    {doDia.slice(0, 3).map((p) => (
                      <span
                        key={p.id}
                        className={`calendario-tag calendario-tag-${p.status.toLowerCase()}`}
                        title={`${p.solicitanteNome} (${p.equipeNome}) - ${p.status === "PENDENTE" ? "Pendente" : "Aprovado"} (${p.dataInicio} a ${p.dataFim})`}
                      />
                    ))}
                    {doDia.length > 3 && (
                      <span className="calendario-tag-mais" title={`+${doDia.length - 3} periodo(s)`}>
                        +{doDia.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="calendario-legenda">
            <span>
              <span className="calendario-tag calendario-tag-pendente" /> Pendente
            </span>
            <span>
              <span className="calendario-tag calendario-tag-aprovado" /> Aprovado
            </span>
          </div>
        </>
      )}
    </div>
  );
}
