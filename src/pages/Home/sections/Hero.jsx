import { Link } from 'react-router-dom';
import RevealOnScroll from '../../../components/RevealOnScroll';

export default function Hero() {
  return (
    <>
      <section className="hero">
        <RevealOnScroll as="div" className="hero-text">
          <span className="eyebrow"><span className="dot" />Feito para estudantes de Moçambique</span>
          <h1>Vai <span className="accent">marrar</span><br />com confiança.</h1>
          <p className="lead">Matérias, exercícios e explicação para os exames de admissão e nacional, tudo num único lugar.</p>
          <div className="hero-cta">
            <Link className="btn-primary large" to="/login">Criar conta grátis</Link>
            <Link className="btn-ghost large" to="/login">Já tenho conta</Link>
          </div>
          <div className="trust-row">
            <div className="avatars">
              <span style={{ background: '#D6342C' }}>A</span>
              <span style={{ background: '#F0A438' }}>B</span>
              <span style={{ background: '#1E9E5A' }}>C</span>
            </div>
            Estudantes já estão a marrar todos os dias
          </div>
        </RevealOnScroll>

        <RevealOnScroll as="div" delay={2} className="hero-illustration">
          <div className="illustration-frame">
            <svg viewBox="0 0 420 420" fill="none">
              <circle cx="210" cy="210" r="190" fill="var(--bg-soft)" />
              <g opacity="0.5" stroke="var(--gold)" strokeWidth="1.2">
                <circle cx="210" cy="210" r="150" />
                <circle cx="210" cy="210" r="112" />
                <circle cx="210" cy="210" r="74" />
              </g>

              <path
                className="draw-path"
                d="M55 330 C 110 330, 100 250, 160 240 C 220 230, 210 160, 270 150 C 320 142, 320 95, 360 75"
                stroke="var(--accent)"
                strokeWidth="5"
                strokeLinecap="round"
              />

              <circle className="pulse-node" cx="55" cy="330" r="9" fill="var(--accent)" />
              <circle className="pulse-node" cx="160" cy="240" r="9" fill="var(--gold)" />
              <circle className="pulse-node" cx="270" cy="150" r="9" fill="var(--green)" />

              <g className="float" transform="translate(30,255)">
                <rect x="0" y="0" width="46" height="34" rx="6" fill="#fff" stroke="var(--border)" strokeWidth="1.5" />
                <rect x="7" y="9" width="32" height="4" rx="2" fill="var(--accent-tint)" />
                <rect x="7" y="17" width="20" height="4" rx="2" fill="var(--accent-tint)" />
              </g>

              <g className="float-rev" transform="translate(130,175)">
                <path d="M0 20 L20 0 L40 20 L20 40 Z" fill="var(--gold-tint)" stroke="var(--gold)" strokeWidth="1.5" />
                <path d="M14 20l4 4 8-8" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </g>

              <g className="float-slow" transform="translate(300,190)">
                <circle cx="20" cy="20" r="20" fill="var(--green-tint)" stroke="var(--green)" strokeWidth="1.5" />
                <path d="M12 20l5.5 6L28 14" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </g>

              <g className="float" transform="translate(330,50)">
                <path d="M20 0 L40 12 L20 24 L0 12 Z" fill="var(--accent)" />
                <path d="M8 16v10c0 3 5.4 6 12 6s12-3 12-6V16" stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
            </svg>
          </div>
        </RevealOnScroll>
      </section>

      <RevealOnScroll as="div" className="badges-strip">
        <div className="badge">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          Exercícios avaliados por universidades
        </div>
        <div className="badge">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          Explicação para admissão e exame nacional
        </div>
        <div className="badge">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          Conteúdo actualizado sempre
        </div>
      </RevealOnScroll>
    </>
  );
}
