// /api/duvidas.js
// Endpoint: POST /api/duvidas
//
// Migrado de Gemini para Groq. A Groq usa uma API compatível com o formato
// da OpenAI (chat.completions), por isso a forma do pedido/resposta muda,
// mas o contrato com o frontend (Duvidas.jsx) mantém-se: recebe
// { pergunta, historico, contexto } e devolve { texto } ou { erro }.

// Modelo a usar. A Groq actualiza a lista com frequência e descontinua
// modelos (ex: llama-3.3-70b-versatile já foi descontinuado) — confirma
// sempre em https://console.groq.com/docs/models antes de assumir que
// este ainda é válido.
const MODELO = "openai/gpt-oss-120b";

async function chamarGroq(instrucaoSistema, messages, apiKey, tentativas = 3) {
  const url = "https://api.groq.com/openai/v1/chat/completions";

  let ultimaResposta = null;
  let ultimoErro = null;

  for (let i = 0; i < tentativas; i++) {
    const controller = new AbortController();
    // Timeout de 20s por tentativa: evita que o pedido fique pendurado
    // indefinidamente se a Groq estiver lenta a responder.
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const resposta = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODELO,
          messages: [{ role: "system", content: instrucaoSistema }, ...messages],
          // O gpt-oss-120b é um modelo de "raciocínio": por padrão gasta uma
          // boa quantidade de tokens a "pensar" antes de responder (nível
          // "medium"). Para um chat de dúvidas do liceu isso é desnecessário
          // e no plano gratuito da Groq esgota rápido o limite de tokens/min
          // (8.000 TPM neste modelo) — muitas vezes numa única mensagem.
          // "low" corta drasticamente esse consumo escondido.
          reasoning_effort: "low",
          max_tokens: 800,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (resposta.ok) return resposta;

      ultimaResposta = resposta;

      // Só faz retry em erros temporários (503 = indisponível, 429 = rate limit)
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
      console.warn(`Groq indisponível/lenta (tentativa ${i + 1}/${tentativas}), a aguardar ${espera}ms...`);
      await new Promise((r) => setTimeout(r, espera));
    }
  }

  if (ultimaResposta) return ultimaResposta;

  // Todas as tentativas falharam por timeout/erro de rede, nunca chegou a haver resposta HTTP
  throw ultimoErro || new Error("Falha desconhecida ao contactar a Groq.");
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

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ erro: "GROQ_API_KEY não configurada no servidor." });
  }

  // 3. Construção da Instrução do Sistema
  const instrucaoSistema = [
    "És o assistente de estudo do Marrar, uma plataforma moçambicana de preparação para exames.",
    "Respondes sempre em português de Moçambique, de forma curta, clara e directa — como um explicador paciente, nunca condescendente.",
    "O teu foco é ajudar o estudante a perceber a matéria escolar (exame de admissão e exame nacional).",
    "Formata a resposta em Markdown simples: usa ## para títulos de secção, texto normal para parágrafos, e listas com - ou 1. quando fizer sentido.",
    "Usa uma citação em bloco (linha começada por '> ') para destacar UMA fórmula-chave, definição ou resumo importante — no máximo uma ou duas por resposta, não abuses.",
    "Para matemática usa APENAS $...$ para fórmulas dentro do texto e $$...$$ para fórmulas em bloco. Nunca uses \\[ \\], \\( \\) ou outros delimitadores LaTeX.",
    "Não uses tabelas nem blocos de código a não ser que a pergunta seja mesmo sobre programação.",
    contexto?.aulaTitulo && contexto?.materiaNome
      ? `O estudante está a ver a aula "${contexto.aulaTitulo}" de ${contexto.materiaNome}. Usa isso como contexto se fizer sentido.`
      : null,
  ].filter(Boolean).join(" ");

  // 4. Sanitização do Histórico
  // A Groq (à semelhança da OpenAI) usa "assistant" em vez de "model" para
  // as respostas da IA, e não exige alternância estrita como a Gemini —
  // mesmo assim mantemos a limpeza para não enviar entradas malformadas.
  const historicoValido = Array.isArray(historico) ? historico : [];
  const historicoLimpo = historicoValido
    .filter((m) => m && typeof m.texto === "string" && (m.role === "user" || m.role === "model"))
    .map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.texto,
    }));

  // 5. Construção final das mensagens
  const messages = [
    ...historicoLimpo,
    { role: "user", content: pergunta },
  ];

  try {
    const resposta = await chamarGroq(instrucaoSistema, messages, apiKey);

    if (!resposta.ok) {
      const detalhe = await resposta.text();
      console.error("Groq API error:", resposta.status, detalhe);

      let mensagemGroq = null;
      try {
        const json = JSON.parse(detalhe);
        mensagemGroq = json?.error?.message || null;
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
        erroUtilizador = `Pedido inválido enviado à IA${mensagemGroq ? `: ${mensagemGroq}` : "."}`;
      } else if (resposta.status === 401 || resposta.status === 403) {
        erroUtilizador = `Acesso negado pela IA${mensagemGroq ? `: ${mensagemGroq}` : " (verifica a chave de API)."}`;
      } else {
        erroUtilizador = `Falha ao contactar a IA (código ${resposta.status})${mensagemGroq ? `: ${mensagemGroq}` : "."}`;
      }

      return res.status(502).json({ erro: erroUtilizador });
    }

    const dados = await resposta.json();
    const texto =
      dados?.choices?.[0]?.message?.content ||
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
