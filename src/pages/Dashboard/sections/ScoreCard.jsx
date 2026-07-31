export default function ScoreCard({ score = 13.4, maxScore = 20 }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const ratio = score / maxScore;
  const dashOffset = circumference * (1 - ratio);

  return (
    <div className="score-card">
      <div className="glow" />
      <div className="score-ring">
        <svg viewBox="0 0 84 84">
          <circle className="bg" cx="42" cy="42" r={radius} />
          <circle
            className="fg"
            cx="42"
            cy="42"
            r={radius}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: dashOffset,
            }}
          />
        </svg>
        <div className="num">
          {score.toFixed(1)}
          <span>/{maxScore}</span>
        </div>
      </div>
      <div className="score-text">
        <div className="lbl">Nota prevista</div>
        <h3>Alta probabilidade de aprovação</h3>
        <p>Baseado nos teus últimos exercícios</p>
      </div>
    </div>
  );
}
