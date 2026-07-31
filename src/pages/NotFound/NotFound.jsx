import { Link } from 'react-router-dom';
import Logo from '../../components/Logo';
import RevealOnScroll from '../../components/RevealOnScroll';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="notfound-top">
        <Logo />
      </div>

      <RevealOnScroll as="div" className="notfound-content">
        <div className="notfound-illustration">
          <svg viewBox="0 0 320 320" fill="none">
            <circle cx="160" cy="160" r="150" fill="var(--bg-soft)" />
            <g opacity="0.5" stroke="var(--gold)" strokeWidth="1.2">
              <circle cx="160" cy="160" r="118" />
              <circle cx="160" cy="160" r="86" />
            </g>

            <g className="nf-float-slow" transform="translate(96,84)">
              <rect x="0" y="0" width="128" height="94" rx="14" fill="#fff" stroke="var(--border)" strokeWidth="2" />
              <path d="M0 20h128" stroke="var(--border)" strokeWidth="2" />
              <circle cx="16" cy="10" r="3" fill="var(--border)" />
              <circle cx="28" cy="10" r="3" fill="var(--border)" />
              <circle cx="40" cy="10" r="3" fill="var(--border)" />
              <text x="64" y="66" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="800" fontSize="34" fill="var(--accent)">404</text>
            </g>

            <g className="nf-float">
              <circle cx="232" cy="96" r="22" fill="var(--gold-tint)" stroke="var(--gold)" strokeWidth="1.5" />
              <path d="M224 96h16M232 88v16" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" transform="rotate(45 232 96)" />
            </g>

            <g className="nf-float-rev">
              <circle cx="80" cy="220" r="18" fill="var(--green-tint)" stroke="var(--green)" strokeWidth="1.5" />
              <path d="M73 220l5 5 9-10" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            <g className="nf-float">
              <path d="M244 214 L264 226 L244 238 L224 226 Z" fill="var(--accent)" opacity="0.9" />
            </g>
          </svg>
        </div>

        <h1>Página não encontrada</h1>
        <p>Parece que marraste o caminho errado. Esta página não existe ou foi movida.</p>

        <div className="notfound-actions">
          <Link className="btn-primary large" to="/">Voltar ao início</Link>
          <Link className="btn-ghost large" to="/login">Ir para o login</Link>
        </div>
      </RevealOnScroll>
    </div>
  );
}