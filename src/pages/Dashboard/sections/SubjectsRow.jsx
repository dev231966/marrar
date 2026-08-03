import { Link } from 'react-router-dom';
import Skeleton from '../../../components/Skeleton';

// Antes: 4 matérias fixas (Matemática sempre primeiro, Física sempre
// segundo...) vindas de dashboardData.js. Agora: os TEMAS que o próprio
// utilizador já praticou, vindos de /api/exercicios-feitos — nada
// pré-definido, cresce e muda consoante o que a pessoa realmente estuda.
export default function SubjectsRow({ materias, carregando }) {
  if (carregando) {
    return (
      <>
        <div className="section-lbl">As tuas matérias</div>
        <div className="subjects">
          {[0, 1, 2, 3].map((i) => (
            <div className="subject-card" key={i}>
              <div className="subject-top">
                <Skeleton width="9px" height="9px" radius="50%" />
                <Skeleton width="70%" height="13px" />
              </div>
              <Skeleton width="100%" height="6px" radius="100px" style={{ marginBottom: 6 }} />
              <Skeleton width="50%" height="11px" />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (!materias || materias.length === 0) {
    return (
      <>
        <div className="section-lbl">As tuas matérias</div>
        <Link to="/dashboard/exercicios" className="subjects-vazio">
          Ainda não praticaste nenhum tema — começa por aqui.
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="section-lbl">As tuas matérias</div>
      <div className="subjects">
        {materias.map((m) => {
          const percent = Math.round((m.acertos / m.total) * 100);
          return (
            <Link
              className="subject-card"
              key={m.tema}
              to="/dashboard/exercicios"
              state={{ context: { busca: m.tema } }}
            >
              <div className="subject-top">
                <span className="subject-dot" style={{ background: 'var(--blue)' }} />
                <h4>{m.tema}</h4>
              </div>
              <div className="subject-bar">
                <i style={{ width: `${percent}%`, background: 'var(--blue)' }} />
              </div>
              <div className="subject-pct">{percent}% de acerto · {m.total} respostas</div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
