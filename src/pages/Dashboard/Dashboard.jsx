import { useAuth } from '../../context/AuthContext';
import DashboardHeader from '../../components/layout/DashboardHeader';
import ScoreCard from './sections/ScoreCard';
import ContinueCard from './sections/ContinueCard';
import ServicesGrid from './sections/ServicesGrid';
import SubjectsRow from './sections/SubjectsRow';
import ExamCountdown from './sections/ExamCountdown';
import StudyHeatmap from './sections/StudyHeatmap';
import ActivityFeed from './sections/ActivityFeed';
import Achievements from './sections/Achievements';
import './Dashboard.css';

export default function Dashboard({ streakDays = 7 }) {
  const { user } = useAuth();
  const studentName = user?.nome?.split(' ')[0] || 'Estudante';

  return (
    <div className="dashboard-page">
      <DashboardHeader />

      <main className="page">
        <div className="greet">
          <div>
            <h1>
              Olá, <span>{studentName}</span>
            </h1>
            <p>Aqui está o teu progresso de hoje</p>
          </div>
          <div className="streak">
            <svg viewBox="0 0 24 24">
              <path d="M12 2c1 3-2 4-2 7a4 4 0 008 0c0-1-.5-2-1-2 1 3-1 5-3 5a4 4 0 01-4-4c0-4 3-4 2-6z" />
            </svg>
            {streakDays} dias seguidos
          </div>
        </div>

        <div className="hero-row">
          <ScoreCard score={13.4} maxScore={20} />
          <ContinueCard subject="Matemática · Progressões" progress={58} />
        </div>

        <ServicesGrid />
        <SubjectsRow />
        <ExamCountdown daysLeft={47} readySubjects={5} totalSubjects={6} />

        <div className="section-lbl">O teu histórico</div>
        <div className="grid-2">
          <StudyHeatmap />
          <ActivityFeed />
        </div>

        <Achievements />
      </main>
    </div>
  );
}
