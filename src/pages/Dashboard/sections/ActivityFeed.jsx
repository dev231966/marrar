import { activityFeed } from './dashboardData';
import { IconCheck, IconPlay, IconAlert } from './DashboardIcons';

const ICONS = {
  check: IconCheck,
  play: IconPlay,
  alert: IconAlert,
};

export default function ActivityFeed() {
  return (
    <div className="heatmap-card">
      <h3 style={{ marginBottom: '10px' }}>Actividade recente</h3>
      <div className="feed">
        {activityFeed.map((item) => {
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
