import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Contexto único de autenticação. Fala directamente com /api/auth (que já
// existe no backend, com bcrypt + sessões em base de dados) — não há aqui
// nenhuma simulação de login. O token fica em localStorage porque isto é a
// app real do utilizador (não um artifact/sandbox), por isso é seguro usar.

const AuthContext = createContext(null);

const TOKEN_KEY = 'marrar_token';
const USER_KEY = 'marrar_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  // "loading" evita um flash para /login antes de sabermos se já havia
  // sessão guardada no localStorage.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const persistirSessao = useCallback((novoUser, novoToken) => {
    setUser(novoUser);
    setToken(novoToken);
    localStorage.setItem(TOKEN_KEY, novoToken);
    localStorage.setItem(USER_KEY, JSON.stringify(novoUser));
  }, []);

  const chamarAuth = useCallback(async (payload) => {
    let resposta;
    try {
      resposta = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Falha de rede: a plataforma não deve rebentar, dá-se um erro claro.
      throw new Error('Não foi possível ligar ao servidor. Verifica a tua ligação.');
    }

    const dados = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
      throw new Error(dados.erro || 'Não foi possível concluir o pedido.');
    }
    return dados;
  }, []);

  const entrar = useCallback(async (email, palavraPasse) => {
    const dados = await chamarAuth({ acao: 'entrar', email, palavraPasse });
    persistirSessao(dados.user, dados.token);
    return dados.user;
  }, [chamarAuth, persistirSessao]);

  const registar = useCallback(async (nome, email, palavraPasse) => {
    const dados = await chamarAuth({ acao: 'registar', nome, email, palavraPasse });
    persistirSessao(dados.user, dados.token);
    return dados.user;
  }, [chamarAuth, persistirSessao]);

  const sair = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    entrar,
    registar,
    sair,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth tem de ser usado dentro de <AuthProvider>');
  return ctx;
}

/**
 * Helper para chamadas autenticadas a /api/*: junta sempre o Bearer token
 * guardado, para não repetir isto em cada página que fala com a API.
 */
export function authFetch(token, url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
