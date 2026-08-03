// scripts/migrate.js
// Substitui o antigo /api/migrate.js. Fazia a mesma coisa (aplicar
// schema.sql na Neon), mas como endpoint HTTP contava como mais uma
// Serverless Function na Vercel — e o plano Hobby tem limite de 12.
//
// Na prática isto raramente era necessário de qualquer forma: `ensureSchema()`
// em api/_db.js já aplica o schema.sql automaticamente (com IF NOT EXISTS)
// sempre que uma função acorda de um cold start. Este script serve só para
// quem quiser aplicar alterações ao schema.sql imediatamente, sem esperar
// pelo próximo pedido à API.
//
// Como usar:
//   1. Garante que tens DATABASE_URL no teu .env local (mesma connection
//      string que está configurada na Vercel).
//   2. Corre:  npm run migrate
//
// Todos os statements no schema.sql usam IF NOT EXISTS / ADD COLUMN IF NOT
// EXISTS, por isso é seguro correr isto quantas vezes quiseres.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function paraPlaceholdersPostgres(sqlTexto) {
  let i = 0;
  return sqlTexto.replace(/\?/g, () => `$${++i}`);
}

function dividirStatements(sqlTexto) {
  return sqlTexto
    .split("\n")
    .filter((linha) => !linha.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Erro: DATABASE_URL não definida. Define-a no teu .env ou exporta-a antes de correr o script.");
    process.exit(1);
  }

  const sql = neon(url);
  const caminhoSchema = path.join(__dirname, "..", "schema.sql");

  let sqlTexto;
  try {
    sqlTexto = fs.readFileSync(caminhoSchema, "utf-8");
  } catch (e) {
    console.error(`Erro: não consegui ler ${caminhoSchema}`, e.message);
    process.exit(1);
  }

  const statements = dividirStatements(sqlTexto);
  let aplicados = 0;
  const falhados = [];

  for (const stmt of statements) {
    try {
      await sql.query(paraPlaceholdersPostgres(stmt));
      aplicados++;
      console.log("OK  ", stmt.slice(0, 70).replace(/\s+/g, " "));
    } catch (e) {
      falhados.push({ stmt: stmt.slice(0, 70).replace(/\s+/g, " "), erro: e.message });
      console.error("FAIL", stmt.slice(0, 70).replace(/\s+/g, " "), "→", e.message);
    }
  }

  console.log(`\nTotal: ${statements.length} | Aplicados: ${aplicados} | Falhados: ${falhados.length}`);
  process.exit(falhados.length > 0 ? 1 : 0);
}

main();
