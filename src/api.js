import Constants from 'expo-constants';
import { currentToken, clearSession } from './auth.js';

// Base da API. Configuravel via app.json -> extra.apiBase ou EXPO_PUBLIC_API_BASE;
// o default e o backend publicado no Render.
const extra = Constants.expoConfig?.extra || {};
export const API_BASE = process.env.EXPO_PUBLIC_API_BASE || extra.apiBase || 'https://caios-backend.onrender.com';

// Chamado quando o backend responde 401: a sessao venceu ou foi revogada e o app
// precisa voltar para a tela de senha. Registrado pelo AuthProvider.
let onUnauthorized = null;
export function setUnauthorizedHandler(fn) { onUnauthorized = fn; }

export async function apiFetch(path, opts = {}) {
  const token = currentToken();

  const res = await fetch(API_BASE + path, {
    headers: {
      'Content-Type': 'application/json',
      // O zeroTrustMiddleware le o token do cookie `fmv_session_token` ou do
      // header `x-session-token` — NAO de Authorization: Bearer. RN nao tem
      // cookie jar automatico, entao usamos o header.
      ...(token ? { 'x-session-token': token } : null),
      // O mesmo middleware tem geofence: sem indicacao de regiao Rio/SP a
      // resposta e 403. Enviamos explicitamente.
      'x-region': 'America/Sao_Paulo',
      ...(opts.headers || {})
    },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });

  // Sessao expirada/revogada: limpa e avisa quem controla a navegacao.
  if (res.status === 401) {
    await clearSession();
    if (onUnauthorized) onUnauthorized();
    throw new Error('Sessão expirada. Entre novamente.');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

export const api = {
  get: path => apiFetch(path),
  post: (path, body) => apiFetch(path, { method: 'POST', body }),
  del: path => apiFetch(path, { method: 'DELETE' })
};

// POST /v1/auth/login — troca a senha por um token de 6h.
// Nao usa apiFetch porque nao deve mandar Authorization nem tratar 401 como
// "sessao expirada": aqui 401 significa senha errada.
export async function login(password) {
  const res = await fetch(API_BASE + '/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-region': 'America/Sao_Paulo' },
    body: JSON.stringify({ password })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // NUNCA repassar data.error para a UI: o backend responde com o formato da
    // senha ("use canguru@horario, ex: canguru@1956"), o que a exibiria na tela
    // de login para qualquer um que estivesse olhando. Mensagem genérica.
    throw new Error(res.status === 401 ? 'Senha incorreta.' : 'Não foi possível entrar. Tente novamente.');
  }
  return data;   // { token, expiresAt, user, message }
}
