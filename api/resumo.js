// /api/resumo.js
// Rota consolidada que junta 4 endpoints de leitura simples (GET) que antes
// eram funções serverless separadas: historico.js, erros.js, recomendado.js
// e progresso.js. Juntámo-las aqui para ficar dentro do limite de 12
// Serverless Functions do plano Hobby da Vercel — cada arquivo em /api conta
// como uma função, e o projeto tinha 15.
//
// GET /api/resumo?tipo=historico&limite=40
//     -> { mensagens: [{ role, texto, contexto, criadoEm }] }
// GET /api/resumo?tipo=erros
//     -> { erros: [{ id, materiaId, materiaNome, tema, pergunta, tuaResposta, respostaCerta, explicacao, criadoEm }] }
// GET /api/resumo?tipo=recomendado
//     -> { recomendado: { tema, materiaId, total, acertos } | null }
// GET /api/resumo?tipo=progresso&cursor=0&limite=15
//     -> { pontos, nivel, exerciciosFeitos, exerciciosCertos, sequenciaDias,
//          pontosParaProximoNivel, atividade: [...], temMais }
//
// A lógica interna de cada `tipo` é exactamente a mesma que estava nos
// arquivos originais — só o roteamento HTTP mudou.

import { autenticar, ensureSchema, getDb } from "./_db.js";

const LIMITE_HISTORICO_PADRAO = 40;
const PONTOS_POR_NIVEL = 150;
const MINIMO_RESPOSTAS_RECOMENDADO = 3;

async function handleHistorico(req, res, userId, db) {
  const limite = Math.min(Number(req.query?.limite) || LIMITE_HISTORICO_PADRAO, 100);

  const resultado = await db.execute({
    sql: `SELECT role, texto, contexto_json, criado_em FROM duvidas_historico
          WHERE user_id = ? ORDER BY id DESC LIMIT ?`,
    args: [userId, limite],
  });

  const mensagens = resultado.rows
    .map((r) => ({
      role: r.role,
      texto: r.texto,
      contexto: r.contexto_json ? JSON.parse(r.contexto_json) : null,
      criadoEm: r.criado_em,
    }))
    .reverse();

  return res.status(200).json({ mensagens });
}

async function handleErros(req, res, userId, db) {
  const resultado = await db.execute({
    sql: `SELECT id, materia_id, materia_nome, tema, pergunta, tua_resposta, resposta_certa, explicacao, criado_em
          FROM erros_guardados WHERE user_id = ? ORDER BY id DESC LIMIT 200`,
    args: [userId],
  });

  const erros = resultado.rows.map((r) => ({
    id: r.id,
    materiaId: r.materia_id,
    materiaNome: r.materia_nome,
    tema: r.tema,
    pergunta: r.pergunta,
    tuaResposta: r.tua_resposta,
    respostaCerta: r.resposta_certa,
    explicacao: r.explicacao,
    criadoEm: r.criado_em,
  }));

  return res.status(200).json({ erros });
}

async function handleRecomendado(req, res, userId, db) {
  const resultado = await db.execute({
    sql: `SELECT eb.tema            AS tema,
                 MIN(eb.materia_id) AS materia_id,
                 COUNT(*)           AS total,
                 SUM(CASE WHEN er.acertou THEN 1 ELSE 0 END) AS acertos
          FROM exercicios_respostas er
          JOIN exercicios_banco eb ON eb.id = er.exercicio_id
          WHERE er.user_id = ?
          GROUP BY eb.tema
          HAVING COUNT(*) >= ?
          ORDER BY (SUM(CASE WHEN er.acertou THEN 1 ELSE 0 END)::float / COUNT(*)) ASC,
                   MAX(er.respondido_em) DESC
          LIMIT 1`,
    args: [userId, MINIMO_RESPOSTAS_RECOMENDADO],
  });

  const linha = resultado.rows[0];
  if (!linha) return res.status(200).json({ recomendado: null });

  return res.status(200).json({
    recomendado: {
      tema: linha.tema,
      materiaId: linha.materia_id,
      total: Number(linha.total),
      acertos: Number(linha.acertos),
    },
  });
}

async function handleProgresso(req, res, userId, db) {
  const { cursor = "0", limite = "15" } = req.query || {};
  const lim = Math.min(parseInt(limite, 10) || 15, 50);
  const offset = parseInt(cursor, 10) || 0;

  const progresso = await db.execute({
    sql: "SELECT pontos, exercicios_feitos, exercicios_certos, sequencia_dias FROM user_progresso WHERE user_id = ?",
    args: [userId],
  });
  const p = progresso.rows[0] || { pontos: 0, exercicios_feitos: 0, exercicios_certos: 0, sequencia_dias: 0 };
  const nivel = Math.floor(p.pontos / PONTOS_POR_NIVEL) + 1;

  const atividade = await db.execute({
    sql: `SELECT r.id, r.acertou, r.respondido_em, b.tema, b.materia_id, b.pergunta
          FROM exercicios_respostas r
          JOIN exercicios_banco b ON b.id = r.exercicio_id
          WHERE r.user_id = ?
          ORDER BY r.respondido_em DESC
          LIMIT ? OFFSET ?`,
    args: [userId, lim, offset],
  });

  return res.status(200).json({
    pontos: p.pontos,
    nivel,
    exerciciosFeitos: p.exercicios_feitos,
    exerciciosCertos: p.exercicios_certos,
    sequenciaDias: p.sequencia_dias,
    pontosParaProximoNivel: nivel * PONTOS_POR_NIVEL - p.pontos,
    atividade: atividade.rows.map((r) => ({
      id: r.id,
      acertou: r.acertou,
      quando: r.respondido_em,
      tema: r.tema,
      materiaId: r.materia_id,
      pergunta: r.pergunta,
    })),
    temMais: atividade.rows.length >= lim,
  });
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const tipo = String(req.query?.tipo || "");
  const CHAVES_VALIDAS = new Set(["historico", "erros", "recomendado", "progresso"]);
  if (!CHAVES_VALIDAS.has(tipo)) {
    return res.status(400).json({ erro: "Parâmetro 'tipo' inválido. Use: historico, erros, recomendado ou progresso." });
  }

  // historico e erros: nunca travam a UI por falha de auth/BD — devolvem
  // vazio (comportamento igual ao original).
  if (tipo === "historico" || tipo === "erros") {
    let userId;
    try {
      userId = await autenticar(req);
    } catch (e) {
      console.error(`Erro a autenticar em /api/resumo?tipo=${tipo}:`, e);
      return res.status(200).json(tipo === "historico" ? { mensagens: [] } : { erros: [] });
    }

    if (!userId) {
      return res.status(401).json({ erro: "Sessão inválida ou expirada." });
    }

    try {
      await ensureSchema();
      const db = getDb();
      if (tipo === "historico") return await handleHistorico(req, res, userId, db);
      return await handleErros(req, res, userId, db);
    } catch (e) {
      console.error(`Erro em /api/resumo?tipo=${tipo}:`, e);
      return res.status(200).json(tipo === "historico" ? { mensagens: [] } : { erros: [] });
    }
  }

  // recomendado e progresso: erro de configuração de BD devolve 500
  // (comportamento igual ao original).
  let userId;
  let db;
  try {
    await ensureSchema();
    db = getDb();
    userId = await autenticar(req);
  } catch (e) {
    console.error("Erro de configuração da base de dados:", e);
    return res.status(500).json({ erro: "Base de dados não configurada no servidor." });
  }

  if (!userId) return res.status(401).json({ erro: "Precisas de sessão activa." });

  try {
    if (tipo === "recomendado") return await handleRecomendado(req, res, userId, db);
    return await handleProgresso(req, res, userId, db);
  } catch (e) {
    console.error(`Erro em /api/resumo?tipo=${tipo}:`, e);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}
