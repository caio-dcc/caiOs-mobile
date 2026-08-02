import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Text from '../Text.js';
import TextInput from '../TextInput.js';
import { useApp } from '../AppContext.js';
import { NOTES as DEFAULT_NOTES } from '../data.js';
import { Chip, font } from '../ui.jsx';
import { useSettings } from '../settings.jsx';
import { api } from '../api.js';

const LOCAL_STORAGE_KEY = 'caios_local_notes_v2';
const GENRES = ['Reflexão', 'Estratégia', 'Pessoal', 'Estudo', 'Trabalho', 'Ideia', 'Geral'];

const SAMPLE_FALLBACK_NOTES = [
  {
    id: 'sample-1',
    title: 'Diretrizes do Sistema caiOs',
    genre: 'Estratégia',
    body: 'Centralização de registros diários, sincronização Zero-Trust em tempo real e arquitetura reativa.',
    date: 'Hoje'
  },
  {
    id: 'sample-2',
    title: 'Reflexões sobre Produtividade Pessoal',
    genre: 'Reflexão',
    body: 'Manter a constância na entrada de dados diários gera contexto rico para o assistente de IA.',
    date: 'Hoje'
  }
];

export default function Anotacoes() {
  const st = useSettings();
  const { palette } = st;
  const { openModal } = useApp();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form
  const [selectedGenre, setSelectedGenre] = useState('Reflexão');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [activeTab, setActiveTab] = useState('escrever'); // 'escrever' | 'minhas'

  // Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('Todos');

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
      await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    } catch {}
  };

  const fetchNotes = async () => {
    setLoading(true);
    const local = await getLocalStored();

    try {
      const apiNotes = await api.get('/v1/notes');
      let formattedApi = [];

      if (Array.isArray(apiNotes) && apiNotes.length > 0) {
        formattedApi = apiNotes.map(n => {
          let genre = n.tag || 'Geral';
          let noteTitle = n.title || 'Anotação sem título';
          const match = noteTitle.match(/^\[(.*?)\]\s*(.*)$/);
          if (match) {
            genre = match[1];
            noteTitle = match[2];
          }

          return {
            id: n.id || `api-${Date.now()}`,
            title: noteTitle,
            genre,
            body: n.body || n.content || n.bodyEnc || '',
            date: n.createdAt ? new Date(n.createdAt).toLocaleDateString('pt-BR') : 'Hoje'
          };
        });
      }

      const combined = [...formattedApi, ...local];
      if (combined.length === 0) {
        combined.push(...SAMPLE_FALLBACK_NOTES);
      }

      // Desduplicar
      const seen = new Set();
      const unique = combined.filter(item => {
        const key = `${(item.title || '').trim()}_${(item.body || '').trim()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setNotes(unique);
    } catch (e) {
      console.warn('API de notas offline no mobile, usando cache local:', e.message);
      const fallbackList = local.length > 0 ? local : SAMPLE_FALLBACK_NOTES;
      setNotes(fallbackList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSave = async () => {
    if (!title.trim() && !body.trim()) return;
    setSaving(true);

    const titleText = title.trim() || 'Anotação sem título';
    const fullTitle = `[${selectedGenre}] ${titleText}`;
    const dateStr = new Date().toLocaleDateString('pt-BR');

    const newNoteObj = {
      id: `local-${Date.now()}`,
      title: titleText,
      genre: selectedGenre,
      body: body.trim(),
      date: dateStr
    };

    const local = await getLocalStored();
    const updatedLocal = [newNoteObj, ...local];
    await saveLocalStored(updatedLocal);

    setNotes(prev => [newNoteObj, ...prev]);

    try {
      await api.post('/v1/notes', {
        title: fullTitle,
        body: body.trim(),
        tag: selectedGenre,
        day: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Nota salva localmente no mobile (API indisponível):', e.message);
    } finally {
      setSaving(false);
      setTitle('');
      setBody('');
      setActiveTab('minhas');
    }
  };

  const filtered = notes.filter(n => {
    const genreNormalized = n.genre || 'Geral';
    const matchG = filterGenre === 'Todos' || genreNormalized.toLowerCase() === filterGenre.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchS = !q ||
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.body && n.body.toLowerCase().includes(q));

    return matchG && matchS;
  });

  return (
    <ScrollView style={{ flex: 1, padding: 14 }}>
      {/* Abas Superiores Mobile */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <TouchableOpacity
          onPress={() => setActiveTab('escrever')}
          style={[
            styles.tabBtn,
            { backgroundColor: activeTab === 'escrever' ? palette.acDeep : 'rgba(255,255,255,0.05)', borderColor: activeTab === 'escrever' ? palette.acLite : 'transparent' }
          ]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'escrever' ? '#fff' : 'rgba(255,255,255,0.6)' }]}>
            ✦ Escrever Anotação
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('minhas')}
          style={[
            styles.tabBtn,
            { backgroundColor: activeTab === 'minhas' ? palette.acDeep : 'rgba(255,255,255,0.05)', borderColor: activeTab === 'minhas' ? palette.acLite : 'transparent' }
          ]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'minhas' ? '#fff' : 'rgba(255,255,255,0.6)' }]}>
            📚 Minhas Anotações ({filtered.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'escrever' ? (
        <View style={styles.card}>
          <Text style={[styles.subLabel, { color: palette.acLite }]}>✦ Sentido / Gênero</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {GENRES.map(g => (
                <Chip key={g} on={selectedGenre === g} onPress={() => setSelectedGenre(g)}>
                  {g}
                </Chip>
              ))}
            </View>
          </ScrollView>

          <Text style={[styles.subLabel, { color: palette.acLite }]}>Título</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Digite o título da anotação..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            style={styles.input}
          />

          <Text style={[styles.subLabel, { color: palette.acLite }]}>Conteúdo</Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Escreva seus pensamentos ou ideias..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            multiline
            numberOfLines={6}
            style={[styles.input, { height: 140, textAlignVertical: 'top' }]}
          />

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || (!title.trim() && !body.trim())}
            style={[styles.saveBtn, { backgroundColor: palette.acDeep, borderColor: palette.acLite }]}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Salvando...' : '✦ Salvar Anotação'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar por título ou conteúdo..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            style={styles.input}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {['Todos', ...GENRES].map(g => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setFilterGenre(g)}
                  style={[
                    styles.filterChip,
                    { backgroundColor: filterGenre === g ? palette.acDeep : 'rgba(255,255,255,0.05)', borderColor: filterGenre === g ? palette.acLite : 'transparent', borderWidth: 1 }
                  ]}
                >
                  <Text style={{ fontSize: 12, color: filterGenre === g ? '#fff' : 'rgba(255,255,255,0.6)', fontWeight: filterGenre === g ? 'bold' : 'normal' }}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {filtered.length === 0 ? (
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', textAlign: 'center', marginVertical: 20 }}>
              Nenhuma anotação encontrada.
            </Text>
          ) : (
            filtered.map((n, i) => (
              <View key={n.id || i} style={styles.noteItem}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 11, color: palette.acLite, fontWeight: 'bold', textTransform: 'uppercase' }}>
                    ✦ {n.genre || 'Geral'}
                  </Text>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{n.date}</Text>
                </View>
                <Text style={{ fontFamily: font.display, fontSize: 16, color: '#fff', fontWeight: 'bold' }}>
                  {n.title}
                </Text>
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4, lineHeight: 18 }}>
                  {n.body || 'Sem conteúdo.'}
                </Text>
              </View>
            ))
          )}
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
    backgroundColor: 'rgba(12, 14, 22, 0.85)', padding: 16, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)'
  },
  subLabel: {
    fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 6, marginTop: 8
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 12, borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1, color: '#fff', paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10
  },
  saveBtn: {
    paddingVertical: 12, borderRadius: 14, alignItems: 'center', marginTop: 10, borderWidth: 1
  },
  saveBtnText: {
    color: '#fff', fontWeight: 'bold', fontSize: 15, fontFamily: font.display
  },
  filterChip: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8
  },
  noteItem: {
    backgroundColor: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)'
  }
});
