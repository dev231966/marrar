// /api/perfil/index.js
// POST /api/perfil  { respostas: {...} }
//   -> { id, estado: 'a_processar' }
//   Grava as respostas do wizard e dispara /api/perfil/gerar em background
//   (sem await) — o pedido responde logo, o aluno não espera.
//
// GET /api/perfil
//   -> { resultado: { id, estado, planoJson, criadoEm } | null }

import { autenticar, ensureSchema, getDb } from "../_db.js";

function baseUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

async function tratarPost(req, res, db, userId) {
  const { respostas } = req.body || {};
  if (!respostas || typeof respostas !== "object") {
    return res.status(400).json({ erro: "Faltam as respostas do formulário." });
  }

  const inserted = await db.execute({
    sql: `INSERT INTO perfil_estudo_resultados (user_id, respostas_json, estado)
          VALUES (?, ?, 'a_processar') RETURNING id`,
    args: [userId, JSON.stringify(respostas)],
  });
  const id = inserted.rows[0].id;

  const token = (req.headers.authorization || "").replace("Bearer ", "");
  fetch(`${baseUrl(req)}/api/perfil/gerar`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ perfilId: id }),
  }).catch((e) => console.error("Falha a disparar geração do plano:", e.message));

  return res.status(202).json({ id, estado: "a_processar" });
}

async function tratarGet(req, res, db, userId) {
  const resultado = await db.execute({
    sql: `SELECT id, estado, plano_json, criado_em
          FROM perfil_estudo_resultados
          WHERE user_id = ?
          ORDER BY criado_em DESC
          LIMIT 1`,
    args: [userId],
  });
  const linha = resultado.rows[0];
  if (!linha) return res.status(200).json({ resultado: null });

  return res.status(200).json({
    resultado: {
      id: linha.id,
      estado: linha.estado,
      planoJson: linha.plano_json ? JSON.parse(linha.plano_json) : null,
      criadoEm: linha.criado_em,
    },
  });
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  let db, userId;
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
    if (req.method === "POST") return await tratarPost(req, res, db, userId);
    return await tratarGet(req, res, db, userId);
  } catch (e) {
    console.error("Erro em /api/perfil:", e);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}
