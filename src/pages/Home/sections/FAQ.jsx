import { useState } from 'react';
import RevealOnScroll from '../../../components/RevealOnScroll';

const FAQS = [
  {
    q: 'O Marrar é mesmo grátis?',
    a: 'Sim. O plano Estudante dá acesso às matérias base e a exercícios semanais sem qualquer custo. O Premium é opcional, para quem quer explicação e exercícios ilimitados.',
  },
  {
    q: 'Para que exames serve?',
    a: 'Serve para o exame de admissão à universidade e para o exame nacional. Escolhes o teu exame no registo e o conteúdo organiza-se à volta dele.',
  },
  {
    q: 'Como funciona a explicação?',
    a: 'Cada matéria tem aulas directas ao que costuma ser perguntado no exame, seguidas de exercícios com explicação passo a passo para fixares a lógica, não só a resposta.',
  },
  {
    q: 'Os exercícios são avaliados por quem?',
    a: 'Por especialistas universitários, que revêm cada exercício e a respectiva explicação antes de entrar na plataforma.',
  },
  {
    q: 'Posso cancelar o Premium quando quiser?',
    a: 'Sim, sem burocracia e sem multa. Voltas ao plano Estudante e mantens o teu histórico de estudo.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faqs" style={{ background: 'var(--bg-soft)' }}>
      <RevealOnScroll as="div" className="section-head">
        <span className="eyebrow"><span className="dot" />Dúvidas</span>
        <h2>Perguntas frequentes</h2>
        <p>Tudo o que precisas de saber antes de começar a marrar.</p>
      </RevealOnScroll>

      <div className="faq-list">
        {FAQS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <RevealOnScroll as="div" delay={index} key={item.q} className={`faq-item ${isOpen ? 'open' : ''}`}>
              <button className="faq-q" onClick={() => setOpenIndex(isOpen ? null : index)}>
                {item.q}
                <svg className="chev" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              <div className="faq-a" style={{ maxHeight: isOpen ? '240px' : '0' }}>
                <p>{item.a}</p>
              </div>
            </RevealOnScroll>
          );
        })}
      </div>
    </section>
  );
}
