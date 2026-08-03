// /api/conquistas.js
// GET  /api/conquistas
//      -> { conquistas: [{ chave, nome, descricao, icone, desbloqueada, quando }] }
//      Lista o catálogo inteiro, marcando o que este utilizador já tem.
//
// POST /api/conquistas  { evento: "ronda_concluida", acertos, total }
//      Verifica conquistas que só fazem sentido ao nível de uma ronda
//      completa (ex: perfeccionista). As conquistas ligadas a
//      pontos/nível/sequência/mestria são verificadas directamente em
//      /api/exercicios (POST), a cada resposta.
//      -> { novas: [{ chave, nome, descricao, icone }] }

import { autenticar, ensureSchema, getDb } from "./_db.js";

async function tentarAtribuir(db, userId, chave, detalhe = "") {
  try {
    const resultado = await db.execute({
      sql: `INSERT INTO user_conquistas (user_id, conquista_chave, detalhe)
            VALUES (?, ?, ?)
            ON CONFLICT (user_id, conquista_chave, detalhe) DO NOTHING
            RETURNING conquista_chave`,
      args: [userId, chave, detalhe],
    });
    return resultado.rows.length > 0; // true só se foi mesmo atribuída agora
  } catch (e) {
    console.error("Erro a atribuir conquista", chave, e.message);
    return false;
  }
}

async function handleGet(req, res, userId) {
  const db = getDb();

  const catalogo = await db.execute({ sql: "SELECT * FROM conquistas ORDER BY chave", args: [] });
  const desbloqueadas = await db.execute({
    sql: "SELECT conquista_chave, desbloqueado_em FROM user_conquistas WHERE user_id = ?",
    args: [userId],
  });

  const mapaDesbloqueadas = new Map(desbloqueadas.rows.map((r) => [r.conquista_chave, r.desbloqueado_em]));

  const conquistas = catalogo.rows.map((c) => ({
    chave: c.chave,
    nome: c.nome,
    descricao: c.descricao,
    icone: c.icone,
    desbloqueada: mapaDesbloqueadas.has(c.chave),
    quando: mapaDesbloqueadas.get(c.chave) || null,
  }));

  return res.status(200).json({ conquistas });
}

async function handlePost(req, res, userId) {
  const db = getDb();
  const { evento, acertos, total } = req.body || {};

  if (evento === "ronda_concluida" && typeof acertos === "number" && typeof total === "number" && total > 0) {
    const novas = [];
    if (acertos === total) {
      const atribuida = await tentarAtribuir(db, userId, "perfeccionista");
      if (atribuida) {
        const c = await db.execute({ sql: "SELECT * FROM conquistas WHERE chave = ?", args: ["perfeccionista"] });
        if (c.rows[0]) novas.push(c.rows[0]);
      }
    }
    return res.status(200).json({ novas });
  }

  return res.status(400).json({ erro: "Evento desconhecido." });
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
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

  try {
    if (req.method === "GET") return await handleGet(req, res, userId);
    return await handlePost(req, res, userId);
  } catch (e) {
    console.error("Erro em /api/conquistas:", e);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}

export { tentarAtribuir };
