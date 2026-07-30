import { Link } from 'react-router-dom';
import Logo from '../Logo';
import './MobileMenu.css';

export default function MobileMenu({ open, onClose, links, lang, setLang }) {
  return (
    <div className={`mobile-menu ${open ? 'open' : ''}`}>
      <div className="mobile-menu-top">
        <Logo />
        <button className="menu-btn" aria-label="Fechar menu" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>

      <nav>
        {links.map((link) => (
          <a key={link.href} href={link.href} onClick={onClose}>{link.label}</a>
        ))}
      </nav>

      <div className="mobile-menu-bottom">
        <div className="mobile-lang">
          <button className={lang === 'PT' ? 'selected' : ''} onClick={() => setLang('PT')}>Português</button>
          <button className={lang === 'EN' ? 'selected' : ''} onClick={() => setLang('EN')}>English</button>
        </div>
        <Link className="btn-ghost" to="/login" style={{ display: 'flex', justifyContent: 'center' }} onClick={onClose}>Entrar</Link>
        <Link className="btn-primary large" to="/login" style={{ justifyContent: 'center' }} onClick={onClose}>Criar conta grátis</Link>
      </div>
    </div>
  );
}
