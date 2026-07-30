import { Link } from 'react-router-dom';
import RevealOnScroll from '../../../components/RevealOnScroll';

export default function CTABanner() {
  return (
    <section>
      <RevealOnScroll as="div" className="cta-banner">
        <div className="glow" />
        <h2>Pronto para marrar?</h2>
        <p>Cria a tua conta e começa a estudar hoje, de graça.</p>
        <Link className="btn-primary large" to="/login" style={{ display: 'inline-flex' }}>Criar conta grátis</Link>
      </RevealOnScroll>
    </section>
  );
}
