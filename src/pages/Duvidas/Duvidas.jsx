import { useLocation, useNavigate } from "react-router-dom";
import "./Duvidas.css";

export default function Duvidas() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const context = state?.context;

  return (
    <div className="duv-page">
      <header className="duv-header">
        <button className="duv-back" aria-label="Voltar" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span>Dúvidas</span>
      </header>

      <div className="duv-empty">
        <div className="duv-ghost">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2.5C8.13 2.5 5 5.63 5 9.5v10.3c0 .4.46.62.77.36l1.28-1.07a.75.75 0 01.95 0l1.28 1.07c.28.24.7.24.98 0l1.28-1.07a.75.75 0 01.95 0l1.28 1.07c.28.24.7.24.98 0l1.28-1.07a.75.75 0 01.95 0l1.28 1.07c.31.26.77.04.77-.36V9.5c0-3.87-3.13-7-7-7z"
              fill="#fff"
            />
            <ellipse cx="9.3" cy="10.5" rx="1" ry="1.3" fill="var(--accent)" />
            <ellipse cx="14.7" cy="10.5" rx="1" ry="1.3" fill="var(--accent)" />
          </svg>
        </div>
        <span className="duv-tag">Área em criação</span>
        <h1>Estamos a treinar o teu explicador pessoal</h1>
        <p>
          Em breve vais poder tirar dúvidas aqui a qualquer hora, sobre qualquer aula.
          {context?.aulaTitulo && (
            <> Assim que estiver pronto, já sabemos que vinhas de <b>{context.aulaTitulo}</b> ({context.materiaNome}).</>
          )}
        </p>
      </div>
    </div>
  );
}
