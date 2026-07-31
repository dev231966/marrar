import { Link } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import './MeuMaterial.css';

export default function MeuMaterial() {
  return (
    <div className="material-page">
      <DashboardHeader />

      <main className="page">
        <div className="placeholder">
          <div className="placeholder-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
          </div>

          <h1>Meu Material</h1>
          <p>
            Este é o teu espaço para guardar resumos, exercícios e apontamentos.
            Ainda estamos a construí-lo — em breve vais poder carregar e organizar os teus ficheiros aqui.
          </p>

          <Link className="btn-primary" to="/dashboard">Voltar ao Dashboard</Link>
        </div>
      </main>
    </div>
  );
}
