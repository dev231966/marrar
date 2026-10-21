import { useEffect, useState } from "react";
import DashboardHeader from "../../components/layout/DashboardHeader";
import { materias } from "../../data/explicacaoData";
import "./Exames.css";

const NIVEIS = [
  { id: "todos", nome: "Todos" },
  { id: "10", nome: "10ª classe" },
  { id: "11", nome: "11ª classe" },
  { id: "12", nome: "12ª classe" },
  { id: "admissao", nome: "Admissão" },
];

export default function Exames() {
  const [query, setQuery] = useState("");
  const [disciplina, setDisciplina] = useState("todas");
  const [nivel, setNivel] = useState("todos");
  const [resultados, setResultados] = useState([]);
  const [estado, setEstado] = useState("loading");
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams({ query, disciplina, nivel });
    const controller = new AbortController();
    setEstado("loading");

    fetch(`/api/exames?${params}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Não foi possível carregar o catálogo.");
        return response.json();
      })
      .then((data) => {
        setResultados(data.exames || []);
        setEstado("ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setEstado("error");
      });

    return () => controller.abort();
  }, [query, disciplina, nivel, tentativa]);

  return (
    <div className="exm-page">
      <DashboardHeader />

      <main className="page">
        <div className="exm-intro">
          <h1>Exames para descarregar</h1>
          <p>Exames nacionais e de admissão, organizados por disciplina e nível.</p>
        </div>

        <div className="exm-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Pesquisar exame..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="exm-filtros">
          <select value={disciplina} onChange={(e) => setDisciplina(e.target.value)}>
            <option value="todas">Todas as disciplinas</option>
            {materias.map((m) => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>

          <div className="exm-niveis">
            {NIVEIS.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`exm-nivel-chip ${nivel === n.id ? "active" : ""}`}
                onClick={() => setNivel(n.id)}
              >
                {n.nome}
              </button>
            ))}
          </div>
        </div>

        {estado === "loading" ? (
          <section className="exm-vazio" aria-live="polite"><h2>A carregar exames verificados</h2><p>A consultar o catálogo oficial.</p></section>
        ) : estado === "error" ? (
          <section className="exm-vazio" aria-live="assertive"><h2>Não foi possível carregar os exames</h2><p>Verifica a ligação e tenta novamente.</p><button type="button" className="exm-limpar" onClick={() => setTentativa((value) => value + 1)}>Tentar novamente</button></section>
        ) : resultados.length === 0 ? (
          <section className="exm-vazio" aria-live="polite">
            <div className="exm-vazio-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3.5h9l3 3V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
                <path d="M14 3.5V7h4M8 11h8M8 15h5" />
              </svg>
            </div>
            <h2>{query || disciplina !== "todas" || nivel !== "todos" ? "Nenhum exame corresponde aos filtros" : "O catálogo ainda está a ser preparado"}</h2>
            <p>{query || disciplina !== "todas" || nivel !== "todos" ? "Experimenta outra disciplina, classe ou termo de pesquisa." : "Só vamos publicar documentos oficiais verificados. Assim estudas com fontes reais, sem links quebrados ou materiais inventados."}</p>
            {(query || disciplina !== "todas" || nivel !== "todos") && (
              <button type="button" className="exm-limpar" onClick={() => { setQuery(""); setDisciplina("todas"); setNivel("todos"); }}>
                Limpar filtros
              </button>
            )}
          </section>
        ) : (
          <div className="exm-lista">
            {resultados.map((e) => {
              const materia = materias.find((m) => m.id === e.disciplina);
              return (
                <div key={e.id} className="exm-item">
                  <span className="exm-dot" style={{ background: materia?.cor || "#B00020" }} />
                  <div className="exm-info">
                    <div className="t">{e.titulo}</div>
                    <div className="s">{e.disciplinaNome} · {e.tipo === "admissao" ? "Exame de admissão" : "Exame nacional"} · {e.ano}</div>
                  </div>
                  <a className="exm-download" href={e.ficheiro} download>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <path d="M7 10l5 5 5-5" /><path d="M12 15V3" />
                    </svg>
                    Descarregar
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
