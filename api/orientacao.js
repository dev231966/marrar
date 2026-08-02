// /api/orientacao.js
// POST /api/orientacao  { interesses, disciplinasFortes, estilo, confianca?, observacoes? }
//   -> { sugestoes, origem, guardado, id? }
//   Requer sessão (Authorization: Bearer <token>) para gravar no histórico.
//   Sem sessão, devolve o resultado na mesma mas não grava.
//
// GET /api/orientacao  (com Authorization: Bearer <token>)
//   -> { resultados: [{ id, respostas, sugestoes, origem, criadoEm }] }
//
// GET /api/orientacao?id=123
//   -> { resultado: { id, respostas, sugestoes, origem, criadoEm } }

import { getDb, ensureSchema } from "./_db.js";

const MODELO = "openai/gpt-oss-120b";
const LIMITE_HISTORICO = 20;

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

async function sugerirComIA(disciplinasFortes, interesses, estilo, confianca, observacoes, apiKey) {
  const instrucao = [
    "És um orientador vocacional experiente, especializado no sistema universitário de Moçambique.",
    `Disciplinas fortes do estudante: ${disciplinasFortes.join(", ") || "não indicadas"}.`,
    `Interesses: ${interesses.join(", ") || "não indicados"}.`,
    estilo ? `Estilo de trabalho preferido: ${estilo}.` : "",
    confianca ? `Confiança do estudante nas suas notas actuais (1-10): ${confianca}.` : "",
    observacoes ? `Observações adicionais do estudante: ${observacoes}` : "",
    "",
    "Sugere exactamente 3 cursos universitários, em ordem de aderência ao perfil (o primeiro é o mais alinhado).",
    "Para cada curso, classifica-o com um 'perfil': 'seguro' (encaixe directo e óbvio), 'alinhado' (bom encaixe, menos óbvio) ou 'ousado' (fora da zona de conforto mas com potencial real dado o perfil).",
    confianca ? "Usa a confiança indicada para calibrar: confiança baixa (1-4) pesa mais para 'seguro'; confiança alta (7-10) permite mais 'ousado'." : "",
    "Sempre que fizer sentido, refere universidades moçambicanas reais onde o curso existe (ex: UEM, UP, ISCTEM, A Politécnica, ISUTC, UCM).",
    "O campo 'porque' deve ligar explicitamente as disciplinas/interesses do estudante ao curso — nada de justificação genérica que sirva para qualquer estudante.",
    "O campo 'saidas' deve indicar 1-2 saídas profissionais concretas e realistas no contexto moçambicano.",
    "",
    "Responde APENAS com JSON válido, sem texto à volta, no formato:",
    `{"sugestoes": [{"curso": "...", "perfil": "seguro|alinhado|ousado", "porque": "...", "universidades": ["..."], "saidas": ["..."]}]}`,
    "Português de Moçambique, directo, sem floreios.",
  ].filter(Boolean).join(" ");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 18000);

  try {
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODELO,
        messages: [{ role: "user", content: instrucao }],
        reasoning_effort: "medium",
        max_tokens: 900,
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

    return sugestoes.filter((s) => s?.curso && s?.porque).slice(0, 3);
  } catch (e) {
    clearTimeout(timeoutId);
    console.error("Falha a gerar orientação vocacional com IA:", e.message);
    return null;
  }
}

// --- Auth: se já tiveres um helper igual noutro endpoint, usa esse em vez deste ---
function extrairToken(req) {
  const header = req.headers.authorization || "";
  const [tipo, token] = header.split(" ");
  return tipo === "Bearer" && token ? token : null;
}

async function obterUserPeloToken(db, token) {
  if (!token) return null;
  const resultado = await db.execute({
    sql: `SELECT u.id, u.nome, u.email
          FROM sessions s
          JOIN users u ON u.id = s.user_id
          WHERE s.token = ? AND s.expira_em > now()`,
    args: [token],
  });
  return resultado.rows[0] || null;
}
// -----------------------------------------------------------------------------

function linhaParaResultado(row) {
  return {
    id: row.id,
    respostas: JSON.parse(row.respostas_json),
    sugestoes: JSON.parse(row.sugestoes_json),
    origem: row.origem,
    criadoEm: row.criado_em,
  };
}

async function tratarGet(req, res, db, user) {
  if (!user) {
    return res.status(401).json({ erro: "Precisas de sessão activa para ver o histórico." });
  }

  const { id } = req.query || {};

  if (id) {
    const resultado = await db.execute({
      sql: "SELECT * FROM orientacao_resultados WHERE id = ? AND user_id = ?",
      args: [id, user.id],
    });
    const linha = resultado.rows[0];
    if (!linha) return res.status(404).json({ erro: "Resultado não encontrado." });
    return res.status(200).json({ resultado: linhaParaResultado(linha) });
  }

  const resultado = await db.execute({
    sql: `SELECT * FROM orientacao_resultados
          WHERE user_id = ?
          ORDER BY criado_em DESC
          LIMIT ?`,
    args: [user.id, LIMITE_HISTORICO],
  });

  return res.status(200).json({ resultados: resultado.rows.map(linhaParaResultado) });
}

async function tratarPost(req, res, db, user) {
  const { interesses = [], disciplinasFortes = [], estilo = "", confianca = null, observacoes = "" } = req.body || {};

  if (!Array.isArray(interesses) || !Array.isArray(disciplinasFortes)) {
    return res.status(400).json({ erro: "Formato inválido para interesses/disciplinasFortes." });
  }

  const apiKey = process.env.GROQ_API_KEY;
  const sugestoesIA = apiKey
    ? await sugerirComIA(disciplinasFortes, interesses, estilo, confianca, observacoes, apiKey)
    : null;

  const sugestoes = sugestoesIA || sugerirComRegras(disciplinasFortes, interesses);
  const origem = sugestoesIA ? "ia" : "regras";

  let guardado = false;
  let id = null;

  if (user) {
    try {
      const respostasParaGuardar = { disciplinasFortes, interesses, estilo, confianca, observacoes };
      const inserted = await db.execute({
        sql: `INSERT INTO orientacao_resultados (user_id, respostas_json, sugestoes_json, origem)
              VALUES (?, ?, ?, ?) RETURNING id`,
        args: [user.id, JSON.stringify(respostasParaGuardar), JSON.stringify(sugestoes), origem],
      });
      id = inserted.rows[0].id;
      guardado = true;
    } catch (e) {
      console.error("Falha a gravar resultado de orientação:", e.message);
    }
  }

  return res.status(200).json({ sugestoes, origem, guardado, id });
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  let db;
  try {
    await ensureSchema();
    db = getDb();
  } catch (e) {
    console.error("Erro de configuração da base de dados:", e);
    return res.status(500).json({ erro: "Base de dados não configurada no servidor." });
  }

  const token = extrairToken(req);

  try {
    const user = await obterUserPeloToken(db, token);
    if (req.method === "GET") return await tratarGet(req, res, db, user);
    return await tratarPost(req, res, db, user);
  } catch (e) {
    console.error("Erro em /api/orientacao:", e);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}