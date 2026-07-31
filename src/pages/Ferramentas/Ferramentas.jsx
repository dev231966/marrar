import { Link } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import './Ferramentas.css';

const FERRAMENTAS_PLANEADAS = [
  { nome: 'Calculadora científica', descricao: 'Para resolver expressões sem sair da plataforma.' },
  { nome: 'Conversor de unidades', descricao: 'Comprimento, massa, tempo, energia e mais.' },
  { nome: 'Formulário rápido', descricao: 'As fórmulas mais usadas de cada matéria, num só lugar.' },
];

export default function Ferramentas() {
  return (
    <div className="ferramentas-page">
      <DashboardHeader />

      <main className="page">
        <div className="placeholder">
          <div className="placeholder-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.1-3.1a4 4 0 01-5.4 5.4L6.7 20a2 2 0 01-2.8-2.8L11 8.5a4 4 0 015.4-5.4l-3 3z" />
            </svg>
          </div>

          <h1>Ferramentas</h1>
          <p>Estamos a preparar um conjunto de ferramentas para te ajudar a estudar mais rápido. Em breve por aqui:</p>

          <ul className="placeholder-list">
            {FERRAMENTAS_PLANEADAS.map((f) => (
              <li key={f.nome}>
                <span className="t">{f.nome}</span>
                <span className="s">{f.descricao}</span>
              </li>
            ))}
          </ul>

          <Link className="btn-primary" to="/dashboard">Voltar ao Dashboard</Link>
        </div>
      </main>
    </div>
  );
}
