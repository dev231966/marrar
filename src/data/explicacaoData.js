// ---------------------------------------------------------------------------
// DADOS MOCK — dicionário temporário.
// Quando o backend estiver pronto, isto sai e cada função abaixo passa a
// fazer fetch/axios para a API (ex: GET /materias, GET /materias/:id/temas,
// GET /aulas/:materiaId/:temaId). A FORMA dos dados foi pensada para bater
// certo com o que as páginas esperam, para a troca ser só na fonte.
// ---------------------------------------------------------------------------

export const materias = [
  { id: "matematica", nome: "Matemática", cor: "#D6342C", progresso: 68 },
  { id: "fisica", nome: "Física", cor: "#2F6FED", progresso: 44 },
  { id: "quimica", nome: "Química", cor: "#1E9E5A", progresso: 81 },
  { id: "biologia", nome: "Biologia", cor: "#9B59B6", progresso: 30 },
];

export const temasPorMateria = {
  matematica: [
    { id: "progressoes", nome: "Progressões Aritméticas", totalAulas: 9, concluidas: 4 },
    { id: "funcoes-quadraticas", nome: "Funções Quadráticas", totalAulas: 7, concluidas: 2 },
    { id: "trigonometria", nome: "Trigonometria", totalAulas: 11, concluidas: 0 },
  ],
  fisica: [
    { id: "leis-newton", nome: "Leis de Newton", totalAulas: 6, concluidas: 3 },
    { id: "cinematica", nome: "Cinemática", totalAulas: 8, concluidas: 1 },
  ],
  quimica: [
    { id: "estequiometria", nome: "Estequiometria", totalAulas: 5, concluidas: 5 },
    { id: "tabela-periodica", nome: "Tabela Periódica", totalAulas: 4, concluidas: 2 },
  ],
  biologia: [
    { id: "genetica", nome: "Genética", totalAulas: 6, concluidas: 0 },
  ],
};

// Conteúdo completo de cada aula, indexado por "materiaId/temaId".
// Para os temas ainda sem conteúdo escrito, cai no fallback genérico
// (ver getAula) em vez de rebentar a página.
export const aulasDetalhe = {
  "matematica/progressoes": {
    titulo: "Progressões Aritméticas",
    contexto: "Álgebra",
    corpo: [
      "Uma progressão aritmética (PA) é uma sequência de números em que a diferença entre termos consecutivos é sempre a mesma. A essa diferença chamamos razão, representada por r.",
      "Para encontrar qualquer termo de uma PA sem ter de somar um a um, usamos a fórmula do termo geral.",
    ],
    exemplos: [
      {
        tag: "Fórmula",
        latex: "a_n = a_1 + (n-1) \\cdot r",
        nota: "Onde a₁ é o primeiro termo, n a posição do termo que queres encontrar, e r a razão.",
      },
      {
        tag: "Exemplo resolvido",
        enunciado: "Numa PA em que o primeiro termo é 3 e a razão é 4, qual é o 10º termo?",
        latex: "a_{10} = 3 + (10-1) \\cdot 4 = 3 + 36 = 39",
        explicacao: "Substituímos a₁ = 3, n = 10 e r = 4 na fórmula, e resolvemos.",
      },
    ],
    exerciciosRelacionados: 12,
  },
};

// Aulas em destaque no hub — normalmente viria de "últimas vistas" ou
// "recomendadas" calculadas no backend a partir do progresso do estudante.
export const recentes = [
  { materiaId: "matematica", temaId: "progressoes", titulo: "Progressões Aritméticas", subtitulo: "Matemática · continuar" },
  { materiaId: "fisica", temaId: "leis-newton", titulo: "Leis de Newton", subtitulo: "Física · continuar" },
];

export const blogPosts = [
  { id: "estudar-30min", titulo: "30 minutos por dia batem 5 horas de uma vez", tag: "Dica de estudo" },
  { id: "erros-caderno", titulo: "Porque o Caderno de Erros é a tua maior arma", tag: "Estratégia" },
];

// --- helpers ---------------------------------------------------------------

export function getMateria(materiaId) {
  return materias.find((m) => m.id === materiaId) || null;
}

export function getTemas(materiaId) {
  return temasPorMateria[materiaId] || [];
}

export function getTema(materiaId, temaId) {
  return getTemas(materiaId).find((t) => t.id === temaId) || null;
}

export function getAula(materiaId, temaId) {
  const key = `${materiaId}/${temaId}`;
  if (aulasDetalhe[key]) return aulasDetalhe[key];

  // fallback: tema existe mas o conteúdo ainda não foi escrito
  const tema = getTema(materiaId, temaId);
  if (!tema) return null;
  return {
    titulo: tema.nome,
    contexto: getMateria(materiaId)?.nome || "",
    corpo: ["O conteúdo desta aula está a ser preparado pela nossa equipa. Volta em breve."],
    exemplos: [],
    exerciciosRelacionados: 0,
  };
}

export function searchConteudo(query) {
  const q = query.trim().toLowerCase();
  if (!q) return { aulas: [], posts: [] };

  const aulasEncontradas = Object.entries(temasPorMateria).flatMap(([materiaId, temas]) =>
    temas
      .filter((t) => t.nome.toLowerCase().includes(q))
      .map((t) => ({ materiaId, temaId: t.id, titulo: t.nome, materiaNome: getMateria(materiaId).nome }))
  );

  const postsEncontrados = blogPosts.filter((p) => p.titulo.toLowerCase().includes(q));

  return { aulas: aulasEncontradas, posts: postsEncontrados };
}
