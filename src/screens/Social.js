import React from 'react';
import { View, Pressable } from 'react-native';
import Text from '../Text.js';
import { useSettings } from '../settings.jsx';
import { useApp } from '../AppContext.js';
import { peopleView } from './people.js';
import { GridRow, font } from '../ui.jsx';
import EmptyState from '../components/EmptyState.js';

export default function Social() {
  const st = useSettings();
  const { openModal } = useApp();
  const people = peopleView(st.hides);

  if (!people || people.length === 0) {
    return <EmptyState title="Nenhum contato recente no Social" subtitle="Cadastre interações sociais, conversas e anotações para alimentar a análise de perfil." ctaLabel="+ Cadastrar Interação / Contato" onPress={() => openModal({ kind: 'add' })} />;
  }

  return (
    <View>
      <View style={{ borderRadius: 18, padding: 16, marginBottom: 18, flexDirection: 'row', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <Text style={{ fontSize: 13.5, flex: 1, color: '#fff' }}>Contatos recentes. A análise de IA só roda quando o dia fecha completo.</Text>
        <Pressable onPress={() => openModal({ kind: 'add' })}>
          <Text style={{ color: '#fff', fontFamily: font.body, fontSize: 15 }}>anotar agora</Text>
        </Pressable>
      </View>
      <GridRow min={300} cols={1}>
        {people.map(p => (
          <Pressable key={p.name} onPress={() => openModal({ kind: 'person', person: p })} style={{ borderRadius: 18, padding: 17 }}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: st.palette.acmAlpha(0.6) }}>
                <Text style={{ fontFamily: font.display, fontWeight: '600', fontSize: 14, color: st.palette.acLite }}>{p.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14.5, fontWeight: '600', color: '#fff' }}>{p.name}</Text>
                <Text style={{ fontSize: 12.5, color: '#fff' }}>{p.sub}</Text>
              </View>
              <Text style={{ fontSize: 10.5, textTransform: 'uppercase', color: '#fff', borderWidth: 1, borderColor: st.palette.ac2Alpha(0.28), paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999 }}>{p.from}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
              {[['confiança', p.trust], ['proximidade', p.prox]].map(([l, v]) => (
                <View key={l} style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 11, color: '#fff' }}>{l}</Text>
                    <Text style={{ fontSize: 11, color: '#fff' }}>{v}</Text>
                  </View>
                  <View style={{ height: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,.08)', marginTop: 5 }}>
                    <View style={{ height: 4, borderRadius: 999, width: v, backgroundColor: st.palette.ac }} />
                  </View>
                </View>
              ))}
            </View>
            <Text style={{ fontSize: 12.5, marginTop: 14, lineHeight: 17, color: '#fff' }}>{p.note}</Text>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
              {p.flags.map(f => (
                <Text key={f} style={{ fontSize: 11, paddingVertical: 4, paddingHorizontal: 9, borderRadius: 8, backgroundColor: 'rgba(255,255,255,.04)', color: '#fff' }}>{f}</Text>
              ))}
            </View>
          </Pressable>
        ))}
      </GridRow>
    </View>
  );
}
