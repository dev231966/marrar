// /api/historico.js
// Endpoint: GET /api/historico
// Cabeçalho: Authorization: Bearer <token>
// Devolve: { mensagens: [{ role, texto, contexto, criado_em }] } ou { erro }
//
// Usado por Duvidas.jsx para retomar a última conversa com a IA ("continuar
// de onde paraste"), reaproveitando a interface já existente em Explicação.

import { autenticar, ensureSchema, getDb } from "./_db.js";

const LIMITE_PADRAO = 40;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  let userId;
  try {
    userId = await autenticar(req);
  } catch (e) {
    console.error("Erro a autenticar em /api/historico:", e);
    return res.status(200).json({ mensagens: [] }); // nunca trava a UI por causa disto
  }

  if (!userId) {
    return res.status(401).json({ erro: "Sessão inválida ou expirada." });
  }

  try {
    await ensureSchema();
    const db = getDb();
    const limite = Math.min(Number(req.query?.limite) || LIMITE_PADRAO, 100);

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
      .reverse(); // veio da query em ordem decrescente, devolve-se em ordem cronológica

    return res.status(200).json({ mensagens });
  } catch (e) {
    console.error("Erro em /api/historico:", e);
    // Falha na base de dados não deve derrubar a página — devolve vazio e
    // o frontend simplesmente começa uma conversa nova.
    return res.status(200).json({ mensagens: [] });
  }
}
