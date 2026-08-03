// /api/progresso.js
// GET /api/progresso?cursor=0&limite=15
// -> { pontos, nivel, exerciciosFeitos, exerciciosCertos, sequenciaDias,
//      pontosParaProximoNivel, atividade: [...], temMais }

import { getDb, ensureSchema } from "./_db.js";

const PONTOS_POR_NIVEL = 150;

function extrairToken(req) {
  const header = req.headers.authorization || "";
  const [tipo, token] = header.split(" ");
  return tipo === "Bearer" && token ? token : null;
}

async function obterUserPeloToken(db, token) {
  if (!token) return null;
  const resultado = await db.execute({
    sql: `SELECT u.id FROM sessions s JOIN users u ON u.id = s.user_id
          WHERE s.token = ? AND s.expira_em > now()`,
    args: [token],
  });
  return resultado.rows[0] || null;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ erro: "Método não permitido" });

  let db;
  try {
    await ensureSchema();
    db = getDb();
  } catch (e) {
    console.error("Erro de configuração da base de dados:", e);
    return res.status(500).json({ erro: "Base de dados não configurada no servidor." });
  }

  const user = await obterUserPeloToken(db, extrairToken(req));
  if (!user) return res.status(401).json({ erro: "Sessão inválida." });

  const { cursor = "0", limite = "15" } = req.query || {};
  const lim = Math.min(parseInt(limite, 10) || 15, 50);
  const offset = parseInt(cursor, 10) || 0;

  try {
    const progresso = await db.execute({
      sql: "SELECT pontos, exercicios_feitos, exercicios_certos, sequencia_dias FROM user_progresso WHERE user_id = ?",
      args: [user.id],
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
      args: [user.id, lim, offset],
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
  } catch (e) {
    console.error("Erro em /api/progresso:", e);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}
