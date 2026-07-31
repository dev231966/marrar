import { Link, useNavigate, useParams } from "react-router-dom";
import { getMateria, getTema, getAula } from "../../data/explicacaoData";
import Math from "../../components/Math";
import Mascot from "../../components/Mascot";
import "./Aula.css";

export default function Aula() {
  const { materiaId, temaId } = useParams();
  const navigate = useNavigate();

  const materia = getMateria(materiaId);
  const tema = getTema(materiaId, temaId);
  const aula = getAula(materiaId, temaId);

  if (!materia || !tema || !aula) {
    return (
      <div className="aula-page">
        <p>Aula não encontrada.</p>
        <Link to="/dashboard/explicacao">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="aula-page">
      <header className="aula-header">
        <button className="aula-back" aria-label="Voltar" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="crumb">
          {materia.nome}<span className="sep">/</span><span className="current">{tema.nome}</span>
        </div>
      </header>

      <h1>{aula.titulo}</h1>
      <div className="meta">{aula.contexto}</div>

      <div className="aula-body">
        {aula.corpo.map((p, i) => <p key={i}>{p}</p>)}
      </div>

      {aula.exemplos.map((ex, i) => (
        <div className="example-box" key={i}>
          <span className="tag">{ex.tag}</span>
          {ex.enunciado && <p className="enunciado">{ex.enunciado}</p>}
          {ex.latex && <div className="formula"><Math tex={ex.latex} /></div>}
          {(ex.nota || ex.explicacao) && (
            <p className="nota">{ex.nota || <><b>Porquê:</b> {ex.explicacao}</>}</p>
          )}
        </div>
      ))}

      <div className="ad-slot">
        <span className="lbl">Publicidade</span>
        <span>espaço reservado</span>
      </div>

      {aula.exerciciosRelacionados > 0 && (
        <div className="related">
          <div>
            <div className="t">Pronto para praticar?</div>
            <div className="s">{aula.exerciciosRelacionados} exercícios sobre este tema</div>
          </div>
          <Link to="/dashboard/exercicios">Praticar</Link>
        </div>
      )}

      <Mascot
        message="Já treinaste isto? Tenho uns exercícios parecidos."
        context={{ materiaId, materiaNome: materia.nome, temaId, aulaTitulo: aula.titulo }}
      />
    </div>
  );
}
