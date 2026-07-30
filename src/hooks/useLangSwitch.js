import { useState } from 'react';

/**
 * Estado partilhado do selector de idioma (PT / EN).
 * Por agora só controla o rótulo apresentado; quando o site tiver
 * traduções reais, este hook é o ponto certo para ligar um i18n.
 */
export function useLangSwitch(initial = 'PT') {
  const [lang, setLang] = useState(initial);
  return { lang, setLang };
}
