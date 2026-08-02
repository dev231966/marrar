import { useState, useEffect, useMemo } from "react";
import DashboardHeader from "../../components/layout/DashboardHeader";
import { materias } from "../../data/explicacaoData";
import { useAuth, authFetch } from "../../context/AuthContext";
import "./Orientacao.css";

const INTERESSES = [
  { id: "tecnologia", nome: "Tecnologia" },
  { id: "construir", nome: "Construir/Projectar" },
  { id: "saude", nome: "Saúde" },
  { id: "natureza", nome: "Natureza" },
  { id: "dinheiro", nome: "Negócios/Finanças" },
  { id: "escrever", nome: "Escrever/Argumentar" },
  { id: "ensinar", nome: "Ensinar" },
  { id: "pessoas", nome: "Trabalhar com pessoas" },
  { id: "dados", nome: "Dados/Análise" },
  { id: "ajudar", nome: "Ajudar os outros" },
];

const ESTILOS = [
  { id: "pratico", nome: "Prático — mãos à obra" },
  { id: "analitico", nome: "Analítico — resolver problemas" },
  { id: "social", nome: "Social — lidar com pessoas" },
  { id: "criativo", nome: "Criativo — criar coisas novas" },
];

const PERFIL_LABEL = { seguro: "Aposta segura", alinhado: "Bem alinhado", ousado: "Aposta ousada" };

const PASSOS = [
  { chave: "disciplinas", tipo: "lista", multi: true, min: 1, titulo: "Em que disciplinas és mais forte?", sub: "Escolhe pelo menos uma.", opcoes: materias },
  { chave: "interesses", tipo: "lista", multi: true, min: 1, titulo: "O que te interessa?", sub: "Escolhe quantos quiseres.", opcoes: INTERESSES },
  { chave: "estilo", tipo: "lista", multi: false, min: 1, titulo: "Como preferes trabalhar?", sub: "Escolhe uma opção.", opcoes: ESTILOS },
  { chave: "confianca", tipo: "escala", min: 1, titulo: "Numa escala de 1 a 10, quão confiante estás nas tuas notas actuais?", sub: "Isto ajuda a calibrar entre apostas seguras e ousadas." },
  { chave: "observacoes", tipo: "texto", min: 0, titulo: "Há algo mais que devemos saber?", sub: "Opcional — por exemplo, um curso que já tens em mente.", placeholder: "Escreve aqui (opcional)…" },
];

const VALOR_INICIAL = { disciplinas: [], interesses: [], estilo: [], confianca: null, observacoes: "" };

const PASSO_HISTORICO = -2;
const PASSO_ENTRADA = -1;

function toggle(lista, id) {
  return lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id];
}

function formatarData(iso) {
  try {
    return new Date(iso).toLocaleDateString("pt-MZ", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function Orientacao() {
  const { token } = useAuth();
  const [passoAtual, setPassoAtual] = useState(PASSO_ENTRADA);
  const [direcao, setDirecao] = useState("frente");
  const [respostas, setRespostas] = useState(VALOR_INICIAL);
  const [buscaLista, setBuscaLista] = useState("");
  const [sugestoes, setSugestoes] = useState(null);
  const [origem, setOrigem] = useState(null);
  const [erro, setErro] = useState(null);
  const [cardsVisiveis, setCardsVisiveis] = useState(0);
  const [historico, setHistorico] = useState(null);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  const PASSO_LOADING = PASSOS.length;
  const PASSO_RESULTADO = PASSOS.length + 1;
  const passoInfo = passoAtual >= 0 && passoAtual < PASSOS.length ? PASSOS[passoAtual] : null;
  const progresso = passoAtual >= PASSO_LOADING || passoAtual < 0 ? 100 : Math.round((passoAtual / PASSOS.length) * 100);

  const opcoesFiltradas = useMemo(() => {
    if (!passoInfo || passoInfo.tipo !== "lista") return [];
    const termo = buscaLista.trim().toLowerCase();
    if (!termo) return passoInfo.opcoes;
    return passoInfo.opcoes.filter((o) => o.nome.toLowerCase().includes(termo));
  }, [passoInfo, buscaLista]);

  function podeAvancarPasso(info, valor) {
    if (!info) return true;
    if (info.tipo === "lista") return valor.length >= info.min;
    if (info.tipo === "escala") return info.min === 0 || valor !== null;
    if (info.tipo === "texto") return info.min === 0 || valor.trim().length > 0;
    return true;
  }
  const podeAvancar = podeAvancarPasso(passoInfo, passoInfo ? respostas[passoInfo.chave] : null);

  function irPara(passo, dir = "frente") {
    setDirecao(dir);
    setBuscaLista("");
    setPassoAtual(passo);
  }

  function avancar() {
    if (passoAtual < PASSOS.length - 1) irPara(passoAtual + 1);
    else descobrirCurso();
  }

  function voltar() {
    if (passoAtual === 0) return irPara(PASSO_ENTRADA, "tras");
    irPara(passoAtual - 1, "tras");
  }

  function escolherLista(id) {
    setRespostas((r) => {
      const atual = r[passoInfo.chave];
      if (passoInfo.multi) return { ...r, [passoInfo.chave]: toggle(atual, id) };
      const novo = { ...r, [passoInfo.chave]: [id] };
      setTimeout(() => avancar(), 220);
      return novo;
    });
  }

  function escolherEscala(valor) {
    setRespostas((r) => ({ ...r, [passoInfo.chave]: valor }));
    setTimeout(() => avancar(), 220);
  }

  function escolherTexto(valor) {
    setRespostas((r) => ({ ...r, [passoInfo.chave]: valor }));
  }

  async function descobrirCurso() {
    irPara(PASSO_LOADING);
    setErro(null);
    try {
      const resp = await authFetch(token, "/api/orientacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disciplinasFortes: respostas.disciplinas,
          interesses: respostas.interesses,
          estilo: respostas.estilo[0] || null,
          confianca: respostas.confianca,
          observacoes: respostas.observacoes || null,
        }),
      });
      const dados = await resp.json().catch(() => null);
      if (!resp.ok || !dados?.sugestoes) throw new Error(dados?.erro || "Resposta inválida do servidor.");
      setSugestoes(dados.sugestoes);
      setOrigem(dados.origem);
      irPara(PASSO_RESULTADO);
    } catch (e) {
      setErro(e.message || "Não foi possível ligar ao servidor. Tenta novamente.");
      irPara(PASSOS.length - 1);
    }
  }

  async function abrirHistorico() {
    irPara(PASSO_HISTORICO);
    if (historico === null) {
      setCarregandoHistorico(true);
      try {
        const resp = await authFetch(token, "/api/orientacao", { method: "GET" });
        const dados = await resp.json().catch(() => null);
        if (!resp.ok) throw new Error(dados?.erro || "Não foi possível carregar o histórico.");
        setHistorico(dados.resultados || []);
      } catch (e) {
        setErro(e.message);
        setHistorico([]);
      } finally {
        setCarregandoHistorico(false);
      }
    }
  }

  function abrirResultadoAntigo(item) {
    setSugestoes(item.sugestoes);
    setOrigem(item.origem);
    irPara(PASSO_RESULTADO);
  }

  useEffect(() => {
    if (passoAtual !== PASSO_RESULTADO || !sugestoes) return;
    setCardsVisiveis(0);
    sugestoes.forEach((_, i) => {
      setTimeout(() => setCardsVisiveis((v) => v + 1), 260 * (i + 1));
    });
  }, [passoAtual, sugestoes]);

  function recomecar() {
    setRespostas(VALOR_INICIAL);
    setSugestoes(null);
    setOrigem(null);
    setErro(null);
    irPara(0);
  }

  return (
    <div className="ori-page">
      <DashboardHeader />

      <main className="page">
        {passoAtual === PASSO_ENTRADA && (
          <div className="ori-entrada">
            <h1>Orientação Vocacional</h1>
            <p className="ori-sub">Descobre cursos universitários compatíveis contigo, ou revê sugestões anteriores.</p>
            <div className="ori-entrada-acoes">
              <button className="btn-primary large" onClick={() => irPara(0)}>Começar questionário</button>
              <button className="btn-ghost" onClick={abrirHistorico}>Ver resultados anteriores</button>
            </div>
          </div>
        )}

        {passoAtual === PASSO_HISTORICO && (
          <div className="ori-historico">
            <div className="ori-historico-topo">
              <button className="btn-ghost" onClick={() => irPara(PASSO_ENTRADA)}>← Voltar</button>
              <h1>Resultados anteriores</h1>
            </div>

            {carregandoHistorico && (
              <div className="ori-loading">
                <div className="ori-spinner" />
                <p>A carregar histórico…</p>
              </div>
            )}

            {!carregandoHistorico && historico?.length === 0 && (
              <p className="ori-hist-vazio">Ainda não tens nenhum resultado guardado. Faz o questionário para começar.</p>
            )}

            {!carregandoHistorico && historico?.length > 0 && (
              <div className="ori-hist-lista">
                {historico.map((item) => (
                  <button key={item.id} className="ori-hist-item" onClick={() => abrirResultadoAntigo(item)}>
                    <div className="ori-hist-item-topo">
                      <span className="ori-hist-curso">{item.sugestoes?.[0]?.curso || "Resultado"}</span>
                      <span className="ori-hist-data">{formatarData(item.criadoEm)}</span>
                    </div>
                    <span className="ori-hist-sub">
                      {item.sugestoes?.length || 0} sugestões · {item.origem === "ia" ? "IA" : "regras"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {passoAtual >= 0 && passoAtual < PASSO_LOADING && (
          <>
            <div className="ori-barra">
              <div className="ori-barra-fill" style={{ width: `${progresso}%` }} />
            </div>

            <div key={passoAtual} className={`ori-passo anim-${direcao}`}>
              <h1>{passoInfo.titulo}</h1>
              <p className="ori-sub">{passoInfo.sub}</p>

              {passoInfo.tipo === "lista" && (
                <div className="ori-lista-card">
                  {passoInfo.opcoes.length > 8 && (
                    <input
                      type="text"
                      className="ori-lista-busca"
                      placeholder="Pesquisar…"
                      value={buscaLista}
                      onChange={(e) => setBuscaLista(e.target.value)}
                    />
                  )}
                  <div className="ori-lista-scroll">
                    {opcoesFiltradas.length === 0 && (
                      <p className="ori-lista-vazio">Nenhum resultado para "{buscaLista}".</p>
                    )}
                    {opcoesFiltradas.map((item) => {
                      const ativo = respostas[passoInfo.chave].includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`ori-lista-item ${ativo ? "active" : ""}`}
                          onClick={() => escolherLista(item.id)}
                        >
                          <span className={`ori-marcador ${passoInfo.multi ? "quadrado" : "redondo"} ${ativo ? "active" : ""}`} />
                          <span>{item.nome}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {passoInfo.tipo === "escala" && (
                <div className="ori-escala">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`ori-escala-item ${respostas[passoInfo.chave] === n ? "active" : ""}`}
                      onClick={() => escolherEscala(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}

              {passoInfo.tipo === "texto" && (
                <textarea
                  className="ori-texto-input"
                  placeholder={passoInfo.placeholder || "Escreve aqui…"}
                  value={respostas[passoInfo.chave]}
                  onChange={(e) => escolherTexto(e.target.value)}
                  rows={4}
                />
              )}

              {passoInfo.tipo === "lista" && passoInfo.multi && (
                <span className="ori-contagem">
                  {respostas[passoInfo.chave].length > 0
                    ? `${respostas[passoInfo.chave].length} selecionada${respostas[passoInfo.chave].length > 1 ? "s" : ""}`
                    : ""}
                </span>
              )}

              {erro && <p className="ori-erro">{erro}</p>}

              <div className="ori-nav">
                <button className="btn-ghost" onClick={voltar}>Voltar</button>
                {(passoInfo.tipo === "texto" || (passoInfo.tipo === "lista" && passoInfo.multi)) && (
                  <button className="btn-primary" disabled={!podeAvancar} onClick={avancar}>
                    {passoAtual === PASSOS.length - 1 ? "Descobrir o meu curso ideal" : "Continuar"}
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {passoAtual === PASSO_LOADING && (
          <div className="ori-loading">
            <div className="ori-spinner" />
            <p>A analisar as tuas respostas…</p>
          </div>
        )}

        {passoAtual === PASSO_RESULTADO && (
          <div className="ori-resultado">
            <h1>Sugestões para ti</h1>
            <p className="ori-sub">
              {origem === "ia"
                ? "Geradas pela IA com base nas tuas respostas."
                : "Com base num conjunto de regras — a IA não respondeu desta vez, mas isto continua fiável."}
            </p>

            <div className="ori-cursos">
              {sugestoes.slice(0, cardsVisiveis).map((s, i) => (
                <div key={i} className="ori-curso-card card-in">
                  <div className="ori-curso-topo">
                    <span className="num">{i + 1}</span>
                    <div className="ori-curso-titulo">
                      <h3>{s.curso}</h3>
                      {s.perfil && <span className={`ori-badge badge-${s.perfil}`}>{PERFIL_LABEL[s.perfil] || s.perfil}</span>}
                    </div>
                  </div>
                  <p className="ori-porque">{s.porque}</p>
                  {Array.isArray(s.universidades) && s.universidades.length > 0 && (
                    <div className="ori-linha">
                      <span className="ori-linha-label">Onde estudar</span>
                      <span className="ori-linha-valor">{s.universidades.join(", ")}</span>
                    </div>
                  )}
                  {Array.isArray(s.saidas) && s.saidas.length > 0 && (
                    <div className="ori-linha">
                      <span className="ori-linha-label">Saídas profissionais</span>
                      <span className="ori-linha-valor">{s.saidas.join(" · ")}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {cardsVisiveis >= sugestoes.length && (
              <div className="ori-acoes fade-in">
                <button className="btn-ghost" onClick={() => irPara(PASSO_ENTRADA)}>Voltar ao início</button>
                <button className="btn-primary" onClick={recomecar}>Refazer questionário</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}