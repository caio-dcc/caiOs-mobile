import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useSettings } from '../settings.jsx';
import { useApp } from '../AppContext.js';
import { peopleView } from './people.js';
import { EVENTLIST } from '../data.js';
import { Tag, font } from '../ui.jsx';
import EmptyState from '../components/EmptyState.js';

export default function Pessoas() {
  const st = useSettings();
  const { openModal } = useApp();
  const people = peopleView(st.hides);

  if (!people || people.length === 0) {
    return <EmptyState title="Nenhuma pessoa cadastrada" subtitle="Cadastre pessoas do seu convívio para acompanhar conexões e histórico." ctaLabel="+ Cadastrar Pessoa" onPress={() => openModal({ kind: 'add' })} />;
  }

  return (
    <View style={{ gap: 12 }}>
      {people.map((p, i) => {
        const personEvents = EVENTLIST.slice(i % (EVENTLIST.length || 1), (i % (EVENTLIST.length || 1)) + 2);
        const photo = st.personPhotos && st.personPhotos[p.name];
        return (
          <Pressable
            key={p.name}
            onPress={() => openModal({ kind: 'person', person: p })}
            style={{ flexDirection: 'row', gap: 16, alignItems: 'center', flexWrap: 'wrap', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,.07)', backgroundColor: 'rgba(255,255,255,.022)' }}
          >
            <View style={{ minWidth: 46, alignItems: 'center' }}>
              {photo ? (
                <Image source={{ uri: photo }} style={{ width: 46, height: 46, borderRadius: 14 }} />
              ) : (
                <View style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: st.palette.acmAlpha(0.7) }}>
                  <Text style={{ fontFamily: font.display, fontSize: 16, fontWeight: '700', color: st.palette.acLite }}>{p.initials}</Text>
                </View>
              )}
              <Text style={{ fontSize: 10, textTransform: 'uppercase', marginTop: 4, opacity: 0.6, color: '#fff' }}>{p.last}</Text>
            </View>

            <View style={{ flex: 1, minWidth: 160 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>{p.name}</Text>
              <Text style={{ fontSize: 12.5, opacity: 0.65, marginTop: 2, color: '#fff' }}>{p.sub} • Conheci em {p.from}</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <Text style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.45, marginRight: 4, color: '#fff' }}>Eventos:</Text>
              {personEvents.map(ev => <Tag key={ev.title}>{ev.title}</Tag>)}
            </View>

            <View style={{ alignItems: 'flex-end', minWidth: 70 }}>
              <Text style={{ fontFamily: font.display, fontSize: 15, fontWeight: '600', color: '#fff' }}>{p.noteCount} notas</Text>
              <Text style={{ fontSize: 11, opacity: 0.45, color: '#fff' }}>registradas</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
