import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Sessao ──
//
// O backend (backend/src/routes/auth.js) compara a senha enviada com a variavel
// de ambiente SESSION_SECRET do servidor e devolve um token de 6 horas. O token e
// o que autentica as requisicoes seguintes.
//
// A senha em si NAO fica no app: e digitada pelo usuario a cada nova sessao. O que
// guardamos aqui e apenas o token, que expira sozinho — se este storage for lido,
// o que se obtem e um acesso com prazo, nao a senha.

const KEY = 'fmv-session';

let cached = null;   // { token, expiresAt } — evita ler o AsyncStorage a cada request

export async function loadSession() {
  if (cached) return cached;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s?.token) return null;
    // token de 6h; se ja venceu, nao adianta tentar usar
    if (s.expiresAt && Date.parse(s.expiresAt) <= Date.now()) {
      await clearSession();
      return null;
    }
    cached = s;
    return s;
  } catch {
    return null;
  }
}

export async function saveSession(session) {
  cached = session;
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(session));
  } catch {}
}

export async function clearSession() {
  cached = null;
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}

// Token em memoria, para o apiFetch nao precisar ser async antes da requisicao.
export function currentToken() {
  return cached?.token || null;
}
