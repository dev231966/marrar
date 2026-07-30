import RevealOnScroll from '../../../components/RevealOnScroll';

const FEATURES = [
  {
    title: 'Matérias num só lugar',
    text: 'Todas as cadeiras organizadas, sem perder tempo a saltar entre grupos e sites diferentes.',
    icon: <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />,
    icon2: <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />,
  },
  {
    title: 'Exercícios práticos',
    text: 'Avaliados por especialistas de grandes universidades, com correcção passo a passo.',
    icon: <path d="M9 11l3 3L22 4" />,
    icon2: <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />,
  },
  {
    title: 'Estudo por temas',
    text: 'Conteúdos directos e relevantes, ideais para reforçar o que já aprendeste.',
    icon: <circle cx="12" cy="12" r="9" />,
    icon2: <path d="M12 7v5l3 3" />,
  },
];

export default function Explanation() {
  return (
    <section id="explicacao" style={{ background: 'var(--bg-soft)' }}>
      <RevealOnScroll as="div" className="section-head">
        <span className="eyebrow"><span className="dot" />O que encontras</span>
        <h2>Feito para quem precisa de passar</h2>
        <p>A explicação é o coração do Marrar. À volta dela, tudo o que ajuda a fixar a matéria.</p>
      </RevealOnScroll>

      <div className="features-grid">
        <RevealOnScroll as="div" className="feature-card spotlight">
          <div className="spotlight-text">
            <span className="tag">Foco principal</span>
            <h3 style={{ fontSize: '19px' }}>Explicação para exames</h3>
            <p>Preparação directa para o exame de admissão e para o exame nacional, com professores que conhecem a matéria a fundo.</p>
          </div>
          <div className="feature-icon" style={{ margin: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10L12 4 2 10l10 6 10-6z" />
              <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
            </svg>
          </div>
        </RevealOnScroll>

        {FEATURES.map((feature, index) => (
          <RevealOnScroll as="div" delay={index + 1} key={feature.title} className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {feature.icon}
                {feature.icon2}
              </svg>
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
