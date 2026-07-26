import React, { useState } from 'react';
import { View, Pressable, Image, Modal, ScrollView } from 'react-native';
import TextInput from '../TextInput.js';
import Text from '../Text.js';
import { useSettings } from '../settings.jsx';
import { useApp } from '../AppContext.js';
import { api } from '../api.js';
import { STATS, TIMELINE, EVENTS, PENDING, RIO_TECH_POSTS } from '../data.js';
import { AnimatedList, StatCard, GridRow, font, label } from '../ui.jsx';

const INITIAL_FORM_FIELDS = [
  ['Pessoas de hoje', ['+ Buscar'], true],
  ['Itens que saíram comigo', ['+ Inventário'], true],
  ['Evento', ['+ Novo evento'], false]
];

const UFC_POSTS = [
  { id: 'u1', tag: 'UFC', title: 'UFC 318: Do Bronx enfrenta Makhachev II em Las Vegas', img: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?w=800&q=60', summary: 'Revanche épica confirmada na categoria dos leves.' },
  { id: 'u2', tag: 'UFC Rio', title: 'Pantoja defende cinturão dos moscas no Maracanãzinho', img: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=60', summary: 'Campeão carioca retorna diante da torcida local.' }
];

function NewsCarousel({ posts }) {
  const { palette } = useSettings();
  const [idx, setIdx] = useState(0);
  const [activePost, setActivePost] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [chatLog, setChatLog] = useState([]);
  const [question, setQuestion] = useState('');

  const post = posts[idx];
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
    <>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 8 }}>
        <Image source={{ uri: post.img }} style={{ width: 100, height: 100, borderRadius: 14 }} />
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: palette.acLite }}>{post.tag}</Text>
            <Pressable onPress={() => openAnalysis(post)}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: palette.acLite }}>✦ Análise IA</Text>
            </Pressable>
          </View>
          <Text style={{ fontFamily: font.display, fontSize: 15, fontWeight: '700', color: '#fff' }} numberOfLines={2}>{post.title}</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }} numberOfLines={2}>{post.summary}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            <Pressable onPress={prev} style={{ backgroundColor: 'rgba(255,255,255,.08)', width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 11 }}>❮</Text>
            </Pressable>
            <Pressable onPress={next} style={{ backgroundColor: 'rgba(255,255,255,.08)', width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 11 }}>❯</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Modal visible={!!activePost} transparent animationType="fade" onRequestClose={() => setActivePost(null)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 }} onPress={() => setActivePost(null)}>
          <Pressable onPress={e => e.stopPropagation?.()} style={{ borderRadius: 20, backgroundColor: '#12151e', borderWidth: 1, borderColor: palette.ac2Alpha(0.3), padding: 24, gap: 16, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.acLite, textTransform: 'uppercase' }}>✦ Análise de Inteligência IA</Text>
                <Text style={{ fontFamily: font.display, fontSize: 18, color: '#fff', marginTop: 4 }}>{activePost?.title}</Text>
              </View>
              <Pressable onPress={() => setActivePost(null)}><Text style={{ color: '#ff7777', fontSize: 18, fontWeight: '700' }}>✕</Text></Pressable>
            </View>

            <ScrollView style={{ maxHeight: 280 }}>
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
                style={{ flex: 1, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,.15)', backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff', paddingVertical: 10, paddingHorizontal: 12, fontSize: 13 }}
              />
              <Pressable onPress={sendFollowUp}><Text style={{ color: '#fff', fontWeight: '700', fontSize: 13, paddingHorizontal: 12 }}>Perguntar</Text></Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export default function Inicio() {
  const st = useSettings();
  const { openModal, go } = useApp();
  const [formValues, setFormValues] = useState({});

  const toggleFormPill = (fieldLabel, option) => {
    setFormValues(prev => {
      const current = prev[fieldLabel] || [];
      const updated = current.includes(option) ? current.filter(i => i !== option) : [...current, option];
      return { ...prev, [fieldLabel]: updated };
    });
  };

  const displayStats = [
    { label: 'Hoje', value: 'R$ 44,00', hint: '+ R$ 9' },
    { label: 'Semana', value: 'R$ 310,00', hint: '-12%' },
    { label: 'Mês', value: 'R$ 1.840,00', hint: '+5%' }
  ];

  return (
    <View style={{ gap: 20 }}>
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <View>
            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: st.palette.acLite, marginBottom: 4 }}>✦ painel executivo pessoal</Text>
            <Text style={{ fontFamily: font.display, fontSize: 26, fontWeight: '700', color: '#fff' }}>{st.greeting()}</Text>
          </View>
          <Pressable onPress={() => openModal({ kind: 'add' })}>
            <Text style={{ color: '#fff', fontFamily: font.display, fontSize: 16, fontWeight: '700' }}>+ Adicionar</Text>
          </Pressable>
        </View>

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

        <View>
          <Text style={label}>Anotação do dia</Text>
          <TextInput
            multiline
            placeholder="o que aconteceu, com quem, e o que ficou na cabeça…"
            placeholderTextColor="rgba(255,255,255,.4)"
            style={{ minHeight: 96, textAlignVertical: 'top', borderRadius: 14, backgroundColor: st.palette.acdAlpha(0.24), color: '#fff', fontFamily: font.body, fontSize: 14, padding: 13 }}
          />
        </View>

        <NewsCarousel posts={RIO_TECH_POSTS} />

        <View style={{ flexDirection: 'row', gap: 9, flexWrap: 'wrap' }}>
          <Pressable onPress={() => openModal({ kind: 'add' })}>
            <Text style={{ color: '#fff', fontFamily: font.body, fontSize: 15, fontWeight: '700' }}>Salvar no dia</Text>
          </Pressable>
          <Pressable onPress={() => openModal({ kind: 'add', defaultTab: 0 })}>
            <Text style={{ color: 'rgba(255,255,255,.6)', fontFamily: font.body, fontSize: 14 }}>Anexar foto</Text>
          </Pressable>
        </View>
      </View>

      {/* indicadores lado a lado, 2 por linha */}
      <GridRow min={150} gap={10} cols={2}>
        {displayStats.map(s => <StatCard key={s.label} {...s} value={st.money(s.value)} />)}
      </GridRow>

      <GridRow min={320} cols={1}>
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
            <Text style={{ fontFamily: font.display, fontSize: 16, fontWeight: '600', color: '#fff' }}>O dia de hoje</Text>
            <Text style={{ fontSize: 12, color: '#fff' }}>25 jul · sáb</Text>
          </View>
          {TIMELINE && TIMELINE.length > 0 ? (
            TIMELINE.map((t, i) => (
              <Pressable key={i} onPress={() => openModal({ kind: 'day', n: 25 })} style={{ flexDirection: 'row', gap: 12, paddingVertical: 12 }}>
                <View style={{ width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: t.tint }}>
                  <Text style={{ fontFamily: font.display, fontSize: 11, fontWeight: '700', color: t.ink }}>{t.tag}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#fff' }}>{t.title}</Text>
                  <Text style={{ fontSize: 12.5, marginTop: 3, color: '#fff' }}>{t.meta}</Text>
                </View>
                <Text style={{ fontSize: 12, color: '#fff' }}>{st.money(t.right)}</Text>
              </Pressable>
            ))
          ) : (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>Nenhuma atividade registrada hoje.</Text>
              <Pressable onPress={() => openModal({ kind: 'add' })}>
                <Text style={{ color: '#fff', fontFamily: font.display, fontSize: 16 }}>+ Novo Registro</Text>
              </Pressable>
            </View>
          )}
        </View>

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

          <View>
            <Text style={{ fontSize: 11.5, letterSpacing: 1.2, textTransform: 'uppercase', color: st.palette.ac2Alpha(0.7), fontWeight: '600', marginBottom: 10 }}>pendências de hoje</Text>
            {PENDING && PENDING.length > 0 ? (
              PENDING.map((p, i) => (
                <Pressable key={i} onPress={() => go(p.route)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
                  <View style={{ width: 16, height: 16, borderRadius: 5, borderWidth: 1.5, borderColor: st.palette.ac2Alpha(0.6) }} />
                  <Text style={{ flex: 1, fontSize: 13.5, color: '#fff' }}>{p.label}</Text>
                  <Text style={{ fontSize: 12, color: st.palette.ac2Alpha(0.8) }}>{p.cta}</Text>
                </Pressable>
              ))
            ) : (
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>Tudo em dia! Nenhuma pendência em aberto.</Text>
            )}
          </View>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', color: st.palette.acLite, fontWeight: '700' }}>⚔ UFC & Combate</Text>
              <Text style={{ fontSize: 10, opacity: 0.5, color: '#fff' }}>Cache 6h · RAM</Text>
            </View>
            <NewsCarousel posts={UFC_POSTS} />
          </View>
        </View>
      </GridRow>
    </View>
  );
}
