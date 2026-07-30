import RevealOnScroll from '../../../components/RevealOnScroll';

const STEPS = [
  { title: 'Escolhe o teu exame', text: 'Admissão à universidade ou exame nacional. O Marrar organiza tudo à volta do que precisas.' },
  { title: 'Estuda por matéria ou tema', text: 'Todo o conteúdo relevante reunido, sem perder tempo a procurar em vários sítios.' },
  { title: 'Recebe explicação de qualidade', text: 'Aulas pensadas para o exame, directas ao que realmente é perguntado.' },
  { title: 'Pratica com exercícios avaliados', text: 'Exercícios revistos por especialistas de universidades, com correcção clara.' },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona">
      <RevealOnScroll as="div" className="section-head">
        <span className="eyebrow"><span className="dot" />Percurso</span>
        <h2>Como funciona o Marrar</h2>
        <p>Um caminho simples desde a primeira matéria até ao dia do exame.</p>
      </RevealOnScroll>

      <div className="timeline">
        {STEPS.map((step, index) => (
          <RevealOnScroll as="div" delay={index} key={step.title} className="t-step">
            <div className="t-node">{index + 1}</div>
            <div className="t-content">
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
