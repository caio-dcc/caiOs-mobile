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
  const method = (opts.method || 'GET').toUpperCase();
  const url = API_BASE + path;
  const startTime = Date.now();

  console.log(`🌐 [HTTP REQ] ${method} ${path}`, opts.body ? { body: opts.body } : '');

  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'x-session-token': token } : null),
        'x-region': 'America/Sao_Paulo',
        ...(opts.headers || {})
      },
      ...opts,
      method,
      body: opts.body && typeof opts.body === 'object' ? JSON.stringify(opts.body) : opts.body
    });

    const duration = Date.now() - startTime;

    if (res.status === 401) {
      console.warn(`🔒 [HTTP 401] ${method} ${path} (${duration}ms) - Sessão Expirada`);
      await clearSession();
      if (onUnauthorized) onUnauthorized();
      throw new Error('Sessão expirada. Entre novamente.');
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`❌ [HTTP ERR ${res.status}] ${method} ${path} (${duration}ms):`, text);
      throw new Error(`API ${path} failed: ${res.status} ${text}`);
    }

    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await res.json() : await res.text();
    console.log(`✅ [HTTP ${res.status}] ${method} ${path} (${duration}ms)`, data);
    return data;
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`💥 [HTTP FAIL] ${method} ${path} (${duration}ms):`, err.message);
    throw err;
  }
}

export const api = {
  get: path => apiFetch(path),
  post: (path, body) => apiFetch(path, { method: 'POST', body }),
  del: path => apiFetch(path, { method: 'DELETE' })
};

export async function login(password) {
  const url = API_BASE + '/v1/auth/login';
  const startTime = Date.now();
  console.log(`🌐 [HTTP REQ] POST /v1/auth/login`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-region': 'America/Sao_Paulo' },
      body: JSON.stringify({ password })
    });

    const duration = Date.now() - startTime;
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error(`❌ [HTTP ${res.status}] POST /v1/auth/login (${duration}ms)`);
      throw new Error(res.status === 401 ? 'Senha incorreta.' : 'Não foi possível entrar. Tente novamente.');
    }

    console.log(`✅ [HTTP ${res.status}] POST /v1/auth/login (${duration}ms)`, data);
    return data;
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`💥 [HTTP FAIL] POST /v1/auth/login (${duration}ms):`, err.message);
    throw err;
  }
}
