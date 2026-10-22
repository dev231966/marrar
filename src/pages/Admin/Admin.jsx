import { useEffect, useMemo, useState } from 'react';
import { authFetch, useAuth } from '../../context/AuthContext';
import './Admin.css';

const navItems = [
  ['overview', 'Visão geral', '⌂'],
  ['users', 'Utilizadores', '◎'],
  ['materials', 'Materiais', '▧'],
  ['exams', 'Exames', '◇'],
  ['simulados', 'Simulados', '□'],
  ['reports', 'Denúncias', '⚑'],
  ['editorial', 'Editorial', '✦'],
];

const emptyStats = { utilizadores: '—', materiais: '—', exames: '—', denuncias: '—' };

function Icon({ children }) { return <span className="admin-icon" aria-hidden="true">{children}</span>; }

function StatCard({ label, value, note, tone }) {
  return <article className={`admin-stat admin-stat-${tone}`}><div className="admin-stat-top"><span>{label}</span><Icon>{tone === 'red' ? '↗' : tone === 'gold' ? '◷' : tone === 'green' ? '✓' : '•'}</Icon></div><strong>{value}</strong><small>{note}</small></article>;
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
      <div className="admin-brand"><span className="admin-brand-mark">e</span><div><strong>estudai</strong><small>administração</small></div></div>
      <div className="admin-workspace"><span className="admin-workspace-dot" /> Operações <span>⌄</span></div>
      <nav aria-label="Navegação administrativa" className="admin-nav">
        <p className="admin-nav-label">GESTÃO</p>
        {navItems.map(([id, label, icon]) => <button key={id} type="button" className={active === id ? 'is-active' : ''} onClick={() => selectSection(id)}><Icon>{icon}</Icon>{label}{id === 'reports' && <b>0</b>}</button>)}
        <p className="admin-nav-label admin-nav-label-lower">SISTEMA</p>
        <button type="button" onClick={() => setNotice('Definições administrativas em breve.')}><Icon>⚙</Icon>Definições</button>
      </nav>
      <div className="admin-sidebar-foot"><div className="admin-user-avatar">{(user?.nome || 'AD').slice(0, 2).toUpperCase()}</div><div><strong>{user?.nome || 'Administrador'}</strong><small>Administrador</small></div><button type="button" aria-label="Sair" onClick={sair}>↗</button></div>
    </aside>
    <main className="admin-main">
      <header className="admin-topbar"><div className="admin-breadcrumb"><span>estudai</span><b>/</b><strong>{currentLabel}</strong></div><div className="admin-top-actions"><button type="button" className="admin-icon-button" aria-label="Notificações" onClick={() => setNotice('Não existem notificações novas.')}>♧</button><div className="admin-top-avatar">{(user?.nome || 'AD').slice(0, 2).toUpperCase()}</div></div></header>
      <div className="admin-content">
        <section className="admin-heading"><div><p className="admin-eyebrow">CENTRO DE OPERAÇÕES</p><h1>{active === 'overview' ? 'Bom dia, administrador.' : currentLabel}</h1><p className="admin-heading-copy">Acompanhe o estado da plataforma e mantenha os conteúdos académicos em ordem.</p></div><div className="admin-heading-meta"><span className="admin-live-dot" /> Ambiente de produção<br /><small>Actualizado agora</small></div></section>
        {notice && <div className="admin-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')}>Fechar</button></div>}
        {active === 'overview' ? <>
          <section className="admin-stats" aria-label="Indicadores da plataforma"><StatCard label="Utilizadores" value={stats.utilizadores} note="Registos totais" tone="red" /><StatCard label="Recursos publicados" value={stats.materiais} note="Materiais guardados" tone="blue" /><StatCard label="Exames disponíveis" value={stats.exames} note="Exames publicados" tone="gold" /><StatCard label="Denúncias abertas" value={stats.denuncias} note="Aguardam revisão" tone="green" /></section>
          <section className="admin-grid"><article className="admin-panel admin-panel-wide"><div className="admin-panel-head"><div><p className="admin-eyebrow">ACTIVIDADE</p><h2>Movimento da plataforma</h2></div><button type="button" className="admin-select" onClick={() => setNotice('Filtros de período em breve.')}>Últimos 30 dias⌄</button></div><div className="admin-chart"><div className="admin-chart-empty"><span>—</span><p>Os dados de actividade aparecerão aqui quando a API administrativa estiver ligada.</p></div><div className="admin-chart-lines" /></div></article><article className="admin-panel"><div className="admin-panel-head"><div><p className="admin-eyebrow">PENDENTES</p><h2>Requer atenção</h2></div><span className="admin-count">0</span></div><EmptyPanel title="Tudo em dia" detail="Não há conteúdos ou denúncias a aguardar revisão." /></article></section>
          <section className="admin-panel admin-users-panel"><div className="admin-panel-head"><div><p className="admin-eyebrow">UTILIZADORES</p><h2>Registos recentes</h2></div><button type="button" className="admin-button admin-button-light" onClick={() => selectSection('users')}>Ver todos <span>→</span></button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Utilizador</th><th>Papel</th><th>Estado</th><th /></tr></thead><tbody>{loading ? Array.from({ length: 4 }, (_, index) => <tr key={`skeleton-${index}`} className="admin-skeleton-row"><td><span className="admin-skeleton admin-skeleton-person" /></td><td><span className="admin-skeleton admin-skeleton-select" /></td><td><span className="admin-skeleton admin-skeleton-status" /></td><td><span className="admin-skeleton admin-skeleton-dot" /></td></tr>) : filteredUsers.map((item) => <tr key={item.email}><td><div className="admin-person"><span>{(item.nome || 'U').slice(0, 2).toUpperCase()}</span><div><strong>{item.nome}</strong><small>{item.email}</small></div></div></td><td><select value={item.papel} onChange={(event) => updateUser(item, 'papel', event.target.value)} aria-label={`Papel de ${item.nome}`}><option value="estudante">Estudante</option><option value="professor">Professor</option><option value="admin">Administrador</option></select></td><td><button type="button" className="admin-status" onClick={() => updateUser(item, 'suspenso', !item.suspenso)}>{item.suspenso ? 'Suspenso' : 'Activo'}</button></td><td><button type="button" className="admin-more" aria-label="Mais opções" onClick={() => setNotice(`Conta de ${item.nome} actualizada.`)}>•••</button></td></tr>)}</tbody></table></div></section>
        </> : <section className="admin-panel admin-section-empty"><div className="admin-section-icon">{navItems.find(([id]) => id === active)?.[2]}</div><h2>{currentLabel} preparado</h2><p>A estrutura desta área está criada. O próximo passo é ligar os dados persistidos e as permissões verificadas no backend.</p><button type="button" className="admin-button admin-button-dark" onClick={() => selectSection('overview')}>Voltar à visão geral</button></section>}
        <footer className="admin-footer">marrar admin <span>•</span> MVP em construção <span>•</span> acesso protegido</footer>
      </div>
    </main>
  </div>;
}
