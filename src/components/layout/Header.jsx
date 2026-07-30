import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Logo';
import MobileMenu from './MobileMenu';
import { useLangSwitch } from '../../hooks/useLangSwitch';
import './Header.css';

const NAV_LINKS = [
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#materias', label: 'Matérias' },
  { href: '#planos', label: 'Planos' },
  { href: '#explicacao', label: 'Explicação' },
  { href: '#faqs', label: 'FAQ' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { lang, setLang } = useLangSwitch();
  const langSwitchRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (langSwitchRef.current && !langSwitchRef.current.contains(event.target)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <>
      <header className="site">
        <div className="header-inner">
          <Logo />

          <nav className="nav-desktop">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
          </nav>

          <div className="header-actions">
            <div className={`lang-switch ${langMenuOpen ? 'open' : ''}`} ref={langSwitchRef}>
              <button
                type="button"
                className="lang-switch-trigger"
                onClick={() => setLangMenuOpen((v) => !v)}
              >
                <span>{lang}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              <div className="lang-menu">
                <button className={lang === 'PT' ? 'selected' : ''} onClick={() => { setLang('PT'); setLangMenuOpen(false); }}>Português (MZ)</button>
                <button className={lang === 'EN' ? 'selected' : ''} onClick={() => { setLang('EN'); setLangMenuOpen(false); }}>English</button>
              </div>
            </div>

            <Link className="btn-ghost" to="/login">Entrar</Link>
            <Link className="btn-primary" to="/login">Criar conta</Link>

            <button className="menu-btn" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={NAV_LINKS}
        lang={lang}
        setLang={setLang}
      />
    </>
  );
}
