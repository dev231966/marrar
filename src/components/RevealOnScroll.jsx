import { useEffect, useRef, useState } from 'react';

/**
 * Envolve qualquer conteúdo e aplica a animação "reveal" (fade + slide-up)
 * quando o elemento entra no viewport. Substitui o IntersectionObserver
 * global que existia no <script> da versão HTML.
 *
 * Uso: <RevealOnScroll delay={1}><div className="feature-card">...</div></RevealOnScroll>
 */
export default function RevealOnScroll({ children, delay = 0, className = '', as: Tag = 'div' }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const delayClass = delay ? `reveal-delay-${delay}` : '';

  return (
    <Tag ref={ref} className={`reveal ${delayClass} ${isVisible ? 'in' : ''} ${className}`.trim()}>
      {children}
    </Tag>
  );
}
