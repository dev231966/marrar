import { useState } from 'react';
import Logo from '../Logo';
import DashboardSidebar from './DashboardSidebar';
import './DashboardHeader.css';

export default function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="dash-header">
        <div className="dash-inner">
          <Logo />

          <div className="dash-actions">
            <button className="icon-btn" aria-label="Notificações">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <span className="badge">3</span>
            </button>

            <button
              className={`icon-btn ${isMenuOpen ? 'active' : ''}`}
              aria-label="Abrir menu"
              onClick={() => setIsMenuOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <DashboardSidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}