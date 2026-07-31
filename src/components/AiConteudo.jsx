import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "./AiConteudo.css";

// Renderiza markdown vindo da IA (títulos, parágrafos, listas, negrito,
// matemática em LaTeX) de forma consistente em qualquer parte do site.
// As citações em bloco ("> texto") do markdown viram "cards de destaque".
//
// Uso: <AiConteudo texto={mensagem} />
export default function AiConteudo({ texto }) {
  if (!texto) return null;

  return (
    <div className="ai-conteudo">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ node, ...props }) => <h2 className="ai-titulo" {...props} />,
          h2: ({ node, ...props }) => <h3 className="ai-titulo" {...props} />,
          h3: ({ node, ...props }) => <h4 className="ai-subtitulo" {...props} />,
          p: ({ node, ...props }) => <p className="ai-paragrafo" {...props} />,
          ul: ({ node, ...props }) => <ul className="ai-lista" {...props} />,
          ol: ({ node, ...props }) => <ol className="ai-lista-num" {...props} />,
          li: ({ node, ...props }) => <li className="ai-item" {...props} />,
          strong: ({ node, ...props }) => <strong className="ai-negrito" {...props} />,
          hr: () => <hr className="ai-divisor" />,
          blockquote: ({ node, children, ...props }) => (
            <div className="ai-card-destaque" {...props}>
              <span className="ai-card-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l2.6 6.6L21 11l-6.4 2.4L12 20l-2.6-6.6L3 11l6.4-2.4L12 2z" />
                </svg>
              </span>
              <div className="ai-card-body">{children}</div>
            </div>
          ),
          code: ({ node, inline, children, ...props }) =>
            inline ? (
              <code className="ai-code-inline" {...props}>{children}</code>
            ) : (
              <pre className="ai-code-block"><code {...props}>{children}</code></pre>
            ),
        }}
      >
        {texto}
      </ReactMarkdown>
    </div>
  );
}
