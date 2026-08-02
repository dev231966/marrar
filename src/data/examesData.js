// ---------------------------------------------------------------------------
// Catálogo de exames disponíveis para download.
// Os ficheiros em si (PDFs) não vêm embutidos no código — cada item aponta
// para /exames/<ficheiro>.pdf dentro de public/. Basta colocar lá os PDFs
// reais com o mesmo nome para os downloads funcionarem de imediato; a
// página em si (pesquisa, filtros, listagem) já está 100% funcional.
// ---------------------------------------------------------------------------

export const exames = [
  { id: "mat-12-2024", disciplina: "matematica", disciplinaNome: "Matemática", nivel: "12", tipo: "nacional", ano: 2024, titulo: "Exame Nacional de Matemática — 12ª classe (2024)", ficheiro: "/exames/matematica-12-2024.pdf" },
  { id: "mat-12-2023", disciplina: "matematica", disciplinaNome: "Matemática", nivel: "12", tipo: "nacional", ano: 2023, titulo: "Exame Nacional de Matemática — 12ª classe (2023)", ficheiro: "/exames/matematica-12-2023.pdf" },
  { id: "mat-10-2024", disciplina: "matematica", disciplinaNome: "Matemática", nivel: "10", tipo: "nacional", ano: 2024, titulo: "Exame Nacional de Matemática — 10ª classe (2024)", ficheiro: "/exames/matematica-10-2024.pdf" },
  { id: "fis-12-2024", disciplina: "fisica", disciplinaNome: "Física", nivel: "12", tipo: "nacional", ano: 2024, titulo: "Exame Nacional de Física — 12ª classe (2024)", ficheiro: "/exames/fisica-12-2024.pdf" },
  { id: "fis-12-2023", disciplina: "fisica", disciplinaNome: "Física", nivel: "12", tipo: "nacional", ano: 2023, titulo: "Exame Nacional de Física — 12ª classe (2023)", ficheiro: "/exames/fisica-12-2023.pdf" },
  { id: "qui-12-2024", disciplina: "quimica", disciplinaNome: "Química", nivel: "12", tipo: "nacional", ano: 2024, titulo: "Exame Nacional de Química — 12ª classe (2024)", ficheiro: "/exames/quimica-12-2024.pdf" },
  { id: "qui-10-2023", disciplina: "quimica", disciplinaNome: "Química", nivel: "10", tipo: "nacional", ano: 2023, titulo: "Exame Nacional de Química — 10ª classe (2023)", ficheiro: "/exames/quimica-10-2023.pdf" },
  { id: "bio-12-2024", disciplina: "biologia", disciplinaNome: "Biologia", nivel: "12", tipo: "nacional", ano: 2024, titulo: "Exame Nacional de Biologia — 12ª classe (2024)", ficheiro: "/exames/biologia-12-2024.pdf" },
  { id: "bio-12-2023", disciplina: "biologia", disciplinaNome: "Biologia", nivel: "12", tipo: "nacional", ano: 2023, titulo: "Exame Nacional de Biologia — 12ª classe (2023)", ficheiro: "/exames/biologia-12-2023.pdf" },
  { id: "adm-mat-2024", disciplina: "matematica", disciplinaNome: "Matemática", nivel: "admissao", tipo: "admissao", ano: 2024, titulo: "Exame de Admissão — Matemática (2024)", ficheiro: "/exames/admissao-matematica-2024.pdf" },
  { id: "adm-fis-2024", disciplina: "fisica", disciplinaNome: "Física", nivel: "admissao", tipo: "admissao", ano: 2024, titulo: "Exame de Admissão — Física (2024)", ficheiro: "/exames/admissao-fisica-2024.pdf" },
  { id: "adm-bio-2024", disciplina: "biologia", disciplinaNome: "Biologia", nivel: "admissao", tipo: "admissao", ano: 2024, titulo: "Exame de Admissão — Biologia (2024)", ficheiro: "/exames/admissao-biologia-2024.pdf" },
];

export function pesquisarExames({ query = "", disciplina = "todas", nivel = "todos" } = {}) {
  const q = query.trim().toLowerCase();
  return exames
    .filter((e) => disciplina === "todas" || e.disciplina === disciplina)
    .filter((e) => nivel === "todos" || e.nivel === nivel)
    .filter((e) => !q || e.titulo.toLowerCase().includes(q))
    .sort((a, b) => b.ano - a.ano);
}
