# Plano único — Marrar

Regra de ouro: **nada que prejudique a UX entra**. Toda a funcionalidade tem de
degradar graciosamente — se a IA cair, ou a base de dados na nuvem ainda não
existir, a plataforma não cai; ela usa o recurso seguinte da lista (banco
local, regras determinísticas, dados de demonstração) sem nunca mostrar um
ecrã em branco ou partido.

Resolvido por fases, cada uma isolada e testável antes de avançar para a
seguinte, porque tudo depende da Fase 1 (sem autenticação real aplicada de
facto, não há "utilizador"; sem "utilizador" não há histórico de IA, nem
progresso, nem Caderno de Erros).

## Fase 1 — Autenticação real + ícones ✅ CONCLUÍDA
- `public/icons.svg`: sprite único com `<symbol>`, usado via `<use href="/icons.svg#nome">`.
  Já cobre a gama necessária (navegação, estado da IA, feedback, acções) —
  incluindo `compass` e `graduation-cap` (Orientação Vocacional) e `download`
  / `file-text` (Exames), por isso não foi preciso acrescentar símbolos novos.
- `AuthContext` já existia, mas **nunca estava montado** — corrigido: `main.jsx`
  agora envolve a app em `<AuthProvider>`.
- `ProtectedRoute` já existia, mas **nenhuma rota o usava** — bug crítico
  corrigido: `App.jsx` agora envolve todas as rotas `/dashboard/*` com
  `<ProtectedRoute>`. Sem sessão válida → `/login`, com a rota original
  guardada para regressar lá depois de entrar.
- `Login.jsx` deixou de ser mockup (tinha `TODO: ligar à API real` e um
  `setTimeout` a fingir sucesso) — chama `useAuth().entrar/registar` a sério
  e mostra o erro devolvido pelo servidor.
- Nome do estudante (Dashboard + menu lateral) deixou de vir de um valor por
  omissão (`studentName = 'Juvêncio'`, `"Juvêncio Penga"` fixo) e passa a vir
  do utilizador autenticado. Acrescentado botão "Sair" funcional (não existia).

## Fase 2 — Base de dados: migrado de Turso/SQLite para Neon/Postgres ✅ CONCLUÍDA
> **Nota de migração (2 Ago 2026):** a ideia inicial desta fase era Turso
> (libSQL/SQLite) com fallback automático para um ficheiro local quando a
> nuvem não estivesse configurada. Isso partiu no ambiente de
> desenvolvimento real (Termux/Android): o pacote `@libsql/client` usa um
> binário nativo sem build disponível para `android-arm64`
> (`EBADPLATFORM`), e a própria CLI da Turso também depende de binários
> nativos que falharam a instalar por dependências do sistema em falta
> (`openssh`/`krb5` por resolver). Migrámos para **Neon (Postgres)**, cujo
> driver oficial (`@neondatabase/serverless`) fala apenas HTTP — zero
> dependências nativas, funciona em qualquer ambiente com `fetch`,
> incluindo Termux. Como consequência, **deixou de existir o modo "ficheiro
> local sem servidor"**: sem `DATABASE_URL` válida, a app não tem onde
> gravar nada (antes disso ser um problema, mesmo assim é preferível a
> passar dias a tentar instalar binários nativos que não têm build para a
> plataforma).
- `schema.sql` reescrito em sintaxe Postgres (`SERIAL`, `TIMESTAMPTZ`,
  `BOOLEAN`, `ADD COLUMN IF NOT EXISTS`).
- `api/_db.js` reescrito para `@neondatabase/serverless`, mas **mantém a
  mesma interface** que as rotas já usavam (`db.execute({ sql, args }) →
  { rows }`, com `?` traduzido automaticamente para `$1, $2...`) — por
  isso quase nenhuma rota precisou de ser tocada.
- `ensureSchema()` aplica o `schema.sql` sozinho em todos os arranques
  frios (todas as instruções usam `IF NOT EXISTS`, por isso é seguro
  repetir) — **já não é preciso correr nada manualmente** para provisionar
  a base de dados, ao contrário do que se previa para a Turso.
- Corrigido `resultado.lastInsertRowid` em `auth.js` (específico do
  libSQL) para `INSERT ... RETURNING id` (padrão Postgres).
- Removida uma fuga de debug em `auth.js` que expunha stack traces
  completos na resposta HTTP em caso de erro 500 — resquício de
  diagnóstico que nunca devia ter ido para produção.
- `api/exercicios.js`: `acertou` passa a booleano nativo (a coluna mudou de
  `INTEGER` para `BOOLEAN`).
- `duvidas.js` já tinha retries e mensagens de erro amigáveis; continua a
  gravar pergunta/resposta em `duvidas_historico`, associadas ao utilizador
  autenticado — sem bloquear a resposta da IA se a gravação falhar.
- Frontend (`Duvidas.jsx`): se `/api/duvidas` falhar (rede em baixo, IA fora
  do ar), mostra o erro em vez de travar — nunca um ecrã em branco.
- `CadernoDeErros.jsx`: `tempoRelativo()` simplificado — o Postgres devolve
  `TIMESTAMPTZ` já em ISO 8601 válido via JSON, não precisa da correcção
  manual de formato que era necessária com as datas do SQLite.

## Fase 3 — "Continuar de onde parou" reaproveitado ✅ CONCLUÍDA
- Extraído para `src/components/ContinuarCard.jsx` (+ `.css`), com a mesma
  aparência que já existia em Explicação.
- Explicação usa-o tal como antes (agora via componente partilhado).
- `api/historico.js`: devolve a última conversa guardada do estudante.
- Dúvidas mostra "Continuar a tua última conversa com a IA" no ecrã vazio
  quando existe histórico — reaproveitando a mesma interface.

## Fase 4 — Exercícios por nível/disciplina (funcional) ✅ CONCLUÍDA
- `exercicios_banco` ganhou uma coluna `nivel` (migração defensiva incluída
  para bases já criadas sem ela).
- `api/exercicios.js`:
  - `GET` devolve exercícios filtrados por disciplina+nível a partir do
    banco; se o banco estiver curto num tema, a **IA gera o resto na hora**
    e grava com `origem: 'ia'` (o banco cresce sozinho com o uso).
  - `POST` regista a resposta em `exercicios_respostas` e, se o estudante
    errou, grava automaticamente em `erros_guardados` — liga-se sozinho ao
    Caderno de Erros, venha o exercício do banco (servidor) ou do banco
    local embutido no frontend.
- `Exercicios.jsx`: selector de nível, chama `/api/exercicios`, e se falhar
  por qualquer razão cai sem drama para o banco local já embutido
  (`src/data/exerciciosData.js`) — a página nunca fica vazia mesmo sem IA
  nem base de dados.
- `api/erros.js` + `CadernoDeErros.jsx`: passaram a ler os erros reais do
  estudante autenticado (antes eram sempre os mesmos 3 erros de demonstração
  para todos os utilizadores). Se a API falhar, mostra os dados de
  demonstração em vez de um ecrã em branco.

## Fase 5 — Nova rota: Orientação Vocacional ✅ CONCLUÍDA
- `/dashboard/orientacao`: questionário curto (disciplinas fortes,
  interesses, estilo de trabalho preferido).
- `api/orientacao.js`: a IA sugere 2–3 cursos/áreas compatíveis; se estiver
  indisponível ou sem `GROQ_API_KEY`, cai para uma árvore de decisão local
  determinística (`REGRAS`, ajustada às 4 disciplinas reais da plataforma) —
  nunca fica sem resposta.

## Fase 6 — Nova rota: banco de exames para download ✅ CONCLUÍDA (estrutura)
- `/dashboard/exames`: lista de exames nacionais/de admissão por
  disciplina/ano/nível, com pesquisa e filtros — 100% funcional.
- `src/data/examesData.js` define o catálogo; cada item aponta para
  `/exames/<ficheiro>.pdf` dentro de `public/exames/`.
- **Falta**: os PDFs reais. A pasta `public/exames/` já existe com um
  `README.md` a explicar — basta lá colocar os ficheiros com o nome exacto
  indicado em `examesData.js` e os downloads funcionam sem tocar em código.

## Fase 7 — Limpeza final (por fazer)
- Confirmar todas as imagens em `.webp` (a cargo do utilizador, já em curso
  segundo a última mensagem).
- Colocar os PDFs reais em `public/exames/` (ver Fase 6).
- Rever se ainda sobra algum dado fictício/hardcoded por ligar à base real
  (ex: `streakDays`, `score` no Dashboard continuam com valores fixos —
  não há ainda tabela de progresso/streak no schema).
- Antes de publicar: `npm install && npm run build` para apanhar qualquer
  erro de import que a revisão manual do código não tenha detectado (este
  ambiente não tinha `node_modules` nem rede para correr o build). O
  `package-lock.json` foi removido de propósito nesta entrega — vai ser
  regenerado do zero com as dependências correctas (`@neondatabase/serverless`
  em vez de `@libsql/client`) no primeiro `npm install`.
- Definir `DATABASE_URL` (connection string da Neon, ver `.env.example`) e
  `GROQ_API_KEY` como variáveis de ambiente em produção (Vercel → Project →
  Settings → Environment Variables). Sem isso, `/api/*` responde 500 em
  qualquer rota que toque na base de dados.

---
Fases 1 a 6 implementadas nesta entrega. Fase 7 é limpeza/operacional, a
tratar antes do lançamento.
