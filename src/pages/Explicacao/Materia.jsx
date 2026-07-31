import { Link, useNavigate, useParams } from "react-router-dom";
import { getMateria, getTemas } from "../../data/explicacaoData";
import "./Materia.css";

export default function Materia() {
  const { materiaId } = useParams();
  const navigate = useNavigate();
  const materia = getMateria(materiaId);
  const temas = getTemas(materiaId);

  if (!materia) {
    return (
      <div className="mat-page">
        <p>Matéria não encontrada.</p>
        <Link to="/dashboard/explicacao">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="mat-page">
      <header className="mat-header">
        <button className="mat-back" aria-label="Voltar" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span>{materia.nome}</span>
      </header>

      <div className="mat-progress">
        <div className="bar">
          <div className="fill" style={{ width: `${materia.progresso}%`, background: materia.cor }} />
        </div>
        <span>{materia.progresso}% concluído</span>
      </div>

      <div className="mat-temas">
        {temas.map((t) => (
          <Link key={t.id} to={`/dashboard/explicacao/${materiaId}/${t.id}`} className="mat-tema-row">
            <div className="mat-tema-check" data-done={t.concluidas === t.totalAulas}>
              {t.concluidas === t.totalAulas ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                t.concluidas
              )}
            </div>
            <div className="mat-tema-info">
              <div className="t">{t.nome}</div>
              <div className="s">{t.concluidas}/{t.totalAulas} aulas</div>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
