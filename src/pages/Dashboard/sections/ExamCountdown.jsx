import { IconChevronRight } from './DashboardIcons';

export default function ExamCountdown({
  daysLeft = 47,
  examName = 'Exame Nacional · 12ª Classe',
  readySubjects = 5,
  totalSubjects = 6,
}) {
  return (
    <>
      <div className="section-lbl">Contagem para o exame</div>
      <div className="countdown">
        <div className="countdown-num">
          {daysLeft}
          <span>dias</span>
        </div>
        <div className="countdown-divider" />
        <div className="countdown-text">
          <h3>{examName}</h3>
          <p>
            No teu ritmo actual, chegas preparado em {readySubjects} das {totalSubjects} matérias
          </p>
        </div>
        <a className="countdown-cta" href="#">
          Ver plano
          <IconChevronRight />
        </a>
      </div>
    </>
  );
}
