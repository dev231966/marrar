// ---------------------------------------------------------------------------
// DADOS MOCK — banco de exercícios por matéria.
// Quando o backend estiver pronto: GET /exercicios/:materiaId devolve isto.
// ---------------------------------------------------------------------------

export const bancoExercicios = {
  matematica: [
    {
      id: "mat-1",
      pergunta: "Numa progressão aritmética, o primeiro termo é 3 e a razão é 4. Qual é o 6.º termo?",
      opcoes: ["19", "23", "27", "15"],
      correta: 1,
      explicacao: "$a_n = a_1 + (n-1)\\cdot r \\Rightarrow a_6 = 3 + 5\\cdot4 = 23$",
    },
    {
      id: "mat-2",
      pergunta: "Qual é o valor de x na equação $2x + 6 = 18$?",
      opcoes: ["4", "5", "6", "8"],
      correta: 2,
      explicacao: "$2x = 12 \\Rightarrow x = 6$",
    },
    {
      id: "mat-3",
      pergunta: "Qual é o vértice da parábola $y = x^2 - 4x + 3$?",
      opcoes: ["(2, -1)", "(-2, 1)", "(4, 3)", "(1, 0)"],
      correta: 0,
      explicacao: "$x_v = -b/2a = 2$, substituindo: $y_v = 4-8+3=-1$",
    },
    {
      id: "mat-4",
      pergunta: "A soma dos ângulos internos de um triângulo é sempre:",
      opcoes: ["90°", "180°", "270°", "360°"],
      correta: 1,
      explicacao: "Propriedade geométrica básica de qualquer triângulo.",
    },
  ],
  fisica: [
    {
      id: "fis-1",
      pergunta: "Segundo a 2.ª Lei de Newton, se a força resultante é 10 N e a massa é 2 kg, qual é a aceleração?",
      opcoes: ["2 m/s²", "5 m/s²", "20 m/s²", "0.2 m/s²"],
      correta: 1,
      explicacao: "$F = m\\cdot a \\Rightarrow a = F/m = 10/2 = 5$ m/s²",
    },
    {
      id: "fis-2",
      pergunta: "Um corpo parte do repouso com aceleração constante de 4 m/s². Qual a sua velocidade após 3 s?",
      opcoes: ["7 m/s", "12 m/s", "4 m/s", "16 m/s"],
      correta: 1,
      explicacao: "$v = v_0 + a\\cdot t = 0 + 4\\cdot3 = 12$ m/s",
    },
    {
      id: "fis-3",
      pergunta: "A unidade SI de força é:",
      opcoes: ["Joule", "Watt", "Newton", "Pascal"],
      correta: 2,
      explicacao: "A força é medida em Newton (N), em homenagem a Isaac Newton.",
    },
  ],
  quimica: [
    {
      id: "qui-1",
      pergunta: "Quantos mols existem em 44 g de CO₂ (massa molar 44 g/mol)?",
      opcoes: ["0.5 mol", "1 mol", "2 mol", "4 mol"],
      correta: 1,
      explicacao: "$n = m/M = 44/44 = 1$ mol",
    },
    {
      id: "qui-2",
      pergunta: "Qual destes elementos é um gás nobre?",
      opcoes: ["Sódio", "Cloro", "Néon", "Cálcio"],
      correta: 2,
      explicacao: "O néon (Ne) pertence ao grupo 18 — gases nobres.",
    },
  ],
  biologia: [
    {
      id: "bio-1",
      pergunta: "Numa cruzamento entre dois híbridos (Aa x Aa), qual a proporção genotípica esperada?",
      opcoes: ["1 AA : 2 Aa : 1 aa", "1 AA : 1 aa", "3 AA : 1 aa", "2 AA : 2 aa"],
      correta: 0,
      explicacao: "Proporção clássica de Mendel para um monohibridismo: 1:2:1.",
    },
    {
      id: "bio-2",
      pergunta: "Onde ocorre a fotossíntese na célula vegetal?",
      opcoes: ["Mitocôndria", "Núcleo", "Cloroplasto", "Ribossoma"],
      correta: 2,
      explicacao: "O cloroplasto contém clorofila, pigmento essencial à fotossíntese.",
    },
  ],
};

export function getExercicios(materiaId) {
  return bancoExercicios[materiaId] || [];
}
