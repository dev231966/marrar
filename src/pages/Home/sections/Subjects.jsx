import RevealOnScroll from '../../../components/RevealOnScroll';

const STATS = [
  { num: 'Todas as matérias', label: 'Num único lugar, sempre organizadas' },
  { num: 'Milhares de exercícios', label: 'Avaliados por especialistas universitários' },
  { num: 'Explicação diária', label: 'Conteúdo novo para manter o ritmo de estudo' },
];

export default function Subjects() {
  return (
    <section id="materias">
      <RevealOnScroll as="div" className="section-head">
        <span className="eyebrow"><span className="dot" />Resultados</span>
        <h2>Estudo pensado para render</h2>
      </RevealOnScroll>

      <div className="stats">
        {STATS.map((stat, index) => (
          <RevealOnScroll as="div" delay={index} key={stat.num} className="stat-card">
            <div className="num">{stat.num}</div>
            <div className="lbl">{stat.label}</div>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
