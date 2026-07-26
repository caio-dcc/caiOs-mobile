import React from 'react';
import { View, Pressable } from 'react-native';
import Text from '../Text.js';
import { useSettings } from '../settings.jsx';
import { useApp } from '../AppContext.js';
import { BUCKETDAYS } from '../data.js';
import { GridRow, font } from '../ui.jsx';
import EmptyState from '../components/EmptyState.js';

export default function Bucket() {
  const st = useSettings();
  const { openModal } = useApp();

  if (!BUCKETDAYS || BUCKETDAYS.length === 0) {
    return <EmptyState title="Nenhum arquivo no Bucket" subtitle="Armazene fotos, documentos e áudios vinculados aos seus dias e eventos." ctaLabel="+ Enviar Arquivo" onPress={() => openModal({ kind: 'add' })} />;
  }

  return (
    <View>
      {BUCKETDAYS.map((d, i) => (
        <View key={i} style={{ marginBottom: 26 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
            <Text style={{ fontFamily: font.display, fontSize: 15, fontWeight: '600', color: '#fff' }}>{d.date}</Text>
            <View style={{ height: 1, flex: 1, backgroundColor: 'rgba(255,255,255,.07)' }} />
            <Text style={{ fontSize: 12.5, color: '#fff' }}>{st.money(d.summary)}</Text>
          </View>
          <GridRow min={150} gap={10}>
            {d.files.map((f, k) => (
              <Pressable key={k} onPress={() => openModal({ kind: 'day', n: 25 })} style={{ borderRadius: 14, backgroundColor: f.bg, padding: 11, justifyContent: 'space-between', minHeight: 110 }}>
                <Text style={{ alignSelf: 'flex-start', fontSize: 10, textTransform: 'uppercase', fontWeight: '700', paddingVertical: 3, paddingHorizontal: 7, borderRadius: 6, backgroundColor: 'rgba(0,0,0,.45)', color: '#fff' }}>{f.kind}</Text>
                <View>
                  <Text style={{ fontSize: 12.5, fontWeight: '500', color: '#fff' }}>{st.mask(f.name, 'bucket')}</Text>
                  <Text style={{ fontSize: 11.5, marginTop: 2, color: '#fff' }}>{st.hides('bucket') ? '••••••' : st.money(f.link)}</Text>
                </View>
              </Pressable>
            ))}
            <Pressable onPress={() => openModal({ kind: 'add', defaultTab: 0 })} style={{ borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: st.palette.ac2Alpha(0.3), alignItems: 'center', justifyContent: 'center', minHeight: 110 }}>
              <Text style={{ color: st.palette.ac2Alpha(0.7), fontSize: 12.5 }}>arraste ou toque</Text>
            </Pressable>
          </GridRow>
        </View>
      ))}
    </View>
  );
}
