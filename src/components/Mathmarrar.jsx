import katex from "katex";
import "katex/dist/katex.min.css";

// Uso: <Mathmarrar tex="a_n = a_1 + (n-1) \cdot r" />
// Requer: npm install katex
//
// Renomeado de "Math" para "Mathmarrar": o nome anterior fazia sombra ao
// objeto global `Math` (Math.PI, Math.random, etc.) em qualquer ficheiro
// que o importasse, o que é um risco real de bugs silenciosos.
export default function Mathmarrar({ tex, display = true }) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: display });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
