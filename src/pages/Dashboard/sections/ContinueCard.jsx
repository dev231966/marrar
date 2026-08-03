import { Link } from 'react-router-dom';
import { IconPlay, IconChevronRight } from './DashboardIcons';
import Skeleton from '../../../components/Skeleton';

// Antes: props fixas ("Matemática · Progressões", 58%). Agora: recebe o
// tema que /api/recomendado escolheu (pior taxa de acerto do utilizador,
// com pelo menos 3 respostas) — ou null se ainda não há dados suficientes.
export default function ContinueCard({ recomendado, carregando }) {
  if (carregando) {
    return (
      <div className="continue-card">
        <div className="continue-icon"><Skeleton width="24px" height="24px" radius="6px" /></div>
        <div className="continue-text" style={{ flex: 1 }}>
          <Skeleton width="40%" height="10px" style={{ marginBottom: 8 }} />
          <Skeleton width="70%" height="16px" style={{ marginBottom: 10 }} />
          <Skeleton width="100%" height="6px" radius="100px" />
        </div>
      </div>
    );
  }

  if (!recomendado) {
    return (
      <Link className="continue-card" to="/dashboard/exercicios">
        <div className="continue-icon continue-icon-neutro">
          <IconPlay />
        </div>
        <div className="continue-text">
          <div className="lbl">Começar</div>
          <h3>Faz o teu primeiro exercício</h3>
          <p className="continue-hint">As tuas recomendações aparecem aqui depois de praticares um pouco.</p>
        </div>
        <div className="continue-go">
          <IconChevronRight stroke="#fff" />
        </div>
      </Link>
    );
  }

  const progress = Math.round((recomendado.acertos / recomendado.total) * 100);

  return (
    <Link
      className="continue-card"
      to="/dashboard/exercicios"
      state={{ context: { busca: recomendado.tema } }}
    >
      <div className="continue-icon">
        <IconPlay />
      </div>
      <div className="continue-text">
        <div className="lbl">Recomendado para ti</div>
        <h3>{recomendado.tema}</h3>
        <div className="continue-progress">
          <i style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="continue-go">
        <IconChevronRight stroke="#fff" />
      </div>
    </Link>
  );
}
