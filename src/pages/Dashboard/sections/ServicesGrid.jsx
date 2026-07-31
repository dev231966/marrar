import { Link } from 'react-router-dom';
import { services } from './dashboardData';
import { IconChat, IconCheck, IconTrend, IconAlert, IconBook, IconTools } from './DashboardIcons';

const ICONS = {
  chat: IconChat,
  check: IconCheck,
  trend: IconTrend,
  alert: IconAlert,
  book: IconBook,
  tools: IconTools,
};

export default function ServicesGrid() {
  return (
    <>
      <div className="section-lbl">Serviços</div>
      <div className="services">
        {services.map((service) => {
          const Icon = ICONS[service.icon];
          return (
            <Link key={service.key} className={`service ${service.className}`} to={`/dashboard/${service.key}`}>
              <div className="service-icon">
                <Icon />
              </div>
              <span className="name">{service.name}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
