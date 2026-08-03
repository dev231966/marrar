// /api/exercicios.js
// GET  /api/exercicios?busca=trigonometria&limite=5
//      -> { exercicios: [{ id, pergunta, opcoes, correta, explicacao, origem, dificuldade }] }
//      Pesquisa por texto livre no banco (full-text search em português) e
//      nunca repete um exercício já respondido pelo utilizador. Se o banco
//      não tiver o suficiente sobre o tema, o Fario (IA) completa e grava.
//
// POST /api/exercicios  { exercicioId, materiaId, ..., respostaDada, correta, dificuldade }
//      Regista a resposta, alimenta o Caderno de Erros se necessário, e
//      atualiza pontos/nível/sequência de dias.

import { autenticar, ensureSchema, getDb } from "./_db.js";

const MODELO = "openai/gpt-oss-120b";
const PONTOS_POR_DIFICULDADE = { facil: 10, medio: 20, dificil: 35 };
const PONTOS_POR_NIVEL = 150;

// Transforma o texto de pesquisa numa chave estável para agrupar
// dificuldade/estatísticas (ex.: "Leis de Newton" e "leis de newton" contam
// como o mesmo tema).
function normalizarChave(texto) {
  return String(texto).trim().toLowerCase().replace(/\s+/g, "-").slice(0, 80);
}

async function calcularDificuldadeAlvo(db, userId, materiaId) {
  if (!userId) return "facil";

  const resultado = await db.execute({
    sql: `SELECT r.acertou FROM exercicios_respostas r
          JOIN exercicios_banco b ON b.id = r.exercicio_id
          WHERE r.user_id = ? AND b.materia_id = ?
          ORDER BY r.respondido_em DESC LIMIT 10`,
    args: [userId, materiaId],
  });

  const respostas = resultado.rows;
  if (respostas.length < 3) return "facil";

  const taxa = respostas.filter((r) => r.acertou).length / respostas.length;
  if (taxa >= 0.8) return "dificil";
  if (taxa >= 0.5) return "medio";
  return "facil";
}

async function gerarComFario(temaBusca, dificuldade, quantidade) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || quantidade <= 0) return [];

  const instrucao = [
    `Cria ${quantidade} exercícios de escolha múltipla sobre "${temaBusca}", para o liceu em Moçambique.`,
    `O nível de dificuldade deve ser "${dificuldade}" (facil, medio ou dificil).`,
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
    const parsed = JSON.parse(texto);
    const lista = Array.isArray(parsed) ? parsed : (parsed.exercicios || []);

    return lista
      .filter((e) => e?.pergunta && Array.isArray(e.opcoes) && e.opcoes.length >= 2 && typeof e.correta === "number")
      .slice(0, quantidade);
  } catch (e) {
    clearTimeout(timeoutId);
    console.error("Falha do Fario a gerar exercícios:", e.message);
    return [];
  }
}

async function handleGet(req, res) {
  const busca = String(req.query?.busca || "").trim();
  const limite = Math.min(Math.max(Number(req.query?.limite) || 5, 1), 15);

  if (!busca) {
    return res.status(400).json({ erro: "Falta o termo de pesquisa (busca)." });
  }

  const chave = normalizarChave(busca);

  let userId = null;
  try {
    userId = await autenticar(req);
  } catch {
    userId = null;
  }

  let linhas = [];
  let dificuldadeAlvo = "facil";

  try {
    await ensureSchema();
    const db = getDb();

    dificuldadeAlvo = await calcularDificuldadeAlvo(db, userId, chave);

    // Full-text search em português sobre tema + pergunta + matéria —
    // encontra conteúdo relevante mesmo sem correspondência exacta de texto.
    const resultado = await db.execute({
      sql: `SELECT id, pergunta, opcoes_json, correta, explicacao, origem, dificuldade
            FROM exercicios_banco
            WHERE busca_tsv @@ plainto_tsquery('portuguese', ?) AND dificuldade = ?
            ${userId ? "AND id NOT IN (SELECT exercicio_id FROM exercicios_respostas WHERE user_id = ?)" : ""}
            ORDER BY RANDOM() LIMIT ?`,
      args: userId ? [busca, dificuldadeAlvo, userId, limite] : [busca, dificuldadeAlvo, limite],
    });
    linhas = resultado.rows;
  } catch (e) {
    console.error("Banco de exercícios indisponível, a seguir sem ele:", e.message);
  }

  // Banco curto sobre este tema/dificuldade: o Fario completa e grava com
  // id real — nunca devolve um id falso ao frontend.
  if (linhas.length < limite) {
    const gerados = await gerarComFario(busca, dificuldadeAlvo, limite - linhas.length);
    if (gerados.length) {
      try {
        const db = getDb();
        for (const ex of gerados) {
          const inserted = await db.execute({
            sql: `INSERT INTO exercicios_banco (materia_id, nivel, tema, pergunta, opcoes_json, correta, explicacao, origem, dificuldade)
                  VALUES (?, 'todos', ?, ?, ?, ?, ?, 'ia', ?) RETURNING id`,
            args: [chave, busca, ex.pergunta, JSON.stringify(ex.opcoes), ex.correta, ex.explicacao || "", dificuldadeAlvo],
          });
          linhas.push({
            id: inserted.rows[0].id,
            pergunta: ex.pergunta,
            opcoes_json: JSON.stringify(ex.opcoes),
            correta: ex.correta,
            explicacao: ex.explicacao || "",
            origem: "ia",
            dificuldade: dificuldadeAlvo,
          });
        }
      } catch (e) {
        console.error("Não foi possível gravar exercícios gerados pelo Fario:", e.message);
      }
    }
  }

  const exercicios = linhas.map((r) => ({
    id: r.id,
    pergunta: r.pergunta,
    opcoes: JSON.parse(r.opcoes_json),
    correta: r.correta,
    explicacao: r.explicacao,
    origem: r.origem,
    dificuldade: r.dificuldade,
  }));

  return res.status(200).json({ exercicios });
}

async function atualizarProgresso(db, userId, acertou, dificuldade) {
  const existente = await db.execute({
    sql: "SELECT * FROM user_progresso WHERE user_id = ?",
    args: [userId],
  });

  const hoje = new Date().toISOString().slice(0, 10);
  let pontos = 0, exerciciosFeitos = 0, exerciciosCertos = 0, sequenciaDias = 0, ultimoDia = null;

  if (existente.rows.length > 0) {
    ({ pontos, exercicios_feitos: exerciciosFeitos, exercicios_certos: exerciciosCertos, sequencia_dias: sequenciaDias, ultimo_dia_activo: ultimoDia } = existente.rows[0]);
  }

  const pontosGanhos = acertou ? (PONTOS_POR_DIFICULDADE[dificuldade] || PONTOS_POR_DIFICULDADE.medio) : 0;
  pontos += pontosGanhos;
  exerciciosFeitos += 1;
  if (acertou) exerciciosCertos += 1;

  const ultimoDiaStr = ultimoDia ? new Date(ultimoDia).toISOString().slice(0, 10) : null;
  if (ultimoDiaStr !== hoje) {
    const ontem = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    sequenciaDias = ultimoDiaStr === ontem ? sequenciaDias + 1 : 1;
  }

  if (existente.rows.length > 0) {
    await db.execute({
      sql: `UPDATE user_progresso
            SET pontos = ?, exercicios_feitos = ?, exercicios_certos = ?, sequencia_dias = ?, ultimo_dia_activo = ?, atualizado_em = now()
            WHERE user_id = ?`,
      args: [pontos, exerciciosFeitos, exerciciosCertos, sequenciaDias, hoje, userId],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO user_progresso (user_id, pontos, exercicios_feitos, exercicios_certos, sequencia_dias, ultimo_dia_activo)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [userId, pontos, exerciciosFeitos, exerciciosCertos, sequenciaDias, hoje],
    });
  }

  const nivel = Math.floor(pontos / PONTOS_POR_NIVEL) + 1;
  return { pontosGanhos, pontosTotais: pontos, nivel, sequenciaDias };
}

async function handlePost(req, res) {
  const { exercicioId, materiaId, materiaNome, tema, pergunta, opcoes, respostaDada, correta, explicacao, dificuldade } = req.body || {};

  if (!materiaId || !pergunta || typeof respostaDada !== "number" || typeof correta !== "number") {
    return res.status(400).json({ erro: "Dados incompletos para registar a resposta." });
  }

  let userId = null;
  try {
    userId = await autenticar(req);
  } catch {
    userId = null;
  }

  if (!userId) {
    return res.status(200).json({ gravado: false, motivo: "sem sessão" });
  }

  const acertou = respostaDada === correta;

  try {
    await ensureSchema();
    const db = getDb();

    const exercicioIdValido = typeof exercicioId === "number" || (typeof exercicioId === "string" && /^\d+$/.test(exercicioId));
    if (exercicioIdValido) {
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

    const progresso = await atualizarProgresso(db, userId, acertou, dificuldade || "medio");

    return res.status(200).json({ gravado: true, ...progresso });
  } catch (e) {
    console.error("Erro a registar resposta de exercício:", e.message);
    return res.status(200).json({ gravado: false, motivo: "erro interno" });
  }
}

export default async function handler(req, res) {
  if (req.method === "GET") return handleGet(req, res);
  if (req.method === "POST") return handlePost(req, res);
  return res.status(405).json({ erro: "Método não permitido" });
}
