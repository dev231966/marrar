import { Link, useLocation, useNavigate } from 'react-router-dom';
import './DashboardSidebar.css';
import Logo from "../Logo"
import { useAuth } from '../../context/AuthContext';

const mainNav = [
  { label: 'Visão Geral', path: '/dashboard', icon: <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" /> },
  { label: 'Explicação', path: '/dashboard/explicacao', icon: <path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /> },
  { label: 'Exercícios', path: '/dashboard/exercicios', icon: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></> },
];

const generalNav = [
  { label: 'Evolução', path: '/dashboard/evolucao', icon: <><path d="M3 3v18h18" /><path d="M7 14l4-4 3 3 5-6" /></> },
  { label: 'Ferramentas', path: '/dashboard/ferramentas', icon: <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.1-3.1a4 4 0 01-5.4 5.4L6.7 20a2 2 0 01-2.8-2.8L11 8.5a4 4 0 015.4-5.4l-3 3z" /> },
  { label: 'Caderno de Erros', path: '/dashboard/erros', icon: <><circle cx="12" cy="12" r="9" /><path d="M9.1 9a3 3 0 015.8 1c0 2-3 2-3 4" /><path d="M12 17h.01" /></> },
  { label: 'Meu Material', path: '/dashboard/material', icon: <><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></> },
  { label: 'Orientação Vocacional', path: '/dashboard/orientacao', icon: <><circle cx="12" cy="12" r="10" /><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" /></> },
  { label: 'Exames', path: '/dashboard/exames', icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M12 18v-6M9 15l3 3 3-3" /></> },
];

export default function DashboardSidebar({ isOpen, onClose }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, sair } = useAuth();
  const nomeUtilizador = user?.nome || 'Estudante';
  const inicial = nomeUtilizador.trim().charAt(0).toUpperCase() || '?';

  function handleSair() {
    sair();
    onClose?.();
    navigate('/login', { replace: true });
  }

  return (
    <>
      <div className={`menu-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />

      <nav className={`side-menu ${isOpen ? 'open' : ''}`}>
        <div className="side-top">
          <Logo />
          <button className="side-close" aria-label="Fechar menu" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <Link to="/dashboard/plano" className="plan-banner" onClick={onClose}>
          <div className="plan-banner-icon">
            <svg viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>
          </div>
          <div className="plan-banner-text">
            <div className="t">Plano Estudante</div>
            <div className="s">Sobe para Premium e desbloqueia tudo</div>
          </div>
          <svg className="chev" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>

        <div className="nav-group">
          <div className="nav-label">Principal</div>
          {mainNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${pathname === item.path ? 'active' : ''}`}
              onClick={onClose}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                {item.icon}
              </svg>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="nav-divider" />

        <div className="nav-group">
          <div className="nav-label">Geral</div>
          {generalNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${pathname === item.path ? 'active' : ''}`}
              onClick={onClose}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                {item.icon}
              </svg>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="side-bottom">
          <div className="nav-divider" />
          <Link to="/dashboard/perfil" className="profile-row" onClick={onClose}>
            <div className="profile-avatar">{inicial}</div>
            <div>
              <div className="profile-name">{nomeUtilizador}</div>
              <div className="profile-sub">Ver perfil</div>
            </div>
          </Link>
          <Link to="/dashboard/configuracoes" className="nav-item" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            Configurações
          </Link>
          <button type="button" className="nav-item nav-item-logout" onClick={handleSair}>
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            Sair
          </button>
        </div>
      </nav>
    </>
  );
}