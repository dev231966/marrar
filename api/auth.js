// /api/auth.js
// Endpoint: POST /api/auth
// Body: { acao: "registar" | "entrar", nome?, email, palavraPasse }
// Devolve: { user: { id, nome, email }, token } ou { erro }

import bcrypt from "bcryptjs";
import { getDb, gerarTokenSessao, ensureSchema } from "./_db.js";

const DIAS_SESSAO = 30;

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function criarSessao(db, userId) {
  const token = gerarTokenSessao();
  const expiraEm = new Date(Date.now() + DIAS_SESSAO * 24 * 60 * 60 * 1000).toISOString();
  await db.execute({
    sql: "INSERT INTO sessions (user_id, token, expira_em) VALUES (?, ?, ?)",
    args: [userId, token, expiraEm],
  });
  return token;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { acao, nome, email, palavraPasse } = req.body || {};

  if (!email || !validarEmail(email)) {
    return res.status(400).json({ erro: "Email inválido." });
  }
  if (!palavraPasse || palavraPasse.length < 8) {
    return res.status(400).json({ erro: "A palavra-passe precisa de pelo menos 8 caracteres." });
  }

  let db;
  try {
    await ensureSchema();
    db = getDb();
  } catch (e) {
    console.error("Erro de configuração da base de dados:", e);
    return res.status(500).json({ erro: "Base de dados não configurada no servidor." });
  }

  try {
    if (acao === "registar") {
      if (!nome || !nome.trim()) {
        return res.status(400).json({ erro: "Falta o nome." });
      }

      const existe = await db.execute({
        sql: "SELECT id FROM users WHERE email = ?",
        args: [email],
      });
      if (existe.rows.length > 0) {
        return res.status(409).json({ erro: "Já existe uma conta com este email." });
      }

      const hash = await bcrypt.hash(palavraPasse, 10);
      const resultado = await db.execute({
        sql: "INSERT INTO users (nome, email, password_hash) VALUES (?, ?, ?) RETURNING id",
        args: [nome.trim(), email, hash],
      });

      const userId = resultado.rows[0].id;
      const token = await criarSessao(db, userId);

      return res.status(201).json({
        user: { id: userId, nome: nome.trim(), email },
        token,
      });
    }

    if (acao === "entrar") {
      const resultado = await db.execute({
        sql: "SELECT id, nome, email, password_hash FROM users WHERE email = ?",
        args: [email],
      });
      const user = resultado.rows[0];

      if (!user) {
        return res.status(401).json({ erro: "Email ou palavra-passe incorrectos." });
      }

      const valido = await bcrypt.compare(palavraPasse, user.password_hash);
      if (!valido) {
        return res.status(401).json({ erro: "Email ou palavra-passe incorrectos." });
      }

      const token = await criarSessao(db, user.id);

      return res.status(200).json({
        user: { id: user.id, nome: user.nome, email: user.email },
        token,
      });
    }

    return res.status(400).json({ erro: "Acção inválida. Usa 'registar' ou 'entrar'." });
  } catch (e) {
    console.error("Erro em /api/auth:", e);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}
