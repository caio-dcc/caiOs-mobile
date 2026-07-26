import React, { useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { useSettings } from '../settings.jsx';
import { NAV } from '../data.js';
import { NAV_ICONS } from './navIcons.js';
import { ROUTE_SCREEN_NAMES } from './routes.js';
import Particles from '../Particles.js';

const ICON_SIZE = 24;
const BTN_SIZE = 52;

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

// Um item da barra. Fundo sempre transparente — o que marca o selecionado e a
// intensidade do brilho neon (igual a sidebar web, que usa textShadow em camadas
// e nao muda o fundo da pilula).
//
// PERF: memo + callbacks estaveis. Antes, cada item montava seu proprio
// <Particles> (20 Views + 20 useAnimatedStyle cada) => 16 itens = 320 nos
// animados so na barra, o que explicava o scroll travado. Agora as particulas
// sao UMA camada compartilhada, posicionada sobre o item tocado.
const TabItem = memo(function TabItem({ id, isActive, onPress, onLayout, palette, allNeons }) {
  const glow = useSharedValue(isActive ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    glow.value = withTiming(isActive ? 1 : 0, { duration: 240, easing: Easing.out(Easing.cubic) });
  }, [isActive]);

  const handlePress = useCallback(() => {
    scale.value = withSequence(
      withTiming(0.84, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 200, easing: Easing.elastic(1.2) })
    );
    onPress(id);
  }, [id, onPress]);

  // O onLayout tem de ficar no wrapper animado, nao no Pressable interno: o
  // layout.x e relativo ao pai, e o Pressable preenche o wrapper, entao lá ele
  // media sempre 0 — o que fazia toda explosao sair no primeiro item (Inicio).
  const handleLayout = useCallback(e => onLayout(id, e.nativeEvent.layout.x), [id, onLayout]);

  // Neon mais forte: halo de 12 -> 26 e opacidade minima maior, para o inativo
  // tambem brilhar de verdade e o ativo saltar.
  const iconStyle = useAnimatedStyle(() => {
    const g = glow.value;
    if (allNeons === false) return { opacity: 0.55 + g * 0.45, textShadowRadius: 0 };
    return {
      opacity: 0.62 + g * 0.38,
      textShadowRadius: 12 + g * 14,
      transform: [{ scale: 1 + g * 0.1 }]
    };
  });

  const wrapStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const shadowColor = isActive ? palette.acLite : palette.ac;

  return (
    <Animated.View style={wrapStyle} onLayout={handleLayout}>
      <Pressable onPress={handlePress} style={styles.btn} hitSlop={6}>
        {/* halo em duas camadas, como o textShadow empilhado da sidebar web */}
        {allNeons !== false && (
          <AnimatedIcon
            name={NAV_ICONS[id] || 'ellipse-outline'}
            size={ICON_SIZE}
            color={shadowColor}
            style={[styles.halo, { textShadowColor: shadowColor, textShadowOffset: ZERO }, iconStyle]}
          />
        )}
        <AnimatedIcon
          name={NAV_ICONS[id] || 'ellipse-outline'}
          size={ICON_SIZE}
          color={isActive ? '#ffffff' : 'rgba(255,255,255,.78)'}
          style={[{ textShadowColor: shadowColor, textShadowOffset: ZERO }, iconStyle]}
        />
      </Pressable>
    </Animated.View>
  );
});

const ZERO = { width: 0, height: 0 };

// Barra flutuante inferior, totalmente transparente, com scroll horizontal.
export default function FloatingTabBar({ state, navigation }) {
  const { palette, hides, allNeons } = useSettings();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const btnPositions = useRef({});
  const particleRef = useRef(null);
  // escalares, nao um objeto: mutar .value com um objeto novo nao reavalia o
  // useAnimatedStyle de forma confiavel.
  const burstX = useSharedValue(0);
  const burstY = useSharedValue(0);

  const activeRouteName = state.routes[state.index]?.name;
  const activeRoute = useMemo(() => {
    const found = Object.entries(ROUTE_SCREEN_NAMES).find(([, name]) => name === activeRouteName);
    return found ? Number(found[0]) : 0;
  }, [activeRouteName]);

  const visibleNav = useMemo(
    () => NAV.filter(([, id]) => !(id === 11 && hides('osint'))),
    [hides]
  );

  useEffect(() => {
    const x = btnPositions.current[activeRoute];
    if (x !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ x: Math.max(0, x - 90), animated: true });
    }
  }, [activeRoute]);

  const handleLayout = useCallback((id, x) => { btnPositions.current[id] = x; }, []);

  // Dispara a camada compartilhada de particulas na posicao do item tocado.
  const handlePress = useCallback(id => {
    const x = btnPositions.current[id];
    if (x !== undefined) {
      burstX.value = x + BTN_SIZE / 2;
      burstY.value = BTN_SIZE / 2;
    }
    particleRef.current?.burst();
    navigation.navigate(ROUTE_SCREEN_NAMES[id]);
  }, [navigation]);

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + 10 }]} pointerEvents="box-none">
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        style={styles.scroll}
        removeClippedSubviews={false}
        decelerationRate="fast"
      >
        {visibleNav.map(([, id]) => (
          <TabItem
            key={id}
            id={id}
            isActive={id === activeRoute}
            palette={palette}
            allNeons={allNeons}
            onLayout={handleLayout}
            onPress={handlePress}
          />
        ))}
        <Particles ref={particleRef} palette={palette} anchorX={burstX} anchorY={burstY} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0
  },
  scroll: {
    backgroundColor: 'transparent',
    flexGrow: 0
  },
  row: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 2,
    alignItems: 'center'
  },
  btn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  halo: {
    position: 'absolute',
    textAlign: 'center'
  }
});
