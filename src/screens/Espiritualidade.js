import React, { useState, useEffect } from 'react';
import { View, Pressable, Image } from 'react-native';
import TextInput from '../TextInput.js';
import Text from '../Text.js';
import { ScrollView } from 'react-native-gesture-handler';
import { api } from '../api.js';
import { useSettings } from '../settings.jsx';
import { font, card, H2, Chip, AnimatedList, GridRow } from '../ui.jsx';

const CARD_IMAGE_MAP = {
  'O Louco (0)': 'https://caios-backend.onrender.com/cards/00-TheFool.jpg',
  'O Mago (I)': 'https://caios-backend.onrender.com/cards/01-TheMagician.jpg',
  'A Sacerdotisa (II)': 'https://caios-backend.onrender.com/cards/02-TheHighPriestess.jpg',
  'A Imperatriz (III)': 'https://caios-backend.onrender.com/cards/03-TheEmpress.jpg',
  'O Imperador (IV)': 'https://caios-backend.onrender.com/cards/04-TheEmperor.jpg',
  'O Hierofante (V)': 'https://caios-backend.onrender.com/cards/05-TheHierophant.jpg',
  'Os Enamorados (VI)': 'https://caios-backend.onrender.com/cards/06-TheLovers.jpg',
  'O Carro (VII)': 'https://caios-backend.onrender.com/cards/07-TheChariot.jpg',
  'A Força (VIII)': 'https://caios-backend.onrender.com/cards/08-Strength.jpg',
  'O Eremita (IX)': 'https://caios-backend.onrender.com/cards/09-TheHermit.jpg',
  'A Roda da Fortuna (X)': 'https://caios-backend.onrender.com/cards/10-WheelOfFortune.jpg',
  'A Justiça (XI)': 'https://caios-backend.onrender.com/cards/11-Justice.jpg',
  'O Pendurado (XII)': 'https://caios-backend.onrender.com/cards/12-TheHangedMan.jpg',
  'A Morte (XIII)': 'https://caios-backend.onrender.com/cards/13-Death.jpg',
  'A Temperança (XIV)': 'https://caios-backend.onrender.com/cards/14-Temperance.jpg',
  'O Diabo (XV)': 'https://caios-backend.onrender.com/cards/15-TheDevil.jpg',
  'A Torre (XVI)': 'https://caios-backend.onrender.com/cards/16-TheTower.jpg',
  'A Estrela (XVII)': 'https://caios-backend.onrender.com/cards/17-TheStar.jpg',
  'A Lua (XVIII)': 'https://caios-backend.onrender.com/cards/18-TheMoon.jpg',
  'O Sol (XIX)': 'https://caios-backend.onrender.com/cards/19-TheSun.jpg',
  'O Julgamento (XX)': 'https://caios-backend.onrender.com/cards/20-Judgement.jpg',
  'O Mundo (XXI)': 'https://caios-backend.onrender.com/cards/21-TheWorld.jpg'
};

const FULL_TAROT_DECK = [
  { name: 'O Louco (0)', element: 'Ar · Urano', symbol: '🃠', phrase: 'Novos começos, coragem de saltar e fé no fluxo da vida.' },
  { name: 'O Mago (I)', element: 'Mercúrio', symbol: '⚝', phrase: 'Foco, força de vontade e manifestação através das ferramentas certas.' },
  { name: 'A Sacerdotisa (II)', element: 'Lua', symbol: '☾', phrase: 'Intuição apurada, mistério e escuta atenta dos sinais sutis.' },
  { name: 'A Imperatriz (III)', element: 'Vênus', symbol: '♔', phrase: 'Abundância, criação, nutrição de ideias e conexão vital.' },
  { name: 'O Imperador (IV)', element: 'Áries', symbol: '☖', phrase: 'Estrutura, autoridade, disciplina e domínio da realidade material.' },
  { name: 'O Hierofante (V)', element: 'Touro', symbol: '☸', phrase: 'Tradição, aprendizado espiritual e busca por valores fundamentais.' },
  { name: 'Os Enamorados (VI)', element: 'Gêmeos', symbol: '❥', phrase: 'Escolhas do coração, alinhamento ético e uniões significativas.' },
  { name: 'O Carro (VII)', element: 'Câncer', symbol: '🛡', phrase: 'Determinação, superação de dualidades e vitória pela disciplina.' },
  { name: 'A Força (VIII)', element: 'Leão', symbol: '<ctrl42>', phrase: 'Domínio próprio, compaixão, coragem serena e paciência.' },
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
  '1 Carta': { title: '1 Carta (Insight)', positions: ['Insight Principal'], didactic: 'Ideal para perguntas diretas ou intenção do dia.' },
  '3 Cartas': { title: '3 Cartas (Linha Temporal)', positions: ['Passado', 'Presente', 'Futuro'], didactic: 'Método clássico de evolução temporal.' },
  '5 Cartas': { title: '5 Cartas (Cruz Simples)', positions: ['Centro', 'Desafio', 'A Favor', 'Contra', 'Desfecho'], didactic: 'Dinâmicas de forças opostas em dilemas.' },
  'Cruz Celta': { title: 'Cruz Celta (10 Cartas)', positions: ['1. Atual', '2. Desafio', '3. Raiz', '4. Passado', '5. Objetivo', '6. Futuro', '7. Atitude', '8. Ambiente', '9. Anseio', '10. Desfecho'], didactic: 'O método mais completo da tradição.' }
};

function TarotCardVisual({ cardData, palette }) {
  const { position, card: cardName, reversed, element, phrase } = cardData;
  const cardUri = CARD_IMAGE_MAP[cardName] || 'https://caios-backend.onrender.com/cards/CardBacks.jpg';

  return (
    <View style={{
      flex: 1, minWidth: '46%', padding: 10, borderRadius: 16,
      backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1, borderColor: palette.ac2Alpha(0.4),
      transform: [{ rotate: reversed ? '180deg' : '0deg' }], justifyContent: 'space-between', alignItems: 'center', marginVertical: 4
    }}>
      <Text style={{ fontSize: 9.5, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: palette.acLite, textAlign: 'center', marginBottom: 4 }}>{position}</Text>
      
      {/* Imagem Autêntica do Baralho no Mobile */}
      <View style={{ width: '100%', height: 160, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', marginVertical: 6 }}>
        <Image
          source={{ uri: cardUri }}
          style={{ width: '100%', height: '100%', borderRadius: 10 }}
          resizeMode="cover"
        />
        {reversed && (
          <View style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.8)', paddingVertical: 1, paddingHorizontal: 4, borderRadius: 4 }}>
            <Text style={{ fontSize: 8.5, fontWeight: '700', color: '#ff7c7c' }}>Invertida ↻</Text>
          </View>
        )}
      </View>

      <View style={{ alignItems: 'center', gap: 2 }}>
        <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#fff', textAlign: 'center' }}>{cardName}</Text>
        <Text style={{ fontSize: 9, opacity: 0.55, textTransform: 'uppercase', color: '#fff' }}>{element}</Text>
        <Text numberOfLines={2} style={{ fontSize: 9.5, opacity: 0.8, fontStyle: 'italic', color: '#fff', textAlign: 'center' }}>"{phrase}"</Text>
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
    <View style={{ gap: 18 }}>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,.08)', paddingBottom: 10 }}>
        <Chip on={activeTab === 'tarot'} onPress={() => setActiveTab('tarot')}>☯ Tarot & Oráculo</Chip>
        <Chip on={activeTab === 'diario'} onPress={() => setActiveTab('diario')}>✍ Diário & Intuição</Chip>
        <Chip on={activeTab === 'rituais'} onPress={() => setActiveTab('rituais')}>🕯 Rituais & Hábitos</Chip>
      </View>

      {activeTab === 'tarot' && (
        <View style={{ gap: 18 }}>
          <View style={{ gap: 4 }}>
            <Text style={{ fontFamily: font.display, fontSize: 16, fontWeight: '700', color: palette.acLite }}>☯ Oráculo & Leitura de Tarot</Text>
            <Text style={{ fontSize: 12.5, lineHeight: 17, opacity: 0.85, color: '#fff' }}>
              Sorteio com imagens autênticas do baralho Rider-Waite.
            </Text>
          </View>

          <View style={{ gap: 14 }}>
            <Text style={{ fontSize: 12, opacity: 0.6, color: '#fff' }}>Método de Tiragem:</Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {Object.keys(METHOD_DESCRIPTIONS).map(m => (
                <Pressable
                  key={m}
                  onPress={() => { setSelectedMethod(m); setDrawnCards([]); setReadingResult(null); }}
                  style={{
                    flex: 1, minWidth: '45%', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12,
                    borderWidth: 1, borderColor: selectedMethod === m ? palette.acLite : 'rgba(255,255,255,0.1)',
                    backgroundColor: selectedMethod === m ? palette.ac2Alpha(0.3) : 'rgba(0,0,0,0.3)',
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: selectedMethod === m ? '#fff' : palette.acLite }}>{m}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={{ fontSize: 12, opacity: 0.8, color: '#fff', fontStyle: 'italic' }}>
              ✦ {METHOD_DESCRIPTIONS[selectedMethod].title}: {METHOD_DESCRIPTIONS[selectedMethod].didactic}
            </Text>

            <View style={{ gap: 10 }}>
              <TextInput
                placeholder="Qual a sua dúvida ou intenção?"
                placeholderTextColor="rgba(255,255,255,.4)"
                value={question}
                onChangeText={setQuestion}
                style={{ backgroundColor: palette.acdAlpha(0.28), borderWidth: 1, borderColor: 'rgba(255,255,255,.15)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, color: '#fff', fontSize: 13.5 }}
              />
              <Pressable
                onPress={handlePerformReading}
                disabled={loading}
                style={{ backgroundColor: palette.acDeep, borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontFamily: font.body, fontSize: 14.5, fontWeight: '700' }}>
                  {loading ? '🔮 Consultando Oráculo...' : '✦ Sortear Cartas & Interpretar'}
                </Text>
              </Pressable>
            </View>

            {drawnCards.length > 0 && (
              <View style={{ gap: 10 }}>
                <Text style={{ fontSize: 12, opacity: 0.7, fontWeight: '700', color: '#fff' }}>Cartas na Mesa ({drawnCards.length}):</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {drawnCards.map((c, i) => (
                    <TarotCardVisual key={i} cardData={c} palette={palette} />
                  ))}
                </View>
              </View>
            )}

            {readingResult && (
              <View style={{ gap: 10, padding: 14, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: 1, borderColor: palette.ac2Alpha(0.4) }}>
                <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.2, color: palette.ac2, fontWeight: '700' }}>✦ Interpretação do Oráculo</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff', fontStyle: 'italic' }}>"{readingResult.resumo_astrologico || readingResult.resumo_leitura}"</Text>
                <Text style={{ fontSize: 13, lineHeight: 18, color: 'rgba(255,255,255,0.9)' }}>
                  <Text style={{ fontWeight: '700' }}>Síntese: </Text>{readingResult.sintese_leitura || readingResult.sintese_geral}
                </Text>
                <Text style={{ fontSize: 13, color: '#7ce0a8', fontWeight: '600', marginTop: 4 }}>
                  ✦ Conselho: {readingResult.conselho_pratico || readingResult.conselho_objetivo}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {activeTab === 'diario' && (
        <View style={{ gap: 14 }}>
          <H2 sub="Insights rápidos e intuição salvos no banco de dados.">Diário & Intuição</H2>
          <AnimatedList
            title="Registros de Intuição"
            items={reflections.map(r => r.text || r.title || r.name)}
            onAdd={newItems => newItems.forEach(handleAddReflectionText)}
            onRemove={handleDeleteReflection}
            emptyText="Nenhum registro cadastrado até o momento."
            fieldLabel="Nova Intuição"
          />
        </View>
      )}

      {activeTab === 'rituais' && (
        <View style={{ gap: 14 }}>
          <H2 sub="Práticas de presença e hábitos de serenidade salvos no banco de dados.">Rituais & Costumes</H2>
          <AnimatedList
            title="Rituais Cadastrados"
            items={rituals.map(r => r.title || r.name)}
            onAdd={newItems => newItems.forEach(handleAddRitualText)}
            onRemove={handleDeleteRitual}
            emptyText="Nenhum ritual cadastrado até o momento."
            fieldLabel="Novo Ritual"
          />
        </View>
      )}
    </View>
  );
}
