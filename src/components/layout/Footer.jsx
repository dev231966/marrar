import Logo from '../Logo';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site">
      <div className="footer-inner">
        <div className="footer-top">
          <Logo />
          <div className="footer-links">
            <a href="#como-funciona">Como funciona</a>
            <a href="#materias">Matérias</a>
            <a href="#planos">Planos</a>
            <a href="#explicacao">Explicação</a>
            <a href="#faqs">FAQ</a>
            <a href="#">Termos</a>
            <a href="#">Privacidade</a>
          </div>
          <div className="footer-social">
            <a href="#" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" /></svg>
            </a>
            <a href="#" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8"><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" /></svg>
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Marrar. Feito em Moçambique.</span>
        </div>
      </div>
    </footer>
  );
}
