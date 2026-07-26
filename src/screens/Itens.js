import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import Text from '../Text.js';
import { useSettings } from '../settings.jsx';
import { useApp } from '../AppContext.js';
import { ITEMS } from '../data.js';
import { GridRow, font } from '../ui.jsx';
import EmptyState from '../components/EmptyState.js';

const BODY_SLOTS = [
  { id: 'cabeça', label: 'Cabeça', items: [] },
  { id: 'torso', label: 'Torso', items: [] },
  { id: 'pulso', label: 'Pulso', items: [] },
  { id: 'bolsos', label: 'Bolsos', items: [] },
  { id: 'costas', label: 'Costas / Mochila', items: [] },
  { id: 'pés', label: 'Pés', items: [] }
];

export default function Itens() {
  const { palette } = useSettings();
  const { openModal } = useApp();
  const [selectedSlot, setSelectedSlot] = useState(null);

  if (!ITEMS || ITEMS.length === 0) {
    return <EmptyState title="Nenhum item no inventário" subtitle="Cadastre os objetos do seu inventário e acompanhe o uso diário." ctaLabel="+ Cadastrar Item" onPress={() => openModal({ kind: 'add' })} />;
  }

  return (
    <View style={{ gap: 24 }}>
      <View style={{ borderRadius: 20, borderWidth: 1, borderColor: palette.ac2Alpha(0.25), backgroundColor: palette.acdAlpha(0.35), padding: 22 }}>
        <Text style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: palette.ac2, fontWeight: '700', marginBottom: 4 }}>
          Silhueta da Pessoa • Equipamentos & EDC
        </Text>
        <Text style={{ fontSize: 13, opacity: 0.7, marginBottom: 20, color: '#fff' }}>Itens mapeados diretamente no corpo e posições de transporte diário</Text>

        <GridRow min={160} gap={14}>
          {BODY_SLOTS.map(slot => (
            <Pressable
              key={slot.id}
              onPress={() => setSelectedSlot(selectedSlot === slot.id ? null : slot.id)}
              style={{
                borderRadius: 14, padding: 14,
                borderWidth: 1, borderColor: selectedSlot === slot.id ? palette.ac2 : 'rgba(255,255,255,.09)',
                backgroundColor: selectedSlot === slot.id ? palette.acmAlpha(0.45) : 'rgba(255,255,255,.03)'
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: palette.ac2 }} />
                <Text style={{ fontSize: 12, fontWeight: '700', textTransform: 'uppercase', color: palette.acLite }}>{slot.label}</Text>
              </View>
              {slot.items.map(itName => (
                <Text key={itName} style={{ fontSize: 13, opacity: 0.85, color: '#fff' }}>• {itName}</Text>
              ))}
            </Pressable>
          ))}
        </GridRow>
      </View>

      <GridRow min={260}>
        {ITEMS.map((it, i) => {
          const used = i < 6;
          const slotInfo = BODY_SLOTS[i % BODY_SLOTS.length];
          return (
            <Pressable
              key={it[0]}
              onPress={() => openModal({ kind: 'item', name: it[1], meta: it[2] })}
              style={{
                borderWidth: 1, borderColor: used ? palette.ac2Alpha(0.35) : 'rgba(255,255,255,.07)',
                backgroundColor: used ? palette.acmAlpha(0.3) : 'rgba(255,255,255,.022)',
                borderRadius: 16, padding: 15, flexDirection: 'row', gap: 12, alignItems: 'center'
              }}
            >
              <View style={{ width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,.4)', borderWidth: 1, borderColor: palette.ac2Alpha(0.2) }}>
                <Text style={{ fontFamily: font.display, fontSize: 12, fontWeight: '700', color: palette.acLite }}>{it[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>{it[1]}</Text>
                <Text style={{ fontSize: 12, opacity: 0.6, marginTop: 2, color: '#fff' }}>{it[2]} • Slot: {slotInfo.label}</Text>
              </View>
              <Text style={{ fontSize: 11, paddingVertical: 4, paddingHorizontal: 9, borderRadius: 999, borderWidth: 1, borderColor: used ? palette.ac2Alpha(0.5) : 'rgba(255,255,255,.12)', color: used ? palette.ac2 : 'rgba(255,255,255,.4)' }}>
                {used ? 'no corpo' : 'no armário'}
              </Text>
            </Pressable>
          );
        })}
      </GridRow>
    </View>
  );
}
