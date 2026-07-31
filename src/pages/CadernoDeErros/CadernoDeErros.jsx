import { Link } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import './CadernoDeErros.css';

export default function CadernoDeErros() {
  return (
    <div className="erros-page">
      <DashboardHeader />

      <main className="page">
        <div className="placeholder">
          <div className="placeholder-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M9.1 9a3 3 0 015.8 1c0 2-3 2-3 4" />
              <path d="M12 17h.01" />
            </svg>
          </div>

          <h1>Caderno de Erros</h1>
          <p>
            Aqui vais poder rever os exercícios que erraste, agrupados por matéria e tema,
            para nunca mais repetires o mesmo erro. Esta página está em construção.
          </p>

          <Link className="btn-primary" to="/dashboard">Voltar ao Dashboard</Link>
        </div>
      </main>
    </div>
  );
}
