// ---------------------------------------------------------------------------
// DADOS MOCK — materiais guardados pelo estudante.
// ---------------------------------------------------------------------------

export const pastasIniciais = [
  { id: "matematica", nome: "Matemática", cor: "#D6342C", ficheiros: 8 },
  { id: "fisica", nome: "Física", cor: "#2F6FED", ficheiros: 5 },
  { id: "quimica", nome: "Química", cor: "#1E9E5A", ficheiros: 3 },
  { id: "biologia", nome: "Biologia", cor: "#9B59B6", ficheiros: 6 },
];

export const ficheirosIniciais = [
  { id: "f1", nome: "Resumo — Progressões Aritméticas.pdf", pastaId: "matematica", tipo: "pdf", tamanho: "1.2 MB", data: "Hoje" },
  { id: "f2", nome: "Fórmulas de Cinemática.pdf", pastaId: "fisica", tipo: "pdf", tamanho: "480 KB", data: "Ontem" },
  { id: "f3", nome: "Foto do quadro — Estequiometria.jpg", pastaId: "quimica", tipo: "img", tamanho: "2.1 MB", data: "Ontem" },
  { id: "f4", nome: "Apontamentos — Genética Mendeliana.docx", pastaId: "biologia", tipo: "doc", tamanho: "340 KB", data: "3 dias" },
  { id: "f5", nome: "Exercícios resolvidos — Funções.pdf", pastaId: "matematica", tipo: "pdf", tamanho: "890 KB", data: "5 dias" },
];
