import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Text from '../Text.js';
import TextInput from '../TextInput.js';
import { useApp } from '../AppContext.js';
import { peopleView } from './people.js';
import { useSettings } from '../settings.jsx';
import { font } from '../ui.jsx';
import { api } from '../api.js';

const deduplicatePeople = (list) => {
  const seen = new Set();
  return list.filter(p => {
    if (!p || !p.name || !p.name.trim()) return false;
    const key = p.name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export default function Social() {
  const st = useSettings();
  const { openModal } = useApp();
  const defaultPeople = peopleView(st.hides);

  const [people, setPeople] = useState([]);
  const [activeTab, setActiveTab] = useState('dossie');
  const [saving, setSaving] = useState(false);

  // Form State
  const [activePersonId, setActivePersonId] = useState(null);
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [metWhere, setMetWhere] = useState('');
  const [trustScore, setTrustScore] = useState(75);
  const [closenessScore, setClosenessScore] = useState(60);
  const [dossier, setDossier] = useState('');

  // Filter
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPeople = async () => {
    try {
      const apiPeople = await api.get('/v1/people');
      let formatted = [];
      if (Array.isArray(apiPeople) && apiPeople.length > 0) {
        formatted = apiPeople.map(p => ({
          id: p.id,
          name: p.name,
          sub: p.subtitle || 'Contato',
          from: p.metWhere || 'Geral',
          trust: p.trustScore ? `${p.trustScore}%` : '75%',
          prox: p.closenessScore ? `${p.closenessScore}%` : '60%',
          initials: p.name ? p.name.slice(0, 2).toUpperCase() : 'PE',
          dossier: p.dossier || p.dossierEnc || p.body || ''
        }));
      }

      const merged = deduplicatePeople([...formatted, ...defaultPeople]);
      setPeople(merged);
      if (!activePersonId && merged.length > 0) populateForm(merged[0]);
    } catch (e) {
      console.warn('Erro ao carregar pessoas no mobile:', e.message);
      const merged = deduplicatePeople(defaultPeople);
      setPeople(merged);
      if (!activePersonId && merged.length > 0) populateForm(merged[0]);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const populateForm = (p) => {
    setActivePersonId(p.id || p.name);
    setName(p.name || '');
    setSubtitle(p.sub || '');
    setMetWhere(p.from || '');
    setDossier(p.dossier || p.note || '');
    setTrustScore(parseInt(p.trust) || 75);
    setClosenessScore(parseInt(p.prox) || 60);
  };

  const handleClear = () => {
    setActivePersonId(null);
    setName('');
    setSubtitle('');
    setMetWhere('');
    setDossier('');
    setTrustScore(75);
    setClosenessScore(60);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);

    const cleanName = name.trim();
    const existing = people.find(p => p.name.toLowerCase() === cleanName.toLowerCase());
    const targetId = activePersonId || existing?.id || `local-${Date.now()}`;

    const personObj = {
      id: targetId,
      name: cleanName,
      sub: subtitle.trim() || 'Contato',
      from: metWhere.trim() || 'Geral',
      trust: `${trustScore}%`,
      prox: `${closenessScore}%`,
      initials: cleanName.slice(0, 2).toUpperCase(),
      dossier: dossier.trim()
    };

    setPeople(prev => deduplicatePeople([personObj, ...prev]));

    try {
      const payload = {
        name: personObj.name,
        subtitle: personObj.sub,
        metWhere: personObj.from,
        dossier: personObj.dossier,
        trustScore,
        closenessScore
      };

      if (targetId && !targetId.toString().startsWith('local-')) {
        await api.put(`/v1/people/${targetId}`, payload);
      } else {
        await api.post('/v1/people', payload);
      }
    } catch (e) {
      console.warn('Salvo localmente no mobile:', e.message);
    } finally {
      setSaving(false);
      setActiveTab('contatos');
    }
  };

  const filtered = people.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    return !q || p.name?.toLowerCase().includes(q) || p.sub?.toLowerCase().includes(q) || p.from?.toLowerCase().includes(q);
  });

  return (
    <ScrollView style={{ flex: 1, padding: 14 }}>
      {/* Abas Mobile */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <TouchableOpacity
          onPress={() => setActiveTab('dossie')}
          style={[styles.tabBtn, activeTab === 'dossie' && styles.tabActive]}
        >
          <Text style={styles.tabText}>✦ Dossiê & Análise</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('contatos')}
          style={[styles.tabBtn, activeTab === 'contatos' && styles.tabActive]}
        >
          <Text style={styles.tabText}>⚥ Rede ({filtered.length})</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'dossie' ? (
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ fontFamily: font.display, fontSize: 18, color: '#fff', fontWeight: 'bold' }}>
              {name || 'Nova Pessoa'}
            </Text>
            <TouchableOpacity onPress={handleClear} style={{ padding: 6 }}>
              <Text style={{ color: '#aaa', fontSize: 12 }}>+ Limpar</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Nome Completo</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} />

          <Text style={styles.label}>Ocupação / Subtítulo</Text>
          <TextInput value={subtitle} onChangeText={setSubtitle} style={styles.input} />

          <Text style={styles.label}>Onde Conheceu</Text>
          <TextInput value={metWhere} onChangeText={setMetWhere} style={styles.input} />

          {/* Sliders de Confiança / Proximidade */}
          <View style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 12, marginVertical: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 12, color: 'var(--ac-lite)' }}>Confiança</Text>
              <Text style={{ fontSize: 12, color: '#fff' }}>{trustScore}%</Text>
            </View>
            <View style={{ height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <View style={{ height: 6, borderRadius: 999, width: `${trustScore}%`, backgroundColor: 'var(--ac)' }} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, marginTop: 10 }}>
              <Text style={{ fontSize: 12, color: 'var(--ac-lite)' }}>Proximidade</Text>
              <Text style={{ fontSize: 12, color: '#fff' }}>{closenessScore}%</Text>
            </View>
            <View style={{ height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <View style={{ height: 6, borderRadius: 999, width: `${closenessScore}%`, backgroundColor: 'var(--ac-deep)' }} />
            </View>
          </View>

          <Text style={styles.label}>Dossiê / Histórico de Relacionamento</Text>
          <TextInput
            value={dossier}
            onChangeText={setDossier}
            multiline
            numberOfLines={5}
            style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
          />

          <TouchableOpacity onPress={handleSave} disabled={saving || !name.trim()} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>{saving ? 'Gravando...' : '✦ Salvar Dossiê'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Buscar contato..." style={styles.input} />

          {filtered.map((p, i) => (
            <TouchableOpacity
              key={p.id || p.name + i}
              onPress={() => { populateForm(p); setActiveTab('dossie'); }}
              style={styles.item}
            >
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <View style={styles.avatar}>
                  <Text style={{ color: 'var(--ac-lite)', fontWeight: 'bold' }}>{p.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: font.display, fontSize: 15, color: '#fff', fontWeight: 'bold' }}>{p.name}</Text>
                  <Text style={{ fontSize: 12, color: '#aaa' }}>{p.sub} • {p.from}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center'
  },
  tabActive: {
    backgroundColor: 'var(--ac-deep)', borderWidth: 1, borderColor: 'var(--ac-lite)'
  },
  tabText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  card: {
    backgroundColor: 'rgba(12, 14, 22, 0.85)', padding: 16, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)'
  },
  label: { fontSize: 11, fontWeight: 'bold', color: 'var(--ac-lite)', textTransform: 'uppercase', marginBottom: 4, marginTop: 8 },
  input: {
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', color: '#fff', paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8
  },
  saveBtn: {
    backgroundColor: 'var(--ac-deep)', paddingVertical: 12, borderRadius: 14, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: 'var(--ac-lite)'
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15, fontFamily: font.display },
  item: {
    backgroundColor: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)'
  },
  avatar: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(var(--ac-rgb), 0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'var(--ac-lite)'
  }
});
