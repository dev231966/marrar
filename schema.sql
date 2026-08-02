-- Schema Postgres (Neon). Aplicar uma vez com:
--   psql "$DATABASE_URL" -f schema.sql
-- ou colando no SQL Editor do dashboard da Neon.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  nome          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_em   TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS duvidas_historico (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('user', 'model')),
  texto         TEXT NOT NULL,
  contexto_json TEXT,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS erros_guardados (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  materia_id     TEXT NOT NULL,
  materia_nome   TEXT NOT NULL,
  tema           TEXT NOT NULL,
  pergunta       TEXT NOT NULL,
  tua_resposta   TEXT NOT NULL,
  resposta_certa TEXT NOT NULL,
  explicacao     TEXT NOT NULL,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exercicios_banco (
  id          SERIAL PRIMARY KEY,
  materia_id  TEXT NOT NULL,
  nivel       TEXT NOT NULL DEFAULT 'todos',
  pergunta    TEXT NOT NULL,
  opcoes_json TEXT NOT NULL,
  correta     INTEGER NOT NULL,
  explicacao  TEXT NOT NULL,
  origem      TEXT NOT NULL DEFAULT 'seed' CHECK (origem IN ('seed', 'ia')),
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exercicios_respostas (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercicio_id  INTEGER NOT NULL REFERENCES exercicios_banco(id) ON DELETE CASCADE,
  resposta_dada INTEGER NOT NULL,
  acertou       BOOLEAN NOT NULL,
  respondido_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS materiais_ficheiros (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  materia_id  TEXT NOT NULL,
  nome        TEXT NOT NULL,
  tipo        TEXT NOT NULL,
  tamanho     TEXT NOT NULL,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_duvidas_user ON duvidas_historico(user_id, criado_em);
CREATE INDEX IF NOT EXISTS idx_erros_user ON erros_guardados(user_id, criado_em);
CREATE INDEX IF NOT EXISTS idx_respostas_user ON exercicios_respostas(user_id, respondido_em);
CREATE INDEX IF NOT EXISTS idx_materiais_user ON materiais_ficheiros(user_id, materia_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_exercicios_materia_nivel ON exercicios_banco(materia_id, nivel);

-- Migração defensiva: bases criadas antes da coluna `nivel` existir.
ALTER TABLE exercicios_banco ADD COLUMN IF NOT EXISTS nivel TEXT NOT NULL DEFAULT 'todos';

CREATE TABLE IF NOT EXISTS orientacao_resultados (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  respostas_json TEXT NOT NULL,
  sugestoes_json TEXT NOT NULL,
  origem         TEXT NOT NULL CHECK (origem IN ('ia', 'regras')),
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orientacao_user ON orientacao_resultados(user_id, criado_em);

CREATE TABLE IF NOT EXISTS notificacoes (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo          TEXT NOT NULL DEFAULT 'geral',
  conteudo_enc  TEXT NOT NULL,
  lida          BOOLEAN NOT NULL DEFAULT false,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_user ON notificacoes(user_id, criado_em);
