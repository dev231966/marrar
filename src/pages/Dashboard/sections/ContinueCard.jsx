import { IconPlay, IconChevronRight } from './DashboardIcons';

export default function ContinueCard({
  subject = 'Matemática · Progressões',
  progress = 58,
  href = '#',
}) {
  return (
    <a className="continue-card" href={href}>
      <div className="continue-icon">
        <IconPlay />
      </div>
      <div className="continue-text">
        <div className="lbl">Continuar</div>
        <h3>{subject}</h3>
        <div className="continue-progress">
          <i style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="continue-go">
        <IconChevronRight stroke="#fff" />
      </div>
    </a>
  );
}
