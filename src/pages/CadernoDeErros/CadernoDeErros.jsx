import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../../components/layout/DashboardHeader";
import Mathmarrar from "../../components/Mathmarrar";
import { materias } from "../../data/explicacaoData";
import { errosGuardados } from "../../data/errosData";
import "./CadernoDeErros.css";

function renderComFormula(texto) {
  const partes = texto.split(/(\$[^$]+\$)/g);
  return partes.map((parte, i) =>
    parte.startsWith("$") && parte.endsWith("$")
      ? <Mathmarrar key={i} tex={parte.slice(1, -1)} display={false} />
      : <span key={i}>{parte}</span>
  );
}

export default function CadernoDeErros() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState("todas");
  const [abertoId, setAbertoId] = useState(null);

  const filtros = [{ id: "todas", nome: "Todas" }, ...materias.map((m) => ({ id: m.id, nome: m.nome }))];
  const erros = filtro === "todas" ? errosGuardados : errosGuardados.filter((e) => e.materiaId === filtro);

  return (
    <div className="err-page">
      <DashboardHeader />

      <main className="page">
        <div className="err-intro">
          <h1>Caderno de Erros</h1>
          <p>Revê o que erraste para nunca mais repetires o mesmo erro no exame.</p>
        </div>

        <div className="err-filtros">
          {filtros.map((f) => (
            <button
              key={f.id}
              className={`err-filtro ${filtro === f.id ? "active" : ""}`}
              onClick={() => setFiltro(f.id)}
            >
              {f.nome}
            </button>
          ))}
        </div>

        {erros.length === 0 ? (
          <div className="err-vazio">
            <svg viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="56" fill="var(--green-tint)" />
              <path d="M40 61l14 14 26-28" stroke="var(--green)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3>Zero erros por aqui!</h3>
            <p>Não guardaste nenhum erro nesta matéria. Continua assim.</p>
          </div>
        ) : (
          <div className="err-lista">
            {erros.map((e) => {
              const aberto = abertoId === e.id;
              return (
                <div key={e.id} className={`err-card ${aberto ? "open" : ""}`}>
                  <button className="err-card-head" onClick={() => setAbertoId(aberto ? null : e.id)}>
                    <span className="err-tag" style={{ background: `${e.cor}18`, color: e.cor }}>{e.materiaNome} · {e.tema}</span>
                    <span className="err-pergunta">{renderComFormula(e.pergunta)}</span>
                    <span className="err-meta">
                      {e.data}
                      <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                    </span>
                  </button>

                  {aberto && (
                    <div className="err-card-body">
                      <div className="err-respostas">
                        <div className="err-resp errada">
                          <span className="lbl">A tua resposta</span>
                          <span className="v">{renderComFormula(e.tuaResposta)}</span>
                        </div>
                        <div className="err-resp certa">
                          <span className="lbl">Resposta correcta</span>
                          <span className="v">{renderComFormula(e.respostaCerta)}</span>
                        </div>
                      </div>
                      <p className="err-explicacao">{renderComFormula(e.explicacao)}</p>
                      <button
                        className="btn-primary"
                        onClick={() => navigate("/dashboard/exercicios", { state: { context: { materiaId: e.materiaId } } })}
                      >
                        Praticar {e.materiaNome} de novo
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
