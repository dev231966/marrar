import RevealOnScroll from '../../../components/RevealOnScroll';

const BAD_POINTS = [
  'Não sabes o que realmente vai sair no exame',
  'Estudas muitas horas sem ver resultado',
  'Materiais espalhados em vários grupos e sites',
];

const GOOD_POINTS = [
  'Exercícios avaliados por especialistas universitários',
  'Explicação directa ao que realmente interessa',
  'Tudo num só lugar, sempre organizado',
];

export default function ProblemSection() {
  return (
    <section>
      <RevealOnScroll as="div" className="section-head">
        <span className="eyebrow"><span className="dot" />A realidade</span>
        <h2>Estudar sem estratégia é arriscado</h2>
        <p>Muita gente estuda horas sem parar e ainda chega insegura ao exame.</p>
      </RevealOnScroll>

      <div className="compare">
        <RevealOnScroll as="div" className="compare-card bad">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            Sem estratégia
          </h3>
          <ul>
            {BAD_POINTS.map((point) => (
              <li key={point}>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                {point}
              </li>
            ))}
          </ul>
        </RevealOnScroll>

        <RevealOnScroll as="div" delay={1} className="compare-card good">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            Com o Marrar
          </h3>
          <ul>
            {GOOD_POINTS.map((point) => (
              <li key={point}>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                {point}
              </li>
            ))}
          </ul>
        </RevealOnScroll>
      </div>
    </section>
  );
}
