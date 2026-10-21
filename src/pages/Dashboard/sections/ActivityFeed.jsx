import { IconCheck, IconPlay, IconAlert } from './DashboardIcons';

const ICONS = {
  check: IconCheck,
  alert: IconAlert,
};

export default function ActivityFeed({ atividade = [] }) {
  const items = atividade.map((item) => ({
    key: item.id,
    icon: item.acertou ? 'check' : 'alert',
    tone: item.acertou ? 'ok' : 'warn',
    title: `${item.tema || 'Exercício'} · ${item.acertou ? 'Resposta correcta' : 'Resposta a rever'}`,
    subtitle: item.pergunta || 'Exercício praticado',
    time: item.quando ? new Date(item.quando).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }) : 'Recente',
  }));

  return (
    <div className="heatmap-card">
      <h3 style={{ marginBottom: '10px' }}>Actividade recente</h3>
      <div className="feed">
        {items.length === 0 ? <p className="empty-state">Ainda não há actividade registada.</p> : items.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <div className="feed-item" key={item.key}>
              <div className={`feed-icon ${item.tone}`}>
                <Icon />
              </div>
              <div className="feed-text">
                <h4>{item.title}</h4>
                <p>{item.subtitle}</p>
              </div>
              <div className="feed-time">{item.time}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
