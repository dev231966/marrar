import { useState, useEffect } from "react";
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

const PASSOS = [
  { chave: "disciplinas", titulo: "Em que disciplinas és mais forte?", sub: "Escolhe pelo menos uma.", min: 1, multi: true },
  { chave: "interesses", titulo: "O que te interessa?", sub: "Escolhe quantos quiseres.", min: 1, multi: true },
  { chave: "estilo", titulo: "Como preferes trabalhar?", sub: "Escolhe uma opção.", min: 1, multi: false },
];

const PERFIL_LABEL = {
  seguro: "Aposta segura",
  alinhado: "Bem alinhado",
  ousado: "Aposta ousada",
};

function toggle(lista, id) {
  return lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id];
}

export default function Orientacao() {
  const { token } = useAuth();
  const [passoAtual, setPassoAtual] = useState(0); // 0..2 = perguntas, 3 = loading, 4 = resultado
  const [direcao, setDirecao] = useState("frente");
  const [disciplinasFortes, setDisciplinasFortes] = useState([]);
  const [interesses, setInteresses] = useState([]);
  const [estilo, setEstilo] = useState(null);
  const [sugestoes, setSugestoes] = useState(null);
  const [origem, setOrigem] = useState(null);
  const [erro, setErro] = useState(null);
  const [cardsVisiveis, setCardsVisiveis] = useState(0);

  const respostas = { disciplinas: disciplinasFortes, interesses, estilo: estilo ? [estilo] : [] };
  const passoInfo = PASSOS[passoAtual];
  const progresso = passoAtual >= 3 ? 100 : Math.round((passoAtual / PASSOS.length) * 100);

  function avancar() {
    setDirecao("frente");
    if (passoAtual < PASSOS.length - 1) {
      setPassoAtual((p) => p + 1);
    } else {
      descobrirCurso();
    }
  }

  function voltar() {
    if (passoAtual === 0) return;
    setDirecao("tras");
    setPassoAtual((p) => p - 1);
  }

  function escolher(id) {
    if (passoInfo.chave === "disciplinas") {
      setDisciplinasFortes((d) => toggle(d, id));
    } else if (passoInfo.chave === "interesses") {
      setInteresses((i) => toggle(i, id));
    } else {
      setEstilo(id);
      setDirecao("frente");
      setTimeout(() => descobrirCurso(), 220);
    }
  }

  async function descobrirCurso() {
    setDirecao("frente");
    setPassoAtual(3);
    setErro(null);
    try {
      const resp = await authFetch(token, "/api/orientacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disciplinasFortes, interesses, estilo }),
      });
      const dados = await resp.json().catch(() => null);
      if (!resp.ok || !dados?.sugestoes) throw new Error(dados?.erro || "Resposta inválida do servidor.");
      setSugestoes(dados.sugestoes);
      setOrigem(dados.origem);
      setPassoAtual(4);
    } catch (e) {
      setErro(e.message || "Não foi possível ligar ao servidor. Tenta novamente.");
      setPassoAtual(2);
    }
  }

  useEffect(() => {
    if (passoAtual !== 4 || !sugestoes) return;
    setCardsVisiveis(0);
    sugestoes.forEach((_, i) => {
      setTimeout(() => setCardsVisiveis((v) => v + 1), 260 * (i + 1));
    });
  }, [passoAtual, sugestoes]);

  function recomecar() {
    setPassoAtual(0);
    setDisciplinasFortes([]);
    setInteresses([]);
    setEstilo(null);
    setSugestoes(null);
    setOrigem(null);
    setErro(null);
  }

  const podeAvancar = passoInfo ? respostas[passoInfo.chave].length >= passoInfo.min : true;

  return (
    <div className="ori-page">
      <DashboardHeader />

      <main className="page">
        {passoAtual < 3 && (
          <>
            <div className="ori-barra">
              <div className="ori-barra-fill" style={{ width: `${progresso}%` }} />
            </div>

            <div key={passoAtual} className={`ori-passo anim-${direcao}`}>
              <h1>{passoInfo.titulo}</h1>
              <p className="ori-sub">{passoInfo.sub}</p>

              <div className="ori-chips">
                {(passoInfo.chave === "disciplinas" ? materias : passoInfo.chave === "interesses" ? INTERESSES : ESTILOS).map((item) => {
                  const ativo = respostas[passoInfo.chave].includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`ori-chip ${ativo ? "active" : ""}`}
                      onClick={() => escolher(item.id)}
                    >
                      {item.nome}
                    </button>
                  );
                })}
              </div>

              {passoInfo.multi && (
                <span className="ori-contagem">
                  {respostas[passoInfo.chave].length > 0
                    ? `${respostas[passoInfo.chave].length} selecionada${respostas[passoInfo.chave].length > 1 ? "s" : ""}`
                    : ""}
                </span>
              )}

              {erro && <p className="ori-erro">{erro}</p>}

              <div className="ori-nav">
                {passoAtual > 0 && <button className="btn-ghost" onClick={voltar}>Voltar</button>}
                {passoInfo.multi && (
                  <button className="btn-primary" disabled={!podeAvancar} onClick={avancar}>
                    {passoAtual === PASSOS.length - 1 ? "Descobrir o meu curso ideal" : "Continuar"}
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {passoAtual === 3 && (
          <div className="ori-loading">
            <div className="ori-spinner" />
            <p>A analisar as tuas respostas…</p>
          </div>
        )}

        {passoAtual === 4 && (
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
                      {s.perfil && (
                        <span className={`ori-badge badge-${s.perfil}`}>{PERFIL_LABEL[s.perfil] || s.perfil}</span>
                      )}
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
                <button className="btn-ghost" onClick={recomecar}>Refazer questionário</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}