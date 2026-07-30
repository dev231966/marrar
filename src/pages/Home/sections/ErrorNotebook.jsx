import RevealOnScroll from '../../../components/RevealOnScroll';

const ERRORS = [
  { name: 'Matemática', count: 12 },
  { name: 'Física', count: 7 },
  { name: 'Química', count: 4 },
  { name: 'Biologia', count: 9 },
];

export default function ErrorNotebook() {
  return (
    <section>
      <div className="split-section">
        <RevealOnScroll as="div" className="split-text">
          <span className="eyebrow"><span className="dot" />Sem repetir erros</span>
          <h2>Nunca mais repitas o mesmo erro</h2>
          <p>Todo exercício errado fica guardado automaticamente no teu caderno de erros, organizado por matéria, pronto a rever antes do exame.</p>
          <ul>
            <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>Guardado automaticamente, sem esforço</li>
            <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>Revisão rápida antes do dia do exame</li>
          </ul>
        </RevealOnScroll>

        <RevealOnScroll as="div" delay={1} className="split-media">
          <div className="mockup-wrap">
            <div className="mockup-card">
              <div className="mockup-title">Caderno de erros</div>
              <div className="errors-list">
                {ERRORS.map((error) => (
                  <div className="error-row" key={error.name}>
                    <span className="name">{error.name}</span>
                    <span className="count">{error.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
