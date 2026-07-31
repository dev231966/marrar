import { useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardHeader from "../../components/layout/DashboardHeader";
import Mathmarrar from "../../components/Mathmarrar";
import { materias } from "../../data/explicacaoData";
import { getExercicios } from "../../data/exerciciosData";
import "./Exercicios.css";

// Divide o texto em partes normais e blocos LaTeX ($...$), tal como em Duvidas.jsx
function renderComFormula(texto) {
  const partes = texto.split(/(\$[^$]+\$)/g);
  return partes.map((parte, i) =>
    parte.startsWith("$") && parte.endsWith("$")
      ? <Mathmarrar key={i} tex={parte.slice(1, -1)} display={false} />
      : <span key={i}>{parte}</span>
  );
}

export default function Exercicios() {
  const { state } = useLocation();
  const context = state?.context;

  const [materiaId, setMateriaId] = useState(context?.materiaId || null);
  const [passo, setPasso] = useState(0);
  const [selecionada, setSelecionada] = useState(null);
  const [respostas, setRespostas] = useState([]); // boolean por pergunta

  const perguntas = materiaId ? getExercicios(materiaId) : [];
  const materia = materias.find((m) => m.id === materiaId);
  const acertos = respostas.filter(Boolean).length;
  const terminou = materiaId && passo >= perguntas.length;

  function escolherMateria(id) {
    setMateriaId(id);
    setPasso(0);
    setSelecionada(null);
    setRespostas([]);
  }

  function confirmar() {
    if (selecionada === null) return;
    const correta = selecionada === perguntas[passo].correta;
    setRespostas((r) => [...r, correta]);
  }

  function seguinte() {
    setSelecionada(null);
    setPasso((p) => p + 1);
  }

  function recomecar() {
    setPasso(0);
    setSelecionada(null);
    setRespostas([]);
  }

  return (
    <div className="exe-page">
      <DashboardHeader />

      <main className="page">
        {!materiaId ? (
          <>
            <div className="exe-intro">
              <h1>Exercícios</h1>
              <p>Escolhe uma matéria e testa o que já sabes. Cada erro fica guardado no teu Caderno de Erros.</p>
            </div>

            <div className="exe-materias">
              {materias.map((m) => {
                const total = getExercicios(m.id).length;
                return (
                  <button key={m.id} className="exe-materia-card" onClick={() => escolherMateria(m.id)}>
                    <span className="dot" style={{ background: m.cor }} />
                    <div className="info">
                      <span className="nome">{m.nome}</span>
                      <span className="qtd">{total} exercícios disponíveis</span>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </>
        ) : terminou ? (
          <div className="exe-result">
            <div className="exe-result-ring">
              <svg viewBox="0 0 100 100">
                <circle className="bg" cx="50" cy="50" r="42" />
                <circle
                  className="fg"
                  cx="50"
                  cy="50"
                  r="42"
                  style={{
                    strokeDasharray: 2 * Math.PI * 42,
                    strokeDashoffset: 2 * Math.PI * 42 * (1 - acertos / perguntas.length),
                  }}
                />
              </svg>
              <div className="num">{acertos}/{perguntas.length}</div>
            </div>

            <h1>{acertos === perguntas.length ? "Perfeito! 🎯" : acertos / perguntas.length >= 0.5 ? "Bom trabalho!" : "Continua a praticar"}</h1>
            <p>
              Acertaste {acertos} de {perguntas.length} perguntas de <b>{materia?.nome}</b>.
              {acertos < perguntas.length && " As que erraste ficam guardadas no teu Caderno de Erros."}
            </p>

            <div className="exe-result-actions">
              <button className="btn-primary" onClick={recomecar}>Repetir matéria</button>
              <button className="btn-ghost" onClick={() => escolherMateria(null)}>Escolher outra matéria</button>
            </div>
          </div>
        ) : (
          <div className="exe-quiz">
            <div className="exe-quiz-head">
              <button className="exe-exit" onClick={() => escolherMateria(null)} aria-label="Sair">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
              <div className="exe-progress">
                <div className="bar"><div className="fill" style={{ width: `${(passo / perguntas.length) * 100}%`, background: materia?.cor }} /></div>
                <span>{passo + 1} / {perguntas.length}</span>
              </div>
            </div>

            <div className="exe-tag" style={{ background: `${materia?.cor}18`, color: materia?.cor }}>{materia?.nome}</div>
            <h2 className="exe-pergunta">{renderComFormula(perguntas[passo].pergunta)}</h2>

            <div className="exe-opcoes">
              {perguntas[passo].opcoes.map((op, i) => {
                const respondida = selecionada !== null;
                const isCorreta = i === perguntas[passo].correta;
                const isEscolhida = i === selecionada;
                let estado = "";
                if (respondida) {
                  if (isCorreta) estado = "correta";
                  else if (isEscolhida) estado = "errada";
                }
                return (
                  <button
                    key={i}
                    className={`exe-opcao ${estado}`}
                    disabled={respondida}
                    onClick={() => setSelecionada(i)}
                  >
                    <span className="letra">{String.fromCharCode(65 + i)}</span>
                    <span className="texto">{renderComFormula(op)}</span>
                    {estado === "correta" && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                    )}
                    {estado === "errada" && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                    )}
                  </button>
                );
              })}
            </div>

            {selecionada !== null && (
              <div className="exe-feedback">
                <p>{renderComFormula(perguntas[passo].explicacao)}</p>
              </div>
            )}

            <div className="exe-actions">
              {selecionada === null ? (
                <button className="btn-primary large" disabled>Escolhe uma opção</button>
              ) : respostas.length === passo ? (
                <button className="btn-primary large" onClick={confirmar}>Confirmar resposta</button>
              ) : (
                <button className="btn-primary large" onClick={seguinte}>
                  {passo + 1 === perguntas.length ? "Ver resultado" : "Próxima pergunta"}
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
