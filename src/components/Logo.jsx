import './Logo.css';

/**
 * Marca do Marrar. `showWordmark` controla se o texto "Marrar" aparece
 * ao lado do símbolo (útil para espaços mais apertados, ex: favicon-like usages).
 */
export default function Logo({ showWordmark = true, as: Tag = 'a', href = '/' }) {
  return (
    <Tag className="logo" href={href}>
      <span className="logo-mark">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M4 12L10 18L20 6" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {showWordmark && 'Marrar'}
    </Tag>
  );
}
