import React, { useState } from 'react';
import { View } from 'react-native';
import Text from '../Text.js';
import { useSettings } from '../settings.jsx';
import { useApp } from '../AppContext.js';
import { AUDIT, AUDIT_FILTERS } from '../data.js';
import { ChipRow, GridRow, font } from '../ui.jsx';
import EmptyState from '../components/EmptyState.js';

export default function Memoria() {
  const st = useSettings();
  const { openModal } = useApp();
  const [filter, setFilter] = useState(0);

  if (!AUDIT || AUDIT.length === 0) {
    return <EmptyState title="Nenhum registro na Memória de Auditoria" subtitle="As alterações, cadastros e atualizações de dados aparecerão registradas aqui automaticamente." ctaLabel="+ Novo Registro" onPress={() => openModal({ kind: 'add' })} />;
  }

  return (
    <View>
      <View style={{ marginBottom: 16 }}>
        <ChipRow options={AUDIT_FILTERS} value={filter} onPick={setFilter} />
      </View>
      <View style={{ gap: 10 }}>
        {AUDIT.map((a, i) => (
          <View key={i} style={{ borderRadius: 18, padding: 16 }}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'baseline', flexWrap: 'wrap' }}>
              <Text style={{ fontSize: 10.5, textTransform: 'uppercase', fontWeight: '700', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 7, backgroundColor: a.tint, color: a.ink }}>{a.action}</Text>
              <Text style={{ fontSize: 14, fontWeight: '500', flex: 1, color: '#fff' }}>{a.entity}</Text>
              <Text style={{ fontSize: 12, color: '#fff' }}>{a.when}</Text>
            </View>
            <GridRow min={200} gap={8} style={{ marginTop: 13 }}>
              <View style={{ padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,.025)', borderWidth: 1, borderColor: 'rgba(255,255,255,.05)' }}>
                <Text style={{ fontSize: 10.5, textTransform: 'uppercase', color: 'rgba(255,120,120,.7)', fontWeight: '600', marginBottom: 5 }}>antes</Text>
                <Text style={{ fontSize: 13, fontFamily: font.display, color: '#fff' }}>{st.money(a.before)}</Text>
              </View>
              <View style={{ padding: 12, borderRadius: 12, backgroundColor: st.palette.acdAlpha(0.35), borderWidth: 1, borderColor: st.palette.ac2Alpha(0.2) }}>
                <Text style={{ fontSize: 10.5, textTransform: 'uppercase', color: 'rgba(140,255,190,.7)', fontWeight: '600', marginBottom: 5 }}>depois</Text>
                <Text style={{ fontSize: 13, fontFamily: font.display, color: '#fff' }}>{st.money(a.after)}</Text>
              </View>
            </GridRow>
            <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap', marginTop: 13 }}>
              <Text style={{ fontSize: 12, color: '#fff' }}>campo {a.field}</Text>
              <Text style={{ fontSize: 12, color: '#fff' }}>{st.mask(a.geo, 'audit')}</Text>
              <Text style={{ fontSize: 12, color: '#fff' }}>{st.mask(a.device, 'audit')}</Text>
              <Text style={{ fontSize: 12, color: '#fff' }}>ip {st.hides('audit') ? '•••' : a.ip}</Text>
              <Text style={{ fontSize: 12, color: a.trustColor }}>{a.trust}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
