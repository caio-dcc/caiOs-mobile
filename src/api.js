import Constants from 'expo-constants';

// Em web, localhost aponta pro proprio navegador; num dispositivo/emulador precisa
// do IP da maquina de dev na rede local. Configuravel via app.json -> extra.apiBase
// ou env EXPO_PUBLIC_API_BASE, com fallback pro localhost (funciona no simulador iOS/web).
const extra = Constants.expoConfig?.extra || {};
export const API_BASE = process.env.EXPO_PUBLIC_API_BASE || extra.apiBase || 'http://localhost:3001';

export async function apiFetch(path, opts = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
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
