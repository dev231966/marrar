// /api/perfil/gerar.js
// POST /api/perfil/gerar  { perfilId }
// Chamado internamente por /api/perfil/index.js (fetch sem await). Faz o
// trabalho pesado: chama a Groq para montar o plano de estudo, grava o
// resultado e notifica o aluno quando pronto. Não é pensado para ser
// chamado directamente pelo frontend.

import { autenticar, ensureSchema, getDb } from "../_db.js";
import { encriptar } from "../_crypto.js";

const MODELO = "openai/gpt-oss-120b";

function montarInstrucao(respostas) {
  const {
    tipoExame, mesesFaltam, areaInteresse, notaAlvo, classeAtual,
    materiasExame = [], nivelPorMateria = {}, materiaDificil, jaReprovou,
    minutosDia, diasSemana = [], horaMelhor, sozinhoOuGrupo,
    estiloAprendizagem, verExplicacaoLogo, prefereDetalhe,
    acessoInternet, dispositivoEstudo,
  } = respostas;

  const nivelTexto = materiasExame
    .map((m) => `${m}: ${nivelPorMateria[m] || "não indicado"}`)
    .join("; ");

  const ehSecundario = classeAtual === "10" || classeAtual === "12";

  return [
    "És um orientador de estudos experiente da Marrar, plataforma moçambicana de preparação para exames.",
    `Tipo de exame: ${tipoExame}. Meses até ao exame: ${mesesFaltam || "não indicado"}.`,
    areaInteresse ? `Área/curso de interesse: ${areaInteresse}.` : "",
    notaAlvo ? `Nota-alvo (0-20): ${notaAlvo}.` : "",
    `Classe actual: ${classeAtual || "não indicada"}.`,
    `Matérias do exame e nível auto-avaliado: ${nivelTexto || "não indicado"}.`,
    materiaDificil ? `Matéria que mais dificuldade dá: ${materiaDificil}.` : "",
    jaReprovou ? `Já reprovou nalguma destas matérias antes: ${jaReprovou}.` : "",
    `Tempo disponível por dia: ${minutosDia || "não indicado"}.`,
    diasSemana.length ? `Dias disponíveis: ${diasSemana.join(", ")}.` : "",
    horaMelhor ? `Melhor altura do dia para estudar: ${horaMelhor}.` : "",
    sozinhoOuGrupo ? `Prefere estudar: ${sozinhoOuGrupo}.` : "",
    estiloAprendizagem ? `Estilo de aprendizagem preferido: ${estiloAprendizagem}.` : "",
    verExplicacaoLogo ? `Quando erra um exercício, prefere: ${verExplicacaoLogo}.` : "",
    prefereDetalhe ? `Prefere explicações: ${prefereDetalhe}.` : "",
    acessoInternet ? `Acesso a internet: ${acessoInternet}.` : "",
    dispositivoEstudo ? `Estuda principalmente por: ${dispositivoEstudo}.` : "",
    "",
    "Monta um plano de estudo personalizado.",
    ehSecundario
      ? "Como o aluno está no ensino secundário (10ª/12ª), inclui uma tabela explícita de temas por matéria com prioridade (alta/media/baixa) e o porquê de cada prioridade."
      : "Inclui uma lista de temas prioritários por matéria, com prioridade (alta/media/baixa) e o porquê.",
    "Inclui também instruções curtas e concretas de como usar a Marrar para seguir o plano (ex: que página visitar, em que ordem).",
    "Responde APENAS com JSON válido, sem texto à volta, no formato:",
    `{"resumo": "...", "temas": [{"materiaId": "...", "tema": "...", "prioridade": "alta|media|baixa", "porque": "..."}], "instrucoes": ["...", "..."]}`,
    "Português de Moçambique, directo, sem floreios.",
  ].filter(Boolean).join(" ");
}

async function chamarGroq(instrucao, apiKey) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);
  try {
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODELO,
        messages: [{ role: "user", content: instrucao }],
        reasoning_effort: "medium",
        max_tokens: 1400,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return resp;
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

async function marcarFalha(db, perfilId) {
  await db.execute({
    sql: "UPDATE perfil_estudo_resultados SET estado = 'falhou' WHERE id = ?",
    args: [perfilId],
  }).catch((e) => console.error("Falha a marcar perfil como falhado:", e.message));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { perfilId } = req.body || {};
  if (!perfilId) return res.status(400).json({ erro: "Falta o perfilId." });

  let db, userId;
  try {
    await ensureSchema();
    db = getDb();
    userId = await autenticar(req);
  } catch (e) {
    console.error("Erro de configuração da base de dados:", e);
    return res.status(500).json({ erro: "Base de dados não configurada no servidor." });
  }
  if (!userId) return res.status(401).json({ erro: "Precisas de sessão activa." });

  const linha = await db.execute({
    sql: "SELECT respostas_json FROM perfil_estudo_resultados WHERE id = ? AND user_id = ?",
    args: [perfilId, userId],
  });
  const registo = linha.rows[0];
  if (!registo) return res.status(404).json({ erro: "Perfil não encontrado." });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    await marcarFalha(db, perfilId);
    return res.status(500).json({ erro: "GROQ_API_KEY não configurada." });
  }

  try {
    const respostas = JSON.parse(registo.respostas_json);
    const instrucao = montarInstrucao(respostas);
    const resposta = await chamarGroq(instrucao, apiKey);

    if (!resposta.ok) {
      console.error("Groq API error ao gerar plano:", resposta.status, await resposta.text());
      await marcarFalha(db, perfilId);
      return res.status(502).json({ erro: "Falha ao gerar o plano." });
    }

    const dados = await resposta.json();
    const plano = JSON.parse(dados?.choices?.[0]?.message?.content || "{}");

    if (!plano.temas || !Array.isArray(plano.temas)) {
      await marcarFalha(db, perfilId);
      return res.status(502).json({ erro: "A IA devolveu um plano em formato inesperado." });
    }

    await db.execute({
      sql: `UPDATE perfil_estudo_resultados SET plano_json = ?, estado = 'pronto' WHERE id = ?`,
      args: [JSON.stringify(plano), perfilId],
    });

    const mensagem = "O teu plano de estudo personalizado está pronto. Vai a 'O teu plano' para veres.";
    await db.execute({
      sql: "INSERT INTO notificacoes (user_id, tipo, conteudo_enc) VALUES (?, 'plano_estudo', ?)",
      args: [userId, encriptar(mensagem)],
    }).catch((e) => console.error("Falha a notificar sobre o plano:", e.message));

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("Erro em /api/perfil/gerar:", e);
    await marcarFalha(db, perfilId);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}
