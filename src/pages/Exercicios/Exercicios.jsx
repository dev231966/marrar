import { Link, useLocation } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import './Exercicios.css';

export default function Exercicios() {
  const { state } = useLocation();
  const context = state?.context;

  return (
    <div className="exercicios-page">
      <DashboardHeader />

      <main className="page">
        <div className="placeholder">
          <div className="placeholder-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>

          <h1>Exercícios</h1>
          <p>
            {context?.aulaTitulo
              ? <>Ainda estamos a preparar os exercícios de <b>{context.aulaTitulo}</b>. Volta em breve.</>
              : 'Esta secção está em construção. Em breve vais poder praticar com exercícios de cada matéria e tema.'}
          </p>

          <Link className="btn-primary" to="/dashboard">Voltar ao Dashboard</Link>
        </div>
      </main>
    </div>
  );
}
