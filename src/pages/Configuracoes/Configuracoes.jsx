import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import { useAuth } from '../../context/AuthContext';
import './Configuracoes.css';

export default function Configuracoes() {
  const navigate = useNavigate();
  const { user, sair } = useAuth();

  function handleSair() {
    sair();
    navigate('/login', { replace: true });
  }

  return (
    <div className="settings-page">
      <DashboardHeader />
      <main className="settings-content">
        <div className="settings-heading">
          <span className="settings-kicker">Conta</span>
          <h1>Configurações</h1>
          <p>Gere a tua conta e sessão.</p>
        </div>
        <section className="settings-card">
          <div className="settings-profile">
            <div className="settings-avatar">{(user?.nome || 'E').trim().charAt(0).toUpperCase()}</div>
            <div><strong>{user?.nome || 'Estudante'}</strong><span>{user?.email || 'Conta Estudai'}</span></div>
          </div>
          <div className="settings-row"><span>Nome</span><strong>{user?.nome || 'Estudante'}</strong></div>
          <div className="settings-row"><span>Email</span><strong>{user?.email || '—'}</strong></div>
        </section>
        <section className="settings-card settings-danger">
          <div><h2>Sessão</h2><p>Termina a sessão neste dispositivo.</p></div>
          <button type="button" onClick={handleSair}>Sair da conta</button>
        </section>
        <button type="button" className="settings-back" onClick={() => navigate('/dashboard')}>Voltar ao dashboard</button>
      </main>
    </div>
  );
}
