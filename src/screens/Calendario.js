import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSettings } from '../settings.jsx';
import { useApp } from '../AppContext.js';
import { WEEKDAYS, CAL_SEEDS, CAL_SPEND, CAL_PHOTO, CAL_TINT } from '../data.js';
import { font } from '../ui.jsx';

function cells(palette) {
  const tint = { ...CAL_TINT, e: palette.ac };
  const out = [];
  for (let k = 0; k < 35; k++) {
    const n = k - 2, inMonth = n >= 1 && n <= 31, today = n === 25;
    out.push({
      n: inMonth ? String(n) : '', today, inMonth,
      dots: inMonth && CAL_SEEDS[n] ? CAL_SEEDS[n].map(s => tint[s]) : [],
      spend: inMonth && CAL_SPEND[n] ? 'R$' + CAL_SPEND[n] : '',
      photo: inMonth && CAL_PHOTO[n]
    });
  }
  return out;
}

export default function Calendario() {
  const st = useSettings();
  const { openModal } = useApp();
  const { palette } = st;
  const grid = cells(palette);

  return (
    <View style={{ borderRadius: 20, padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingHorizontal: 4, flexWrap: 'wrap', gap: 10 }}>
        <Text style={{ fontFamily: font.display, fontSize: 17, fontWeight: '600', color: '#fff' }}>julho 2026</Text>
        <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
          {[['evento', palette.ac], ['gasto', '#7ce0a8'], ['anotação', '#e0c47c'], ['pessoa', '#c37ce0']].map(([l, c]) => (
            <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: c }} />
              <Text style={{ fontSize: 12.5, color: '#fff' }}>{l}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
        {WEEKDAYS.map(w => (
          <View key={w} style={{ width: '14.2857%', alignItems: 'center', paddingVertical: 4 }}>
            <Text style={{ fontSize: 10.5, textTransform: 'uppercase', fontWeight: '600', color: '#fff' }}>{w}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {grid.map((d, i) => (
          <View key={i} style={{ width: '14.2857%', padding: 2 }}>
            <Pressable
              disabled={!d.inMonth}
              onPress={() => d.inMonth && openModal({ kind: 'day', n: Number(d.n) })}
              style={{
                aspectRatio: 0.95, borderRadius: 11, padding: 6, justifyContent: 'space-between',
                borderWidth: 1,
                borderColor: d.today ? palette.ac2Alpha(0.8) : d.inMonth ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.03)',
                backgroundColor: d.photo ? palette.acmAlpha(0.55) : d.today ? palette.acmAlpha(0.45) : d.inMonth ? 'rgba(255,255,255,.022)' : 'transparent'
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: font.display, fontSize: 12.5, fontWeight: '600', color: d.inMonth ? (d.today ? palette.acInk : 'rgba(255,255,255,.7)') : 'rgba(255,255,255,.15)' }}>{d.n}</Text>
                <Text style={{ fontSize: 9.5, color: '#fff' }}>{st.money(d.spend)}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 3 }}>
                {d.dots.map((c, k) => <View key={k} style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: c }} />)}
              </View>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}
