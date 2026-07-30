import RevealOnScroll from '../../../components/RevealOnScroll';

export default function ExerciseShowcase() {
  return (
    <section>
      <div className="split-section">
        <RevealOnScroll as="div" className="split-text">
          <span className="eyebrow"><span className="dot" />Produto real</span>
          <h2>Resolve exercícios reais com explicação estratégica</h2>
          <p>Cada exercício vem com a resposta certa e o porquê, para fixares a lógica e não só a resposta.</p>
          <ul>
            <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>Explicação passo a passo em cada questão</li>
            <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>Exercícios organizados por matéria e tema</li>
          </ul>
        </RevealOnScroll>

        <RevealOnScroll as="div" delay={1} className="split-media">
          <div className="mockup-wrap">
            <div className="mockup-card">
              <div className="mockup-bar"><span /><span /><span /></div>
              <div className="mockup-title">Matemática · Exame Nacional</div>
              <div className="q-stem">Numa PA em que o primeiro termo é 3 e a razão é 4, qual é o 10º termo?</div>
              <div className="q-option"><span className="radio" />33</div>
              <div className="q-option correct"><span className="radio" />39</div>
              <div className="q-option"><span className="radio" />43</div>
              <div className="explain-box"><b>Porquê:</b> aₙ = a₁ + (n−1)·r → 3 + 9×4 = 39.</div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
