import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardHeader from "../../components/layout/DashboardHeader";
import Mathmarrar from "../../components/Mathmarrar";
import { materias } from "../../data/explicacaoData";
import { getExercicios } from "../../data/exerciciosData";
import { useAuth, authFetch } from "../../context/AuthContext";
import "./Exercicios.css";

const NIVEIS = [
  { id: "todos", nome: "Todos os níveis" },
  { id: "8-9", nome: "8ª–9ª classe" },
  { id: "10-11", nome: "10ª–11ª classe" },
  { id: "12", nome: "12ª classe" },
  { id: "admissao", nome: "Exame de admissão" },
];

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
  const { token } = useAuth();

  const [materiaId, setMateriaId] = useState(context?.materiaId || null);
  const [nivel, setNivel] = useState("todos");
  const [passo, setPasso] = useState(0);
  const [selecionada, setSelecionada] = useState(null);
  const [respostas, setRespostas] = useState([]); // boolean por pergunta
  const [perguntas, setPerguntas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [origemBanco, setOrigemBanco] = useState("local"); // "local" | "servidor" — só para debug visual, não bloqueia nada

  const materia = materias.find((m) => m.id === materiaId);
  const acertos = respostas.filter(Boolean).length;
  const terminou = materiaId && perguntas.length > 0 && passo >= perguntas.length;

  // Sempre que a matéria ou o nível mudam, tenta ir buscar exercícios ao
  // servidor (banco real + IA a completar temas curtos). Se falhar por
  // qualquer razão — API em baixo, sem sessão, sem rede — cai sem drama
  // para o banco local já embutido na aplicação, que nunca está vazio.
  useEffect(() => {
    if (!materiaId) return;
    let cancelado = false;
    setCarregando(true);

    const localFallback = () => {
      if (cancelado) return;
      setPerguntas(getExercicios(materiaId));
      setOrigemBanco("local");
      setCarregando(false);
    };

    const params = new URLSearchParams({ materiaId, nivel, materiaNome: materia?.nome || materiaId, limite: "5" });
    authFetch(token, `/api/exercicios?${params}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("falhou"))))
      .then((dados) => {
        if (cancelado) return;
        if (Array.isArray(dados.exercicios) && dados.exercicios.length > 0) {
          setPerguntas(dados.exercicios);
          setOrigemBanco("servidor");
          setCarregando(false);
        } else {
          localFallback();
        }
      })
      .catch(localFallback);

    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materiaId, nivel]);

  function escolherMateria(id) {
    setMateriaId(id);
    setPasso(0);
    setSelecionada(null);
    setRespostas([]);
    setPerguntas([]);
  }

  function confirmar() {
    if (selecionada === null) return;
    const exercicio = perguntas[passo];
    const correta = selecionada === exercicio.correta;
    setRespostas((r) => [...r, correta]);

    // Regista a resposta (e, se errou, alimenta o Caderno de Erros) sem
    // bloquear a interface — o estudante já vê o feedback na hora.
    authFetch(token, "/api/exercicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exercicioId: exercicio.id,
        materiaId,
        materiaNome: materia?.nome,
        tema: exercicio.tema || materia?.nome,
        pergunta: exercicio.pergunta,
        opcoes: exercicio.opcoes,
        respostaDada: selecionada,
        correta: exercicio.correta,
        explicacao: exercicio.explicacao,
      }),
    }).catch(() => {}); // falha silenciosa: o quiz continua normalmente
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
              <p>Escolhe o nível, a matéria, e testa o que já sabes. Cada erro fica guardado no teu Caderno de Erros.</p>
            </div>

            <div className="exe-niveis">
              {NIVEIS.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`exe-nivel-chip ${nivel === n.id ? "active" : ""}`}
                  onClick={() => setNivel(n.id)}
                >
                  {n.nome}
                </button>
              ))}
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
        ) : carregando && perguntas.length === 0 ? (
          <div className="exe-loading">
            <div className="exe-spinner" />
            <p>A preparar os teus exercícios de {materia?.nome}…</p>
          </div>
        ) : perguntas.length === 0 ? (
          <div className="exe-loading">
            <p>Ainda não há exercícios de {materia?.nome} para este nível. Experimenta outro nível ou matéria.</p>
            <button className="btn-ghost" onClick={() => escolherMateria(null)}>Voltar</button>
          </div>
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
