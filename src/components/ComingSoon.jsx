import { useNavigate } from "react-router-dom";
import "./ComingSoon.css";

/**
 * Página genérica "em construção" — usada pelas secções do dashboard
 * que ainda não têm conteúdo próprio, para a navegação nunca rebentar
 * enquanto o resto é construído.
 *
 * Props:
 *  - titulo: nome da secção (ex: "Exercícios")
 *  - descricao: frase curta do que vai aparecer aqui
 *  - icon: elemento <svg>...</svg> (paths), já no viewBox 24x24
 */
export default function ComingSoon({ titulo, descricao, icon }) {
  const navigate = useNavigate();

  return (
    <div className="cs-page">
      <header className="cs-header">
        <button className="cs-back" aria-label="Voltar" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span>{titulo}</span>
      </header>

      <div className="cs-empty">
        <div className="cs-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {icon}
          </svg>
        </div>
        <span className="cs-tag">Área em criação</span>
        <h1>{titulo}</h1>
        <p>{descricao}</p>
      </div>
    </div>
  );
}
