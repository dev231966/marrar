// /api/migrate.js
// Aplica o schema.sql na base de dados Neon, usando a MESMA ligação que já
// tens em _db.js — sem psql, sem instalar nada de novo.
//
// Como usar:
//   1. Define no .env / nas env vars da Vercel: MIGRATE_SECRET=algumaCoisaSecreta
//   2. Faz deploy normalmente (o schema.sql já vai junto no projeto).
//   3. Sempre que alterares o schema.sql, visita uma vez:
//        https://teu-dominio.com/api/migrate?secret=algumaCoisaSecreta
//      (ou faz um pedido POST/GET com curl, que já vem em qualquer sistema)
//   4. Pronto — as tabelas/colunas novas são criadas na Neon.
//
// Como todos os CREATE TABLE usam IF NOT EXISTS (e os ALTER usam
// ADD COLUMN IF NOT EXISTS), é seguro chamar este endpoint quantas vezes
// quiseres — nunca apaga nem duplica dados.

import fs from "fs";
import path from "path";
import { getDb } from "./_db.js";

function dividirStatements(sqlTexto) {
  // Remove comentários de linha e divide por ";" no fim de cada statement.
  // Suficiente para o teu schema.sql (não tem ";" dentro de strings/funções).
  return sqlTexto
    .split("\n")
    .filter((linha) => !linha.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const segredoEsperado = process.env.MIGRATE_SECRET;
  const segredoRecebido = req.query?.secret || req.headers["x-migrate-secret"];

  if (!segredoEsperado) {
    return res.status(500).json({ erro: "MIGRATE_SECRET não está configurado no servidor." });
  }
  if (segredoRecebido !== segredoEsperado) {
    return res.status(401).json({ erro: "Não autorizado." });
  }

  let db;
  try {
    db = getDb();
  } catch (e) {
    console.error("Erro ao ligar à base de dados:", e);
    return res.status(500).json({ erro: "Base de dados não configurada no servidor." });
  }

  let sqlTexto;
  try {
    sqlTexto = fs.readFileSync(path.join(process.cwd(), "schema.sql"), "utf-8");
  } catch (e) {
    console.error("Erro ao ler schema.sql:", e);
    return res.status(500).json({ erro: "Não consegui encontrar schema.sql no projeto." });
  }

  const statements = dividirStatements(sqlTexto);
  const aplicados = [];
  const falhados = [];

  for (const stmt of statements) {
    try {
      await db.execute(stmt);
      aplicados.push(stmt.slice(0, 60).replace(/\s+/g, " ") + "…");
    } catch (e) {
      falhados.push({ statement: stmt.slice(0, 60).replace(/\s+/g, " ") + "…", erro: e.message });
    }
  }

  const status = falhados.length > 0 ? 207 : 200;
  return res.status(status).json({
    total: statements.length,
    aplicados: aplicados.length,
    falhados,
  });
}
