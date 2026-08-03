// /api/temas-sugeridos.js
// GET /api/temas-sugeridos?q=trigo&limite=8
//     -> { sugestoes: ["Trigonometria", "Trigonometria - lei dos senos", ...] }
//
// Autocomplete "infinito": não é uma lista fixa no código, é pesquisa ao vivo
// em exercicios_banco. Cresce sozinho conforme o banco de exercícios cresce
// (seed ou gerados por IA). Usa prefixo (ILIKE) + full-text (busca_tsv) para
// apanhar tanto "trigo..." como palavras no meio do tema.

import { autenticar, ensureSchema, getDb } from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  let userId;
  try {
    await ensureSchema();
    userId = await autenticar(req);
  } catch (e) {
    console.error("Erro de configuração da base de dados:", e);
    return res.status(500).json({ erro: "Base de dados não configurada no servidor." });
  }

  if (!userId) return res.status(401).json({ erro: "Precisas de sessão activa." });

  const q = String(req.query.q || "").trim();
  const limite = Math.min(parseInt(req.query.limite, 10) || 8, 20);

  // Menos de 2 caracteres não vale a pena pesquisar — só ruído.
  if (q.length < 2) return res.status(200).json({ sugestoes: [] });

  const db = getDb();
  try {
    const resultado = await db.execute({
      sql: `SELECT DISTINCT tema
            FROM exercicios_banco
            WHERE tema ILIKE ? || '%'
               OR busca_tsv @@ plainto_tsquery('portuguese', ?)
            ORDER BY tema
            LIMIT ?`,
      args: [q, q, limite],
    });

    const sugestoes = resultado.rows.map((r) => r.tema).filter(Boolean);
    return res.status(200).json({ sugestoes });
  } catch (e) {
    console.error("Erro em /api/temas-sugeridos:", e);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}
