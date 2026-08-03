import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

// Fallback só para quem ainda não tem nenhum exercício feito (conta nova) —
// assim que houver histórico, a grade de "exercícios feitos" toma o lugar disto.
const SUGESTOES_INICIAIS = ["Trigonometria", "Leis de Newton", "Tabela periódica", "Verbos irregulares"];

function formatarData(iso) {
  try {
    return new Date(iso).toLocaleDateString("pt-MZ", { day: "2-digit", month: "short" });
  } catch {
    return "";
  }
}

export default function Exercicios() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [ecra, setEcra] = useState("entrada"); // entrada | quiz | resultado | historico
  const [busca, setBusca] = useState(state?.context?.busca || "");
  const [temaActivo, setTemaActivo] = useState(null);

  const [perguntas, setPerguntas] = useState([]);
  const [passo, setPasso] = useState(0);
  const [selecionada, setSelecionada] = useState(null);
  const [confirmada, setConfirmada] = useState(false);
  const [respostas, setRespostas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [pontosAnimados, setPontosAnimados] = useState(null);

  const [atividade, setAtividade] = useState([]);
  const [cursorAtividade, setCursorAtividade] = useState(0);
  const [temMaisAtividade, setTemMaisAtividade] = useState(false);

  // Conquistas desbloqueadas nesta ronda (ex: "perfeccionista"), mostradas no ecrã de resultado.
  const [conquistasNovas, setConquistasNovas] = useState([]);

  // ---------- autocomplete ----------
  const [sugestoes, setSugestoes] = useState([]);
  const [sugestoesAbertas, setSugestoesAbertas] = useState(false);
  const [sugestoesCarregando, setSugestoesCarregando] = useState(false);
  const buscaWrapRef = useRef(null);
  const debounceRef = useRef(null);

  // ---------- exercícios feitos (grade da tela principal) ----------
  const [exerciciosFeitos, setExerciciosFeitos] = useState([]);
  const [carregandoFeitos, setCarregandoFeitos] = useState(true);

  // ---------- recomendado: um toque, sem escrever nada ----------
  const [recomendado, setRecomendado] = useState(null);
  const [carregandoRecomendado, setCarregandoRecomendado] = useState(true);

  const acertos = respostas.filter((r) => r.acertou).length;
  const terminou = perguntas.length > 0 && passo >= perguntas.length;

  const carregarExerciciosFeitos = useCallback(async () => {
    setCarregandoFeitos(true);
    try {
      const resp = await authFetch(token, "/api/exercicios-feitos?limite=8");
      const dados = await resp.json().catch(() => null);
      if (resp.ok) setExerciciosFeitos(dados?.exercicios || []);
    } catch {
      // grade é secundária — falha aqui não deve travar a página
    } finally {
      setCarregandoFeitos(false);
    }
  }, [token]);

  const carregarRecomendado = useCallback(async () => {
    setCarregandoRecomendado(true);
    try {
      const resp = await authFetch(token, "/api/resumo?tipo=recomendado");
      const dados = await resp.json().catch(() => null);
      if (resp.ok) setRecomendado(dados?.recomendado || null);
    } catch {
      // recomendação é um bónus — falha aqui não deve travar a página
    } finally {
      setCarregandoRecomendado(false);
    }
  }, [token]);

  useEffect(() => { carregarExerciciosFeitos(); }, [carregarExerciciosFeitos]);
  useEffect(() => { carregarRecomendado(); }, [carregarRecomendado]);

  useEffect(() => {
    if (state?.context?.busca) pesquisar(state.context.busca);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fecha o dropdown de sugestões ao clicar fora dele.
  useEffect(() => {
    function aoClicarFora(e) {
      if (buscaWrapRef.current && !buscaWrapRef.current.contains(e.target)) {
        setSugestoesAbertas(false);
      }
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, []);

  // Autocomplete ao vivo: pesquisa no banco (não é lista fixa) com debounce.
  function aoMudarBusca(valor) {
    setBusca(valor);
    setSugestoesAbertas(true);
    clearTimeout(debounceRef.current);

    const termo = valor.trim();
    if (termo.length < 2) {
      setSugestoes([]);
      setSugestoesCarregando(false);
      return;
    }

    setSugestoesCarregando(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const resp = await authFetch(token, `/api/temas-sugeridos?q=${encodeURIComponent(termo)}&limite=8`);
        const dados = await resp.json().catch(() => null);
        if (resp.ok) setSugestoes(dados?.sugestoes || []);
      } catch {
        // autocomplete é um bónus — falha aqui não deve travar a pesquisa
      } finally {
        setSugestoesCarregando(false);
      }
    }, 300);
  }

  async function pesquisar(termo) {
    const alvo = (termo ?? busca).trim();
    if (!alvo) return;

    setSugestoesAbertas(false);
    setCarregando(true);
    setErro(null);
    setTemaActivo(alvo);
    setPasso(0);
    setSelecionada(null);
    setConfirmada(false);
    setRespostas([]);
    setConquistasNovas([]);

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
        setTimeout(() => setPontosAnimados(null), 1200);
      }
    } catch {
      // falha silenciosa: o quiz continua, só o registo é que não passou
    }
  }

  // Verifica conquistas que só fazem sentido ao nível da ronda inteira
  // (ex: perfeccionista). Chamado uma vez, quando a última pergunta é respondida.
  async function verificarConquistasDaRonda(acertosFinal, totalFinal) {
    try {
      const resp = await authFetch(token, "/api/conquistas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evento: "ronda_concluida", acertos: acertosFinal, total: totalFinal }),
      });
      const dados = await resp.json().catch(() => null);
      if (resp.ok && Array.isArray(dados?.novas) && dados.novas.length > 0) {
        setConquistasNovas(dados.novas);
      }
    } catch {
      // conquistas são um bónus — falha aqui não deve travar o resultado
    }
  }

  function seguinte() {
    setSelecionada(null);
    setConfirmada(false);
    setPasso((p) => {
      const proximo = p + 1;
      if (proximo >= perguntas.length) {
        setEcra("resultado");
        setRespostas((r) => {
          const acertosFinal = r.filter((x) => x.acertou).length;
          verificarConquistasDaRonda(acertosFinal, perguntas.length);
          return r;
        });
        carregarExerciciosFeitos(); // ronda nova entra na grade
        carregarRecomendado(); // a taxa de acerto pode ter mudado o alvo
      }
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
    setConquistasNovas([]);
    setSugestoes([]);
    setEcra("entrada");
  }

  async function abrirHistorico() {
    setEcra("historico");
    if (atividade.length === 0) await carregarMaisAtividade(0);
  }

  async function carregarMaisAtividade(cursor = cursorAtividade) {
    try {
      const resp = await authFetch(token, `/api/resumo?tipo=progresso&cursor=${cursor}&limite=15`);
      const dados = await resp.json().catch(() => null);
      if (!resp.ok) throw new Error(dados?.erro);
      setAtividade((a) => (cursor === 0 ? dados.atividade : [...a, ...dados.atividade]));
      setCursorAtividade(cursor + dados.atividade.length);
      setTemMaisAtividade(dados.temMais);
    } catch {
      // histórico é secundário — falha aqui não deve travar a página
    }
  }

  // Abre a rota de Explicação para estudar/fundamentar um tema. A rota já
  // existe no router — ainda não tem o ecrã construído, só está a receber
  // o contexto para quando for implementada.
  function irParaExplicacao(item) {
    navigate("/explicacao", { state: { context: { tema: item.tema, materiaId: item.materiaId } } });
  }

  return (
    <div className="exe-page">
      <DashboardHeader />

      <main className="page">
        {/* ---------- Entrada: pesquisa + grade de exercícios feitos ---------- */}
        {ecra === "entrada" && (
          <>
            <div className="exe-intro">
              <h1>O que queres praticar?</h1>
              <p>Escreva o tema ex:"historia de moçambique"</p>
            </div>

            <div className="exe-busca-wrap" ref={buscaWrapRef}>
              <form
                className="exe-busca"
                onSubmit={(e) => { e.preventDefault(); pesquisar(); }}
                autoComplete="off"
              >
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => aoMudarBusca(e.target.value)}
                  onFocus={() => setSugestoesAbertas(true)}
                  placeholder="Pesquisar tema…"
                  autoFocus
                />
                <button type="submit" className="btn-primary" disabled={!busca.trim() || carregando}>
                  {carregando ? "…" : "Praticar"}
                </button>
              </form>

              {sugestoesAbertas && busca.trim().length >= 2 && (
                <div className="exe-autocomplete">
                  {sugestoesCarregando ? (
                    <div className="exe-autocomplete-msg">A procurar…</div>
                  ) : sugestoes.length > 0 ? (
                    sugestoes.map((s) => (
                      <button key={s} className="exe-autocomplete-item" onClick={() => pesquisar(s)}>
                        {s}
                      </button>
                    ))
                  ) : (
                    <div className="exe-autocomplete-msg">
                      Sem sugestões — carrega em "Praticar" para pesquisar mesmo assim.
                    </div>
                  )}
                </div>
              )}
            </div>

            {erro && <p className="exe-erro">{erro}</p>}

            {!carregandoRecomendado && recomendado && (
              <button className="exe-recomendado" onClick={() => pesquisar(recomendado.tema)}>
                <span className="exe-recomendado-label">Recomendado para ti</span>
                <span className="exe-recomendado-tema">{recomendado.tema}</span>
                <span className="exe-recomendado-motivo">
                  {Math.round((recomendado.acertos / recomendado.total) * 100)}% de acerto até agora — vale a pena reforçar
                </span>
              </button>
            )}

            <div className="exe-feitos">
              <div className="exe-feitos-topo">
                <span className="exe-feitos-label">
                  {carregandoFeitos || exerciciosFeitos.length > 0 ? "Exercícios feitos" : "Sugestões para começar"}
                </span>
                <button className="exe-stat-link" onClick={abrirHistorico}>Ver histórico</button>
              </div>

              {carregandoFeitos ? (
                <div className="exe-feitos-grid">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="exe-skeleton-card">
                      <div className="sk-linha sk-tag" />
                      <div className="sk-linha sk-titulo" />
                      <div className="sk-linha sk-sub" />
                    </div>
                  ))}
                </div>
              ) : exerciciosFeitos.length > 0 ? (
                <div className="exe-feitos-grid">
                  {exerciciosFeitos.filter((item) => item.tema !== recomendado?.tema).map((item) => {
                    const pct = item.total > 0 ? Math.round((item.acertos / item.total) * 100) : 0;
                    return (
                      <button
                        key={`${item.materiaId}-${item.tema}`}
                        className="exe-feito-card"
                        onClick={() => irParaExplicacao(item)}
                      >
                        <span className="exe-feito-tema">{item.tema}</span>
                        <span className="exe-feito-stats">{item.acertos}/{item.total} · {pct}% · {formatarData(item.ultima)}</span>
                        <span
                          className="exe-feito-praticar"
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); pesquisar(item.tema); }}
                        >
                          Praticar de novo
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="exe-sugestoes-scroll">
                  {SUGESTOES_INICIAIS.map((s) => (
                    <button key={s} className="exe-sugestao-chip" onClick={() => pesquisar(s)}>{s}</button>
                  ))}
                </div>
              )}
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

            {conquistasNovas.length > 0 && (
              <div className="exe-conquistas-novas">
                <span className="exe-conquistas-label">Conquista desbloqueada</span>
                {conquistasNovas.map((c) => (
                  <div key={c.chave} className="exe-conquista-card">
                    <span className="icone">{c.icone}</span>
                    <div className="info">
                      <span className="nome">{c.nome}</span>
                      <span className="descricao">{c.descricao}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
