// Este catálogo fica vazio até os PDFs reais serem validados e adicionados.
// Não exibimos títulos ou links inventados: um exame só entra aqui quando o
// ficheiro original estiver disponível em public/exames e tiver sido revisto.
export const exames = [];

export function pesquisarExames({ query = "", disciplina = "todas", nivel = "todos" } = {}) {
  const q = query.trim().toLowerCase();
  return exames
    .filter((e) => disciplina === "todas" || e.disciplina === disciplina)
    .filter((e) => nivel === "todos" || e.nivel === nivel)
    .filter((e) => !q || e.titulo.toLowerCase().includes(q))
    .sort((a, b) => b.ano - a.ano);
}
