import React from 'react';
import { View } from 'react-native';
import Text from '../Text.js';
import { useApp } from '../AppContext.js';
import { NOTES } from '../data.js';
import { Tag, GridRow, font } from '../ui.jsx';
import EmptyState from '../components/EmptyState.js';

export default function Anotacoes() {
  const { openModal } = useApp();

  if (!NOTES || NOTES.length === 0) {
    return <EmptyState title="Nenhuma anotação registrada" subtitle="Cadastre novas anotações para vinculá-las a pessoas, dias ou eventos." ctaLabel="+ Registrar Anotação" onPress={() => openModal({ kind: 'add' })} />;
  }

  return (
    <GridRow min={280} cols={1}>
      {NOTES.map((n, i) => (
        <View key={i} style={{ borderRadius: 18, padding: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
            <Text style={{ fontFamily: font.display, fontSize: 15, fontWeight: '600', color: '#fff' }}>{n.title}</Text>
            <Text style={{ fontSize: 11.5, color: '#fff' }}>{n.date}</Text>
          </View>
          <Text style={{ fontSize: 13, lineHeight: 18, marginTop: 9, color: '#fff' }}>{n.body}</Text>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 13 }}>
            {n.links.map(l => <Tag key={l}>{l}</Tag>)}
          </View>
        </View>
      ))}
    </GridRow>
  );
}
