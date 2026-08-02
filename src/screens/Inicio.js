import React, { useState, useEffect } from 'react';
import { View, Pressable, Image, Modal, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TextInput from '../TextInput.js';
import Text from '../Text.js';
import { useSettings } from '../settings.jsx';
import { useApp } from '../AppContext.js';
import { api } from '../api.js';
import { STATS, TIMELINE, EVENTS, PENDING, RIO_TECH_POSTS, UFC_POSTS as FALLBACK_UFC_POSTS } from '../data.js';
import { AnimatedList, StatCard, GridRow, font, label } from '../ui.jsx';

const INITIAL_FORM_FIELDS = [
  ['Pessoas de hoje', ['+ Buscar'], true],
  ['Itens que saíram comigo', ['+ Inventário'], true],
  ['Evento', ['+ Novo evento'], false]
];

const NEWS_CATEGORIES = ['Todas', 'Rio de Janeiro', 'Mundo Tech', 'UFC & Combate', 'Política & Economia', 'Ciência & Cultura'];

function NewsCarousel({ posts = [], categoryTitle, onRefresh }) {
  const st = useSettings();
  const { palette } = st;
  const [idx, setIdx] = useState(0);
  const [activePost, setActivePost] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [chatLog, setChatLog] = useState([]);
  const [question, setQuestion] = useState('');

  if (!posts || posts.length === 0) {
    return (
      <View style={{ padding: 16, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14 }}>
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>Buscando notícias ao vivo...</Text>
      </View>
    );
  }

  const safeIdx = idx % posts.length;
  const post = posts[safeIdx] || posts[0];
  const next = () => setIdx(p => (p + 1) % posts.length);
  const prev = () => setIdx(p => (p - 1 + posts.length) % posts.length);

  const openAnalysis = async newsPost => {
    setActivePost(newsPost);
    setLoadingAi(true);
    setChatLog([]);
    try {
      const data = await api.post('/v1/assistant/chat', {
        message: `Faça uma análise crítica e aprofundada da seguinte notícia:\nTítulo: "${newsPost.title}"\nResumo: ${newsPost.summary}\nForneça 3 insights táticos.`,
        history: []
      });
      setChatLog([{ role: 'assistant', text: data.reply || 'Análise concluída com sucesso.' }]);
    } catch (e) {
      setChatLog([{ role: 'assistant', text: 'Análise Estratégica: notícia de grande relevância, com impacto no contexto atual.' }]);
    } finally {
      setLoadingAi(false);
    }
  };

  const sendFollowUp = async () => {
    if (!question.trim()) return;
    const q = question;
    setQuestion('');
    setChatLog(prev => [...prev, { role: 'user', text: q }]);
    try {
      const data = await api.post('/v1/assistant/chat', {
        message: `Sobre a notícia "${activePost?.title}": ${q}`,
        history: chatLog.map(c => ({ role: c.role, content: c.text }))
      });
      setChatLog(prev => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (e) {
      setChatLog(prev => [...prev, { role: 'assistant', text: 'Excelente questionamento. A análise contínua fortalece a decisão.' }]);
    }
  };

  return (
    <View style={{ marginVertical: 6 }}>
      {categoryTitle && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: palette.acLite }}>
            {categoryTitle} ({posts.length})
          </Text>
          {onRefresh && (
            <Pressable onPress={onRefresh} style={{ paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={{ fontSize: 11, color: palette.acLite, fontWeight: 'bold' }}>✦ Atualizar</Text>
            </Pressable>
          )}
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 12, backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' }}>
        {post.img || post.image ? (
          <Image source={{ uri: post.img || post.image }} style={{ width: 90, height: 90, borderRadius: 12 }} />
        ) : null}
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: palette.acLite, textTransform: 'uppercase' }}>
              {post.tag || post.category || 'Notícia'}
            </Text>
            <Pressable onPress={() => openAnalysis(post)} style={{ backgroundColor: palette.ac2Alpha(0.2), paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: palette.acLite }}>✦ Análise IA</Text>
            </Pressable>
          </View>
          <Text style={{ fontFamily: font.display, fontSize: 14.5, fontWeight: '700', color: '#fff' }} numberOfLines={2}>{post.title}</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }} numberOfLines={2}>{post.summary}</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
              {safeIdx + 1} de {posts.length} • {post.source || 'G1 / Live'}
            </Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Pressable onPress={prev} style={{ backgroundColor: 'rgba(255,255,255,.08)', width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>❮</Text>
              </Pressable>
              <Pressable onPress={next} style={{ backgroundColor: 'rgba(255,255,255,.08)', width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>❯</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <Modal visible={!!activePost} transparent animationType="fade" onRequestClose={() => setActivePost(null)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 }} onPress={() => setActivePost(null)}>
          <Pressable onPress={e => e.stopPropagation?.()} style={{ borderRadius: 20, backgroundColor: '#12151e', borderWidth: 1, borderColor: palette.ac2Alpha(0.4), padding: 20, gap: 14, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.acLite, textTransform: 'uppercase' }}>✦ Análise de Inteligência IA</Text>
                <Text style={{ fontFamily: font.display, fontSize: 17, color: '#fff', marginTop: 4 }}>{activePost?.title}</Text>
              </View>
              <Pressable onPress={() => setActivePost(null)} style={{ padding: 4 }}>
                <Text style={{ color: '#ff7777', fontSize: 18, fontWeight: 'bold' }}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 260 }}>
              {loadingAi ? (
                <Text style={{ fontSize: 13, color: palette.acLite, fontStyle: 'italic' }}>✦ Processando análise em tempo real...</Text>
              ) : chatLog.map((msg, i) => (
                <View key={i} style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%',
                  padding: 10, borderRadius: 14, marginBottom: 8,
                  backgroundColor: msg.role === 'user' ? palette.ac2Alpha(0.25) : 'rgba(255,255,255,.05)'
                }}>
                  <Text style={{ color: '#fff', fontSize: 13, lineHeight: 18 }}>{msg.text}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                placeholder="Faça uma pergunta sobre esta notícia…"
                placeholderTextColor="rgba(255,255,255,.4)"
                value={question}
                onChangeText={setQuestion}
                onSubmitEditing={sendFollowUp}
                style={{ flex: 1, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,.15)', backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff', paddingVertical: 9, paddingHorizontal: 12, fontSize: 13 }}
              />
              <Pressable onPress={sendFollowUp} style={{ backgroundColor: palette.acDeep, paddingHorizontal: 14, borderRadius: 12, justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Perguntar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export default function Inicio() {
  const st = useSettings();
  const { palette } = st;
  const { openModal, go } = useApp();

  const [formValues, setFormValues] = useState({});
  const [finStats, setFinStats] = useState([]);
  const [liveNews, setLiveNews] = useState([]);
  const [ufcNews, setUfcNews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [loadingNews, setLoadingNews] = useState(false);

  // Carrega finanças e notícias reais do backend
  const loadDashboardData = async () => {
    // 1. Finanças do backend
    try {
      const stats = await api.get('/v1/finance/stats');
      if (Array.isArray(stats) && stats.length > 0) {
        setFinStats(stats);
        await AsyncStorage.setItem('caios_fin_stats_cache', JSON.stringify(stats));
      }
    } catch (e) {
      console.warn('Finance stats offline no mobile, usando cache:', e.message);
      try {
        const cached = await AsyncStorage.getItem('caios_fin_stats_cache');
        if (cached) setFinStats(JSON.parse(cached));
      } catch {}
    }

    // 2. Notícias ao vivo do backend
    setLoadingNews(true);
    try {
      const newsRes = await api.get('/v1/news/random');
      if (newsRes && Array.isArray(newsRes.news) && newsRes.news.length > 0) {
        const formatted = newsRes.news.map((item, i) => ({
          id: item.id || `api-${i}`,
          category: item.category || 'Geral · Atualização',
          title: item.title,
          source: item.source || 'Notícias caiOs',
          summary: item.summary,
          image: item.image || item.img || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=60'
        }));
        setLiveNews(formatted);
      } else {
        setLiveNews(RIO_TECH_POSTS);
      }
    } catch (e) {
      console.warn('Notícias offline no mobile:', e.message);
      setLiveNews(RIO_TECH_POSTS);
    } finally {
      setLoadingNews(false);
    }

    // 3. Notícias de UFC do backend
    try {
      const ufcRes = await api.get('/v1/news/ufc');
      if (ufcRes && Array.isArray(ufcRes.news) && ufcRes.news.length > 0) {
        setUfcNews(ufcRes.news);
      } else {
        setUfcNews(FALLBACK_UFC_POSTS);
      }
    } catch {
      setUfcNews(FALLBACK_UFC_POSTS);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const toggleFormPill = (fieldLabel, option) => {
    setFormValues(prev => {
      const current = prev[fieldLabel] || [];
      const updated = current.includes(option) ? current.filter(i => i !== option) : [...current, option];
      return { ...prev, [fieldLabel]: updated };
    });
  };

  const displayStats = finStats.length > 0 ? finStats : [
    { label: 'Hoje', value: 'R$ 0,00', hint: '0 lançamentos' },
    { label: 'Semana', value: 'R$ 0,00', hint: '0 lançamentos' },
    { label: 'Mês', value: 'R$ 0,00', hint: '0 lançamentos' }
  ];

  const filteredNews = liveNews.filter(n => {
    if (selectedCategory === 'Todas') return true;
    const cat = (n.category || n.tag || '').toLowerCase();
    return cat.includes(selectedCategory.toLowerCase());
  });

  return (
    <View style={{ gap: 20 }}>
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <View>
            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: palette.acLite, marginBottom: 4 }}>
              ✦ Painel Executivo Pessoal
            </Text>
            <Text style={{ fontFamily: font.display, fontSize: 24, fontWeight: '700', color: '#fff' }}>
              {st.greeting()}
            </Text>
          </View>
          <Pressable onPress={() => openModal({ kind: 'add' })} style={{ backgroundColor: palette.acDeep, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: palette.acLite }}>
            <Text style={{ color: '#fff', fontFamily: font.display, fontSize: 15, fontWeight: '700' }}>+ Adicionar</Text>
          </Pressable>
        </View>

        {/* Indicadores Financeiros Dinâmicos do Banco de Dados */}
        <GridRow min={100} gap={8} cols={3}>
          {displayStats.map(s => (
            <StatCard key={s.label} label={s.label} value={s.value} hint={s.hint || s.delta} color={palette.acLite} />
          ))}
        </GridRow>

        <GridRow min={150} gap={10} cols={2}>
          {INITIAL_FORM_FIELDS.map(([fieldLabel, options]) => (
            <AnimatedList
              key={fieldLabel}
              title={fieldLabel}
              items={formValues[fieldLabel] || []}
              onAdd={newItems => newItems.forEach(item => toggleFormPill(fieldLabel, item))}
              onRemove={idx => { const item = (formValues[fieldLabel] || [])[idx]; if (item) toggleFormPill(fieldLabel, item); }}
              emptyText="Nenhum item selecionado."
              fieldLabel={fieldLabel}
            />
          ))}
        </GridRow>

        <View>
          <Text style={label}>Anotação do dia</Text>
          <TextInput
            multiline
            placeholder="o que aconteceu, com quem, e o que ficou na cabeça…"
            placeholderTextColor="rgba(255,255,255,.4)"
            style={{ minHeight: 90, textAlignVertical: 'top', borderRadius: 14, backgroundColor: palette.acdAlpha(0.24), color: '#fff', fontFamily: font.body, fontSize: 14, padding: 13 }}
          />
        </View>

        {/* Categorias e Carrossel de Notícias Ao Vivo */}
        <View style={{ gap: 8 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {NEWS_CATEGORIES.map(cat => (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={{
                    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
                    backgroundColor: selectedCategory === cat ? palette.acDeep : 'rgba(255,255,255,0.05)',
                    borderWidth: 1, borderColor: selectedCategory === cat ? palette.acLite : 'transparent'
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: selectedCategory === cat ? 'bold' : 'normal', color: selectedCategory === cat ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <NewsCarousel
            posts={filteredNews.length > 0 ? filteredNews : liveNews}
            categoryTitle={`Notícias do Dia (${selectedCategory})`}
            onRefresh={loadDashboardData}
          />
        </View>
      </View>

      {/* Próximos eventos e UFC */}
      <GridRow min={320} cols={1}>
        <View style={{ gap: 14 }}>
          <View>
            <Text style={{ fontFamily: font.display, fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 14 }}>Próximos eventos</Text>
            {EVENTS && EVENTS.length > 0 ? (
              EVENTS.map((e, i) => (
                <Pressable key={i} onPress={() => openModal({ kind: 'day', n: 25 })} style={{ flexDirection: 'row', gap: 13, alignItems: 'center', paddingVertical: 11 }}>
                  <View style={{ minWidth: 38, alignItems: 'center' }}>
                    <Text style={{ fontFamily: font.display, fontSize: 18, fontWeight: '600', color: '#fff' }}>{e.day}</Text>
                    <Text style={{ fontSize: 10, textTransform: 'uppercase', color: '#fff' }}>{e.mon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#fff' }}>{e.title}</Text>
                    <Text style={{ fontSize: 12.5, marginTop: 2, color: '#fff' }}>{e.meta}</Text>
                  </View>
                </Pressable>
              ))
            ) : (
              <View style={{ paddingVertical: 18, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>Nenhum evento agendado.</Text>
                <Pressable onPress={() => openModal({ kind: 'add' })}>
                  <Text style={{ color: '#fff', fontFamily: font.display, fontSize: 16 }}>+ Criar Evento</Text>
                </Pressable>
              </View>
            )}
          </View>

          <NewsCarousel posts={ufcNews.length > 0 ? ufcNews : FALLBACK_UFC_POSTS} categoryTitle="⚔ UFC & Combate Ao Vivo" />
        </View>
      </GridRow>
    </View>
  );
}
