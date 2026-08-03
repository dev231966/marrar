// src/utils/origemLabel.js
// Traduz o valor interno guardado na base de dados (origem: 'ia' | 'seed')
// para o texto que aparece ao utilizador — nunca a palavra genérica "IA".

const ORIGEM_LABEL = {
  ia: "Criado pelo Fario",
  seed: "Banco de exercícios",
};

export function origemParaLabel(origem) {
  return ORIGEM_LABEL[origem] || "Marrar";
}
