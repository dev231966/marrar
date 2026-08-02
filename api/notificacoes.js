// /api/notificacoes.js
// GET    /api/notificacoes            -> { notificacoes: [{ id, tipo, mensagem, lida, criadoEm }], naoLidas }
// PATCH  /api/notificacoes  { id }    -> marca como lida
// DELETE /api/notificacoes  { id }    -> elimina
// POST   /api/notificacoes  { tipo, mensagem }  -> cria (uso interno/testes)
//
// O conteúdo fica guardado encriptado (AES-256-GCM) na coluna
// `conteudo_enc` — mesmo com acesso direto à base de dados, ninguém lê o
// texto sem a env var NOTIF_ENC_KEY.
//
// Requer sessão (Authorization: Bearer <token>).

import { getDb, ensureSchema } from "./_db.js";
import { encriptar, desencriptar } from "./_crypto.js";

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

function linhaParaNotificacao(row) {
  let mensagem = "[conteúdo indisponível]";
  try {
    mensagem = desencriptar(row.conteudo_enc);
  } catch (e) {
    console.error("Falha a desencriptar notificação", row.id, e.message);
  }
  return {
    id: row.id,
    tipo: row.tipo,
    mensagem,
    lida: row.lida,
    criadoEm: row.criado_em,
  };
}

async function tratarGet(req, res, db, user) {
  const resultado = await db.execute({
    sql: `SELECT * FROM notificacoes WHERE user_id = ? ORDER BY criado_em DESC LIMIT 50`,
    args: [user.id],
  });
  const notificacoes = resultado.rows.map(linhaParaNotificacao);
  const naoLidas = notificacoes.filter((n) => !n.lida).length;
  return res.status(200).json({ notificacoes, naoLidas });
}

async function tratarPost(req, res, db, user) {
  const { tipo = "geral", mensagem } = req.body || {};
  if (!mensagem || !mensagem.trim()) {
    return res.status(400).json({ erro: "Falta a mensagem." });
  }
  const conteudoEnc = encriptar(mensagem.trim());
  const inserted = await db.execute({
    sql: `INSERT INTO notificacoes (user_id, tipo, conteudo_enc) VALUES (?, ?, ?) RETURNING id`,
    args: [user.id, tipo, conteudoEnc],
  });
  return res.status(201).json({ id: inserted.rows[0].id });
}

async function tratarPatch(req, res, db, user) {
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ erro: "Falta o id." });

  const resultado = await db.execute({
    sql: `UPDATE notificacoes SET lida = true WHERE id = ? AND user_id = ? RETURNING id`,
    args: [id, user.id],
  });
  if (resultado.rows.length === 0) return res.status(404).json({ erro: "Notificação não encontrada." });
  return res.status(200).json({ ok: true });
}

async function tratarDelete(req, res, db, user) {
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ erro: "Falta o id." });

  const resultado = await db.execute({
    sql: `DELETE FROM notificacoes WHERE id = ? AND user_id = ? RETURNING id`,
    args: [id, user.id],
  });
  if (resultado.rows.length === 0) return res.status(404).json({ erro: "Notificação não encontrada." });
  return res.status(200).json({ ok: true });
}

export default async function handler(req, res) {
  const metodosPermitidos = ["GET", "POST", "PATCH", "DELETE"];
  if (!metodosPermitidos.includes(req.method)) {
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
  const user = await obterUserPeloToken(db, token);
  if (!user) return res.status(401).json({ erro: "Precisas de sessão activa." });

  try {
    if (req.method === "GET") return await tratarGet(req, res, db, user);
    if (req.method === "POST") return await tratarPost(req, res, db, user);
    if (req.method === "PATCH") return await tratarPatch(req, res, db, user);
    if (req.method === "DELETE") return await tratarDelete(req, res, db, user);
  } catch (e) {
    console.error("Erro em /api/notificacoes:", e);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}
