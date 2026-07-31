// ---------------------------------------------------------------------------
// DADOS MOCK — evolução do estudante ao longo do tempo.
// Quando o backend estiver pronto: GET /evolucao devolve algo com esta forma.
// ---------------------------------------------------------------------------

export const notaTendencia = [10.2, 10.8, 11.5, 11.1, 12.4, 12.9, 13.0, 13.4];
export const semanasLabel = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];

export const evolucaoPorMateria = [
  { id: "matematica", nome: "Matemática", cor: "#D6342C", percent: 68, variacao: 6 },
  { id: "fisica", nome: "Física", cor: "#2F6FED", percent: 44, variacao: -3 },
  { id: "quimica", nome: "Química", cor: "#1E9E5A", percent: 81, variacao: 12 },
  { id: "biologia", nome: "Biologia", cor: "#9B59B6", percent: 30, variacao: 2 },
];

export const statsResumo = {
  notaPrevista: 13.4,
  notaMaxima: 20,
  exerciciosFeitos: 312,
  precisaoMedia: 76,
  tempoEstudoHoras: 41,
};
