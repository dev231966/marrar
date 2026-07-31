import { useLocation, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import Mathmarrar from "../../components/Mathmarrar";
import "./Duvidas.css";

// Divide o texto em pedaços normais, blocos LaTeX ($...$ ou $$...$$)
// e negrito (**texto**), renderizando cada um com o componente certo,
// para destacar fórmulas e termos importantes na resposta da IA.
function renderConteudo(texto) {
  const partes = texto.split(/(\$\$[^$]+\$\$|\$[^$]+\$|\*\*[^*]+\*\*)/g);
  return partes.map((parte, i) => {
    if (parte.startsWith("$$") && parte.endsWith("$$")) {
      return <Mathmarrar key={i} tex={parte.slice(2, -2)} display />;
    }
    if (parte.startsWith("$") && parte.endsWith("$")) {
      return <Mathmarrar key={i} tex={parte.slice(1, -1)} display={false} />;
    }
    if (parte.startsWith("**") && parte.endsWith("**")) {
      return (
        <strong key={i} className="duv-highlight">
          {parte.slice(2, -2)}
        </strong>
      );
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

    const historicoAnterior = mensagens;
    const novoHistorico = [...mensagens, { role: "user", texto: pergunta }];
    setMensagens(novoHistorico);
    setInput("");
    setErro(null);
    setCarregando(true);

    // Timeout de 25s: o backend já tem o seu próprio timeout de ~20s por
    // tentativa Gemini, este é uma rede de segurança para o pedido nunca
    // ficar "parado" indefinidamente do lado do browser.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const resp = await fetch("/api/duvidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pergunta,
          historico: historicoAnterior,
          contexto: context,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let dados = null;
      try {
        dados = await resp.json();
      } catch {
        // resposta não veio em JSON (ex: erro 500 sem corpo, etc.)
      }

      if (!resp.ok) {
        const motivo = dados?.erro || `O servidor respondeu com o código ${resp.status}.`;
        throw new Error(motivo);
      }

      if (!dados?.texto) {
        throw new Error("A resposta da IA veio vazia.");
      }

      setMensagens((atual) => [...atual, { role: "model", texto: dados.texto }]);
    } catch (e) {
      clearTimeout(timeoutId);

      // Remove a pergunta do utilizador que ficou sem resposta, para não deixar
      // uma mensagem "pendurada" no histórico sem indicação do que aconteceu.
      setMensagens((atual) => atual.filter((m) => m !== novoHistorico[novoHistorico.length - 1]));

      let mensagemErro;
      if (e?.name === "AbortError") {
        mensagemErro = "A resposta está a demorar demasiado. Tenta novamente.";
      } else if (e?.message === "Failed to fetch") {
        mensagemErro = "Não consegui ligar ao servidor. Verifica a tua ligação à internet.";
      } else {
        mensagemErro = e?.message || "Não consegui responder agora. Tenta outra vez.";
      }

      setErro(mensagemErro);
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
          {erro && <p className="duv-error">{erro}</p>}
        </div>
      ) : (
        <div className="duv-thread">
          {mensagens.map((m, i) => (
            <div key={i} className={`duv-msg ${m.role}`}>
              <div className="duv-bubble">{renderConteudo(m.texto)}</div>
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
