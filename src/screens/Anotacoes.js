import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Text from '../Text.js';
import TextInput from '../TextInput.js';
import { useApp } from '../AppContext.js';
import { NOTES as DEFAULT_NOTES } from '../data.js';
import { Chip, Tag, font } from '../ui.jsx';
import { api } from '../api.js';

const GENRES = ['Reflexão', 'Estratégia', 'Pessoal', 'Estudo', 'Trabalho', 'Ideia', 'Geral'];

export default function Anotacoes() {
  const { openModal } = useApp();
  const [notes, setNotes] = useState(DEFAULT_NOTES || []);
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

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const apiNotes = await api.get('/v1/notes');
      if (Array.isArray(apiNotes) && apiNotes.length > 0) {
        const formatted = apiNotes.map(n => {
          let genre = 'Geral';
          let noteTitle = n.title || 'Anotação sem título';
          const match = noteTitle.match(/^\[(.*?)\]\s*(.*)$/);
          if (match) {
            genre = match[1];
            noteTitle = match[2];
          }
          return {
            id: n.id,
            title: noteTitle,
            genre,
            body: n.body || n.content || '',
            date: n.createdAt ? new Date(n.createdAt).toLocaleDateString('pt-BR') : 'Hoje'
          };
        });
        setNotes(formatted);
      }
    } catch (e) {
      console.warn('Erro ao carregar anotações mobile:', e.message);
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
    const fullTitle = `[${selectedGenre}] ${title.trim() || 'Anotação sem título'}`;
    try {
      await api.post('/v1/notes', {
        title: fullTitle,
        body: body.trim(),
        tag: selectedGenre,
        day: new Date().toISOString()
      });
      setTitle('');
      setBody('');
      fetchNotes();
      setActiveTab('minhas');
    } catch (e) {
      console.error('Erro ao salvar anotação mobile:', e);
    } finally {
      setSaving(false);
    }
  };

  const filtered = notes.filter(n => {
    const matchG = filterGenre === 'Todos' || n.genre?.toLowerCase() === filterGenre.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchS = !q || n.title?.toLowerCase().includes(q) || n.body?.toLowerCase().includes(q);
    return matchG && matchS;
  });

  return (
    <ScrollView style={{ flex: 1, padding: 14 }}>
      {/* Abas Superiores Mobile */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <TouchableOpacity
          onPress={() => setActiveTab('escrever')}
          style={[styles.tabBtn, activeTab === 'escrever' && styles.tabActive]}
        >
          <Text style={styles.tabText}>✦ Escrever Anotação</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('minhas')}
          style={[styles.tabBtn, activeTab === 'minhas' && styles.tabActive]}
        >
          <Text style={styles.tabText}>📚 Minhas Anotações ({filtered.length})</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'escrever' ? (
        <View style={styles.card}>
          <Text style={styles.subLabel}>✦ Sentido / Gênero</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {GENRES.map(g => (
                <Chip key={g} on={selectedGenre === g} onClick={() => setSelectedGenre(g)}>
                  {g}
                </Chip>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.subLabel}>Título</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <Text style={styles.subLabel}>Conteúdo</Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            multiline
            numberOfLines={6}
            style={[styles.input, { height: 140, textAlignVertical: 'top' }]}
          />

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || (!title.trim() && !body.trim())}
            style={styles.saveBtn}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Salvando...' : '✦ Salvar Anotação'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.input}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {['Todos', ...GENRES].map(g => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setFilterGenre(g)}
                  style={[styles.filterChip, filterGenre === g && styles.filterChipActive]}
                >
                  <Text style={{ fontSize: 12, color: filterGenre === g ? '#fff' : '#aaa' }}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {filtered.map((n, i) => (
            <View key={n.id || i} style={styles.noteItem}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 11, color: 'var(--ac-lite)', fontWeight: 'bold' }}>✦ {n.genre}</Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{n.date}</Text>
              </View>
              <Text style={{ fontFamily: font.display, fontSize: 16, color: '#fff', fontWeight: 'bold' }}>{n.title}</Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{n.body}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center'
  },
  tabActive: {
    backgroundColor: 'var(--ac-deep)',
    borderColor: 'var(--ac-lite)',
    borderWidth: 1
  },
  tabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13
  },
  card: {
    backgroundColor: 'rgba(12, 14, 22, 0.85)',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  subLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'var(--ac-lite)',
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 8
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10
  },
  saveBtn: {
    backgroundColor: 'var(--ac-deep)',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'var(--ac-lite)'
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: font.display
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  filterChipActive: {
    backgroundColor: 'var(--ac-deep)'
  },
  noteItem: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)'
  }
});
