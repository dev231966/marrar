// /api/duvidas.js
// Endpoint: POST /api/duvidas

async function chamarGemini(instrucaoSistema, contents, apiKey, tentativas = 3) {
  const modelo = "gemini-3.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`;

  let ultimaResposta = null;
  let ultimoErro = null;

  for (let i = 0; i < tentativas; i++) {
    const controller = new AbortController();
    // Timeout de 20s por tentativa: evita que o pedido fique pendurado
    // indefinidamente se a Gemini estiver lenta a responder.
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const resposta = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: instrucaoSistema }] },
          contents,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (resposta.ok) return resposta;

      ultimaResposta = resposta;

      // Só faz retry em erros temporários (503 = sobrecarga, 429 = rate limit)
      if (resposta.status !== 503 && resposta.status !== 429) {
        return resposta; // erro definitivo (404, 400, etc) — não adianta tentar de novo
      }
    } catch (err) {
      clearTimeout(timeoutId);
      ultimoErro = err;
      // erro de rede ou timeout: vale a pena tentar de novo dentro do limite de tentativas
    }

    // espera crescente: 1s, 2s, 4s (só entre tentativas, não depois da última)
    if (i < tentativas - 1) {
      const espera = 1000 * Math.pow(2, i);
      console.warn(`Gemini indisponível/lenta (tentativa ${i + 1}/${tentativas}), a aguardar ${espera}ms...`);
      await new Promise((r) => setTimeout(r, espera));
    }
  }

  if (ultimaResposta) return ultimaResposta;

  // Todas as tentativas falharam por timeout/erro de rede, nunca chegou a haver resposta HTTP
  throw ultimoErro || new Error("Falha desconhecida ao contactar a Gemini.");
}

export default async function handler(req, res) {
  // 1. Validação do Método
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { pergunta, historico = [], contexto } = req.body || {};

  // 2. Validação da Pergunta
  if (!pergunta || typeof pergunta !== "string" || !pergunta.trim()) {
    return res.status(400).json({ erro: "Falta a pergunta ou formato inválido." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ erro: "GEMINI_API_KEY não configurada no servidor." });
  }

  // 3. Construção da Instrução do Sistema
  const instrucaoSistema = [
    "És o assistente de estudo do Marrar, uma plataforma moçambicana de preparação para exames.",
    "Respondes sempre em português de Moçambique, de forma curta, clara e directa — como um explicador paciente, nunca condescendente.",
    "O teu foco é ajudar o estudante a perceber a matéria escolar (exame de admissão e exame nacional).",
    "Se a matemática precisar de fórmulas, escreve-as em LaTeX entre $...$ ou $$...$$.",
    contexto?.aulaTitulo && contexto?.materiaNome
      ? `O estudante está a ver a aula "${contexto.aulaTitulo}" de ${contexto.materiaNome}. Usa isso como contexto se fizer sentido.`
      : null,
  ].filter(Boolean).join(" ");

  // 4. Sanitização e Validação do Histórico (Alternância Estrita)
  const historicoValido = Array.isArray(historico) ? historico : [];
  const historicoLimpo = [];
  let ultimaRole = null;

  for (const m of historicoValido) {
    const roleCorrente = m.role === "user" ? "user" : "model";
    // Evita duas mensagens seguidas do mesmo role (obrigatório para o Gemini)
    if (roleCorrente !== ultimaRole && m.texto && typeof m.texto === "string") {
      historicoLimpo.push({
        role: roleCorrente,
        parts: [{ text: m.texto }],
      });
      ultimaRole = roleCorrente;
    }
  }

  // Se a última mensagem do histórico for "user", removemos,
  // pois a nova pergunta também será "user" (evitando erro 400).
  if (historicoLimpo.length > 0 && historicoLimpo[historicoLimpo.length - 1].role === "user") {
    historicoLimpo.pop();
  }

  // 5. Construção final dos Conteúdos
  const contents = [
    ...historicoLimpo,
    { role: "user", parts: [{ text: pergunta }] },
  ];

  try {
    const resposta = await chamarGemini(instrucaoSistema, contents, apiKey);

    if (!resposta.ok) {
      const detalhe = await resposta.text();
      console.error("Gemini API error:", resposta.status, detalhe);

      let mensagemGemini = null;
      try {
        const json = JSON.parse(detalhe);
        mensagemGemini = json?.error?.message || null;
      } catch {
        // detalhe não era JSON, ignora
      }

      let erroUtilizador;
      if (resposta.status === 503) {
        erroUtilizador = "O assistente está sobrecarregado neste momento. Tenta novamente daqui a pouco.";
      } else if (resposta.status === 429) {
        erroUtilizador = "Limite de pedidos à IA atingido neste momento. Tenta novamente dentro de alguns minutos.";
      } else if (resposta.status === 404) {
        erroUtilizador = "O modelo de IA configurado não foi encontrado (erro de configuração no servidor).";
      } else if (resposta.status === 400) {
        erroUtilizador = `Pedido inválido enviado à IA${mensagemGemini ? `: ${mensagemGemini}` : "."}`;
      } else if (resposta.status === 403) {
        erroUtilizador = `Acesso negado pela IA${mensagemGemini ? `: ${mensagemGemini}` : " (verifica a chave de API)."}`;
      } else {
        erroUtilizador = `Falha ao contactar a IA (código ${resposta.status})${mensagemGemini ? `: ${mensagemGemini}` : "."}`;
      }

      return res.status(502).json({ erro: erroUtilizador });
    }

    const dados = await resposta.json();
    const texto =
      dados?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Não consegui responder a isso. Tenta reformular a pergunta.";

    return res.status(200).json({ texto });
  } catch (err) {
    console.error("Erro no processamento:", err);
    const mensagem =
      err.name === "AbortError"
        ? "A IA demorou demasiado tempo a responder. Tenta novamente."
        : `Erro interno no servidor: ${err.message}`;
    return res.status(504).json({ erro: mensagem });
  }
}
