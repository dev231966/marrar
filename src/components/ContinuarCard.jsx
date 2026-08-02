import './ContinuarCard.css';

/**
 * Cartão "continuar de onde paraste" — extraído de Explicação (secção
 * "Continuar de onde paraste") para ser reaproveitado noutros sítios que
 * também têm progresso a retomar, como o chat de Dúvidas com a IA.
 *
 * items: [{ key, titulo, subtitulo, onClick }]
 */
export default function ContinuarCard({ titulo = 'Continuar de onde paraste', items = [] }) {
  if (!items.length) return null;

  return (
    <section className="continuar-secao">
      <h2>{titulo}</h2>
      <div className="continuar-lista">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className="continuar-linha"
            onClick={item.onClick}
          >
            <div className="t">{item.titulo}</div>
            {item.subtitulo && <div className="s">{item.subtitulo}</div>}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ))}
      </div>
    </section>
  );
}
