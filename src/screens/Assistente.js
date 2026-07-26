import React, { useState, useEffect } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import TextInput from '../TextInput.js';
import Text from '../Text.js';
import { useSettings } from '../settings.jsx';
import { useApp } from '../AppContext.js';
import { CHATREFS, PERSONASOURCES } from '../data.js';
import { ChipRow, Chip, Slider, font, GridRow, H2 } from '../ui.jsx';

const DEFAULT_PERSONAS = [
  { name: 'Analista frio', sliders: [10, 30, 85, 20], prompt: 'Atue como analista frio e pragmático. Respostas diretas baseadas estritamente nos dados históricos informados, sem floreios emocionais.' },
  { name: 'Terapeuta', sliders: [85, 80, 25, 65], prompt: 'Atuação acolhedora, empática e investigativa. Promova reflexões profundas sobre bem-estar, hábitos, relacionamentos e autorreflexão.' },
  { name: 'Amigo direto', sliders: [60, 50, 70, 50], prompt: 'Tom casual e transparente de amigo próximo. Foco em conselhos práticos para o cotidiano sem rodeios ou excesso de formalidade.' },
  { name: 'Advogado do diabo', sliders: [20, 70, 95, 85], prompt: 'Crítico e analítico. Questione suposições, proponha contra-argumentos, aponte inconsistências e riscos não mapeados no seu dia a dia.' }
];

const PERSONA_SLIDERS_CONFIG = [
  { label: 'Humor', left: 'seco', right: 'caloroso' },
  { label: 'Tamanho da resposta', left: 'curta', right: 'longa' },
  { label: 'Confronto', left: 'gentil', right: 'brutal' },
  { label: 'Especulação', left: 'só dados', right: 'interpreta' }
];

const PERSONA_OFFERS_LIST = ['Resumos', 'Alertas de manipulação', 'Inconsistências', 'Reflexões filosóficas', 'Sugestão de gasto', 'Lembretes do dia'];

export default function Assistente() {
  const st = useSettings();
  const { openModal, assistantPrompt, setAssistantPrompt } = useApp();

  const [customPersonas, setCustomPersonas] = useState(st.customPersonas || []);
  const allPersonas = [...DEFAULT_PERSONAS, ...customPersonas];

  const [selectedPersonaIdx, setSelectedPersonaIdx] = useState(st.preset || 0);
  const [sliders, setSliders] = useState(allPersonas[selectedPersonaIdx]?.sliders || [50, 50, 50, 50]);
  const [offers, setOffers] = useState([0, 1, 2]);

  const [linkedNotes, setLinkedNotes] = useState(st.linkedNotes || []);
  const [linkedEvents, setLinkedEvents] = useState(st.linkedEvents || []);
  const [linkedItems, setLinkedItems] = useState(st.linkedItems || []);

  const [showNewPersonaModal, setShowNewPersonaModal] = useState(false);
  const [newPersonaName, setNewPersonaName] = useState('');
  const [newPersonaPrompt, setNewPersonaPrompt] = useState('');

  const [inputMsg, setInputMsg] = useState(assistantPrompt || '');
  const [messages, setMessages] = useState([{ mine: false, body: `Olá, ${st.userName || 'Caio'}. Como posso te ajudar hoje?` }]);

  useEffect(() => {
    if (assistantPrompt) {
      setInputMsg(assistantPrompt);
      setAssistantPrompt && setAssistantPrompt('');
    }
  }, [assistantPrompt]);

  const handleSelectPersona = idx => {
    if (idx >= allPersonas.length) return;
    setSelectedPersonaIdx(idx);
    const target = allPersonas[idx];
    if (target) {
      setSliders([...target.sliders]);
      st.set({ systemPrompt: target.prompt, preset: idx });
    }
  };

  const handleCreatePersona = () => {
    if (!newPersonaName.trim()) return;
    const newPersonaObj = { name: newPersonaName.trim(), sliders: [50, 50, 50, 50], prompt: newPersonaPrompt.trim() || `Instruções personalizadas para ${newPersonaName.trim()}.` };
    const updated = [...customPersonas, newPersonaObj];
    setCustomPersonas(updated);
    st.set({ customPersonas: updated });
    const newIndex = DEFAULT_PERSONAS.length + updated.length - 1;
    setSelectedPersonaIdx(newIndex);
    setSliders(newPersonaObj.sliders);
    st.set({ systemPrompt: newPersonaObj.prompt, preset: newIndex });
    setNewPersonaName('');
    setNewPersonaPrompt('');
    setShowNewPersonaModal(false);
  };

  const handleSend = () => {
    const text = inputMsg.trim();
    if (!text) return;
    const contextMeta = [];
    if (linkedNotes.length) contextMeta.push(`Anotações: [${linkedNotes.join(', ')}]`);
    if (linkedEvents.length) contextMeta.push(`Eventos: [${linkedEvents.join(', ')}]`);
    if (linkedItems.length) contextMeta.push(`Itens: [${linkedItems.join(', ')}]`);
    setMessages(prev => [
      ...prev,
      { mine: true, body: text },
      { mine: false, body: `Entendido, ${st.userName || 'Caio'}. Processando com a persona "${allPersonas[selectedPersonaIdx]?.name || 'Personalizada'}".${contextMeta.length ? ` Contexto anexado: ${contextMeta.join(' | ')}.` : ''}` }
    ]);
    setInputMsg('');
  };

  const toggleLinked = (list, setList, item) => {
    setList(list.includes(item) ? list.filter(x => x !== item) : [...list, item]);
  };

  return (
    <GridRow min={340} gap={26} cols={1}>
      <View style={{ gap: 14 }}>
        <ScrollView style={{ maxHeight: 400 }}>
          {messages.map((m, i) => (
            <View key={i} style={{ marginBottom: 18 }}>
              <Text style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.5, fontWeight: '600', marginBottom: 6, color: '#fff' }}>{m.mine ? 'você' : 'assistente'}</Text>
              <Text style={{ fontSize: 16, lineHeight: 22, color: '#fff' }}>{m.body}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {CHATREFS.map(r => <Chip key={r.label}>{r.label}</Chip>)}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end' }}>
          <TextInput
            value={inputMsg}
            onChangeText={setInputMsg}
            multiline
            placeholder="pergunta qualquer coisa — use @ pra apontar pessoa, item, evento, anotação ou dia…"
            placeholderTextColor="rgba(255,255,255,.4)"
            style={{ flex: 1, minHeight: 62, borderRadius: 16, backgroundColor: 'rgba(255,255,255,.06)', color: '#fff', fontSize: 14, lineHeight: 20, padding: 14 }}
          />
          <Pressable onPress={handleSend}><Text style={{ color: '#fff', fontFamily: font.body, fontSize: 16, fontWeight: '700', paddingVertical: 14, paddingHorizontal: 4 }}>Perguntar</Text></Pressable>
        </View>
        <Text style={{ fontSize: 12, opacity: 0.5, color: '#fff' }}>
          Persona ativa: <Text style={{ color: st.palette.ac2, fontWeight: '700' }}>{allPersonas[selectedPersonaIdx]?.name}</Text> · {(st.scopes || []).length} fontes liberadas.
        </Text>
      </View>

      <View style={{ gap: 22 }}>
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontFamily: font.display, fontSize: 15, fontWeight: '600', color: '#fff' }}>Persona</Text>
            <Pressable onPress={() => setShowNewPersonaModal(v => !v)}>
              <Text style={{ color: st.palette.ac2, fontSize: 13.5, fontWeight: '700' }}>+ Criar Persona</Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {allPersonas.map((p, idx) => (
              <Chip key={p.name + idx} on={selectedPersonaIdx === idx} onPress={() => handleSelectPersona(idx)}>{p.name}</Chip>
            ))}
          </View>

          {showNewPersonaModal && (
            <View style={{ marginTop: 14, padding: 14, borderRadius: 14, backgroundColor: st.palette.acdAlpha(0.35), borderWidth: 1, borderColor: st.palette.ac2Alpha(0.3), gap: 10 }}>
              <Text style={{ fontSize: 13.5, fontWeight: '700', color: st.palette.acLite }}>Criar Nova Persona</Text>
              <TextInput
                placeholder="Nome da Persona (ex: Mentor Estoico)"
                placeholderTextColor="rgba(255,255,255,.4)"
                value={newPersonaName}
                onChangeText={setNewPersonaName}
                style={{ backgroundColor: 'rgba(0,0,0,.4)', borderRadius: 10, padding: 8, color: '#fff', fontSize: 13.5 }}
              />
              <TextInput
                placeholder="System Prompt inicial da persona..."
                placeholderTextColor="rgba(255,255,255,.4)"
                value={newPersonaPrompt}
                onChangeText={setNewPersonaPrompt}
                multiline
                style={{ backgroundColor: 'rgba(0,0,0,.4)', borderRadius: 10, padding: 8, color: '#fff', fontSize: 13, minHeight: 65, textAlignVertical: 'top' }}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                <Pressable onPress={() => setShowNewPersonaModal(false)}><Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 13 }}>Cancelar</Text></Pressable>
                <Pressable onPress={handleCreatePersona}><Text style={{ color: '#fff', fontSize: 13.5, fontWeight: '700' }}>+ Salvar Persona</Text></Pressable>
              </View>
            </View>
          )}
        </View>

        <View style={{ backgroundColor: 'rgba(255,255,255,.025)', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,.07)' }}>
          <Text style={{ fontFamily: font.display, fontSize: 14, fontWeight: '600', color: st.palette.acLite, marginBottom: 8 }}>System Prompt da Persona</Text>
          <TextInput
            value={st.systemPrompt || ''}
            onChangeText={v => st.set({ systemPrompt: v })}
            multiline
            placeholder="System prompt da persona..."
            placeholderTextColor="rgba(255,255,255,.4)"
            style={{ minHeight: 80, textAlignVertical: 'top', borderRadius: 10, backgroundColor: st.palette.acdAlpha(0.28), borderWidth: 1, borderColor: 'rgba(255,255,255,.12)', color: '#fff', fontSize: 13, lineHeight: 19, padding: 10 }}
          />
        </View>

        <View style={{ gap: 16 }}>
          {PERSONA_SLIDERS_CONFIG.map((s, i) => (
            <View key={s.label}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 }}>
                <Text style={{ fontSize: 12, color: '#fff' }}>{s.label}</Text>
                <Text style={{ fontSize: 12, opacity: 0.55, color: '#fff' }}>{s.left} → {s.right}</Text>
              </View>
              <Slider value={sliders[i]} onChange={v => setSliders(a => a.map((x, k) => (k === i ? v : x)))} />
            </View>
          ))}
        </View>

        <View>
          <Text style={{ fontFamily: font.display, fontSize: 14, marginBottom: 12, color: '#fff' }}>O que ela pode me oferecer</Text>
          <ChipRow options={PERSONA_OFFERS_LIST} value={offers} onPick={i => setOffers(o => (o.includes(i) ? o.filter(k => k !== i) : o.concat(i)))} />
        </View>

        <View style={{ backgroundColor: 'rgba(255,255,255,.02)', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,.07)', gap: 14 }}>
          <Text style={{ fontFamily: font.display, fontSize: 14, fontWeight: '600', color: st.palette.acLite }}>Contexto Vinculado à Persona</Text>

          {[
            ['Anotações vinculadas', st.notes, linkedNotes, setLinkedNotes, 4, '+ Anotação'],
            ['Eventos vinculados', st.events, linkedEvents, setLinkedEvents, 1, '+ Evento'],
            ['Itens vinculados', st.items, linkedItems, setLinkedItems, 5, '+ Item']
          ].map(([lbl, sourceList, linked, setLinked, tab, addLabel]) => (
            <View key={lbl}>
              <Text style={{ fontSize: 12, opacity: 0.6, marginBottom: 6, color: '#fff' }}>{lbl}</Text>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                {Array.from(new Set([...(sourceList || []).map(n => typeof n === 'string' ? n : n.title || n.body || n.name), ...linked])).map(item => (
                  <Chip key={item} on={linked.includes(item)} onPress={() => toggleLinked(linked, setLinked, item)}>{item}</Chip>
                ))}
                <Chip onPress={() => openModal && openModal({ kind: 'add', defaultTab: tab })}>{addLabel}</Chip>
              </View>
            </View>
          ))}
        </View>

        <View>
          <Text style={{ fontFamily: font.display, fontSize: 14, marginBottom: 12, color: '#fff' }}>Base da persona</Text>
          <View style={{ gap: 9 }}>
            {PERSONASOURCES.map(s => (
              <View key={s.name} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingBottom: 9 }}>
                <Text style={{ fontSize: 13.5, color: '#fff' }}>{s.name}</Text>
                <Text style={{ fontSize: 12, opacity: 0.5, color: '#fff' }}>{s.meta}</Text>
              </View>
            ))}
            <Pressable onPress={() => openModal && openModal({ kind: 'add', defaultTab: 0 })} style={{ marginTop: 4, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,.25)', padding: 14, alignItems: 'center' }}>
              <Text style={{ fontSize: 12.5, color: '#fff' }}>arraste livros, textos ou documentos</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </GridRow>
  );
}
