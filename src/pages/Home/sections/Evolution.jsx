import { useEffect, useRef, useState } from 'react';
import RevealOnScroll from '../../../components/RevealOnScroll';

const WEEKS = [
  { label: 'S1', height: 38 },
  { label: 'S2', height: 52 },
  { label: 'S3', height: 46 },
  { label: 'S4', height: 64 },
  { label: 'S5', height: 58 },
  { label: 'S6', height: 80 },
];

export default function Evolution() {
  const chartRef = useRef(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const node = chartRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section style={{ background: 'var(--bg-soft)' }}>
      <div className="split-section reverse">
        <RevealOnScroll as="div" className="split-text">
          <span className="eyebrow"><span className="dot" />Progresso visível</span>
          <h2>Acompanha a tua evolução em tempo real</h2>
          <p>Vês exactamente onde estás a melhorar semana a semana, e onde ainda precisas de reforçar.</p>
        </RevealOnScroll>

        <RevealOnScroll as="div" delay={1} className="split-media">
          <div className="mockup-wrap">
            <div className="mockup-card">
              <div className="mockup-title">Desempenho · últimas 6 semanas</div>
              <div className="evo-chart" ref={chartRef}>
                {WEEKS.map((week) => (
                  <div className="bar" key={week.label}>
                    <i style={{ height: animated ? `${week.height}%` : '0%' }} />
                  </div>
                ))}
              </div>
              <div className="evo-labels">
                {WEEKS.map((week) => (
                  <span key={week.label}>{week.label}</span>
                ))}
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
