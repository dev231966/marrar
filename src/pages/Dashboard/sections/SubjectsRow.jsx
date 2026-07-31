import { subjects } from './dashboardData';

export default function SubjectsRow() {
  return (
    <>
      <div className="section-lbl">As tuas matérias</div>
      <div className="subjects">
        {subjects.map((subject) => (
          <div className="subject-card" key={subject.key}>
            <div className="subject-top">
              <span className="subject-dot" style={{ background: subject.color }} />
              <h4>{subject.name}</h4>
            </div>
            <div className="subject-bar">
              <i style={{ width: `${subject.percent}%`, background: subject.color }} />
            </div>
            <div className="subject-pct">{subject.percent}% concluído</div>
          </div>
        ))}
      </div>
    </>
  );
}
