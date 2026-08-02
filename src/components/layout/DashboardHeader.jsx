import { useState, useEffect, useRef } from 'react';
import Logo from '../Logo';
import DashboardSidebar from './DashboardSidebar';
import { useAuth, authFetch } from '../../context/AuthContext';
import './DashboardHeader.css';

export default function DashboardHeader() {
  const { token } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifAberta, setNotifAberta] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const notifRef = useRef(null);

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

  useEffect(() => {
    function aoClicarFora(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifAberta(false);
    }
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, []);

  async function marcarComoLida(id) {
    setNotificacoes((lista) => lista.map((n) => (n.id === id ? { ...n, lida: true } : n)));
    setNaoLidas((n) => Math.max(0, n - 1));
    try {
      await authFetch(token, '/api/notificacoes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch {
      // se falhar, a próxima abertura do sino corrige o estado
    }
  }

  async function eliminarNotificacao(id, e) {
    e.stopPropagation();
    const alvo = notificacoes.find((n) => n.id === id);
    setNotificacoes((lista) => lista.filter((n) => n.id !== id));
    if (alvo && !alvo.lida) setNaoLidas((n) => Math.max(0, n - 1));
    try {
      await authFetch(token, '/api/notificacoes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch {
      // se falhar, volta a aparecer na próxima carga
    }
  }

  function abrirNotificacoes() {
    setNotifAberta((v) => !v);
    if (!notifAberta) carregarNotificacoes();
  }

  return (
    <>
      <header className="dash-header">
        <div className="dash-inner">
          <Logo />

          <div className="dash-actions">
            <div className="notif-wrap" ref={notifRef}>
              <button className="icon-btn" aria-label="Notificações" onClick={abrirNotificacoes}>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                {naoLidas > 0 && <span className="badge">{naoLidas > 9 ? '9+' : naoLidas}</span>}
              </button>

              {notifAberta && (
                <div className="notif-dropdown">
                  <div className="notif-dropdown-topo">
                    <span>Notificações</span>
                  </div>

                  {carregando && notificacoes.length === 0 && (
                    <p className="notif-vazio">A carregar…</p>
                  )}

                  {!carregando && notificacoes.length === 0 && (
                    <p className="notif-vazio">Sem notificações por agora.</p>
                  )}

                  <div className="notif-lista">
                    {notificacoes.map((n) => (
                      <button
                        key={n.id}
                        className={`notif-item ${n.lida ? '' : 'nao-lida'}`}
                        onClick={() => !n.lida && marcarComoLida(n.id)}
                      >
                        <span className="notif-texto">{n.mensagem}</span>
                        <button
                          className="notif-eliminar"
                          aria-label="Eliminar notificação"
                          onClick={(e) => eliminarNotificacao(n.id, e)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M6 6l12 12M18 6L6 18" />
                          </svg>
                        </button>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
    </>
  );
}
