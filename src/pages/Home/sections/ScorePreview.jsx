import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import RevealOnScroll from '../../../components/RevealOnScroll';

export default function ScorePreview() {
  const mockupRef = useRef(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const node = mockupRef.current;
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
          <span className="eyebrow"><span className="dot" />Prévia pessoal</span>
          <h2>Se fizesses o exame hoje, qual seria a tua nota?</h2>
          <p>O Marrar acompanha o teu desempenho nos exercícios e mostra uma estimativa realista da tua nota.</p>
          <Link className="btn-primary" to="/login">Descobrir a minha nota</Link>
        </RevealOnScroll>

        <RevealOnScroll as="div" delay={1} className="split-media">
          <div className="mockup-wrap">
            <div className={`mockup-card score-mockup ${animated ? 'in' : ''}`} ref={mockupRef}>
              <div className="mockup-title" style={{ textAlign: 'left' }}>Nota prevista</div>
              <div className="score-num">13.4<span style={{ fontSize: '20px', color: 'var(--ink-soft)', fontWeight: 700 }}>/20</span></div>
              <div className="score-sub">Com base nos teus últimos exercícios</div>
              <div className="score-bar"><i /></div>
              <div className="score-row"><span>0</span><span>Mínimo: 10</span><span>20</span></div>
              <div className="score-badge">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                Alta probabilidade de aprovação
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
