import { useMemo, useState } from "react";
import DashboardHeader from "../../components/layout/DashboardHeader";
import { materias } from "../../data/explicacaoData";
import { pesquisarExames } from "../../data/examesData";
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

  const resultados = useMemo(
    () => pesquisarExames({ query, disciplina, nivel }),
    [query, disciplina, nivel]
  );

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

        {resultados.length === 0 ? (
          <p className="exm-vazio">Nenhum exame encontrado com estes filtros.</p>
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
