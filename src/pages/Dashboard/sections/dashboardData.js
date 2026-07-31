// Dados de exemplo. Substituir por dados vindos da API quando existir.

export const services = [
  { key: 'explicacao', name: 'Explicação', icon: 'chat', className: 'i-explicacao' },
  { key: 'exercicios', name: 'Exercícios', icon: 'check', className: 'i-exercicios' },
  { key: 'evolucao', name: 'Evolução', icon: 'trend', className: 'i-evolucao' },
  { key: 'erros', name: 'Caderno de Erros', icon: 'alert', className: 'i-erros' },
  { key: 'material', name: 'Meu Material', icon: 'book', className: 'i-material' },
  { key: 'ferramentas', name: 'Ferramentas', icon: 'tools', className: 'i-ferramentas' },
];

export const subjects = [
  { key: 'matematica', name: 'Matemática', percent: 68, color: 'var(--accent)' },
  { key: 'fisica', name: 'Física', percent: 44, color: 'var(--blue)' },
  { key: 'quimica', name: 'Química', percent: 81, color: 'var(--green)' },
  { key: 'biologia', name: 'Biologia', percent: 35, color: 'var(--purple)' },
];

export const activityFeed = [
  {
    key: 'a1',
    icon: 'check',
    tone: 'ok',
    title: 'Progressões · 8/10 correctas',
    subtitle: 'Matemática',
    time: 'Hoje',
  },
  {
    key: 'a2',
    icon: 'play',
    tone: 'info',
    title: 'Aula: Leis de Newton',
    subtitle: 'Física',
    time: 'Ontem',
  },
  {
    key: 'a3',
    icon: 'alert',
    tone: 'warn',
    title: '3 erros guardados',
    subtitle: 'Química · Estequiometria',
    time: 'Ontem',
  },
  {
    key: 'a4',
    icon: 'check',
    tone: 'ok',
    title: 'Genética · 10/10 correctas',
    subtitle: 'Biologia',
    time: '2 dias',
  },
];

export const achievements = [
  { key: 'streak7', label: '7 dias seguidos', icon: 'flame', locked: false },
  { key: 'ex100', label: '100 exercícios', icon: 'check', locked: false },
  { key: 'zeroRepeat', label: 'Zero erros repetidos', icon: 'alert', locked: false },
  { key: 'streak30', label: '30 dias seguidos', icon: 'lock', locked: true },
  { key: 'allSubjects', label: 'Todas as matérias', icon: 'lock', locked: true },
];
