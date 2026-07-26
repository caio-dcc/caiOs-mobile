import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { paletteOf, DEFAULT_ACCENT } from './theme.js';
import { PROMPT_PRESETS, WORK_RULES } from './data.js';

const KEY = 'fmv-settings';

const DEFAULTS = {
  accent: DEFAULT_ACCENT,
  userName: 'Caio',
  greet: 0,
  systemPrompt: PROMPT_PRESETS[0][1],
  preset: 0,
  scopes: [0, 1, 2, 3, 4],
  never: [0, 1],
  work: false,
  workRules: [0, 1, 2, 3],
  allNeons: true,
  chatNeon: true,
  shaderBackground: true,
  routineItems: ['Aliança', 'Chaves com Tag', 'Smartphone'],
  dailyPeople: ['Família / Cônjuge'],
  recurringExpenses: [
    { id: 1, name: 'Almoço Executivo', amount: 'R$ 35,00', days: [1, 2, 3, 4, 5] },
    { id: 2, name: 'Transporte / VLT', amount: 'R$ 9,00', days: [1, 2, 3, 4, 5] }
  ],
  personPhotos: {},
  personExperiences: {},
  globalFont: 'default'
};

const Ctx = createContext(null);
export const useSettings = () => useContext(Ctx);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
      } catch {}
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings, hydrated]);

  const palette = useMemo(() => paletteOf(settings.accent) || paletteOf(DEFAULT_ACCENT), [settings.accent]);

  const api = useMemo(() => {
    const set = patch => setSettings(s => ({ ...s, ...patch }));
    const toggle = (key, i) => setSettings(s => {
      const prev = s[key] || [];
      return { ...s, [key]: prev.includes(i) ? prev.filter(k => k !== i) : prev.concat(i) };
    });
    const hides = key => {
      if (!settings.work) return false;
      const i = WORK_RULES.findIndex(r => r[0] === key);
      return (settings.workRules || []).includes(i);
    };
    const mask = (v, key) => (hides(key) ? '••••••' : v);
    const money = v => (hides('money') ? String(v).replace(/[\d.,]+/, '••••') : v);
    const greeting = () => {
      const n = (settings.userName || '').trim();
      return [n ? 'Bom te ver, ' + n : 'Bom te ver', n ? 'Olá, ' + n : 'Olá', 'Início'][settings.greet || 0];
    };
    return { ...settings, palette, set, toggle, hides, mask, money, greeting, hydrated };
  }, [settings, palette, hydrated]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
