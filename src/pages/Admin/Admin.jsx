import { useEffect, useMemo, useState } from 'react';
import { authFetch, useAuth } from '../../context/AuthContext';
import './Admin.css';

const navItems = [
  ['overview', 'Visão geral', 'grid'],
  ['users', 'Utilizadores', 'users'],
  ['materials', 'Materiais', 'file'],
  ['exams', 'Exames', 'document'],
  ['simulados', 'Simulados', 'play'],
  ['reports', 'Denúncias', 'flag'],
  ['editorial', 'Editorial', 'edit'],
];

const emptyStats = { utilizadores: '—', materiais: '—', exames: '—', denuncias: '—' };

const iconPaths = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></>,
  document: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  play: <><circle cx="12" cy="12" r="9" /><path d="m10 8 5 4-5 4z" /></>,
  flag: <><path d="M5 21V4" /><path d="M5 4c5-3 9 3 14 0v10c-5 3-9-3-14 0" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.42 1.42-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V20h-2v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-1.42-1.42.06-.06A1.7 1.7 0 0 0 9.4 15a1.7 1.7 0 0 0-1.55-1H7v-2h.85a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.88L9 9.06l1.42-1.42.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1-1.55V6h2v.49a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06L19.72 9l-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.55 1H21v2h-.13a1.7 1.7 0 0 0-1.47 1.06Z" /></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-6" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
};

function Icon({ name, size = 18 }) { return <svg className="admin-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name] || iconPaths.grid}</svg>; }

function StatCard({ label, value, note, icon }) {
  return <article className="admin-stat"><div className="admin-stat-top"><span>{label}</span><Icon name={icon} /></div><strong>{value}</strong><small>{note}</small></article>;
}

function EmptyPanel({ title, detail, action }) {
  return <div className="admin-empty"><div className="admin-empty-mark"><Icon name="grid" size={22} /></div><h3>{title}</h3><p>{detail}</p>{action && <button type="button" className="admin-button admin-button-dark">{action}</button>}</div>;
}

export default function Admin() {
  const { user, token, sair } = useAuth();
  const [active, setActive] = useState('overview');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [stats, setStats] = useState(emptyStats);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentLabel = navItems.find(([id]) => id === active)?.[1] || 'Visão geral';
  const filteredUsers = useMemo(() => users.filter((item) => `${item.nome} ${item.email}`.toLowerCase().includes(query.toLowerCase())), [query, users]);

  useEffect(() => {
    if (!token) return;
    authFetch(token, '/api/admin').then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.erro || 'Falha ao carregar dados.');
      setStats(data.stats || emptyStats);
      setUsers(data.users || []);
    }).catch((error) => setNotice(error.message)).finally(() => setLoading(false));
  }, [token]);

  async function updateUser(item, field, value) {
    const next = { ...item, [field]: value };
    setUsers((current) => current.map((entry) => entry.id === item.id ? next : entry));
    const response = await authFetch(token, '/api/admin', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: item.id, papel: next.papel, suspenso: next.suspenso }) });
    if (!response.ok) setNotice('Não foi possível guardar a alteração.');
  }

  function selectSection(id) {
    setActive(id);
    setNotice(id === 'overview' ? '' : 'Esta área está pronta para receber dados da API administrativa.');
  }

  return <div className="admin-page">
    <aside className="admin-sidebar">
      <div className="admin-brand"><span className="admin-brand-mark">e</span><div><strong>estudai</strong><small>administração</small></div></div>
      <div className="admin-workspace"><span className="admin-workspace-dot" /> Operações <Icon name="grid" size={14} /></div>
      <nav aria-label="Navegação administrativa" className="admin-nav">
        <p className="admin-nav-label">GESTÃO</p>
        {navItems.map(([id, label, icon]) => <button key={id} type="button" className={active === id ? 'is-active' : ''} onClick={() => selectSection(id)}><Icon name={icon} />{label}{id === 'reports' && <b>0</b>}</button>)}
        <p className="admin-nav-label admin-nav-label-lower">SISTEMA</p>
        <button type="button" onClick={() => setNotice('Definições administrativas em breve.')}><Icon name="settings" />Definições</button>
      </nav>
      <div className="admin-sidebar-foot"><div className="admin-user-avatar">{(user?.nome || 'AD').slice(0, 2).toUpperCase()}</div><div><strong>{user?.nome || 'Administrador'}</strong><small>Administrador</small></div><button type="button" className="admin-logout" aria-label="Sair" onClick={sair}><Icon name="logout" size={17} /></button></div>
    </aside>
    <main className="admin-main">
      <header className="admin-topbar"><div className="admin-breadcrumb"><span>estudai</span><b>/</b><strong>{currentLabel}</strong></div><div className="admin-top-actions"><button type="button" className="admin-icon-button" aria-label="Notificações" onClick={() => setNotice('Não existem notificações novas.')}><Icon name="bell" size={19} /></button><div className="admin-top-avatar">{(user?.nome || 'AD').slice(0, 2).toUpperCase()}</div></div></header>
      <div className="admin-content">
        <section className="admin-heading"><div><p className="admin-eyebrow">CENTRO DE OPERAÇÕES</p><h1>{active === 'overview' ? 'Bom dia, administrador.' : currentLabel}</h1></div><div className="admin-heading-meta"><span className="admin-live-dot" /> Ambiente de produção<br /><small>Actualizado agora</small></div></section>
        {notice && <div className="admin-notice" role="status"><span>{notice}</span><button type="button" aria-label="Fechar aviso" onClick={() => setNotice('')}><Icon name="close" size={16} /></button></div>}
        {active === 'overview' ? <>
          <section className="admin-stats" aria-label="Indicadores da plataforma"><StatCard label="Utilizadores" value={stats.utilizadores} note="Registos totais" icon="users" /><StatCard label="Recursos publicados" value={stats.materiais} note="Materiais guardados" icon="file" /><StatCard label="Exames disponíveis" value={stats.exames} note="Exames publicados" icon="document" /><StatCard label="Denúncias abertas" value={stats.denuncias} note="Aguardam revisão" icon="flag" /></section>
          <section className="admin-grid"><article className="admin-panel admin-panel-wide"><div className="admin-panel-head"><div><p className="admin-eyebrow">ACTIVIDADE</p><h2>Movimento da plataforma</h2></div><button type="button" className="admin-select" onClick={() => setNotice('Filtros de período em breve.')}>Últimos 30 dias⌄</button></div><div className="admin-chart"><div className="admin-chart-empty"><span>—</span><p>Os dados de actividade aparecerão aqui quando a API administrativa estiver ligada.</p></div><div className="admin-chart-lines" /></div></article><article className="admin-panel"><div className="admin-panel-head"><div><p className="admin-eyebrow">PENDENTES</p><h2>Requer atenção</h2></div><span className="admin-count">0</span></div><EmptyPanel title="Tudo em dia" detail="Não há conteúdos ou denúncias a aguardar revisão." /></article></section>
          <section className="admin-panel admin-users-panel"><div className="admin-panel-head"><div><p className="admin-eyebrow">UTILIZADORES</p><h2>Registos recentes</h2></div><button type="button" className="admin-button admin-button-light" onClick={() => selectSection('users')}>Ver todos <Icon name="play" size={14} /></button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Utilizador</th><th>Papel</th><th>Estado</th><th /></tr></thead><tbody>{loading ? Array.from({ length: 4 }, (_, index) => <tr key={`skeleton-${index}`} className="admin-skeleton-row"><td><span className="admin-skeleton admin-skeleton-person" /></td><td><span className="admin-skeleton admin-skeleton-select" /></td><td><span className="admin-skeleton admin-skeleton-status" /></td><td><span className="admin-skeleton admin-skeleton-dot" /></td></tr>) : filteredUsers.map((item) => <tr key={item.email}><td><div className="admin-person"><span>{(item.nome || 'U').slice(0, 2).toUpperCase()}</span><div><strong>{item.nome}</strong><small>{item.email}</small></div></div></td><td><select value={item.papel} onChange={(event) => updateUser(item, 'papel', event.target.value)} aria-label={`Papel de ${item.nome}`}><option value="estudante">Estudante</option><option value="professor">Professor</option><option value="admin">Administrador</option></select></td><td><button type="button" className="admin-status" onClick={() => updateUser(item, 'suspenso', !item.suspenso)}>{item.suspenso ? 'Suspenso' : 'Activo'}</button></td><td><button type="button" className="admin-more" aria-label="Mais opções" onClick={() => setNotice(`Conta de ${item.nome} actualizada.`)}>•••</button></td></tr>)}</tbody></table></div></section>
        </> : <section className="admin-panel admin-section-empty"><div className="admin-section-icon"><Icon name={navItems.find(([id]) => id === active)?.[2]} size={28} /></div><h2>{currentLabel} preparado</h2><p>A estrutura desta área está criada. O próximo passo é ligar os dados persistidos e as permissões verificadas no backend.</p><button type="button" className="admin-button admin-button-dark" onClick={() => selectSection('overview')}>Voltar à visão geral</button></section>}
        <footer className="admin-footer">estudai administração</footer>
      </div>
    </main>
  </div>;
}
