import { useMemo } from 'react';

// Gerador pseudo-aleatório determinístico, apenas para os dados de exemplo.
function createSeededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function levelForValue(value) {
  if (value > 0.88) return 'l4';
  if (value > 0.7) return 'l3';
  if (value > 0.5) return 'l2';
  if (value > 0.32) return 'l1';
  return null;
}

export default function StudyHeatmap({
  weeks = 26,
  seed = 7,
  daysThisYear = 112,
  bestStreak = 23,
}) {
  const cells = useMemo(() => {
    const random = createSeededRandom(seed);
    return Array.from({ length: weeks * 7 }, () => levelForValue(random()));
  }, [weeks, seed]);

  return (
    <div className="heatmap-card">
      <div className="heatmap-head">
        <h3>Constância de estudo</h3>
        <div className="heatmap-legend">
          menos
          <i style={{ background: 'var(--border)' }} />
          <i className="l1" />
          <i className="l2" />
          <i className="l3" />
          <i className="l4" />
          mais
        </div>
      </div>
      <div className="heatmap-grid">
        {cells.map((level, index) => (
          <div key={index} className={`heatmap-cell${level ? ` ${level}` : ''}`} />
        ))}
      </div>
      <div className="heatmap-foot">
        <span>
          <b>{daysThisYear}</b> dias de estudo este ano
        </span>
        <span>
          Melhor sequência: <b>{bestStreak} dias</b>
        </span>
      </div>
    </div>
  );
}
