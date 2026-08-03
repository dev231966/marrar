// /api/exercicios.js
// GET  /api/exercicios?materiaId=matematica&nivel=todos&limite=5
//      -> { exercicios: [{ id, pergunta, opcoes, correta, explicacao, origem }] }
//      Nunca falha "a direito": se a base de dados ou a IA estiverem em
//      baixo, devolve uma lista vazia e o frontend cai para o banco local
//      já embutido no bundle (src/data/exerciciosData.js) — a página de
//      exercícios nunca fica sem conteúdo.
//
// POST /api/exercicios  { acao: "responder", ... }
//      Regista a resposta do estudante e, se errou, grava automaticamente
//      no Caderno de Erros (erros_guardados). Funciona tanto para
//      exercícios vindos do banco (id numérico) como do banco local
//      embutido no frontend (id tipo "mat-1").

import { autenticar, ensureSchema, getDb } from "./_db.js";

const MODELO = "openai/gpt-oss-120b";
const NIVEIS_VALIDOS = ["todos", "8-9", "10-11", "12", "admissao"];

function normalizarNivel(nivel) {
  return NIVEIS_VALIDOS.includes(nivel) ? nivel : "todos";
}

async function gerarComIA(materiaId, materiaNome, nivel, quantidade) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || quantidade <= 0) return [];

  const instrucao = [
    `Cria ${quantidade} exercícios de escolha múltipla de ${materiaNome || materiaId}`,
    nivel !== "todos" ? `para o nível "${nivel}" do ensino em Moçambique.` : "para o liceu em Moçambique.",
    "Responde APENAS com um array JSON válido, sem texto à volta, no formato:",
    `[{"pergunta": "...", "opcoes": ["...","...","...","..."], "correta": 0, "explicacao": "..."}]`,
    "\"correta\" é o índice (0 a 3) da opção certa em \"opcoes\". Para fórmulas usa apenas $...$.",
  ].join(" ");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODELO,
        messages: [{ role: "user", content: instrucao }],
        reasoning_effort: "low",
        max_tokens: 1200,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!resp.ok) return [];

    const dados = await resp.json();
    const texto = dados?.choices?.[0]?.message?.content || "";
    // O modelo por vezes envolve o array num objecto { "exercicios": [...] }
    // por causa do response_format=json_object exigir um objecto — cobrem-se os dois casos.
    const parsed = JSON.parse(texto);
    const lista = Array.isArray(parsed) ? parsed : (parsed.exercicios || parsed.exercicios_ || []);

    return lista
      .filter((e) => e?.pergunta && Array.isArray(e.opcoes) && e.opcoes.length >= 2 && typeof e.correta === "number")
      .slice(0, quantidade);
  } catch (e) {
    clearTimeout(timeoutId);
    console.error("Falha a gerar exercícios com IA:", e.message);
    return [];
  }
}

async function handleGet(req, res) {
  const materiaId = String(req.query?.materiaId || "").trim();
  const nivel = normalizarNivel(req.query?.nivel);
  const materiaNome = req.query?.materiaNome ? String(req.query.materiaNome) : materiaId;
  const limite = Math.min(Math.max(Number(req.query?.limite) || 5, 1), 15);

  if (!materiaId) {
    return res.status(400).json({ erro: "Falta materiaId." });
  }

  let linhas = [];
  try {
    await ensureSchema();
    const db = getDb();
    const resultado = await db.execute({
      sql: `SELECT id, pergunta, opcoes_json, correta, explicacao, origem FROM exercicios_banco
            WHERE materia_id = ? AND (nivel = ? OR nivel = 'todos')
            ORDER BY RANDOM() LIMIT ?`,
      args: [materiaId, nivel, limite],
    });
    linhas = resultado.rows;
  } catch (e) {
    console.error("Banco de exercícios indisponível, a seguir sem ele:", e.message);
  }

  // Banco curto neste tema: pede à IA para completar e grava para reutilizar
  // depois (origem: 'ia') — assim o banco cresce sozinho com o uso.
  if (linhas.length < limite) {
    const gerados = await gerarComIA(materiaId, materiaNome, nivel, limite - linhas.length);
    if (gerados.length) {
      try {
        const db = getDb();
        for (const ex of gerados) {
          await db.execute({
            sql: `INSERT INTO exercicios_banco (materia_id, nivel, pergunta, opcoes_json, correta, explicacao, origem)
                  VALUES (?, ?, ?, ?, ?, ?, 'ia')`,
            args: [materiaId, nivel, ex.pergunta, JSON.stringify(ex.opcoes), ex.correta, ex.explicacao || ""],
          });
        }
      } catch (e) {
        console.error("Não foi possível gravar exercícios gerados pela IA:", e.message);
      }
      linhas = [
        ...linhas,
        ...gerados.map((ex, i) => ({
          id: `ia-temp-${i}`,
          pergunta: ex.pergunta,
          opcoes_json: JSON.stringify(ex.opcoes),
          correta: ex.correta,
          explicacao: ex.explicacao || "",
          origem: "ia",
        })),
      ];
    }
  }

  const exercicios = linhas.map((r) => ({
    id: r.id,
    pergunta: r.pergunta,
    opcoes: JSON.parse(r.opcoes_json),
    correta: r.correta,
    explicacao: r.explicacao,
    origem: r.origem,
  }));

  return res.status(200).json({ exercicios });
}

async function handlePost(req, res) {
  const { exercicioId, materiaId, materiaNome, tema, pergunta, opcoes, respostaDada, correta, explicacao } = req.body || {};

  if (!materiaId || !pergunta || typeof respostaDada !== "number" || typeof correta !== "number") {
    return res.status(400).json({ erro: "Dados incompletos para registar a resposta." });
  }

  let userId = null;
  try {
    userId = await autenticar(req);
  } catch {
    userId = null;
  }

  // Sem sessão válida não há onde gravar (as tabelas exigem user_id) — a UI
  // já mostrou o feedback ao estudante, isto é só persistência.
  if (!userId) {
    return res.status(200).json({ gravado: false, motivo: "sem sessão" });
  }

  const acertou = respostaDada === correta;

  try {
    await ensureSchema();
    const db = getDb();

    if (typeof exercicioId === "number" || (typeof exercicioId === "string" && /^\d+$/.test(exercicioId))) {
      await db.execute({
        sql: "INSERT INTO exercicios_respostas (user_id, exercicio_id, resposta_dada, acertou) VALUES (?, ?, ?, ?)",
        args: [userId, Number(exercicioId), respostaDada, acertou],
      });
    }

    if (!acertou) {
      const opcaoDada = Array.isArray(opcoes) ? (opcoes[respostaDada] ?? String(respostaDada)) : String(respostaDada);
      const opcaoCerta = Array.isArray(opcoes) ? (opcoes[correta] ?? String(correta)) : String(correta);
      await db.execute({
        sql: `INSERT INTO erros_guardados (user_id, materia_id, materia_nome, tema, pergunta, tua_resposta, resposta_certa, explicacao)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [userId, materiaId, materiaNome || materiaId, tema || "Geral", pergunta, opcaoDada, opcaoCerta, explicacao || ""],
      });
    }

    return res.status(200).json({ gravado: true });
  } catch (e) {
    console.error("Erro a registar resposta de exercício:", e.message);
    // A UI do quiz já seguiu em frente — isto não deve travar nada.
    return res.status(200).json({ gravado: false, motivo: "erro interno" });
  }
}

export default async function handler(req, res) {
  if (req.method === "GET") return handleGet(req, res);
  if (req.method === "POST") return handlePost(req, res);
  return res.status(405).json({ erro: "Método não permitido" });
}


