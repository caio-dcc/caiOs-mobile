import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { api } from '../api.js';
import { useSettings } from '../settings.jsx';
import { font, card, H2, Chip, AnimatedList } from '../ui.jsx';

const FULL_TAROT_DECK = [
  { name: 'O Louco (0)', element: 'Ar · Urano', symbol: '🃠', phrase: 'Novos começos, coragem de saltar e fé no fluxo da vida.' },
  { name: 'O Mago (I)', element: 'Mercúrio', symbol: '⚝', phrase: 'Foco, força de vontade e manifestação através das ferramentas certas.' },
  { name: 'A Sacerdotisa (II)', element: 'Lua', symbol: '☾', phrase: 'Intuição apurada, mistério e escuta atenta dos sinais sutis.' },
  { name: 'A Imperatriz (III)', element: 'Vênus', symbol: '♔', phrase: 'Abundância, criação, nutrição de ideias e conexão vital.' },
  { name: 'O Imperador (IV)', element: 'Áries', symbol: '☖', phrase: 'Estrutura, autoridade, disciplina e domínio da realidade material.' },
  { name: 'O Hierofante (V)', element: 'Touro', symbol: '☸', phrase: 'Tradição, aprendizado espiritual e busca por valores fundamentais.' },
  { name: 'Os Enamorados (VI)', element: 'Gêmeos', symbol: '❥', phrase: 'Escolhas do coração, alinhamento ético e uniões significativas.' },
  { name: 'O Carro (VII)', element: 'Câncer', symbol: '🛡', phrase: 'Determinação, superação de dualidades e vitória pela disciplina.' },
  { name: 'A Força (VIII)', element: 'Leão', symbol: '♌︎', phrase: 'Domínio próprio, compaixão, coragem serena e paciência.' },
  { name: 'O Eremita (IX)', element: 'Virgem', symbol: '🕯︎', phrase: 'Sabedoria da solitude, discernimento e a luz da experiência própria.' },
  { name: 'A Roda da Fortuna (X)', element: 'Júpiter', symbol: '⚙', phrase: 'Ciclos inevitáveis, viradas do destino e oportunidade no movimento.' },
  { name: 'A Justiça (XI)', element: 'Libra', symbol: '⚖', phrase: 'Verdade, causa e efeito, clareza racional e busca pelo equilíbrio.' },
  { name: 'O Pendurado (XII)', element: 'Água · Netuno', symbol: '⎌', phrase: 'Mudar a perspectiva, aceitar a pausa e render-se ao processo.' },
  { name: 'A Morte (XIII)', element: 'Escorpião', symbol: '♏︎', phrase: 'Transformação profunda, encerramento de ciclos e renovação necessária.' },
  { name: 'A Temperança (XIV)', element: 'Sagitário', symbol: '🏺︎', phrase: 'Alquimia interna, moderação, harmonia dos opostos e fluidez.' },
  { name: 'O Diabo (XV)', element: 'Capricórnio', symbol: '⛓︎', phrase: 'Apegos ilusórios, consciência de sombras e quebra de amarras.' },
  { name: 'A Torre (XVI)', element: 'Marte', symbol: '⚡', phrase: 'Ruptura de falsas estruturas, revelação da verdade e libertação.' },
  { name: 'A Estrela (XVII)', element: 'Aquário', symbol: '✦', phrase: 'Esperança, inspiração divina, cura e renovação espiritual.' },
  { name: 'A Lua (XVIII)', element: 'Peixes', symbol: '☽', phrase: 'Navegar na incerteza, intuição profetizada e integração do inconsciente.' },
  { name: 'O Sol (XIX)', element: 'Sol', symbol: '☉', phrase: 'Clareza radiante, vitalidade, sucesso legítimo e alegria genuína.' },
  { name: 'O Julgamento (XX)', element: 'Fogo · Plutão', symbol: '📯︎', phrase: 'Despertar de consciência, chamado interior e acerto de contas espiritual.' },
  { name: 'O Mundo (XXI)', element: 'Saturno', symbol: '♄', phrase: 'Conclusão mestre, integração completa, plenitude e novos horizontes.' }
];

const METHOD_DESCRIPTIONS = {
  '1 Carta': { title: '1 Carta (Insight Rápido)', positions: ['Insight Principal'], didactic: 'Ideal para perguntas diretas ou uma palavra-chave norteadora.' },
  '3 Cartas': { title: '3 Cartas (Passado, Presente, Futuro)', positions: ['Passado / Raiz', 'Presente / Desafio', 'Futuro / Tendência'], didactic: 'Método clássico de causalidade temporal.' },
  '5 Cartas': { title: '5 Cartas (Cruz Simples)', positions: ['Centro (Situação)', 'Obstáculo (Desafio)', 'Força a Favor', 'Força Contra', 'Desfecho'], didactic: 'Entenda dinâmicas de forças opostas em um dilema.' },
  'Cruz Celta': { title: 'Cruz Celta (10 Cartas)', positions: ['1. Situação Atual', '2. O Desafio Imediato', '3. Base Inconsciente', '4. Passado Recente', '5. Objetivos', '6. Futuro Próximo', '7. Atitude Interna', '8. Ambiente Externo', '9. Esperanças e Receios', '10. Resultado Final'], didactic: 'O método mais rico e completo da tradição ocidental.' }
};

function TarotCardVisual({ cardData, palette }) {
  const { position, card: cardName, reversed, symbol, element, phrase } = cardData;
  return (
    <View style={{
      width: 165, minHeight: 250, padding: 12, borderRadius: 16,
      backgroundColor: 'rgba(0,0,0,0.45)', borderWidth: 1, borderColor: palette.ac2Alpha(0.4),
      transform: [{ rotate: reversed ? '180deg' : '0deg' }], justifyContent: 'space-between', alignItems: 'center'
    }}>
      <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: palette.acLite, textAlign: 'center' }}>{position}</Text>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 34 }}>{symbol || '✦'}</Text>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff', textAlign: 'center' }}>{cardName}</Text>
        {reversed && <Text style={{ fontSize: 10, fontWeight: '700', color: '#ff7c7c' }}>Invertida ↻</Text>}
      </View>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 10, opacity: 0.55, textTransform: 'uppercase', color: '#fff', marginBottom: 4 }}>{element}</Text>
        <Text numberOfLines={2} style={{ fontSize: 10.5, opacity: 0.8, fontStyle: 'italic', color: '#fff', textAlign: 'center' }}>"{phrase}"</Text>
      </View>
    </View>
  );
}

export default function Espiritualidade() {
  const { palette } = useSettings();
  const [activeTab, setActiveTab] = useState('tarot');
  const [selectedMethod, setSelectedMethod] = useState('3 Cartas');
  const [question, setQuestion] = useState('');
  const [drawnCards, setDrawnCards] = useState([]);
  const [readingResult, setReadingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reflections, setReflections] = useState([]);
  const [rituals, setRituals] = useState([]);

  useEffect(() => {
    api.get('/v1/reflections').then(data => { if (Array.isArray(data)) setReflections(data); }).catch(() => {});
    api.get('/v1/rituals').then(data => { if (Array.isArray(data)) setRituals(data); }).catch(() => {});
  }, []);

  const handlePerformReading = async () => {
    setLoading(true);
    setReadingResult(null);
    const config = METHOD_DESCRIPTIONS[selectedMethod];
    const deckShuffled = [...FULL_TAROT_DECK].sort(() => Math.random() - 0.5);
    const cardsDrawn = config.positions.map((pos, idx) => {
      const cardObj = deckShuffled[idx % deckShuffled.length];
      return { position: pos, card: cardObj.name, element: cardObj.element, symbol: cardObj.symbol, reversed: Math.random() < 0.2, phrase: cardObj.phrase };
    });
    setDrawnCards(cardsDrawn);

    try {
      const json = await api.post('/v1/tarot/reading', {
        question: question || 'Orientações e clareza para o momento atual',
        readingType: selectedMethod,
        lunarPhase: 'Lua Crescente em Escorpião',
        userSign: 'Escorpião / Sol em Leão',
        currentDate: '25 de Julho (Dia 206 do Ano)',
        drawnCards: cardsDrawn.map(c => ({ position: c.position, card: c.card, reversed: c.reversed }))
      });
      setReadingResult(json);
    } catch (e) {
      setReadingResult({
        resumo_astrologico: `Leitura sintônica para Escorpião sob a Lua Crescente, alinhando a energia de ${cardsDrawn[cardsDrawn.length - 1]?.card || 'O Sol'} ao ciclo atual.`,
        analise_cartas: cardsDrawn.map(c => ({ posicao: c.position, carta: c.card, interpretacao: c.reversed ? `${c.card} (Invertida) na posição de ${c.position} alerta para desapegar de resistências internas.` : `${c.card} na posição de ${c.position} traz clareza e direção legítima.` })),
        sintese_leitura: `A análise arquetípica das ${cardsDrawn.length} cartas sorteadas indica um portal de discernimento e transformação consciente.`,
        conselho_pratico: 'Mantenha o foco e a intuição aguçada. Tome decisões firmes alinhadas com o seu propósito verdadeiro.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddReflectionText = textStr => {
    if (!textStr || !textStr.trim()) return;
    const newRef = { id: `ref-${Date.now()}-${Math.random()}`, text: textStr.trim(), tag: 'Intuição', date: new Date().toISOString().slice(0, 10) };
    setReflections(prev => [newRef, ...prev]);
    api.post('/v1/reflections', newRef).catch(() => {});
  };

  const handleDeleteReflection = idx => {
    const target = reflections[idx];
    if (!target) return;
    setReflections(prev => prev.filter((_, i) => i !== idx));
    api.del(`/v1/reflections/${target.id}`).catch(() => {});
  };

  const handleAddRitualText = titleStr => {
    if (!titleStr || !titleStr.trim()) return;
    const newRit = { id: `rit-${Date.now()}-${Math.random()}`, title: titleStr.trim(), status: 'Ativo', frequency: 'Semanal' };
    setRituals(prev => [newRit, ...prev]);
    api.post('/v1/rituals', newRit).catch(() => {});
  };

  const handleDeleteRitual = idx => {
    const target = rituals[idx];
    if (!target) return;
    setRituals(prev => prev.filter((_, i) => i !== idx));
    api.del(`/v1/rituals/${target.id}`).catch(() => {});
  };

  return (
    <View style={{ gap: 22 }}>
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,.08)', paddingBottom: 12 }}>
        <Chip on={activeTab === 'tarot'} onPress={() => setActiveTab('tarot')}>☯ Tarot & Oráculo</Chip>
        <Chip on={activeTab === 'diario'} onPress={() => setActiveTab('diario')}>✎ Diário & Intuição</Chip>
        <Chip on={activeTab === 'rituais'} onPress={() => setActiveTab('rituais')}>🕯 Rituais & Costumes</Chip>
      </View>

      {activeTab === 'tarot' && (
        <View style={{ gap: 22 }}>
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: font.display, fontSize: 16, fontWeight: '700', color: palette.acLite }}>☯ Oráculo & Leitura de Tarot Estruturada</Text>
            <Text style={{ fontSize: 13, lineHeight: 18, opacity: 0.85, color: '#fff' }}>
              O sorteio do baralho Rider-Waite-Smith é processado de forma determínica. Em seguida a combinação é enviada para POST /v1/tarot/reading.
            </Text>
          </View>

          <View style={{ gap: 18 }}>
            <H2 sub="Escolha a tiragem, digite sua questão e consulte o oráculo.">Consultar o Oráculo</H2>

            <View>
              <Text style={{ fontSize: 12, opacity: 0.6, marginBottom: 8, color: '#fff' }}>Selecione o Método de Tiragem:</Text>
              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                {Object.keys(METHOD_DESCRIPTIONS).map(m => (
                  <Chip key={m} on={selectedMethod === m} onPress={() => { setSelectedMethod(m); setDrawnCards([]); setReadingResult(null); }}>{m}</Chip>
                ))}
              </View>
              <Text style={{ marginTop: 10, fontSize: 12.5, lineHeight: 17, opacity: 0.85, color: '#fff' }}>
                <Text style={{ fontWeight: '700' }}>{METHOD_DESCRIPTIONS[selectedMethod].title}:</Text> {METHOD_DESCRIPTIONS[selectedMethod].didactic}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              <TextInput
                placeholder="Qual a sua dúvida ou intenção? (opcional)"
                placeholderTextColor="rgba(255,255,255,.4)"
                value={question}
                onChangeText={setQuestion}
                style={{ flexGrow: 1, minWidth: 200, backgroundColor: palette.acdAlpha(0.28), borderWidth: 1, borderColor: 'rgba(255,255,255,.15)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, color: '#fff', fontSize: 14 }}
              />
              <Pressable onPress={handlePerformReading} disabled={loading}>
                <Text style={{ color: '#fff', fontFamily: font.body, fontSize: 15, fontWeight: '700', paddingVertical: 10, paddingHorizontal: 20 }}>
                  {loading ? 'Consultando LLM...' : '✦ Realizar Tiragem'}
                </Text>
              </Pressable>
            </View>

            {drawnCards.length > 0 && (
              <View style={{ gap: 14 }}>
                <Text style={{ fontSize: 12, opacity: 0.6, fontWeight: '700', color: '#fff' }}>Cartas Sorteadas na Mesa ({drawnCards.length}):</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    {drawnCards.map((c, i) => <TarotCardVisual key={i} cardData={c} palette={palette} />)}
                  </View>
                </ScrollView>
              </View>
            )}

            {readingResult && (
              <View style={{ gap: 12 }}>
                <Text style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, color: palette.ac2, fontWeight: '700' }}>✦ Interpretação Estruturada do Tarot</Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff', fontStyle: 'italic' }}>"{readingResult.resumo_astrologico || readingResult.resumo_leitura}"</Text>
                <Text style={{ fontSize: 13.5, lineHeight: 19, color: 'rgba(255,255,255,0.9)' }}>
                  <Text style={{ fontWeight: '700' }}>Síntese da Leitura: </Text>{readingResult.sintese_leitura || readingResult.sintese_geral}
                </Text>
                {readingResult.analise_cartas && (
                  <View style={{ gap: 8, marginTop: 4 }}>
                    <Text style={{ fontSize: 12, opacity: 0.7, fontWeight: '700', color: '#fff' }}>Detalhes por Posição:</Text>
                    {readingResult.analise_cartas.map((item, idx) => (
                      <View key={idx} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,.05)' }}>
                        <Text style={{ fontSize: 13, color: '#fff' }}>
                          <Text style={{ color: palette.acLite, fontWeight: '700' }}>{item.posicao} ({item.carta}): </Text>{item.interpretacao}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                <Text style={{ marginTop: 6, fontSize: 13.5, color: '#7ce0a8', fontWeight: '600' }}>
                  ✦ Conselho Prático: {readingResult.conselho_pratico || readingResult.conselho_objetivo}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {activeTab === 'diario' && (
        <View style={{ gap: 16 }}>
          <H2 sub="Insights rápidos, registro de sonhos e sincronicidades salvas no banco de dados.">Diário & Intuição</H2>
          <AnimatedList
            title="Registros de Intuição & Sonhos"
            items={reflections.map(r => r.text || r.title || r.name)}
            onAdd={newItems => newItems.forEach(handleAddReflectionText)}
            onRemove={handleDeleteReflection}
            emptyText="Nenhum registro de intuição ou sonho cadastrado até o momento."
            fieldLabel="Nova Intuição ou Sonho"
          />
        </View>
      )}

      {activeTab === 'rituais' && (
        <View style={{ gap: 16 }}>
          <H2 sub="Práticas de presença, rituais lunares, purificação e hábitos de serenidade salvos no banco de dados.">Rituais & Costumes</H2>
          <AnimatedList
            title="Rituais & Costumes Cadastrados"
            items={rituals.map(r => r.title || r.name)}
            onAdd={newItems => newItems.forEach(handleAddRitualText)}
            onRemove={handleDeleteRitual}
            emptyText="Nenhum ritual ou costume cadastrado até o momento."
            fieldLabel="Novo Ritual ou Costume"
          />
        </View>
      )}
    </View>
  );
}
