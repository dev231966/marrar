// /api/orientacao.js
// POST /api/orientacao  { interesses: string[], disciplinasFortes: string[], estilo: string }
// -> { sugestoes: [{ curso, porque }], origem: "ia" | "regras" }
//
// A IA entra para dar sugestões mais ricas e personalizadas; se falhar (sem
// chave, rede em baixo, resposta inválida), cai para uma árvore de decisão
// simples e determinística — o estudante nunca fica sem resposta.

const MODELO = "openai/gpt-oss-120b";

const REGRAS = [
  { disciplinas: ["matematica", "fisica"], interesses: ["tecnologia"], curso: "Engenharia Informática", porque: "Forte em Matemática e Física, com gosto por tecnologia — base directa para Engenharia Informática." },
  { disciplinas: ["matematica", "fisica"], interesses: ["construir"], curso: "Engenharia Civil", porque: "Boa base em Matemática e Física associada ao gosto por construir e planear estruturas." },
  { disciplinas: ["quimica", "fisica"], interesses: ["tecnologia", "construir"], curso: "Engenharia Química / Mecânica", porque: "Boas notas em Química e Física combinam com processos industriais e mecânica." },
  { disciplinas: ["biologia", "quimica"], interesses: ["ajudar", "saude"], curso: "Medicina", porque: "Forte em Biologia e Química, com vontade de ajudar pessoas — perfil típico de Medicina." },
  { disciplinas: ["biologia"], interesses: ["natureza", "saude"], curso: "Enfermagem", porque: "Interesse em Biologia e em cuidar de pessoas encaixa bem em Enfermagem." },
  { disciplinas: ["biologia"], interesses: ["natureza"], curso: "Agronomia / Ciências Ambientais", porque: "Boa relação com Biologia e interesse pela natureza apontam para Agronomia ou Ciências Ambientais." },
  { disciplinas: ["matematica"], interesses: ["dinheiro", "negocios"], curso: "Economia / Gestão", porque: "Boa relação com números e interesse em negócios apontam para Economia ou Gestão." },
  { disciplinas: [], interesses: ["escrever", "pessoas"], curso: "Direito", porque: "Gosto por argumentar, escrever e lidar com pessoas encaixa bem em Direito." },
  { disciplinas: [], interesses: ["ensinar", "pessoas"], curso: "Ciências da Educação", porque: "Perfil comunicativo com vontade de ensinar — bom encaixe para a área da Educação." },
  { disciplinas: ["matematica"], interesses: ["tecnologia", "dados"], curso: "Estatística / Ciência de Dados", porque: "Boa base em Matemática com interesse em tecnologia e dados." },
];

const FALLBACK_GENERICO = [
  { curso: "Gestão de Empresas", porque: "Curso versátil que combina bem com perfis com interesses variados." },
  { curso: "Ciências da Computação", porque: "Área em crescimento com boas saídas profissionais, vale a pena explorar." },
];

function sugerirComRegras(disciplinasFortes = [], interesses = []) {
  const pontuadas = REGRAS.map((r) => {
    const pontosDisc = r.disciplinas.filter((d) => disciplinasFortes.includes(d)).length;
    const pontosInt = r.interesses.filter((i) => interesses.includes(i)).length;
    return { ...r, pontos: pontosDisc * 2 + pontosInt };
  }).filter((r) => r.pontos > 0);

  pontuadas.sort((a, b) => b.pontos - a.pontos);
  const top = pontuadas.slice(0, 3).map(({ curso, porque }) => ({ curso, porque }));

  return top.length > 0 ? top : FALLBACK_GENERICO;
}

async function sugerirComIA(disciplinasFortes, interesses, estilo, apiKey) {
  const instrucao = [
    "És um orientador vocacional para estudantes moçambicanos do ensino secundário.",
    `Disciplinas fortes: ${disciplinasFortes.join(", ") || "não indicadas"}.`,
    `Interesses: ${interesses.join(", ") || "não indicados"}.`,
    estilo ? `Estilo de trabalho preferido: ${estilo}.` : "",
    "Sugere exactamente 3 cursos universitários compatíveis, existentes em universidades moçambicanas.",
    "Responde APENAS com JSON válido, sem texto à volta, no formato:",
    `{"sugestoes": [{"curso": "...", "porque": "..."}]}`,
    "O campo \"porque\" tem no máximo 2 frases curtas, directas, em português de Moçambique.",
  ].filter(Boolean).join(" ");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODELO,
        messages: [{ role: "user", content: instrucao }],
        reasoning_effort: "low",
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!resp.ok) return null;

    const dados = await resp.json();
    const parsed = JSON.parse(dados?.choices?.[0]?.message?.content || "{}");
    const sugestoes = Array.isArray(parsed.sugestoes) ? parsed.sugestoes : null;
    if (!sugestoes || sugestoes.length === 0) return null;

    return sugestoes
      .filter((s) => s?.curso && s?.porque)
      .slice(0, 3);
  } catch (e) {
    clearTimeout(timeoutId);
    console.error("Falha a gerar orientação vocacional com IA:", e.message);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { interesses = [], disciplinasFortes = [], estilo = "" } = req.body || {};

  if (!Array.isArray(interesses) || !Array.isArray(disciplinasFortes)) {
    return res.status(400).json({ erro: "Formato inválido para interesses/disciplinasFortes." });
  }

  const apiKey = process.env.GROQ_API_KEY;
  const sugestoesIA = apiKey ? await sugerirComIA(disciplinasFortes, interesses, estilo, apiKey) : null;

  if (sugestoesIA) {
    return res.status(200).json({ sugestoes: sugestoesIA, origem: "ia" });
  }

  // IA indisponível ou sem chave configurada: árvore de decisão local,
  // determinística, garante sempre uma resposta útil.
  return res.status(200).json({ sugestoes: sugerirComRegras(disciplinasFortes, interesses), origem: "regras" });
}
