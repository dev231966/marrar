import { Link } from 'react-router-dom';
import RevealOnScroll from '../../../components/RevealOnScroll';

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
);

export default function Plans() {
  return (
    <section id="planos">
      <RevealOnScroll as="div" className="section-head">
        <span className="eyebrow"><span className="dot" />Planos</span>
        <h2>Escolhe o plano certo para ti</h2>
        <p>Começa de graça. Passa para o Premium quando quiseres ir mais fundo.</p>
      </RevealOnScroll>

      <div className="plans">
        <RevealOnScroll as="div" className="plan-card">
          <div className="plan-name">Estudante</div>
          <div className="plan-price">0 MT<span>/sempre</span></div>
          <div className="plan-note">Para começar a marrar sem custos</div>
          <ul>
            <li><CheckIcon />Acesso às matérias base</li>
            <li><CheckIcon />Exercícios semanais limitados</li>
            <li><CheckIcon />Caderno de erros básico</li>
          </ul>
          <Link className="btn-ghost" to="/login" style={{ display: 'flex', justifyContent: 'center' }}>Criar conta grátis</Link>
        </RevealOnScroll>

        <RevealOnScroll as="div" delay={1} className="plan-card highlight">
          <span className="plan-popular">Mais popular</span>
          <div className="plan-name">Premium</div>
          <div className="plan-price">150 MT<span>/mês</span></div>
          <div className="plan-note">Para quem quer ir com tudo para o exame</div>
          <ul>
            <li><CheckIcon />Todas as matérias e exercícios</li>
            <li><CheckIcon />Explicação ilimitada</li>
            <li><CheckIcon />Nota prevista actualizada</li>
            <li><CheckIcon />Caderno de erros completo</li>
          </ul>
          <Link className="btn-primary" to="/login" style={{ justifyContent: 'center' }}>Assinar Premium</Link>
        </RevealOnScroll>
      </div>
    </section>
  );
}
