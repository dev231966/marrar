import { useEffect, useMemo, useState } from 'react';
import { authFetch, useAuth } from '../../context/AuthContext';
import { IconAlert, IconBook, IconCheck, IconChevronRight, IconLock, IconTrend, IconTools, IconBell } from '../Dashboard/sections/DashboardIcons';
import './Admin.css';

function AdminIcon({ children: IconComponent, ...props }) {
  return <IconComponent className="admin-icon" aria-hidden="true" {...props} />;
}

function IconUsers(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>; }
function IconExam(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 4h16v16H4z" /><path d="M8 8h8M8 12h5M8 16h3" /></svg>; }
function IconFlag(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 21V4" /><path d="M5 4c5-3 8 3 14 0v10c-6 3-9-3-14 0" /></svg>; }
function IconSettings(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.56V22h-2.4v-.2a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.6 17a1.7 1.7 0 0 0-1.56-1H6.8v-2.4H7a1.7 1.7 0 0 0 1.56-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.7-1.7.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1-1.56V7h2.4v.2a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.7 1.7-.06.06A1.7 1.7 0 0 0 19.4 12a1.7 1.7 0 0 0 1.56 1h.24v2.4h-.24a1.7 1.7 0 0 0-1.56 1.6Z" /></svg>; }
function IconLogout(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10 17l5-5-5-5M15 12H3" /><path d="M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" /></svg>; }
function IconArrowUp(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m7 17 10-10M7 7h10v10" /></svg>; }

const navItems = [
  ['overview', 'Visão geral', IconTrend],
  ['users', 'Utilizadores', IconUsers],
  ['materials', 'Materiais', IconBook],
  ['exams', 'Exames', IconExam],
  ['simulados', 'Simulados', IconCheck],
  ['reports', 'Denúncias', IconFlag],
  ['editorial', 'Editorial', IconTools],
];

const emptyStats = { utilizadores: '—', materiais: '—', exames: '—', denuncias: '—' };

function StatCard({ label, value, note, tone, icon: IconComponent }) {
  return <article className={`admin-stat admin-stat-${tone}`}><div className="admin-stat-top"><span>{label}</span><AdminIcon>{IconComponent}</AdminIcon></div><strong>{value}</strong><small>{note}</small></article>;
}

function EmptyPanel({ title, detail, action }) {
  return <div className="admin-empty"><div className="admin-empty-mark">+</div><h3>{title}</h3><p>{detail}</p>{action && <button type="button" className="admin-button admin-button-dark">{action}</button>}</div>;
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
      <div className="admin-brand"><span className="admin-brand-mark">m</span><div><strong>marrar</strong><small>painel interno</small></div></div>
      <div className="admin-workspace"><span className="admin-workspace-dot" /> Operações <span>⌄</span></div>
      <nav aria-label="Navegação administrativa" className="admin-nav">
        <p className="admin-nav-label">GESTÃO</p>
        {navItems.map(([id, label, IconComponent]) => <button key={id} type="button" className={active === id ? 'is-active' : ''} onClick={() => selectSection(id)}><AdminIcon>{IconComponent}</AdminIcon>{label}{id === 'reports' && <b>0</b>}</button>)}
        <p className="admin-nav-label admin-nav-label-lower">SISTEMA</p>
        <button type="button" onClick={() => setNotice('Definições administrativas em breve.')}><AdminIcon>{IconSettings}</AdminIcon>Definições</button>
      </nav>
      <div className="admin-sidebar-foot"><div className="admin-user-avatar">{(user?.nome || 'AD').slice(0, 2).toUpperCase()}</div><div><strong>{user?.nome || 'Administrador'}</strong><small>Administrador</small></div><button type="button" aria-label="Sair" onClick={sair}><IconLogout aria-hidden="true" /></button></div>
    </aside>
    <main className="admin-main">
      <header className="admin-topbar"><div className="admin-breadcrumb"><span>marrar</span><b>/</b><strong>{currentLabel}</strong></div><div className="admin-top-actions"><button type="button" className="admin-icon-button" aria-label="Notificações" onClick={() => setNotice('Não existem notificações novas.')}><IconBell aria-hidden="true" /></button><div className="admin-top-avatar">{(user?.nome || 'AD').slice(0, 2).toUpperCase()}</div></div></header>
      <div className="admin-content">
        <section className="admin-heading"><div><p className="admin-eyebrow">CENTRO DE OPERAÇÕES</p><h1>{active === 'overview' ? 'Bom dia, administrador.' : currentLabel}</h1><p className="admin-heading-copy">Acompanhe o estado da plataforma e mantenha os conteúdos académicos em ordem.</p></div><div className="admin-heading-meta"><span className="admin-live-dot" /> Ambiente de produção<br /><small>Actualizado agora</small></div></section>
        {notice && <div className="admin-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')}>Fechar</button></div>}
        {active === 'overview' ? <>
          <section className="admin-stats" aria-label="Indicadores da plataforma"><StatCard label="Utilizadores" value={stats.utilizadores} note="Registos totais" tone="red" icon={IconUsers} /><StatCard label="Recursos publicados" value={stats.materiais} note="Materiais guardados" tone="blue" icon={IconBook} /><StatCard label="Exames disponíveis" value={stats.exames} note="Exames publicados" tone="gold" icon={IconExam} /><StatCard label="Denúncias abertas" value={stats.denuncias} note="Aguardam revisão" tone="green" icon={IconAlert} /></section>
          <section className="admin-grid"><article className="admin-panel admin-panel-wide"><div className="admin-panel-head"><div><p className="admin-eyebrow">ACTIVIDADE</p><h2>Movimento da plataforma</h2></div><button type="button" className="admin-select" onClick={() => setNotice('Filtros de período em breve.')}>Últimos 30 dias⌄</button></div><div className="admin-chart"><div className="admin-chart-empty"><span>—</span><p>Os dados de actividade aparecerão aqui quando a API administrativa estiver ligada.</p></div><div className="admin-chart-lines" /></div></article><article className="admin-panel"><div className="admin-panel-head"><div><p className="admin-eyebrow">PENDENTES</p><h2>Requer atenção</h2></div><span className="admin-count">0</span></div><EmptyPanel title="Tudo em dia" detail="Não há conteúdos ou denúncias a aguardar revisão." /></article></section>
          <section className="admin-panel admin-users-panel"><div className="admin-panel-head"><div><p className="admin-eyebrow">UTILIZADORES</p><h2>Registos recentes</h2></div><button type="button" className="admin-button admin-button-light" onClick={() => selectSection('users')}>Ver todos <span>→</span></button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Utilizador</th><th>Papel</th><th>Estado</th><th /></tr></thead><tbody>{loading ? <tr><td colSpan="4">A carregar utilizadores...</td></tr> : filteredUsers.map((item) => <tr key={item.email}><td><div className="admin-person"><span>{(item.nome || 'U').slice(0, 2).toUpperCase()}</span><div><strong>{item.nome}</strong><small>{item.email}</small></div></div></td><td><select value={item.papel} onChange={(event) => updateUser(item, 'papel', event.target.value)} aria-label={`Papel de ${item.nome}`}><option value="estudante">Estudante</option><option value="professor">Professor</option><option value="admin">Administrador</option></select></td><td><button type="button" className="admin-status" onClick={() => updateUser(item, 'suspenso', !item.suspenso)}>{item.suspenso ? 'Suspenso' : 'Activo'}</button></td><td><button type="button" className="admin-more" aria-label="Mais opções" onClick={() => setNotice(`Conta de ${item.nome} actualizada.`)}>•••</button></td></tr>)}</tbody></table></div></section>
        </> : <section className="admin-panel admin-section-empty"><div className="admin-section-icon"><AdminIcon>{navItems.find(([id]) => id === active)?.[2]}</AdminIcon></div><h2>{currentLabel} preparado</h2><p>A estrutura desta área está criada. O próximo passo é ligar os dados persistidos e as permissões verificadas no backend.</p><button type="button" className="admin-button admin-button-dark" onClick={() => selectSection('overview')}>Voltar à visão geral</button></section>}
        <footer className="admin-footer">marrar admin <span>•</span> MVP em construção <span>•</span> acesso protegido</footer>
      </div>
    </main>
  </div>;
}
