import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Text from '../Text.js';
import TextInput from '../TextInput.js';
import { useApp } from '../AppContext.js';
import { peopleView } from './people.js';
import { useSettings } from '../settings.jsx';
import { Chip, font } from '../ui.jsx';
import { api } from '../api.js';

const LOCAL_STORAGE_KEY = 'caios_local_people_v2';
const DEFAULT_FLAGS = ['Confiança alta', 'Trabalho', 'Parceria', 'Amigo próximo', 'Rio', 'Networking'];

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
  const { palette } = st;
  const { openModal } = useApp();
  const defaultPeople = peopleView(st.hides);

  const [people, setPeople] = useState([]);
  const [activeTab, setActiveTab] = useState('dossie'); // 'dossie' | 'contatos'
  const [saving, setSaving] = useState(false);

  // Form State
  const [activePersonId, setActivePersonId] = useState(null);
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [metWhere, setMetWhere] = useState('');
  const [trustScore, setTrustScore] = useState(75);
  const [closenessScore, setClosenessScore] = useState(60);
  const [dossier, setDossier] = useState('');
  const [selectedFlags, setSelectedFlags] = useState(['Confiança alta']);

  // Filter
  const [searchQuery, setSearchQuery] = useState('');

  const getLocalStored = async () => {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveLocalStored = async (list) => {
    try {
      const clean = deduplicatePeople(list);
      await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clean));
    } catch {}
  };

  const fetchPeople = async () => {
    const local = await getLocalStored();
    try {
      const apiPeople = await api.get('/v1/people');
      let formatted = [];
      if (Array.isArray(apiPeople) && apiPeople.length > 0) {
        formatted = apiPeople.map(p => ({
          id: p.id,
          name: p.name,
          sub: p.subtitle || p.sub || 'Contato',
          from: p.metWhere || p.from || 'Geral',
          trust: p.trustScore ? `${p.trustScore}%` : (p.trust || '75%'),
          prox: p.closenessScore ? `${p.closenessScore}%` : (p.prox || '60%'),
          initials: p.initials || (p.name ? p.name.slice(0, 2).toUpperCase() : 'PE'),
          dossier: p.dossier || p.dossierEnc || p.body || '',
          flags: p.flags || ['Cadastrado']
        }));
      }

      const merged = deduplicatePeople([...formatted, ...local, ...defaultPeople]);
      setPeople(merged);
      if (!activePersonId && merged.length > 0) populateForm(merged[0]);
    } catch (e) {
      console.warn('API de pessoas indisponível no mobile:', e.message);
      const merged = deduplicatePeople([...local, ...defaultPeople]);
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
    setSubtitle(p.sub || p.subtitle || '');
    setMetWhere(p.from || p.metWhere || '');
    setDossier(p.dossier || p.note || '');
    setTrustScore(parseInt(p.trust) || 75);
    setClosenessScore(parseInt(p.prox) || 60);
    setSelectedFlags(p.flags && p.flags.length > 0 ? p.flags : ['Confiança alta']);
  };

  const handleClear = () => {
    setActivePersonId(null);
    setName('');
    setSubtitle('');
    setMetWhere('');
    setDossier('');
    setTrustScore(75);
    setClosenessScore(60);
    setSelectedFlags(['Confiança alta']);
  };

  const toggleFlag = (flag) => {
    setSelectedFlags(prev =>
      prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
    );
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
      dossier: dossier.trim(),
      flags: selectedFlags
    };

    const localStored = await getLocalStored();
    const updatedLocal = deduplicatePeople([personObj, ...localStored]);
    await saveLocalStored(updatedLocal);

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
      console.warn('Pessoa salva no storage local mobile:', e.message);
    } finally {
      setSaving(false);
      setActiveTab('contatos');
    }
  };

  const filtered = people.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    return !q ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.sub && p.sub.toLowerCase().includes(q)) ||
      (p.from && p.from.toLowerCase().includes(q)) ||
      (p.dossier && p.dossier.toLowerCase().includes(q));
  });

  return (
    <ScrollView style={{ flex: 1, padding: 14 }}>
      {/* Abas Mobile Superiores */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <TouchableOpacity
          onPress={() => setActiveTab('dossie')}
          style={[
            styles.tabBtn,
            { backgroundColor: activeTab === 'dossie' ? palette.acDeep : 'rgba(255,255,255,0.05)', borderColor: activeTab === 'dossie' ? palette.acLite : 'transparent' }
          ]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'dossie' ? '#fff' : 'rgba(255,255,255,0.6)' }]}>
            ✦ Dossiê & Análise
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('contatos')}
          style={[
            styles.tabBtn,
            { backgroundColor: activeTab === 'contatos' ? palette.acDeep : 'rgba(255,255,255,0.05)', borderColor: activeTab === 'contatos' ? palette.acLite : 'transparent' }
          ]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'contatos' ? '#fff' : 'rgba(255,255,255,0.6)' }]}>
            ⚥ Rede ({filtered.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'dossie' ? (
        <View style={[styles.card, { borderColor: 'rgba(255,255,255,0.1)' }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[styles.avatarBox, { backgroundColor: palette.acmAlpha(0.6), borderColor: palette.acLite }]}>
                <Text style={{ fontFamily: font.display, fontSize: 16, fontWeight: 'bold', color: palette.acLite }}>
                  {name ? name.slice(0, 2).toUpperCase() : '⚥'}
                </Text>
              </View>
              <Text style={{ fontFamily: font.display, fontSize: 18, color: '#fff', fontWeight: 'bold' }}>
                {name || 'Nova Pessoa'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClear} style={{ paddingVertical: 4, paddingHorizontal: 8 }}>
              <Text style={{ color: palette.acLite, fontSize: 13, fontWeight: '600' }}>+ Limpar</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: palette.acLite }]}>Nome Completo</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex: Amanda Silva"
            placeholderTextColor="rgba(255,255,255,0.3)"
            style={styles.input}
          />

          <Text style={[styles.label, { color: palette.acLite }]}>Ocupação / Subtítulo</Text>
          <TextInput
            value={subtitle}
            onChangeText={setSubtitle}
            placeholder="Ex: Arquiteta • Design"
            placeholderTextColor="rgba(255,255,255,0.3)"
            style={styles.input}
          />

          <Text style={[styles.label, { color: palette.acLite }]}>Onde Conheceu</Text>
          <TextInput
            value={metWhere}
            onChangeText={setMetWhere}
            placeholder="Ex: Evento Tech RJ"
            placeholderTextColor="rgba(255,255,255,0.3)"
            style={styles.input}
          />

          {/* Sliders de Confiança & Proximidade */}
          <View style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: 14, borderRadius: 14, borderContent: 'solid', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginVertical: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: palette.acLite }}>Confiança</Text>
              <Text style={{ fontSize: 12, color: '#fff', fontWeight: 'bold' }}>{trustScore}%</Text>
            </View>
            <View style={{ height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <View style={{ height: 6, borderRadius: 999, width: `${trustScore}%`, backgroundColor: palette.ac }} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, marginTop: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: palette.acLite }}>Proximidade</Text>
              <Text style={{ fontSize: 12, color: '#fff', fontWeight: 'bold' }}>{closenessScore}%</Text>
            </View>
            <View style={{ height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <View style={{ height: 6, borderRadius: 999, width: `${closenessScore}%`, backgroundColor: palette.acDeep }} />
            </View>
          </View>

          {/* Marcadores Sociais */}
          <Text style={[styles.label, { color: palette.acLite, marginTop: 8 }]}>Rótulos e Marcadores</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {DEFAULT_FLAGS.map(flag => (
              <Chip
                key={flag}
                on={selectedFlags.includes(flag)}
                onPress={() => toggleFlag(flag)}
              >
                {flag}
              </Chip>
            ))}
          </View>

          {/* Dossiê */}
          <Text style={[styles.label, { color: palette.acLite }]}>Dossiê / Histórico de Relacionamento</Text>
          <TextInput
            value={dossier}
            onChangeText={setDossier}
            placeholder="Anotações de conversas, preferências e percepções..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            multiline
            numberOfLines={5}
            style={[styles.input, { height: 130, textAlignVertical: 'top' }]}
          />

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || !name.trim()}
            style={[styles.saveBtn, { backgroundColor: palette.acDeep, borderColor: palette.acLite }]}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Gravando...' : '✦ Salvar Dossiê'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar contato..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            style={styles.input}
          />

          {filtered.map((p, i) => (
            <TouchableOpacity
              key={p.id || p.name + i}
              onPress={() => { populateForm(p); setActiveTab('dossie'); }}
              style={styles.item}
            >
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <View style={[styles.avatarBox, { backgroundColor: palette.acmAlpha(0.6), borderColor: palette.ac2Alpha(0.5) }]}>
                  <Text style={{ color: palette.acLite, fontWeight: 'bold', fontSize: 13 }}>{p.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: font.display, fontSize: 15, color: '#fff', fontWeight: 'bold' }}>{p.name}</Text>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{p.sub} • {p.from}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Confiança</Text>
                    <Text style={{ fontSize: 10, color: '#fff' }}>{p.trust || '75%'}</Text>
                  </View>
                  <View style={{ height: 3, borderRadius: 999, backgroundColor: 'rgba(255,255,255,.08)' }}>
                    <View style={{ height: 3, borderRadius: 999, width: p.trust || '75%', backgroundColor: palette.ac }} />
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Proximidade</Text>
                    <Text style={{ fontSize: 10, color: '#fff' }}>{p.prox || '60%'}</Text>
                  </View>
                  <View style={{ height: 3, borderRadius: 999, backgroundColor: 'rgba(255,255,255,.08)' }}>
                    <View style={{ height: 3, borderRadius: 999, width: p.prox || '60%', backgroundColor: palette.acDeep }} />
                  </View>
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
    flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center'
  },
  tabText: { fontWeight: 'bold', fontSize: 13 },
  card: {
    backgroundColor: 'rgba(12, 14, 22, 0.85)', padding: 16, borderRadius: 18, borderWidth: 1
  },
  label: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4, marginTop: 8 },
  input: {
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', color: '#fff', paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8
  },
  saveBtn: {
    paddingVertical: 12, borderRadius: 14, alignItems: 'center', marginTop: 12, borderWidth: 1
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15, fontFamily: font.display },
  item: {
    backgroundColor: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)'
  },
  avatarBox: {
    width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1
  }
});
