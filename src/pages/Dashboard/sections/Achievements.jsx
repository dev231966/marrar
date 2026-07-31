import { achievements } from './dashboardData';
import { IconFlame, IconCheck, IconAlert, IconLock } from './DashboardIcons';

const ICONS = {
  flame: IconFlame,
  check: IconCheck,
  alert: IconAlert,
  lock: IconLock,
};

export default function Achievements() {
  return (
    <>
      <div className="section-lbl">Conquistas</div>
      <div className="achv-row">
        {achievements.map((achv) => {
          const Icon = ICONS[achv.icon];
          return (
            <div className={`achv${achv.locked ? ' locked' : ''}`} key={achv.key}>
              <div className="achv-badge">
                <Icon />
              </div>
              <span>{achv.label}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
