// Deriva a paleta inteira do sistema a partir de UMA cor principal.
// Ao inves de escrever em CSS vars (:root), retorna um objeto de paleta
// consumido via useTheme()/SettingsContext.

export function hsl(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex || '').trim());
  if (!m) return null;
  const int = parseInt(m[1], 16);
  const r = ((int >> 16) & 255) / 255, g = ((int >> 8) & 255) / 255, b = (int & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  let h = 0, s = 0;
  if (mx !== mn) {
    const dd = mx - mn;
    s = l > .5 ? dd / (2 - mx - mn) : dd / (mx + mn);
    h = mx === r ? (g - b) / dd + (g < b ? 6 : 0) : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4;
    h *= 60;
  }
  return [h, Math.max(45, s * 100)];
}

export function rgbOf(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
  return f(0) + ',' + f(8) + ',' + f(4);
}

export function rgbStr(h, s, l) {
  return 'rgb(' + rgbOf(h, s, l) + ')';
}

export function rgbaStr(h, s, l, a) {
  return 'rgba(' + rgbOf(h, s, l) + ',' + a + ')';
}

// Paleta como valores JS diretos (nao mais CSS custom properties)
export function paletteOf(hex) {
  const p = hsl(hex);
  if (!p) return null;
  const [h, s] = p;
  return {
    ac: rgbStr(h, s, 68),
    ac2: rgbStr(h, s, 78),
    acLite: rgbStr(h, s, 88),
    acInk: rgbStr(h, Math.min(s, 90), 94),
    acDeep: rgbStr(h, 90, 24),
    acMid: rgbStr(h, 66, 29),
    acM1: rgbStr(h, 58, 55),
    acM2: rgbStr(h, 58, 45),
    acM3: rgbStr(h, 60, 32),
    acD1: rgbStr(h, 70, 20),
    acRgb: rgbOf(h, s, 68),
    ac2Rgb: rgbOf(h, s, 78),
    acdRgb: rgbOf(h, 90, 24),
    acmRgb: rgbOf(h, 66, 29),
    // helpers para opacidade variavel (equivalente a rgba(var(--acd-rgb), X))
    acdAlpha: a => 'rgba(' + rgbOf(h, 90, 24) + ',' + a + ')',
    acAlpha: a => 'rgba(' + rgbOf(h, s, 68) + ',' + a + ')',
    ac2Alpha: a => 'rgba(' + rgbOf(h, s, 78) + ',' + a + ')',
    acmAlpha: a => 'rgba(' + rgbOf(h, 66, 29) + ',' + a + ')'
  };
}

export const RAMP_KEYS = ['acD1', 'acDeep', 'acM2', 'acM1', 'ac', 'ac2', 'acLite'];

export const DEFAULT_ACCENT = '#5b7cff';
