import RevealOnScroll from '../../../components/RevealOnScroll';

const METRICS = [
  { value: '70%', label: 'do tempo de estudo é gasto a procurar material', tone: 'bad' },
  { value: '3×', label: 'mais exercícios feitos com conteúdo organizado', tone: 'good' },
];

const BAD_POINTS = [
  {
    icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>,
    text: <>Não sabes o que realmente vai <b>sair no exame</b></>,
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6v6l4 2" /><circle cx="12" cy="12" r="9" /></svg>,
    text: <>Estudas <b>muitas horas</b> sem ver resultado</>,
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="7" height="7" rx="1" /><rect x="14" y="4" width="7" height="7" rx="1" /><rect x="9" y="14" width="7" height="7" rx="1" /></svg>,
    text: <>Materiais <b>espalhados</b> em vários grupos e sites</>,
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /></svg>,
    text: <>Chegas ao exame <b>inseguro</b>, sem saber a tua nota real</>,
  },
];

const GOOD_POINTS = [
  {
    icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>,
    text: <>Exercícios <b>avaliados por especialistas</b> universitários</>,
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10L12 4 2 10l10 6 10-6z" /><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" /></svg>,
    text: <>Explicação <b>directa</b> ao que realmente interessa</>,
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>,
    text: <>Tudo <b>num só lugar</b>, sempre organizado</>,
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M7 14l4-4 3 3 5-6" /></svg>,
    text: <>Sabes a tua <b>nota prevista</b> antes do dia do exame</>,
  },
];

export default function ProblemSection() {
  return (
    <section className="compare-section">
      <RevealOnScroll as="div" className="section-head">
        <span className="eyebrow"><span className="dot" />A realidade</span>
        <h2>Estudar sem estratégia é arriscado</h2>
        <p>Muita gente estuda horas sem parar e ainda chega insegura ao exame. A diferença não é esforço — é direcção.</p>
      </RevealOnScroll>

      <RevealOnScroll as="div" className="compare-metrics">
        {METRICS.map((metric) => (
          <div key={metric.label} className={`compare-metric m-${metric.tone}`}>
            <div className="m-num">{metric.value}</div>
            <div className="m-lbl">{metric.label}</div>
          </div>
        ))}
      </RevealOnScroll>

      <div className="compare">
        <div className="compare-vs">VS</div>

        <RevealOnScroll as="div" className="compare-card bad">
          <div className="cc-head">
            <h3>
              <span className="cc-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
              </span>
              Sem estratégia
            </h3>
          </div>
          <ul>
            {BAD_POINTS.map((point, i) => (
              <li key={i}>
                <span className="li-icon">{point.icon}</span>
                <span>{point.text}</span>
              </li>
            ))}
          </ul>
        </RevealOnScroll>

        <RevealOnScroll as="div" delay={1} className="compare-card good">
          <div className="cc-head">
            <h3>
              <span className="cc-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>
              </span>
              Com o Marrar
            </h3>
          </div>
          <ul>
            {GOOD_POINTS.map((point, i) => (
              <li key={i}>
                <span className="li-icon">{point.icon}</span>
                <span>{point.text}</span>
              </li>
            ))}
          </ul>
        </RevealOnScroll>
      </div>

      <RevealOnScroll as="div" delay={2} className="compare-foot">
        <p>Estudantes que trocam de estratégia recuperam, em média, semanas de estudo perdido. <a href="/login">Começa de graça →</a></p>
      </RevealOnScroll>
    </section>
  );
}
