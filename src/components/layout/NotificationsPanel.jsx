import { useEffect, useState } from 'react';
import { useAuth, authFetch } from '../../context/AuthContext';
import './NotificationsPanel.css';

const FILTROS = [
  { id: 'todas', nome: 'Todas' },
  { id: 'nao-lidas', nome: 'Não lidas' },
];

export default function NotificationsPanel({ isOpen, onClose, notificacoes, setNotificacoes, setNaoLidas, carregando, recarregar }) {
  const { token } = useAuth();
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    if (isOpen) recarregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
      // se falhar, a próxima abertura corrige o estado
    }
  }

  async function marcarTodasComoLidas() {
    const idsNaoLidas = notificacoes.filter((n) => !n.lida).map((n) => n.id);
    if (idsNaoLidas.length === 0) return;
    setNotificacoes((lista) => lista.map((n) => ({ ...n, lida: true })));
    setNaoLidas(0);
    await Promise.all(
      idsNaoLidas.map((id) =>
        authFetch(token, '/api/notificacoes', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        }).catch(() => {})
      )
    );
  }

  async function eliminarNotificacao(id) {
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

  const listados = filtro === 'nao-lidas' ? notificacoes.filter((n) => !n.lida) : notificacoes;

  return (
    <>
      <div className={`notif-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />

      <aside className={`notif-panel ${isOpen ? 'open' : ''}`}>
        <div className="notif-panel-top">
          <h2>Notificações</h2>
          <button className="notif-panel-close" aria-label="Fechar" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="notif-panel-filtros">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              className={`notif-filtro-chip ${filtro === f.id ? 'active' : ''}`}
              onClick={() => setFiltro(f.id)}
            >
              {f.nome}
            </button>
          ))}
          <button className="notif-marcar-todas" onClick={marcarTodasComoLidas}>
            Marcar tudo como lido
          </button>
        </div>

        <div className="notif-panel-lista">
          {carregando && listados.length === 0 && <p className="notif-panel-vazio">A carregar…</p>}

          {!carregando && listados.length === 0 && (
            <p className="notif-panel-vazio">
              {filtro === 'nao-lidas' ? 'Sem notificações por ler.' : 'Ainda não tens notificações.'}
            </p>
          )}

          {listados.map((n) => (
            <div key={n.id} className={`notif-panel-item ${n.lida ? '' : 'nao-lida'}`}>
              <button className="notif-panel-item-corpo" onClick={() => !n.lida && marcarComoLida(n.id)}>
                {!n.lida && <span className="notif-dot" />}
                <span className="notif-panel-texto">{n.mensagem}</span>
              </button>
              <button className="notif-panel-eliminar" aria-label="Eliminar" onClick={() => eliminarNotificacao(n.id)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
