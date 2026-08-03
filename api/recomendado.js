// /api/recomendado.js
// GET /api/recomendado
//     -> { recomendado: { tema, materiaId, total, acertos } | null }
//
// Escolhe, entre os temas já praticados pelo utilizador, aquele com pior
// taxa de acerto — para a UI oferecer um "toque único" que já abre o quiz
// certo, sem obrigar a escrever nada. Exige pelo menos 3 respostas no tema
// para não recomendar com base numa única resposta errada.

import { autenticar, ensureSchema, getDb } from "./_db.js";

const MINIMO_RESPOSTAS = 3;

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

  const db = getDb();
  try {
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
      args: [userId, MINIMO_RESPOSTAS],
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
  } catch (e) {
    console.error("Erro em /api/recomendado:", e);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}
