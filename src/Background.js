import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useSettings } from './settings.jsx';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

// Aproximacao do shader WebGL "faulty-terminal" (ogl) do web: um gradiente
// radial-ish animado usando a cor de destaque, com leve pulso de opacidade
// e deslocamento — nao reproduz o efeito glitch/scanline pixel-a-pixel.
export default function Background({ off }) {
  const { palette, shaderBackground } = useSettings();
  const isOn = shaderBackground !== false && !off;

  const pulse = useSharedValue(0);
  const drift = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.sin) }), -1, true);
    drift.value = withRepeat(withTiming(1, { duration: 9000, easing: Easing.linear }), -1, false);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: isOn ? 0.28 + pulse.value * 0.14 : 0,
    transform: [{ scale: 1 + pulse.value * 0.04 }, { translateX: (drift.value - 0.5) * 30 }]
  }));

  if (!isOn) return null;

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, animStyle]}>
      <AnimatedGradient
        colors={[palette.acdAlpha(0.9), palette.acmAlpha(0.5), 'rgba(0,0,0,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}
