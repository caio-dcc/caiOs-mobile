import { memo, useEffect, useMemo } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useSettings } from './settings.jsx';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── Aproximacao do shader <faulty-terminal> (ogl/WebGL) do front ──
// O shader web desenha uma grade de "digitos" cuja intensidade vem de um fbm
// noise animado, com scanlines correndo, flicker e vinheta curva, tudo tingido
// pelo accent. Nao ha WebGL/GLSL no Expo Go, entao reproduzimos as mesmas
// camadas com primitivas RN.
//
// PERF (v2): este componente e montado UMA vez, acima do navigator (ver App.js).
// Antes ele vivia dentro do ScreenShell, ou seja uma copia por tela do tab
// navigator — apos visitar as 16 rotas eram ~780 nos animados rodando de uma
// vez, mesmo fora da tela. Agora: 1 instancia, e o custo por frame abaixo.
//
// Orcamento de nos animados por frame:
//   BANDS (8) + scanlines (3) = 11 nos  (antes: 36 linhas + 12 + 1 = 49 por copia)
// As celulas da grade sao Views estaticas com opacidade fixa: custo zero por
// frame, pois so o wrapper da banda anima.

const CELL = 30;
const COLS = Math.ceil(SCREEN_W / CELL);
const ROWS = Math.ceil(SCREEN_H / CELL);
const BANDS = 8;                       // linhas agrupadas em faixas que respiram juntas
const ROWS_PER_BAND = Math.ceil(ROWS / BANDS);
const SCANLINE_COUNT = 3;

function hash2(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}
function fbm2(x, y) {
  let v = 0, amp = 0.5, fx = x, fy = y;
  for (let o = 0; o < 3; o++) {
    v += amp * hash2(Math.floor(fx), Math.floor(fy));
    fx *= 2.03; fy *= 2.03; amp *= 0.4545;
  }
  return v;
}

// Uma faixa da grade: celulas estaticas dentro de um unico wrapper animado.
const Band = memo(function Band({ band, color, clock }) {
  const style = useAnimatedStyle(() => {
    const wave = Math.sin((clock.value + band.phase) * Math.PI * 2);
    return { opacity: Math.max(0.05, 0.4 + wave * 0.28) };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: 0, right: 0, top: band.y, height: band.height }, style]}
    >
      {band.cells.map(c => (
        <View
          key={c.k}
          style={{
            position: 'absolute',
            left: c.x,
            top: c.y,
            width: CELL - 6,
            height: CELL - 6,
            borderRadius: 2,
            backgroundColor: color,
            opacity: c.opacity
          }}
        />
      ))}
    </Animated.View>
  );
});

const Scanline = memo(function Scanline({ index, color, clock }) {
  const style = useAnimatedStyle(() => {
    const offset = (clock.value * 0.5 + index / SCANLINE_COUNT) % 1;
    return {
      transform: [{ translateY: offset * SCREEN_H }],
      opacity: 0.05 + Math.sin(offset * Math.PI) * 0.07
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: color }, style]}
    />
  );
});

// Geometria da grade: independente do tema, calculada uma unica vez no modulo.
const BAND_DATA = (() => {
  const bands = [];
  for (let b = 0; b < BANDS; b++) {
    const rowStart = b * ROWS_PER_BAND;
    const rowEnd = Math.min(ROWS, rowStart + ROWS_PER_BAND);
    if (rowStart >= rowEnd) continue;
    const cells = [];
    for (let r = rowStart; r < rowEnd; r++) {
      const falloff = 1 - (r / ROWS) * 0.6;
      for (let c = 0; c < COLS; c++) {
        const value = (fbm2(c * 0.35, r * 0.35) - 0.34) * falloff;
        if (value <= 0.02) continue;
        cells.push({
          k: `${r}-${c}`,
          x: c * CELL,
          y: (r - rowStart) * CELL,
          opacity: Math.min(0.8, value * 1.6)
        });
      }
    }
    if (!cells.length) continue;
    bands.push({
      key: b,
      y: rowStart * CELL,
      height: (rowEnd - rowStart) * CELL,
      phase: hash2(b + 7, 3),
      cells
    });
  }
  return bands;
})();

function Background({ off }) {
  const { palette, shaderBackground } = useSettings();
  const isOn = shaderBackground !== false && !off;

  const clock = useSharedValue(0);

  useEffect(() => {
    if (!isOn) return;
    clock.value = 0;
    clock.value = withRepeat(withTiming(1, { duration: 11000, easing: Easing.linear }), -1, false);
  }, [isOn]);

  const gradient = useMemo(
    () => [palette.acdAlpha(0.3), 'rgba(0,0,0,0.72)', 'rgba(0,0,0,0.93)'],
    [palette]
  );

  if (!isOn) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} collapsable={false}>
      {BAND_DATA.map(band => (
        <Band key={band.key} band={band} color={palette.ac} clock={clock} />
      ))}

      {Array.from({ length: SCANLINE_COUNT }).map((_, i) => (
        <Scanline key={i} index={i} color={palette.acLite} clock={clock} />
      ))}

      <LinearGradient
        colors={gradient}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </View>
  );
}

// A paleta so muda quando o accent muda; sem isso cada navegacao re-renderizava
// a grade inteira.
export default memo(Background);
