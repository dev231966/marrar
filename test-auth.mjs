// Script manual de diagnóstico — não faz parte da app.
// Corre com: node test-auth.mjs
// Confirma que a DATABASE_URL está bem configurada e que o schema já foi
// aplicado, sem passar pelo browser nem pela Vercel.
import { getDb, ensureSchema } from "./api/_db.js";
import bcrypt from "bcryptjs";

try {
  await ensureSchema();
  const db = getDb();
  const hash = await bcrypt.hash("senha1234", 10);
  const email = `teste-${Date.now()}@marrar.co.mz`;

  const r = await db.execute({
    sql: "INSERT INTO users (nome, email, password_hash) VALUES (?, ?, ?) RETURNING id",
    args: ["Teste Local", email, hash],
  });
  console.log("✅ SUCESSO — utilizador de teste criado:", r.rows[0]);

  // limpa o registo de teste para não sujar a base de dados
  await db.execute({ sql: "DELETE FROM users WHERE email = ?", args: [email] });
  console.log("🧹 Registo de teste removido.");
} catch (e) {
  console.error("❌ ERRO COMPLETO:", e);
  process.exit(1);
}
