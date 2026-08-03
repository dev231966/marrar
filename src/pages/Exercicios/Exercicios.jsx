import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import DashboardHeader from "../../components/layout/DashboardHeader";
import Mathmarrar from "../../components/Mathmarrar";
import { useAuth, authFetch } from "../../context/AuthContext";
import "./Exercicios.css";

function renderComFormula(texto) {
  const partes = String(texto).split(/(\$[^$]+\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\])/g);

  return partes.map((parte, i) => {
    if (!parte) return null;

    let tex = null;
    let display = false;

    if (parte.startsWith("$") && parte.endsWith("$")) {
      tex = parte.slice(1, -1);
    } else if (parte.startsWith("\\(") && parte.endsWith("\\)")) {
      tex = parte.slice(2, -2);
    } else if (parte.startsWith("\\[") && parte.endsWith("\\]")) {
      tex = parte.slice(2, -2);
      display = true;
    }

    return tex !== null
      ? <Mathmarrar key={i} tex={tex} display={display} />
      : <span key={i}>{parte}</span>;
  });
}

// Sugestões compactas — não é a lista inteira de matérias, é um atalho rápido.
const SUGESTOES_RAPIDAS = ["Trigonometria", "Leis de Newton", "Tabela periódica", "Verbos irregulares"];

export default function Exercicios() {
  const { state } = useLocation();
  const { token } = useAuth();

  const [ecra, setEcra] = useState("entrada"); // entrada | quiz | resultado | historico
  const [busca, setBusca] = useState(state?.context?.busca || "");
  const [temaActivo, setTemaActivo] = useState(null);

  const [progresso, setProgresso] = useState(null);
  const [pontosAnimados, setPontosAnimados] = useState(null);

  const [perguntas, setPerguntas] = useState([]);
  const [passo, setPasso] = useState(0);
  const [selecionada, setSelecionada] = useState(null);
  const [confirmada, setConfirmada] = useState(false);
  const [respostas, setRespostas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const [atividade, setAtividade] = useState([]);
  const [cursorAtividade, setCursorAtividade] = useState(0);
  const [temMaisAtividade, setTemMaisAtividade] = useState(false);

  const acertos = respostas.filter((r) => r.acertou).length;
  const terminou = perguntas.length > 0 && passo >= perguntas.length;

  const carregarProgresso = useCallback(async () => {
    try {
      const resp = await authFetch(token, "/api/progresso?limite=1");
      const dados = await resp.json().catch(() => null);
      if (resp.ok) setProgresso(dados);
    } catch {
      // silencioso: stats não bloqueiam o uso da página
    }
  }, [token]);

  useEffect(() => { carregarProgresso(); }, [carregarProgresso]);

  useEffect(() => {
    if (state?.context?.busca) pesquisar(state.context.busca);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function pesquisar(termo) {
    const alvo = (termo ?? busca).trim();
    if (!alvo) return;

    setCarregando(true);
    setErro(null);
    setTemaActivo(alvo);
    setPasso(0);
    setSelecionada(null);
    setConfirmada(false);
    setRespostas([]);

    try {
      const params = new URLSearchParams({ busca: alvo, limite: "5" });
      const resp = await authFetch(token, `/api/exercicios?${params}`);
      const dados = await resp.json().catch(() => null);
      if (!resp.ok || !Array.isArray(dados?.exercicios) || dados.exercicios.length === 0) {
        throw new Error(dados?.erro || "Não encontrámos exercícios sobre isso ainda. Tenta outro termo.");
      }
      setPerguntas(dados.exercicios);
      setEcra("quiz");
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  async function confirmar() {
    if (selecionada === null || confirmada) return;
    setConfirmada(true); // só agora revela cores + explicação

    const exercicio = perguntas[passo];
    const acertou = selecionada === exercicio.correta;
    setRespostas((r) => [...r, { acertou }]);

    try {
      const resp = await authFetch(token, "/api/exercicios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercicioId: exercicio.id,
          materiaId: temaActivo,
          materiaNome: temaActivo,
          tema: temaActivo,
          pergunta: exercicio.pergunta,
          opcoes: exercicio.opcoes,
          respostaDada: selecionada,
          correta: exercicio.correta,
          explicacao: exercicio.explicacao,
          dificuldade: exercicio.dificuldade,
        }),
      });
      const dados = await resp.json().catch(() => null);
      if (resp.ok && dados?.gravado) {
        setPontosAnimados(dados.pontosGanhos);
        setProgresso((p) => ({
          ...(p || {}),
          pontos: dados.pontosTotais,
          nivel: dados.nivel,
          sequenciaDias: dados.sequenciaDias,
        }));
        setTimeout(() => setPontosAnimados(null), 1200);
      }
    } catch {
      // falha silenciosa: o quiz continua, só o registo é que não passou
    }
  }

  function seguinte() {
    setSelecionada(null);
    setConfirmada(false);
    setPasso((p) => {
      const proximo = p + 1;
      if (proximo >= perguntas.length) setEcra("resultado");
      return proximo;
    });
  }

  function novaPesquisa() {
    setBusca("");
    setTemaActivo(null);
    setPerguntas([]);
    setPasso(0);
    setSelecionada(null);
    setConfirmada(false);
    setRespostas([]);
    setEcra("entrada");
  }

  async function abrirHistorico() {
    setEcra("historico");
    if (atividade.length === 0) await carregarMaisAtividade(0);
  }

  async function carregarMaisAtividade(cursor = cursorAtividade) {
    try {
      const resp = await authFetch(token, `/api/progresso?cursor=${cursor}&limite=15`);
      const dados = await resp.json().catch(() => null);
      if (!resp.ok) throw new Error(dados?.erro);
      setAtividade((a) => (cursor === 0 ? dados.atividade : [...a, ...dados.atividade]));
      setCursorAtividade(cursor + dados.atividade.length);
      setTemMaisAtividade(dados.temMais);
    } catch {
      // histórico é secundário — falha aqui não deve travar a página
    }
  }

  return (
    <div className="exe-page">
      <DashboardHeader />

      <main className="page">
        {/* ---------- Barra de stats, sempre visível excepto durante o quiz ---------- */}
        {ecra !== "quiz" && progresso && (
          <div className="exe-stats">
            <div className="exe-stat">
              <span className="valor">{progresso.pontos ?? 0}</span>
              <span className="label">pontos</span>
            </div>
            <div className="exe-stat">
              <span className="valor">Nv {progresso.nivel ?? 1}</span>
              <span className="label">nível</span>
            </div>
            <div className="exe-stat">
              <span className="valor">🔥 {progresso.sequenciaDias ?? 0}</span>
              <span className="label">dias seguidos</span>
            </div>
            <button className="exe-stat-link" onClick={abrirHistorico}>Ver histórico</button>
          </div>
        )}

        {/* ---------- Entrada: pesquisa, não grid de matérias ---------- */}
        {ecra === "entrada" && (
          <>
            <div className="exe-intro">
              <h1>O que queres praticar?</h1>
              <p>Escreva o tema ex:"historia de moçambique"</p>
            </div>

            <form className="exe-busca" onSubmit={(e) => { e.preventDefault(); pesquisar(); }}>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar tema…"
                autoFocus
              />
              <button type="submit" className="btn-primary" disabled={!busca.trim() || carregando}>
                {carregando ? "…" : "Praticar"}
              </button>
            </form>

            {erro && <p className="exe-erro">{erro}</p>}

            <div className="exe-sugestoes">
              <span className="exe-sugestoes-label">Sugestões rápidas</span>
              <div className="exe-sugestoes-scroll">
                {SUGESTOES_RAPIDAS.map((s) => (
                  <button key={s} className="exe-sugestao-chip" onClick={() => pesquisar(s)}>{s}</button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ---------- Histórico (nunca apagado) ---------- */}
        {ecra === "historico" && (
          <div className="exe-historico">
            <div className="exe-historico-topo">
              <button className="btn-ghost" onClick={() => setEcra("entrada")}>← Voltar</button>
              <h1>Actividade recente</h1>
            </div>

            {atividade.length === 0 ? (
              <p className="exe-hint">Ainda não fizeste nenhum exercício.</p>
            ) : (
              <>
                <div className="exe-atividade-lista">
                  {atividade.map((a) => (
                    <div key={a.id} className={`exe-atividade-item ${a.acertou ? "certo" : "errado"}`}>
                      <span className="icone">{a.acertou ? "✓" : "✕"}</span>
                      <div className="info">
                        <span className="tema">{a.tema}</span>
                        <span className="quando">{new Date(a.quando).toLocaleDateString("pt-MZ")}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {temMaisAtividade && (
                  <button className="btn-ghost" onClick={() => carregarMaisAtividade()}>Carregar mais</button>
                )}
              </>
            )}
          </div>
        )}

        {/* ---------- Resultado ---------- */}
        {ecra === "resultado" && (
          <div className="exe-result">
            <div className="exe-result-ring">
              <svg viewBox="0 0 100 100">
                <circle className="bg" cx="50" cy="50" r="42" />
                <circle
                  className="fg"
                  cx="50" cy="50" r="42"
                  style={{
                    strokeDasharray: 2 * Math.PI * 42,
                    strokeDashoffset: 2 * Math.PI * 42 * (1 - acertos / perguntas.length),
                  }}
                />
              </svg>
              <div className="num">{acertos}/{perguntas.length}</div>
            </div>

            <h1>{acertos === perguntas.length ? "Perfeito! 🎯" : acertos / perguntas.length >= 0.5 ? "Bom trabalho!" : "Continua a praticar"}</h1>
            <p>Acertaste {acertos} de {perguntas.length} sobre <b>{temaActivo}</b>. Os erros ficam no teu Caderno de Erros.</p>

            <div className="exe-result-actions">
              <button className="btn-primary" onClick={() => pesquisar(temaActivo)}>Praticar mais deste tema</button>
              <button className="btn-ghost" onClick={novaPesquisa}>Pesquisar outro tema</button>
            </div>
          </div>
        )}

        {/* ---------- Quiz ---------- */}
        {ecra === "quiz" && perguntas.length > 0 && !terminou && (
          <div className="exe-quiz">
            <div className="exe-quiz-head">
              <button className="exe-exit" onClick={novaPesquisa} aria-label="Sair">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
              <div className="exe-progress">
                <div className="bar"><div className="fill" style={{ width: `${(passo / perguntas.length) * 100}%` }} /></div>
                <span>{passo + 1} / {perguntas.length}</span>
              </div>
              {pontosAnimados !== null && <span className="exe-pontos-flutuante">+{pontosAnimados}</span>}
            </div>

            <div className="exe-tag">{temaActivo}</div>
            <h2 className="exe-pergunta">{renderComFormula(perguntas[passo].pergunta)}</h2>

            <div className="exe-opcoes">
              {perguntas[passo].opcoes.map((op, i) => {
                const isCorreta = i === perguntas[passo].correta;
                const isEscolhida = i === selecionada;
                let estado = "";
                if (confirmada) {
                  if (isCorreta) estado = "correta";
                  else if (isEscolhida) estado = "errada";
                } else if (isEscolhida) {
                  estado = "selecionada";
                }
                return (
                  <button
                    key={i}
                    className={`exe-opcao ${estado}`}
                    disabled={confirmada}
                    onClick={() => setSelecionada(i)}
                  >
                    <span className="letra">{String.fromCharCode(65 + i)}</span>
                    <span className="texto">{renderComFormula(op)}</span>
                  </button>
                );
              })}
            </div>

            {confirmada && (
              <div className="exe-feedback"><p>{renderComFormula(perguntas[passo].explicacao)}</p></div>
            )}

            <div className="exe-actions">
              {selecionada === null ? (
                <button className="btn-primary large" disabled>Escolhe uma opção</button>
              ) : !confirmada ? (
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
