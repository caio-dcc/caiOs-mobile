import React from 'react';
import { View, Pressable } from 'react-native';
import Text from '../Text.js';
import { useSettings } from '../settings.jsx';
import { useApp } from '../AppContext.js';
import { EVENTLIST } from '../data.js';
import { Tag, font } from '../ui.jsx';
import EmptyState from '../components/EmptyState.js';

export default function Eventos() {
  const st = useSettings();
  const { openModal } = useApp();

  if (!EVENTLIST || EVENTLIST.length === 0) {
    return <EmptyState title="Nenhum evento registrado" subtitle="Cadastre compromissos, reuniões ou encontros sociais no seu diário." ctaLabel="+ Registrar Evento" onPress={() => openModal({ kind: 'add' })} />;
  }

  return (
    <View style={{ gap: 10 }}>
      {EVENTLIST.map((e, i) => (
        <Pressable key={i} onPress={() => openModal({ kind: 'day', n: 25 })} style={{ flexDirection: 'row', gap: 16, alignItems: 'center', flexWrap: 'wrap', borderRadius: 18, padding: 16 }}>
          <View style={{ minWidth: 46, alignItems: 'center' }}>
            <Text style={{ fontFamily: font.display, fontSize: 22, fontWeight: '600', color: '#fff' }}>{e.day}</Text>
            <Text style={{ fontSize: 10, textTransform: 'uppercase', color: '#fff', marginTop: 3 }}>{e.mon}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 160 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>{e.title}</Text>
            <Text style={{ fontSize: 12.5, marginTop: 3, color: '#fff' }}>{e.meta}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {e.links.map(l => <Tag key={l}>{l}</Tag>)}
          </View>
          <Text style={{ fontFamily: font.display, fontSize: 14, color: '#fff' }}>{st.money(e.spend)}</Text>
        </Pressable>
      ))}
    </View>
  );
}
