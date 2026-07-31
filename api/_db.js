cd ~/web/marrar
mkdir -p api
cat > api/_db.js << 'EOF'
// /api/_db.js
// Cliente libsql partilhado. Todas as rotas em /api importam daqui em vez de
// abrirem ligação própria — assim há só um sítio a configurar/mudar.
//
// Não é uma rota (não recebe pedidos HTTP directamente); é só um módulo
// auxiliar. O prefixo "_" no nome é convenção para o Vercel não a tratar
// como endpoint.

import { createClient } from "@libsql/client";

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

// Gera um token de sessão aleatório e seguro (hex, 48 bytes).
export function gerarTokenSessao() {
  const bytes = new Uint8Array(48);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Confirma se o pedido tem uma sessão válida (via header Authorization: Bearer <token>).
// Devolve o user_id se válido, ou null caso contrário. Também apaga sessões
// expiradas encontradas, para a tabela não crescer para sempre.
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
EOF