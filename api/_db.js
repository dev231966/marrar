// /api/_db.js
// Cliente Neon (Postgres) partilhado. Todas as rotas em /api importam
// daqui em vez de abrirem ligação própria — assim há só um sítio a
// configurar/mudar.
//
// Não é uma rota (não recebe pedidos HTTP directamente); é só um módulo
// auxiliar. O prefixo "_" no nome é convenção para o Vercel não a tratar
// como endpoint.
//
// Nota de migração: este projecto usava @libsql/client (SQLite/Turso) com
// um fallback para ficheiro local. Isso partiu no Termux (sem binário
// nativo para android-arm64) e por isso migrámos para a Neon
// (@neondatabase/serverless), que fala HTTP puro — zero dependências
// nativas, funciona em qualquer ambiente onde `fetch` exista. Em troca,
// perdeu-se o modo "ficheiro local sem servidor": sem DATABASE_URL válida,
// já não há onde gravar nada (ver getDb() abaixo).
//
// Para manter as rotas existentes (auth.js, duvidas.js, exercicios.js,
// historico.js, erros.js) praticamente sem alterações, o objecto devolvido
// por getDb() mantém a mesma forma de chamada que se usava com o libsql:
//   const resultado = await db.execute({ sql: "... WHERE x = ?", args: [x] });
//   resultado.rows
// por baixo, isso é traduzido para o formato nativo da Neon ($1, $2...).

import { neon } from "@neondatabase/serverless";
import { randomBytes } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

let cliente = null;
let schemaPronto = null; // promessa partilhada, para não correr o schema em paralelo em vários pedidos

/** Troca os placeholders `?` (estilo SQLite) por `$1, $2, ...` (estilo Postgres). */
function paraPlaceholdersPostgres(sqlTexto) {
  let i = 0;
  return sqlTexto.replace(/\?/g, () => `$${++i}`);
}

export function getDb() {
  if (cliente) return cliente;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL não configurada. Define a connection string da Neon (Project → Connect) nas variáveis de ambiente."
    );
  }

  const sql = neon(url);

  cliente = {
    async execute(input) {
      const texto = typeof input === "string" ? input : input.sql;
      const args = typeof input === "string" ? [] : (input.args || []);
      const rows = await sql.query(paraPlaceholdersPostgres(texto), args);
      return { rows };
    },
    raw: sql, // acesso directo ao cliente da Neon, para quem precisar de sql`...` no futuro
  };

  return cliente;
}

/**
 * Garante que as tabelas existem antes do primeiro pedido as usar. Todas as
 * instruções do schema.sql usam `IF NOT EXISTS` (e `ADD COLUMN IF NOT
 * EXISTS` no Postgres), por isso é seguro tentar aplicá-lo em todos os
 * arranques frios — não faz mal nenhum se já estiver tudo criado.
 */
export async function ensureSchema() {
  if (schemaPronto) return schemaPronto;

  schemaPronto = (async () => {
    const db = getDb();
    const caminhoSchema = join(__dirname, "..", "schema.sql");
    if (!existsSync(caminhoSchema)) return;

    const conteudo = readFileSync(caminhoSchema, "utf-8");
    const statements = conteudo
      .split(";")
      .map((troco) =>
        troco
          .split("\n")
          .filter((linha) => !linha.trim().startsWith("--"))
          .join("\n")
          .trim()
      )
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      try {
        await db.execute(statement);
      } catch (e) {
        // Não deixa uma instrução isolada travar o arranque todo — mas
        // regista, porque pode ser sinal de um erro real no schema.
        console.error("Aviso ao aplicar schema.sql:", e.message);
      }
    }
  })();

  return schemaPronto;
}

export function gerarTokenSessao() {
  return randomBytes(48).toString("hex");
}

export async function autenticar(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

  await ensureSchema();
  const db = getDb();
  const resultado = await db.execute({
    sql: "SELECT user_id, expira_em FROM sessions WHERE token = ?",
    args: [token],
  });

  const sessao = resultado.rows[0];
  if (!sessao) return null;

  if (new Date(sessao.expira_em) < new Date()) {
    await db.execute({ sql: "DELETE FROM sessions WHERE token = ?", args: [token] });
    return null;
  }

  return sessao.user_id;
}
