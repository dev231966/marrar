import katex from "katex";
import "katex/dist/katex.min.css";

// Uso: <Math tex="a_n = a_1 + (n-1) \cdot r" />
// Requer: npm install katex
export default function Math({ tex, display = true }) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: display });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
