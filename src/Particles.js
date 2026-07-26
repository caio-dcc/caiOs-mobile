import React, { forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, withTiming, withDelay, useAnimatedStyle, Easing } from 'react-native-reanimated';

const COUNT = 14;
const noise = n => n / 2 - Math.random() * n;

function Particle({ trigger, color }) {
  const progress = useSharedValue(0);
  const angle = React.useRef(Math.random() * Math.PI * 2).current;
  const dist = React.useRef(18 + Math.random() * 26).current;
  const size = React.useRef(3 + Math.random() * 3).current;
  const delay = React.useRef(Math.random() * 80).current;

  React.useEffect(() => {
    if (trigger > 0) {
      progress.value = 0;
      progress.value = withDelay(delay, withTiming(1, { duration: 500 + Math.random() * 250, easing: Easing.out(Easing.cubic) }));
    }
  }, [trigger]);

  const style = useAnimatedStyle(() => {
    const dx = Math.cos(angle) * dist * progress.value;
    const dy = Math.sin(angle) * dist * progress.value;
    return {
      opacity: 1 - progress.value,
      transform: [{ translateX: dx }, { translateY: dy }]
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[{
        position: 'absolute', top: '50%', left: '50%', width: size, height: size,
        marginTop: -size / 2, marginLeft: -size / 2, borderRadius: 999, backgroundColor: color
      }, style]}
    />
  );
}

// Emissor de particulas — aproxima o burst() DOM/CSS do web usando Reanimated.
const Particles = forwardRef(({ color = '#fff' }, ref) => {
  const [trigger, setTrigger] = React.useState(0);

  useImperativeHandle(ref, () => ({
    burst: () => setTrigger(t => t + 1)
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: COUNT }).map((_, i) => (
        <Particle key={i} trigger={trigger} color={color} />
      ))}
    </View>
  );
});

export default Particles;
