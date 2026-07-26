import React, { useRef, useState } from 'react';
import { View, Text, Pressable, TextInput, Modal as RNModal, ScrollView, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useSettings } from './settings.jsx';
import Particles from './Particles.js';

export const font = { display: 'VT323', body: 'VT323' };

export const muted = { fontSize: 15, color: '#fff', opacity: 0.55 };
export const label = { fontSize: 15, color: '#fff', fontWeight: '600', marginBottom: 7 };

export function H2({ children, sub }) {
  return (
    <View style={{ marginBottom: sub ? 16 : 14 }}>
      <Text style={{ fontFamily: font.display, fontSize: 22, fontWeight: '600', color: '#fff', letterSpacing: -0.2 }}>{children}</Text>
      {sub ? <Text style={{ ...muted, marginTop: 4 }}>{sub}</Text> : null}
    </View>
  );
}

export function Chip({ on, children, onPress }) {
  const { palette } = useSettings();
  const particleRef = useRef(null);
  const scale = useSharedValue(1);

  const handlePress = e => {
    scale.value = withSequence(withTiming(0.92, { duration: 80 }), withTiming(1, { duration: 120 }));
    particleRef.current?.burst();
    if (onPress) onPress(e);
  };

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={handlePress}
        style={{
          position: 'relative',
          paddingVertical: 5,
          paddingHorizontal: 14,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: on ? palette.ac : 'rgba(255,255,255,.12)',
          backgroundColor: on ? palette.acdAlpha(0.45) : 'transparent',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6
        }}
      >
        <Text style={{
          fontFamily: font.body, fontSize: 16, color: on ? '#fff' : 'rgba(255,255,255,.6)',
          fontWeight: on ? '700' : '400'
        }}>
          {on ? '✓ ' : ''}{children}
        </Text>
        <Particles ref={particleRef} color={palette.ac} />
      </Pressable>
    </Animated.View>
  );
}

const PRESET_DICT = {
  'slot': ['Bolsos', 'Cabeça', 'Torso', 'Pulso', 'Costas', 'Pés', 'Armário'],
  'categoria': ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Assinaturas', 'Educação', 'Saúde', 'Outros'],
  'signo': ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'],
  'onde': ['Social', 'Trabalho', 'Evento', 'Faculdade', 'Internet', 'Outro'],
  'tipo': ['Foto', 'Documento', 'Áudio', 'Recibo', 'Planilha'],
  'frequência': ['Não (Pontual)', 'Semanal', 'Mensal', 'Anual'],
  'status': ['No corpo (em uso hoje)', 'No armário (guardado)']
};

function getPresetsFor(labelText, chipText) {
  const key = ((labelText || '') + ' ' + (chipText || '')).toLowerCase();
  for (const k of Object.keys(PRESET_DICT)) {
    if (key.includes(k)) return PRESET_DICT[k];
  }
  return [];
}

export function MiniModal({ labelText, plusText, onClose, onAdd, visible }) {
  const presets = getPresetsFor(labelText, plusText);
  const [selectedItems, setSelectedItems] = useState([]);
  const [customText, setCustomText] = useState('');
  const [extraItems, setExtraItems] = useState([]);

  const allChoices = [...presets, ...extraItems];

  const toggleChoice = item => {
    setSelectedItems(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  };

  const handleAddCustom = () => {
    const trimmed = customText.trim();
    if (trimmed && !allChoices.includes(trimmed)) {
      setExtraItems(prev => [...prev, trimmed]);
      setSelectedItems(prev => [...prev, trimmed]);
      setCustomText('');
    }
  };

  const handleConfirm = () => {
    if (selectedItems.length > 0) onAdd(selectedItems);
    onClose();
  };

  return (
    <RNModal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.55)', justifyContent: 'center', padding: 24 }} onPress={onClose}>
        <Pressable onPress={e => e.stopPropagation?.()} style={{
          backgroundColor: '#090a0f', borderWidth: 1, borderColor: 'rgba(255,255,255,.16)',
          borderRadius: 18, padding: 16, maxWidth: 340, alignSelf: 'center', width: '100%'
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', fontFamily: font.body }}>
              {plusText ? plusText.replace('+', 'Adicionar ') : 'Adicionar Opções'}
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={{ color: '#fff', fontSize: 18 }}>×</Text>
            </Pressable>
          </View>

          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', marginBottom: 10 }}>
            {allChoices.length > 0 ? 'Selecione ou digite para adicionar:' : 'Digite o nome para adicionar:'}
          </Text>

          {allChoices.length > 0 && (
            <ScrollView style={{ maxHeight: 150, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {allChoices.map(item => {
                  const isSel = selectedItems.includes(item);
                  return (
                    <Pressable key={item} onPress={() => toggleChoice(item)} style={{ paddingVertical: 4, paddingHorizontal: 10 }}>
                      <Text style={{ fontSize: 14, color: isSel ? '#fff' : 'rgba(255,255,255,.55)', fontWeight: isSel ? '700' : '400' }}>
                        {isSel ? '✓ ' : '+ '}{item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          )}

          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
            <TextInput
              value={customText}
              onChangeText={setCustomText}
              onSubmitEditing={handleAddCustom}
              placeholder="Digite aqui..."
              placeholderTextColor="rgba(255,255,255,.4)"
              style={{ flex: 1, color: '#fff', fontSize: 15, paddingVertical: 6, paddingHorizontal: 10, fontFamily: font.body }}
            />
            <Pressable onPress={handleAddCustom}>
              <Text style={{ color: '#fff', fontSize: 14, paddingVertical: 6, paddingHorizontal: 10 }}>+ Add</Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
            <Pressable onPress={onClose}>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,.7)', paddingVertical: 6, paddingHorizontal: 12 }}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={handleConfirm}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14, paddingVertical: 6, paddingHorizontal: 14 }}>
                Adicionar ({selectedItems.length})
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

export function ChipRow({ options, value, onPick, onAddOption, fieldLabel }) {
  const [miniModal, setMiniModal] = useState(null);

  const handleChipClick = (o, i) => {
    if (typeof o === 'string' && o.trim().startsWith('+')) {
      setMiniModal({ labelText: fieldLabel || '', plusText: o });
    } else {
      onPick(i);
    }
  };

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      {options.map((o, i) => {
        const isSel = Array.isArray(value) ? value.includes(i) : value === i;
        return <Chip key={i} on={isSel} onPress={() => handleChipClick(o, i)}>{o}</Chip>;
      })}
      <MiniModal
        visible={!!miniModal}
        labelText={miniModal?.labelText}
        plusText={miniModal?.plusText}
        onClose={() => setMiniModal(null)}
        onAdd={newItems => { onAddOption && onAddOption(newItems); }}
      />
    </View>
  );
}

export function Toggle({ on, onPress, size = 'lg' }) {
  const { palette } = useSettings();
  const w = size === 'lg' ? 48 : 29, h = size === 'lg' ? 27 : 16, k = size === 'lg' ? 21 : 12;
  const knobPos = useSharedValue(on ? w - k - (h - k) / 2 : (h - k) / 2);
  React.useEffect(() => {
    knobPos.value = withTiming(on ? w - k - (h - k) / 2 : (h - k) / 2, { duration: 220 });
  }, [on]);
  const knobStyle = useAnimatedStyle(() => ({ left: knobPos.value }));

  return (
    <Pressable onPress={onPress}>
      <View style={{ width: w, height: h, borderRadius: 999, backgroundColor: on ? palette.ac : 'rgba(255,255,255,.14)' }}>
        <Animated.View style={[{ position: 'absolute', top: (h - k) / 2, width: k, height: k, borderRadius: 999, backgroundColor: '#fff' }, knobStyle]} />
      </View>
    </Pressable>
  );
}

export function Slider({ value, onChange }) {
  const { palette } = useSettings();
  const trackWidth = useRef(0);

  const handleGesture = e => {
    const x = e.nativeEvent.x;
    const w = trackWidth.current || 1;
    onChange(Math.max(0, Math.min(100, Math.round((x / w) * 100))));
  };

  return (
    <PanGestureHandler onGestureEvent={handleGesture} onBegan={handleGesture}>
      <View
        onLayout={e => { trackWidth.current = e.nativeEvent.layout.width; }}
        style={{ height: 24, justifyContent: 'center' }}
      >
        <View style={{ height: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,.14)' }} />
        <View style={{ position: 'absolute', left: 0, height: 4, borderRadius: 999, width: value + '%', backgroundColor: palette.ac }} />
        <View style={{ position: 'absolute', left: `${value}%`, width: 14, height: 14, borderRadius: 999, backgroundColor: '#fff', marginLeft: -7 }} />
      </View>
    </PanGestureHandler>
  );
}

export function StatCard({ label: l, value, hint, color }) {
  const glowColor = color || '#fff';
  return (
    <View style={{ borderRadius: 18, paddingVertical: 18, paddingHorizontal: 18 }}>
      <Text style={{ fontSize: 14, letterSpacing: 1.2, textTransform: 'uppercase', color: '#fff', fontWeight: '600' }}>{l}</Text>
      <Text style={{ fontFamily: font.display, fontSize: 32, fontWeight: '600', marginTop: 10, color: glowColor }}>{value}</Text>
      <Text style={{ fontSize: 15, color: '#fff', marginTop: 4 }}>{hint}</Text>
    </View>
  );
}

export function Tag({ children }) {
  const { palette } = useSettings();
  return (
    <View style={{ paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, backgroundColor: palette.acdAlpha(0.55) }}>
      <Text style={{ fontSize: 14, color: '#fff' }}>{children}</Text>
    </View>
  );
}

export function AnimatedList({ items = [], onAdd, onRemove, title, emptyText = 'Nenhum item cadastrado.', fieldLabel = 'Item' }) {
  const { palette } = useSettings();
  const [miniOpen, setMiniOpen] = useState(false);

  return (
    <View style={{ gap: 10 }}>
      {title && <Text style={label}>{title}</Text>}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {items.map((item, idx) => {
          const itemText = typeof item === 'object' ? (item.name || item.label || item.title) : String(item);
          return (
            <Animated.View
              key={`${itemText}-${idx}`}
              entering={FadeIn.duration(220)}
              exiting={FadeOut.duration(160)}
              layout={Layout}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 6, paddingHorizontal: 14,
                borderRadius: 999, backgroundColor: palette.acdAlpha(0.4), borderWidth: 1, borderColor: palette.ac2Alpha(0.45)
              }}
            >
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{itemText}</Text>
              {onRemove && (
                <Pressable onPress={() => onRemove(idx)} hitSlop={8}>
                  <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 13, fontWeight: '700' }}>✕</Text>
                </Pressable>
              )}
            </Animated.View>
          );
        })}

        {onAdd && (
          <View>
            <Pressable
              onPress={() => setMiniOpen(v => !v)}
              style={{
                borderWidth: 1.5, borderStyle: 'dashed', borderColor: palette.ac2Alpha(0.55),
                backgroundColor: 'rgba(255,255,255,.04)', paddingVertical: 5, paddingHorizontal: 14, borderRadius: 999
              }}
            >
              <Text style={{ color: palette.acLite, fontSize: 15, fontWeight: '600' }}>+ Adicionar</Text>
            </Pressable>
            <MiniModal
              visible={miniOpen}
              labelText={fieldLabel}
              plusText="+ Adicionar"
              onClose={() => setMiniOpen(false)}
              onAdd={newItems => { onAdd(newItems); setMiniOpen(false); }}
            />
          </View>
        )}
      </View>
      {items.length === 0 && !onAdd && (
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', fontStyle: 'italic' }}>{emptyText}</Text>
      )}
    </View>
  );
}

export const card = { borderRadius: 20, padding: 20 };
export const field = { borderRadius: 12, color: '#fff', fontFamily: font.body, fontSize: 17, paddingVertical: 11, paddingHorizontal: 13 };

// Substitui o grid() CSS do web — RN nao tem display:grid, entao usamos flexWrap
// com basis fixo por item (aproximacao de repeat(auto-fit, minmax(min,1fr))).
export function GridRow({ children, min = 160, gap = 14, style }) {
  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap }, style]}>
      {React.Children.map(children, child => (
        <View style={{ flexGrow: 1, flexBasis: min, minWidth: min }}>{child}</View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({});
