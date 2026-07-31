import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Mascot.css";

/**
 * Fantasminha flutuante — atalho para a área de dúvidas (IA), nunca o chat
 * em si. Aparece com uma mensagem curta e personalizada; ao tocar, navega
 * para /duvidas levando o contexto actual (matéria/aula) para a IA já saber
 * de onde o estudante veio.
 *
 * Props:
 *  - message: texto do balão (opcional — sem mensagem, mostra só o botão)
 *  - context: { materiaId, materiaNome, temaId, aulaTitulo } passado para /duvidas
 */
export default function Mascot({ message, context }) {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  function goToDuvidas() {
    navigate("/dashboard/duvidas", { state: { context } });
  }

  return (
    <div className="mascot-wrap">
      {message && !dismissed && (
        <button className="mascot-bubble" onClick={goToDuvidas}>
          {message}
          <span
            className="mascot-bubble-close"
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
            }}
          >
            ×
          </span>
        </button>
      )}

      <button className="mascot-btn" aria-label="Perguntar à IA" onClick={goToDuvidas}>
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2.5C8.13 2.5 5 5.63 5 9.5v10.3c0 .4.46.62.77.36l1.28-1.07a.75.75 0 01.95 0l1.28 1.07c.28.24.7.24.98 0l1.28-1.07a.75.75 0 01.95 0l1.28 1.07c.28.24.7.24.98 0l1.28-1.07a.75.75 0 01.95 0l1.28 1.07c.31.26.77.04.77-.36V9.5c0-3.87-3.13-7-7-7z"
            fill="#fff"
          />
          <ellipse cx="9.3" cy="10.5" rx="1" ry="1.3" fill="var(--accent)" />
          <ellipse cx="14.7" cy="10.5" rx="1" ry="1.3" fill="var(--accent)" />
          <path d="M10.3 13.6c.5.5 1.7 1.4 3.4 0" stroke="var(--accent)" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
