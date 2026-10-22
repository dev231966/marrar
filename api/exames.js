import { ensureSchema, getDb } from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    await ensureSchema();
    const db = getDb();
    const query = String(req.query?.query || "").trim();
    const disciplina = String(req.query?.disciplina || "todas");
    const nivel = String(req.query?.nivel || "todos");
    const args = [];
    const filtros = ["publicado = TRUE"];

    if (query) {
      args.push(`%${query}%`);
      filtros.push(`(titulo ILIKE $${args.length} OR descricao ILIKE $${args.length})`);
    }
    if (disciplina !== "todas") {
      args.push(disciplina);
      filtros.push(`disciplina_id = $${args.length}`);
    }
    if (nivel !== "todos") {
      args.push(nivel);
      filtros.push(`nivel = $${args.length}`);
    }

    const result = await db.raw.query(
      `SELECT id, titulo, descricao, disciplina_id AS disciplina, disciplina_nome AS "disciplinaNome", nivel, tipo, ano, ficheiro
       FROM exames
       WHERE ${filtros.join(" AND ")}
       ORDER BY ano DESC NULLS LAST, titulo ASC
       LIMIT 100`,
      args
    );

    const disciplinas = await db.raw.query(
      `SELECT DISTINCT disciplina_id AS id, disciplina_nome AS nome
       FROM exames
       WHERE publicado = TRUE AND disciplina_id IS NOT NULL
       ORDER BY disciplina_nome ASC`
    );

    return res.status(200).json({ exames: result, disciplinas });
  } catch (error) {
    console.error("Erro ao carregar exames:", error.message);
    return res.status(500).json({ error: "Catálogo indisponível." });
  }
}
