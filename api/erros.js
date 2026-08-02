// /api/erros.js
// GET /api/erros  (Authorization: Bearer <token>)
// -> { erros: [{ id, materiaId, materiaNome, tema, pergunta, tuaResposta, respostaCerta, explicacao, criadoEm }] }
//
// Alimentado automaticamente por /api/exercicios sempre que o estudante
// erra uma pergunta — não há aqui nenhuma escrita, só leitura.

import { autenticar, ensureSchema, getDb } from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  let userId;
  try {
    userId = await autenticar(req);
  } catch (e) {
    console.error("Erro a autenticar em /api/erros:", e);
    return res.status(200).json({ erros: [] });
  }

  if (!userId) {
    return res.status(401).json({ erro: "Sessão inválida ou expirada." });
  }

  try {
    await ensureSchema();
    const db = getDb();
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
  } catch (e) {
    console.error("Erro em /api/erros:", e);
    return res.status(200).json({ erros: [] });
  }
}
