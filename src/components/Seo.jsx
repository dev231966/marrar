import { useEffect } from 'react';

const DEFAULTS = {
  title: 'Estudai | Plataforma de estudos em Moçambique',
  description: 'Estuda para os exames de Moçambique com explicações claras, exercícios por disciplina e acompanhamento do teu progresso.',
};

function upsertMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export default function Seo({ title = DEFAULTS.title, description = DEFAULTS.description, noIndex = false }) {
  useEffect(() => {
    const canonical = `${window.location.origin}${window.location.pathname}`;
    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:locale', 'pt_MZ');
    upsertMeta('name', 'twitter:card', 'summary');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);

    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;
  }, [description, noIndex, title]);

  return null;
}

export { DEFAULTS };
