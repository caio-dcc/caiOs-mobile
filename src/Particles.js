import { forwardRef, useImperativeHandle, useState, useRef, useEffect, useMemo, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, withTiming, withDelay, useAnimatedStyle, Easing, interpolate } from 'react-native-reanimated';

// Porta de src/particles.js do web: 4 variacoes de movimento (espiral PS2, onda
// senoidal, explosao radial, deriva estelar), cores tiradas da paleta do accent,
// e um "point" interno que pulsa de escala junto do voo da particula.
//
// PERF: as particulas so entram na arvore depois do primeiro burst (mounted) e
// saem de novo quando a animacao acaba. Antes ficavam montadas para sempre em
// todo chip e todo item da tab bar — 20 nos animados cada, parados mas ainda
// avaliados a cada frame.
const COUNT = 14;
const MOVEMENT_TYPES = ['spiral_ps2', 'sine_wave', 'radial_burst', 'starlight_drift'];
const MAX_LIFE = 1120;   // life max (1000) + delay max (120)
const noise = n => n / 2 - Math.random() * n;

// Sorteia trajetoria (start -> mid -> end) conforme o tipo, igual ao emit() web.
function makePath(i) {
  const motionType = MOVEMENT_TYPES[i % MOVEMENT_TYPES.length];
  let startX = 0, startY = 0, midX = 0, midY = 0, endX = 0, endY = 0;

  if (motionType === 'spiral_ps2') {
    const startAngle = Math.random() * Math.PI * 2;
    const startDist = 26 + Math.random() * 32;
    startX = startDist * Math.cos(startAngle);
    startY = startDist * Math.sin(startAngle);
    const curveDirection = Math.random() > 0.5 ? 1.1 : -1.1;
    const midAngle = startAngle + curveDirection + (Math.random() * 0.4 - 0.2);
    const midDist = startDist * (0.4 + Math.random() * 0.3);
    midX = midDist * Math.cos(midAngle);
    midY = midDist * Math.sin(midAngle);
    endX = noise(5);
    endY = noise(5);
  } else if (motionType === 'sine_wave') {
    startX = noise(24);
    startY = (Math.random() > 0.5 ? 1 : -1) * (14 + Math.random() * 20);
    midX = startX + Math.sin(i) * 18;
    midY = startY * 0.5;
    endX = startX + Math.sin(i * 2) * 28;
    endY = -startY * 0.8;
  } else if (motionType === 'radial_burst') {
    startX = noise(4);
    startY = noise(4);
    const angle = Math.random() * Math.PI * 2;
    const dist = 24 + Math.random() * 30;
    midX = dist * 0.5 * Math.cos(angle);
    midY = dist * 0.5 * Math.sin(angle);
    endX = dist * Math.cos(angle);
    endY = dist * Math.sin(angle);
  } else {
    startX = noise(32);
    startY = noise(32);
    midX = startX + noise(16);
    midY = startY + noise(16);
    endX = midX + noise(18);
    endY = midY + noise(18);
  }

  return {
    startX, startY, midX, midY, endX, endY,
    size: 3 + Math.random() * 3.5,
    life: 600 + Math.random() * 400,
    delay: Math.random() * 120
  };
}

const Particle = memo(function Particle({ trigger, color, path }) {
  const progress = useSharedValue(0);
  const { startX, startY, midX, midY, endX, endY, size, life, delay } = path;

  useEffect(() => {
    if (trigger > 0) {
      progress.value = 0;
      progress.value = withDelay(delay, withTiming(1, { duration: life, easing: Easing.bezier(0.22, 1, 0.36, 1) }));
    }
  }, [trigger]);

  // Trajetoria em 3 pontos + fade nas pontas (espelha @keyframes fmv-particle).
  const style = useAnimatedStyle(() => {
    const p = progress.value;
    if (p === 0) return { opacity: 0, transform: [{ translateX: startX }, { translateY: startY }, { scale: 0.3 }] };
    const tx = interpolate(p, [0, 0.5, 1], [startX, midX, endX]);
    const ty = interpolate(p, [0, 0.5, 1], [startY, midY, endY]);
    const opacity = interpolate(p, [0, 0.15, 0.5, 0.85, 1], [0, 0.95, 0.9, 0.8, 0]);
    // fmv-point: 0.3 -> 1.35 -> 0.85 -> 0.1
    const s = interpolate(p, [0, 0.35, 0.7, 1], [0.3, 1.35, 0.85, 0.1]);
    return { opacity, transform: [{ translateX: tx }, { translateY: ty }, { scale: s }] };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[{
        position: 'absolute', width: size, height: size,
        marginTop: -size / 2, marginLeft: -size / 2, borderRadius: 999, backgroundColor: color
      }, style]}
    />
  );
});

// `anchorX`/`anchorY` (shared values escalares) posicionam a explosao — usado
// pela camada unica da tab bar. Sem anchor, a explosao sai do centro do pai
// (comportamento dos chips).
const Particles = forwardRef(({ palette, color, anchorX, anchorY }, ref) => {
  const [trigger, setTrigger] = useState(0);
  const [mounted, setMounted] = useState(false);
  const timer = useRef(null);

  useImperativeHandle(ref, () => ({
    burst: () => {
      setMounted(true);
      setTrigger(t => t + 1);
      if (timer.current) clearTimeout(timer.current);
      // desmonta apos a ultima particula morrer, liberando os nos animados
      timer.current = setTimeout(() => setMounted(false), MAX_LIFE + 80);
    }
  }));

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  // Paleta dinamica ligada ao accent, como themePalette no web.
  const themePalette = useMemo(() => (
    palette
      ? [palette.ac, palette.ac2, palette.acLite, palette.acM1, palette.acM2, palette.acM3, palette.acDeep]
      : [color || '#fff']
  ), [palette, color]);

  const specs = useRef(
    Array.from({ length: COUNT }).map((_, i) => ({
      path: makePath(i),
      colorIdx: Math.floor(Math.random() * 7)
    }))
  ).current;

  // Sem anchor (chips) o worklet nao le shared value nenhum; o posicionamento
  // fica com o wrapper centralizado do return de baixo.
  const anchorStyle = useAnimatedStyle(() => {
    if (!anchorX || !anchorY) return {};
    return { left: anchorX.value, top: anchorY.value };
  });

  if (!mounted) return null;

  const inner = specs.map((spec, i) => (
    <Particle
      key={i}
      trigger={trigger}
      path={spec.path}
      color={themePalette[spec.colorIdx % themePalette.length]}
    />
  ));

  if (anchorX && anchorY) {
    return (
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: 0, height: 0 }, anchorStyle]}>
        {inner}
      </Animated.View>
    );
  }

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
      <View style={{ width: 0, height: 0 }}>{inner}</View>
    </View>
  );
});

export default Particles;
