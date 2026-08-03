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


-- Adições ao schema.sql existente — correr na Neon (SQL Editor ou psql)

-- Exercícios precisam de tema granular e busca eficiente a partir de 10k+ linhas.
ALTER TABLE exercicios_banco ADD COLUMN IF NOT EXISTS tema TEXT NOT NULL DEFAULT '';
ALTER TABLE exercicios_banco ADD COLUMN IF NOT EXISTS dificuldade TEXT NOT NULL DEFAULT 'medio'
  CHECK (dificuldade IN ('facil', 'medio', 'dificil'));

-- Backfill: exercícios antigos sem tema usam a matéria como tema provisório.
UPDATE exercicios_banco SET tema = materia_id WHERE tema = '';

-- Full-text search em português — essencial para pesquisar "o que o
-- estudante quer aprender" sem varrer a tabela inteira linha a linha.
ALTER TABLE exercicios_banco ADD COLUMN IF NOT EXISTS busca_tsv tsvector
  GENERATED ALWAYS AS (
    to_tsvector('portuguese', coalesce(tema, '') || ' ' || coalesce(pergunta, '') || ' ' || coalesce(materia_id, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_exercicios_busca ON exercicios_banco USING GIN (busca_tsv);
CREATE INDEX IF NOT EXISTS idx_exercicios_tema ON exercicios_banco(tema);

-- Progresso do estudante: tabela própria, actualizada por incremento
-- (UPDATE pontos = pontos + X), nunca recalculada a partir do histórico
-- inteiro. Isto é o que mantém a leitura rápida mesmo com 10k+ respostas.
CREATE TABLE IF NOT EXISTS user_progresso (
  user_id            INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  pontos             INTEGER NOT NULL DEFAULT 0,
  exercicios_feitos  INTEGER NOT NULL DEFAULT 0,
  exercicios_certos  INTEGER NOT NULL DEFAULT 0,
  sequencia_dias     INTEGER NOT NULL DEFAULT 0,
  ultimo_dia_activo  DATE,
  atualizado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);
