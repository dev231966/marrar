// /api/exercicios-feitos.js
// GET /api/exercicios-feitos?limite=8
//     -> { exercicios: [{ tema, materiaId, total, acertos, ultima }], temMais }
//
// Agrupa exercicios_respostas por tema (via join com exercicios_banco) para
// alimentar a grade "exercícios feitos" na tela principal. Ordenado pelo
// tema praticado mais recentemente.
//
// Nota: materia_id em exercicios_banco não é uma categoria real (tipo
// "Matemática") — é normalizarChave(tema), ou seja, um slug do próprio
// tema (ver /api/exercicios.js). Por isso agrupamos só por `tema`; o
// materia_id vai no resultado apenas como contexto para a futura rota
// /explicacao, não deve ser mostrado como "matéria" na UI.

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

  const limite = Math.min(parseInt(req.query.limite, 10) || 8, 50);

  const db = getDb();
  try {
    const resultado = await db.execute({
      sql: `SELECT eb.tema           AS tema,
                   MIN(eb.materia_id) AS materia_id,
                   COUNT(*)          AS total,
                   SUM(CASE WHEN er.acertou THEN 1 ELSE 0 END) AS acertos,
                   MAX(er.respondido_em) AS ultima
            FROM exercicios_respostas er
            JOIN exercicios_banco eb ON eb.id = er.exercicio_id
            WHERE er.user_id = ?
            GROUP BY eb.tema
            ORDER BY ultima DESC
            LIMIT ?`,
      args: [userId, limite],
    });

    const exercicios = resultado.rows.map((r) => ({
      tema: r.tema,
      materiaId: r.materia_id,
      total: Number(r.total),
      acertos: Number(r.acertos),
      ultima: r.ultima,
    }));

    return res.status(200).json({ exercicios, temMais: exercicios.length === limite });
  } catch (e) {
    console.error("Erro em /api/exercicios-feitos:", e);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}
