// ---------------------------------------------------------------------------
// DADOS MOCK — formulário rápido, organizado por matéria.
// ---------------------------------------------------------------------------

export const formulario = [
  {
    materia: "Matemática",
    cor: "#D6342C",
    formulas: [
      { nome: "Termo geral de PA", tex: "a_n = a_1 + (n-1)\\cdot r" },
      { nome: "Fórmula resolvente", tex: "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}" },
      { nome: "Soma de PA", tex: "S_n = \\frac{(a_1+a_n)\\cdot n}{2}" },
    ],
  },
  {
    materia: "Física",
    cor: "#2F6FED",
    formulas: [
      { nome: "2.ª Lei de Newton", tex: "F = m \\cdot a" },
      { nome: "Velocidade média", tex: "v = \\frac{\\Delta d}{\\Delta t}" },
      { nome: "Equação de Torricelli", tex: "v^2 = v_0^2 + 2a\\Delta d" },
    ],
  },
  {
    materia: "Química",
    cor: "#1E9E5A",
    formulas: [
      { nome: "Número de mols", tex: "n = \\frac{m}{M}" },
      { nome: "Concentração molar", tex: "C = \\frac{n}{V}" },
    ],
  },
  {
    materia: "Biologia",
    cor: "#9B59B6",
    formulas: [
      { nome: "Proporção de Mendel (mono-híbrido)", tex: "1\\,AA : 2\\,Aa : 1\\,aa" },
    ],
  },
];

export const unidadesPorCategoria = {
  comprimento: {
    nome: "Comprimento",
    unidades: { km: 1000, m: 1, cm: 0.01, mm: 0.001, mi: 1609.34 },
  },
  massa: {
    nome: "Massa",
    unidades: { kg: 1000, g: 1, mg: 0.001, lb: 453.592 },
  },
  temperatura: {
    nome: "Temperatura",
    especial: true,
  },
};
