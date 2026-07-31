import DashboardHeader from "../../components/layout/DashboardHeader";
import { notaTendencia, semanasLabel, evolucaoPorMateria, statsResumo } from "../../data/evolucaoData";
import "./Evolucao.css";

function TrendChart({ valores, labels }) {
  const w = 560, h = 160, pad = 12;
  const min = Math.min(...valores) - 0.6;
  const max = Math.max(...valores) + 0.6;
  const stepX = (w - pad * 2) / (valores.length - 1);

  const pontos = valores.map((v, i) => {
    const x = pad + i * stepX;
    const y = h - pad - ((v - min) / (max - min)) * (h - pad * 2);
    return [x, y];
  });

  const linha = pontos.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${linha} L${pontos[pontos.length - 1][0]},${h - pad} L${pontos[0][0]},${h - pad} Z`;

  return (
    <svg className="trend-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#trendFill)" />
      <path d={linha} fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pontos.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === pontos.length - 1 ? 5 : 3.5} fill="#fff" stroke="var(--gold)" strokeWidth="2.5" />
      ))}
    </svg>
  );
}

export default function Evolucao() {
  const ultima = notaTendencia[notaTendencia.length - 1];
  const primeira = notaTendencia[0];
  const subida = (ultima - primeira).toFixed(1);

  return (
    <div className="evo-page">
      <DashboardHeader />

      <main className="page">
        <div className="evo-intro">
          <h1>Evolução</h1>
          <p>O teu progresso ao longo do tempo, matéria a matéria.</p>
        </div>

        <div className="evo-stats">
          <div className="evo-stat">
            <span className="lbl">Nota prevista</span>
            <span className="val">{statsResumo.notaPrevista}<small>/{statsResumo.notaMaxima}</small></span>
          </div>
          <div className="evo-stat">
            <span className="lbl">Exercícios feitos</span>
            <span className="val">{statsResumo.exerciciosFeitos}</span>
          </div>
          <div className="evo-stat">
            <span className="lbl">Precisão média</span>
            <span className="val">{statsResumo.precisaoMedia}%</span>
          </div>
          <div className="evo-stat">
            <span className="lbl">Horas de estudo</span>
            <span className="val">{statsResumo.tempoEstudoHoras}h</span>
          </div>
        </div>

        <div className="evo-card">
          <div className="evo-card-head">
            <div>
              <h3>Nota ao longo do tempo</h3>
              <p>Últimas {notaTendencia.length} semanas</p>
            </div>
            <span className={`evo-delta ${subida >= 0 ? "up" : "down"}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {subida >= 0 ? <path d="M6 15l6-6 6 6" /> : <path d="M6 9l6 6 6-6" />}
              </svg>
              {Math.abs(subida)} pts
            </span>
          </div>
          <TrendChart valores={notaTendencia} labels={semanasLabel} />
          <div className="trend-labels">
            {semanasLabel.map((l) => <span key={l}>{l}</span>)}
          </div>
        </div>

        <div className="section-lbl">Por matéria</div>
        <div className="evo-materias">
          {evolucaoPorMateria.map((m) => (
            <div key={m.id} className="evo-materia-row">
              <div className="top">
                <span className="nome">
                  <span className="dot" style={{ background: m.cor }} />
                  {m.nome}
                </span>
                <span className={`variacao ${m.variacao >= 0 ? "up" : "down"}`}>
                  {m.variacao >= 0 ? "+" : ""}{m.variacao}% esta semana
                </span>
              </div>
              <div className="bar">
                <div className="fill" style={{ width: `${m.percent}%`, background: m.cor }} />
              </div>
              <span className="pct">{m.percent}% dominado</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
