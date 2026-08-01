// /api/_db.js
// Cliente libsql partilhado. Todas as rotas em /api importam daqui em vez de
// abrirem ligação própria — assim há só um sítio a configurar/mudar.
//
// Não é uma rota (não recebe pedidos HTTP directamente); é só um módulo
// auxiliar. O prefixo "_" no nome é convenção para o Vercel não a tratar
// como endpoint.

import { createClient } from "@libsql/client";
import { randomBytes } from "node:crypto";

let cliente = null;

export function getDb() {
  if (cliente) return cliente;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error(
      "TURSO_DATABASE_URL ou TURSO_AUTH_TOKEN não configuradas nas variáveis de ambiente."
    );
  }

  cliente = createClient({ url, authToken });
  return cliente;
}

export function gerarTokenSessao() {
  return randomBytes(48).toString("hex");
}

export async function autenticar(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

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
