import { useMemo, useState } from "react";

const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];
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

function dataBr(iso) {
  return iso.split("-").reverse().join("/");
}

function gerarGradeDoMes(ano, mes) {
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

// Visao do ano inteiro (12 meses de uma vez), usada so no painel do
// coordenador. Recebe os periodos ja carregados pelo painel, entao respeita o
// filtro de equipe e atualiza sozinha depois de aprovar ou rejeitar.
export default function CalendarioAnual({ periodos }) {
  const [ano, setAno] = useState(() => new Date().getFullYear());
  const hojeStr = formatarData(new Date());

  // rejeitados nao ocupam o calendario
  const relevantes = useMemo(
    () => periodos.filter((p) => p.status !== "REJEITADO"),
    [periodos]
  );

  const meses = useMemo(
    () =>
      MESES.map((nome, mes) => {
        const inicioMes = formatarData(new Date(ano, mes, 1));
        const fimMes = formatarData(new Date(ano, mes + 1, 0));
        // quantas pessoas diferentes tem ferias que tocam esse mes
        const pessoas = new Set(
          relevantes
            .filter((p) => p.dataInicio <= fimMes && inicioMes <= p.dataFim)
            .map((p) => p.solicitanteNome)
        );
        return { nome, mes, celulas: gerarGradeDoMes(ano, mes), totalPessoas: pessoas.size };
      }),
    [ano, relevantes]
  );

  function infoDoDia(data) {
    const dataStr = formatarData(data);
    const doDia = relevantes.filter((p) => p.dataInicio <= dataStr && dataStr <= p.dataFim);
    if (doDia.length === 0) return null;

    // conflito = duas ou mais pessoas da MESMA equipe fora no mesmo dia
    const porEquipe = {};
    doDia.forEach((p) => {
      porEquipe[p.equipeNome] = (porEquipe[p.equipeNome] || 0) + 1;
    });
    const conflito = Object.values(porEquipe).some((qtd) => qtd > 1);

    // se tiver algum pendente no dia, o dia aparece como pendente: e o que
    // ainda pede decisao do coordenador
    const temPendente = doDia.some((p) => p.status === "PENDENTE");

    const titulo = [
      dataBr(dataStr),
      ...doDia.map(
        (p) =>
          `${p.solicitanteNome} (${p.equipeNome}) - ${p.status === "PENDENTE" ? "Pendente" : "Aprovado"}, ${dataBr(p.dataInicio)} a ${dataBr(p.dataFim)}`
      ),
    ].join("\n");

    return { temPendente, conflito, titulo };
  }

  return (
    <div className="card">
      <div className="calendario-header">
        <button type="button" className="btn btn-ghost" onClick={() => setAno((a) => a - 1)}>
          {"<"}
        </button>
        <h3 style={{ margin: 0 }}>Visao anual {ano}</h3>
        <button type="button" className="btn btn-ghost" onClick={() => setAno((a) => a + 1)}>
          {">"}
        </button>
      </div>

      <div className="cal-anual">
        {meses.map(({ nome, mes, celulas, totalPessoas }) => (
          <div key={mes} className="cal-anual-mes">
            <div className="cal-anual-mes-topo">
              <span className="cal-anual-mes-nome">{nome}</span>
              <span className="cal-anual-mes-qtd">
                {totalPessoas === 0 ? "-" : `${totalPessoas} ${totalPessoas === 1 ? "pessoa" : "pessoas"}`}
              </span>
            </div>

            <div className="cal-anual-grid">
              {DIAS_SEMANA.map((d, i) => (
                <span key={`sem-${i}`} className="cal-anual-semana">
                  {d}
                </span>
              ))}

              {celulas.map((data, idx) => {
                if (!data) {
                  return <span key={`vazio-${idx}`} />;
                }
                const info = infoDoDia(data);
                const classes = ["cal-anual-dia"];
                if (info) classes.push(info.temPendente ? "cal-anual-dia-pendente" : "cal-anual-dia-aprovado");
                if (info && info.conflito) classes.push("cal-anual-dia-conflito");
                if (formatarData(data) === hojeStr) classes.push("cal-anual-dia-hoje");

                return (
                  <span key={idx} className={classes.join(" ")} title={info ? info.titulo : undefined}>
                    {data.getDate()}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="calendario-legenda">
        <span>
          <span className="calendario-tag calendario-tag-aprovado" /> Aprovado
        </span>
        <span>
          <span className="calendario-tag calendario-tag-pendente" /> Pendente
        </span>
        <span>
          <span className="calendario-tag cal-anual-legenda-conflito" /> Conflito na equipe
        </span>
        <span>
          <span className="calendario-tag cal-anual-legenda-hoje" /> Hoje
        </span>
      </div>
    </div>
  );
}
