import { Link } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import './Evolucao.css';

export default function Evolucao() {
  return (
    <div className="evolucao-page">
      <DashboardHeader />

      <main className="page">
        <div className="placeholder">
          <div className="placeholder-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="M7 14l4-4 3 3 5-6" />
            </svg>
          </div>

          <h1>Evolução</h1>
          <p>
            Aqui vais poder acompanhar a tua evolução ao longo do tempo: notas, tempo de estudo
            e progresso por matéria. Esta página está em construção.
          </p>

          <Link className="btn-primary" to="/dashboard">Voltar ao Dashboard</Link>
        </div>
      </main>
    </div>
  );
}
