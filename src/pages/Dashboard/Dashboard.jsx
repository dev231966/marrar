import { Link } from 'react-router-dom';
import Logo from '../../components/Logo';
import './Dashboard.css';

/**
 * Casca do painel autenticado. Propositadamente isolada da Home:
 * tem o seu próprio layout (sidebar + topo), sem depender do
 * Header/Footer do site público. Substitui o conteúdo abaixo
 * pelos módulos reais (matérias, exercícios, caderno de erros...).
 */
export default function Dashboard() {
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Logo />
        <nav className="dashboard-nav">
          <a className="active" href="#">Início</a>
          <a href="#">Matérias</a>
          <a href="#">Exercícios</a>
          <a href="#">Caderno de erros</a>
          <a href="#">Nota prevista</a>
        </nav>
        <Link className="btn-ghost" to="/" style={{ marginTop: 'auto', justifyContent: 'center' }}>Sair</Link>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <h1>Olá 👋</h1>
          <p>Este é o teu painel. Liga aqui os módulos de matérias, exercícios e progresso.</p>
        </header>

        <div className="dashboard-placeholder">
          <p>Conteúdo do dashboard ainda por construir.</p>
        </div>
      </main>
    </div>
  );
}
