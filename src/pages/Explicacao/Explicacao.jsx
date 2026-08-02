import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { materias, recentes, blogPosts, searchConteudo } from "../../data/explicacaoData";
import Mascot from "../../components/Mascot";
import ContinuarCard from "../../components/ContinuarCard";
import "./Explicacao.css";

export default function Explicacao() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const results = query.trim() ? searchConteudo(query) : null;

  const continuarItems = recentes.map((r) => ({
    key: `${r.materiaId}/${r.temaId}`,
    titulo: r.titulo,
    subtitulo: r.subtitulo,
    onClick: () => navigate(`/dashboard/explicacao/${r.materiaId}/${r.temaId}`),
  }));

  return (
    <div className="exp-page">
      <h1 className="exp-title">Explicação</h1>
      <p className="exp-subtitle">A base teórica para resolveres qualquer exercício.</p>

      <div className="exp-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Pesquisar matéria, tema..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {results ? (
        <div className="exp-results">
          {results.aulas.length === 0 && results.posts.length === 0 && (
            <p className="exp-empty">Nada encontrado para "{query}".</p>
          )}
          {results.aulas.map((a) => (
            <Link key={`${a.materiaId}/${a.temaId}`} to={`/dashboard/explicacao/${a.materiaId}/${a.temaId}`} className="exp-result-row">
              <span className="tag">Aula</span>
              {a.titulo}
              <span className="sub">{a.materiaNome}</span>
            </Link>
          ))}
          {results.posts.map((p) => (
            <Link key={p.id} to={`/dashboard/explicacao/blog/${p.id}`} className="exp-result-row">
              <span className="tag blog">Blog</span>
              {p.titulo}
            </Link>
          ))}
        </div>
      ) : (
        <>
          <section className="exp-section">
            <h2>As tuas matérias</h2>
            <div className="exp-materias-grid">
              {materias.map((m) => (
                <Link key={m.id} to={`/dashboard/explicacao/${m.id}`} className="exp-materia-card">
                  <span className="dot" style={{ background: m.cor }} />
                  <span className="nome">{m.nome}</span>
                  <div className="bar">
                    <div className="fill" style={{ width: `${m.progresso}%`, background: m.cor }} />
                  </div>
                  <span className="pct">{m.progresso}% concluído</span>
                </Link>
              ))}
            </div>
          </section>

          <ContinuarCard items={continuarItems} />

          <section className="exp-section">
            <h2>Blog</h2>
            <div className="exp-blog-strip">
              {blogPosts.map((p) => (
                <div key={p.id} className="exp-blog-card">
                  <span className="tag">{p.tag}</span>
                  <div className="t">{p.titulo}</div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <Mascot message="Tenho dúvidas? Pergunta-me qualquer coisa." />
    </div>
  );
}
