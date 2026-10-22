import { autenticar, ensureSchema, getDb } from '../../../api/_db.js';

async function adminId(req, db) {
  const userId = await autenticar(req);
  if (!userId) return null;
  const result = await db.execute({ sql: 'SELECT id FROM users WHERE id = ? AND papel = \'admin\' AND suspenso = false', args: [userId] });
  return result.rows[0]?.id || null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'PATCH') return res.status(405).json({ erro: 'Método não permitido' });
  try {
    await ensureSchema();
    const db = getDb();
    if (!await adminId(req, db)) return res.status(403).json({ erro: 'Acesso administrativo não autorizado.' });

    if (req.method === 'PATCH') {
      const { userId, papel, suspenso } = req.body || {};
      if (!Number.isInteger(Number(userId)) || !['estudante', 'professor', 'admin'].includes(papel) || typeof suspenso !== 'boolean') return res.status(400).json({ erro: 'Dados de utilizador inválidos.' });
      await db.execute({ sql: 'UPDATE users SET papel = ?, suspenso = ? WHERE id = ?', args: [papel, suspenso, Number(userId)] });
      return res.status(200).json({ ok: true });
    }

    const [counts, users] = await Promise.all([
      db.execute({ sql: `SELECT
        (SELECT COUNT(*) FROM users) AS utilizadores,
        (SELECT COUNT(*) FROM materiais_ficheiros) AS materiais,
        (SELECT COUNT(*) FROM exames WHERE publicado = true) AS exames,
        (SELECT COUNT(*) FROM notificacoes WHERE tipo = 'denuncia' AND lida = false) AS denuncias`, args: [] }),
      db.execute({ sql: 'SELECT id, nome, email, papel, suspenso, criado_em FROM users ORDER BY criado_em DESC LIMIT 25', args: [] }),
    ]);
    return res.status(200).json({ stats: counts.rows[0], users: users.rows });
  } catch (error) {
    console.error('Erro em /api/admin:', error);
    return res.status(500).json({ erro: 'Não foi possível carregar a área administrativa.' });
  }
}
