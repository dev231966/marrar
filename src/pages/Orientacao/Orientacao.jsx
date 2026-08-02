import { useState } from "react";
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

function toggle(lista, id) {
  return lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id];
}

export default function Orientacao() {
  const { token } = useAuth();
  const [passo, setPasso] = useState(0); // 0=questionário, 1=resultado
  const [disciplinasFortes, setDisciplinasFortes] = useState([]);
  const [interesses, setInteresses] = useState([]);
  const [estilo, setEstilo] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [sugestoes, setSugestoes] = useState(null);
  const [origem, setOrigem] = useState(null);
  const [erro, setErro] = useState(null);

  const podeSubmeter = disciplinasFortes.length > 0 && interesses.length > 0;

  async function descobrirCurso() {
    if (!podeSubmeter || carregando) return;
    setCarregando(true);
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
      setPasso(1);
    } catch (e) {
      // Mesmo que a chamada de rede falhe por completo, o estudante não
      // deve ficar sem resposta — o próprio servidor já tem uma árvore de
      // decisão de recurso, mas se nem a ligação existir, avisamos aqui.
      setErro(e.message || "Não foi possível ligar ao servidor. Tenta novamente.");
    } finally {
      setCarregando(false);
    }
  }

  function recomecar() {
    setPasso(0);
    setSugestoes(null);
    setOrigem(null);
    setErro(null);
  }

  return (
    <div className="ori-page">
      <DashboardHeader />

      <main className="page">
        {passo === 0 ? (
          <>
            <div className="ori-intro">
              <h1>Orientação Vocacional</h1>
              <p>Responde a estas perguntas rápidas e descobre cursos universitários compatíveis contigo.</p>
            </div>

            <section className="ori-secao">
              <h2>Em que disciplinas és mais forte?</h2>
              <div className="ori-chips">
                {materias.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`ori-chip ${disciplinasFortes.includes(m.id) ? "active" : ""}`}
                    onClick={() => setDisciplinasFortes((d) => toggle(d, m.id))}
                  >
                    {m.nome}
                  </button>
                ))}
              </div>
            </section>

            <section className="ori-secao">
              <h2>O que te interessa? (escolhe quantos quiseres)</h2>
              <div className="ori-chips">
                {INTERESSES.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    className={`ori-chip ${interesses.includes(i.id) ? "active" : ""}`}
                    onClick={() => setInteresses((lst) => toggle(lst, i.id))}
                  >
                    {i.nome}
                  </button>
                ))}
              </div>
            </section>

            <section className="ori-secao">
              <h2>Como preferes trabalhar?</h2>
              <div className="ori-chips">
                {ESTILOS.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    className={`ori-chip ${estilo === e.id ? "active" : ""}`}
                    onClick={() => setEstilo((atual) => (atual === e.id ? null : e.id))}
                  >
                    {e.nome}
                  </button>
                ))}
              </div>
            </section>

            {erro && <p className="ori-erro">{erro}</p>}

            <button className="btn-primary large" disabled={!podeSubmeter || carregando} onClick={descobrirCurso}>
              {carregando ? "A pensar…" : "Descobrir o meu curso ideal"}
            </button>
            {!podeSubmeter && <p className="ori-hint">Escolhe pelo menos uma disciplina e um interesse.</p>}
          </>
        ) : (
          <div className="ori-resultado">
            <h1>Sugestões para ti</h1>
            <p className="ori-sub">
              {origem === "ia"
                ? "Geradas pela IA com base nas tuas respostas."
                : "Com base num conjunto de regras — a IA não respondeu desta vez, mas isto continua fiável."}
            </p>

            <div className="ori-cursos">
              {sugestoes.map((s, i) => (
                <div key={i} className="ori-curso-card">
                  <span className="num">{i + 1}</span>
                  <div>
                    <h3>{s.curso}</h3>
                    <p>{s.porque}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="ori-acoes">
              <button className="btn-ghost" onClick={recomecar}>Refazer questionário</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
