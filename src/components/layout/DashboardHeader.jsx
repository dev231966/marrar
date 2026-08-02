import { useState, useEffect } from 'react';
import Logo from '../Logo';
import DashboardSidebar from './DashboardSidebar';
import NotificationsPanel from './NotificationsPanel';
import { useAuth, authFetch } from '../../context/AuthContext';
import './DashboardHeader.css';

export default function DashboardHeader() {
  const { token } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifAberta, setNotifAberta] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [carregando, setCarregando] = useState(false);

  async function carregarNotificacoes() {
    if (!token) return;
    setCarregando(true);
    try {
      const resp = await authFetch(token, '/api/notificacoes');
      const dados = await resp.json().catch(() => null);
      if (resp.ok && dados) {
        setNotificacoes(dados.notificacoes || []);
        setNaoLidas(dados.naoLidas || 0);
      }
    } catch {
      // falha silenciosa — o sino simplesmente não actualiza desta vez
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarNotificacoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Verifica periodicamente (30s) para o sino actualizar sozinho, sem
  // precisar de reload da página.
  useEffect(() => {
    if (!token) return;
    const intervalo = setInterval(carregarNotificacoes, 30000);
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Também actualiza quando a pessoa volta a esta aba (ex: estava noutra
  // app e regressou) — cobre o caso de o intervalo ainda não ter passado.
  useEffect(() => {
    function aoFicarVisivel() {
      if (document.visibilityState === "visible") carregarNotificacoes();
    }
    document.addEventListener("visibilitychange", aoFicarVisivel);
    return () => document.removeEventListener("visibilitychange", aoFicarVisivel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <>
      <header className="dash-header">
        <div className="dash-inner">
          <Logo />

          <div className="dash-actions">
            <button className="icon-btn" aria-label="Notificações" onClick={() => setNotifAberta(true)}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {naoLidas > 0 && <span className="badge">{naoLidas > 9 ? '9+' : naoLidas}</span>}
            </button>

            <button
              className={`icon-btn ${isMenuOpen ? 'active' : ''}`}
              aria-label="Abrir menu"
              onClick={() => setIsMenuOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <DashboardSidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <NotificationsPanel
        isOpen={notifAberta}
        onClose={() => setNotifAberta(false)}
        notificacoes={notificacoes}
        setNotificacoes={setNotificacoes}
        setNaoLidas={setNaoLidas}
        carregando={carregando}
        recarregar={carregarNotificacoes}
      />
    </>
  );
}
