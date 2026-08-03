// Definição das perguntas do wizard de perfil de estudo, em blocos.
// Cada pergunta: { id, label, tipo: 'select'|'multiselect'|'text'|'number',
// opcoes?, condicional?(formData) => bool }

export const MATERIAS_EXAME = [
  { id: "matematica", nome: "Matemática" },
  { id: "fisica", nome: "Física" },
  { id: "quimica", nome: "Química" },
  { id: "biologia", nome: "Biologia" },
];

export const BLOCOS = [
  {
    titulo: "Objectivo e prazo",
    perguntas: [
      {
        id: "tipoExame", label: "Que tipo de exame vais fazer?", tipo: "select",
        opcoes: [
          { valor: "nacional", label: "Exame Nacional (12ª classe)" },
          { valor: "admissao", label: "Exame de admissão" },
          { valor: "reforco", label: "Só quero reforçar a matéria" },
        ],
      },
      {
        id: "mesesFaltam", label: "Quantos meses faltam para o exame?", tipo: "select",
        condicional: (f) => f.tipoExame && f.tipoExame !== "reforco",
        opcoes: [
          { valor: "menos_1", label: "Menos de 1 mês" },
          { valor: "1_3", label: "1 a 3 meses" },
          { valor: "4_6", label: "4 a 6 meses" },
          { valor: "mais_6", label: "Mais de 6 meses" },
        ],
      },
      { id: "areaInteresse", label: "Que curso ou área queres seguir depois?", tipo: "text" },
      { id: "notaAlvo", label: "Que nota queres atingir? (0-20)", tipo: "number" },
      {
        id: "classeAtual", label: "Em que classe estás actualmente?", tipo: "select",
        opcoes: [
          { valor: "10", label: "10ª classe" },
          { valor: "11", label: "11ª classe" },
          { valor: "12", label: "12ª classe" },
          { valor: "outra", label: "Outra" },
        ],
      },
    ],
  },
  {
    titulo: "Matérias e nível",
    perguntas: [
      {
        id: "materiasExame", label: "Que matérias entram no teu exame?", tipo: "multiselect",
        opcoes: MATERIAS_EXAME.map((m) => ({ valor: m.id, label: m.nome })),
      },
      {
        id: "materiaDificil", label: "Qual dessas te dá mais dificuldade agora?", tipo: "select",
        condicional: (f) => (f.materiasExame || []).length > 0,
        opcoesDinamicas: (f) => (f.materiasExame || []).map((id) => ({
          valor: id, label: MATERIAS_EXAME.find((m) => m.id === id)?.nome || id,
        })),
      },
      {
        id: "jaReprovou", label: "Já reprovaste nalguma destas matérias antes?", tipo: "select",
        opcoes: [{ valor: "sim", label: "Sim" }, { valor: "nao", label: "Não" }],
      },
    ],
  },
  {
    titulo: "Rotina de estudo",
    perguntas: [
      {
        id: "minutosDia", label: "Quanto tempo consegues estudar por dia?", tipo: "select",
        opcoes: [
          { valor: "30", label: "Menos de 30 min" },
          { valor: "60", label: "30 a 60 min" },
          { valor: "120", label: "1 a 2 horas" },
          { valor: "180", label: "Mais de 2 horas" },
        ],
      },
      {
        id: "diasSemana", label: "Que dias consegues estudar?", tipo: "multiselect",
        opcoes: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => ({ valor: d, label: d })),
      },
      {
        id: "horaMelhor", label: "A que hora estudas melhor?", tipo: "select",
        opcoes: [
          { valor: "manha", label: "Manhã" },
          { valor: "tarde", label: "Tarde" },
          { valor: "noite", label: "Noite" },
        ],
      },
      {
        id: "sozinhoOuGrupo", label: "Preferes estudar sozinho ou em grupo?", tipo: "select",
        opcoes: [{ valor: "sozinho", label: "Sozinho" }, { valor: "grupo", label: "Em grupo" }],
      },
    ],
  },
  {
    titulo: "Estilo e recursos",
    perguntas: [
      {
        id: "estiloAprendizagem", label: "Como preferes aprender matéria nova?", tipo: "select",
        opcoes: [
          { valor: "ler", label: "Ler o texto" },
          { valor: "exemplos", label: "Ver exemplos resolvidos" },
          { valor: "exercicios", label: "Fazer exercícios direto" },
        ],
      },
      {
        id: "verExplicacaoLogo", label: "Quando erras um exercício, preferes...", tipo: "select",
        opcoes: [
          { valor: "logo", label: "Ver a explicação logo" },
          { valor: "tentar", label: "Tentar de novo primeiro" },
        ],
      },
      {
        id: "prefereDetalhe", label: "Preferes explicações...", tipo: "select",
        opcoes: [
          { valor: "curtas", label: "Curtas e directas" },
          { valor: "detalhadas", label: "Detalhadas, com contexto" },
        ],
      },
      {
        id: "acessoInternet", label: "Tens internet estável para estudar todos os dias?", tipo: "select",
        opcoes: [
          { valor: "sempre", label: "Sempre" },
          { valor: "as_vezes", label: "Às vezes" },
          { valor: "raramente", label: "Raramente" },
        ],
      },
      {
        id: "dispositivoEstudo", label: "Estudas principalmente por...", tipo: "select",
        opcoes: [{ valor: "telemovel", label: "Telemóvel" }, { valor: "computador", label: "Computador" }],
      },
    ],
  },
];
