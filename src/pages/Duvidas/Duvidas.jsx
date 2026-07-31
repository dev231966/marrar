import { useLocation, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import Math from "../../components/Math";
import "./Duvidas.css";

// Divide o texto em pedaços normais e blocos LaTeX ($...$ ou $$...$$)
// para renderizar fórmulas dentro da resposta da IA sem quebrar o resto do texto.
function renderComLatex(texto) {
  const partes = texto.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
  return partes.map((parte, i) => {
    if (parte.startsWith("$$") && parte.endsWith("$$")) {
      return <Math key={i} tex={parte.slice(2, -2)} display />;
    }
    if (parte.startsWith("$") && parte.endsWith("$")) {
      return <Math key={i} tex={parte.slice(1, -1)} display={false} />;
    }
    return <span key={i}>{parte}</span>;
  });
}

export default function Duvidas() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const context = state?.context;

  const [mensagens, setMensagens] = useState([]); // { role: "user"|"model", texto }
  const [input, setInput] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const bottomRef = useRef(null);

  async function enviar(textoForcado) {
    const pergunta = (textoForcado ?? input).trim();
    if (!pergunta || carregando) return;

    const novoHistorico = [...mensagens, { role: "user", texto: pergunta }];
    setMensagens(novoHistorico);
    setInput("");
    setErro(null);
    setCarregando(true);

    try {
      const resp = await fetch("/api/duvidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pergunta,
          historico: mensagens,
          contexto: context,
        }),
      });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || "Falha na resposta");

      setMensagens((atual) => [...atual, { role: "model", texto: dados.texto }]);
    } catch (e) {
      setErro("Não consegui responder agora. Tenta outra vez.");
    } finally {
      setCarregando(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  const chipsIniciais = context?.aulaTitulo
    ? [`Explica ${context.aulaTitulo} de forma simples`, "Dá-me um exemplo", "Porque é que isto é importante?"]
    : ["Como estudo melhor para o exame?", "Explica uma matéria à tua escolha"];

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

      {mensagens.length === 0 ? (
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
          <h1>
            {context?.aulaTitulo
              ? <>Tens uma dúvida sobre <b>{context.aulaTitulo}</b>?</>
              : "Em que posso ajudar-te a estudar hoje?"}
          </h1>
          <div className="duv-chips">
            {chipsIniciais.map((c) => (
              <button key={c} className="duv-chip" onClick={() => enviar(c)}>{c}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="duv-thread">
          {mensagens.map((m, i) => (
            <div key={i} className={`duv-msg ${m.role}`}>
              <div className="duv-bubble">{renderComLatex(m.texto)}</div>
            </div>
          ))}
          {carregando && (
            <div className="duv-msg model">
              <div className="duv-bubble duv-typing"><span></span><span></span><span></span></div>
            </div>
          )}
          {erro && <p className="duv-error">{erro}</p>}
          <div ref={bottomRef} />
        </div>
      )}

      <form className="duv-input-row" onSubmit={(e) => { e.preventDefault(); enviar(); }}>
        <input
          type="text"
          placeholder="Escreve a tua dúvida..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="duv-send" type="submit" disabled={carregando || !input.trim()} aria-label="Enviar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
