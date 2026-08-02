import React, { useState, useEffect } from 'react';
import { View, Pressable, Image, ScrollView, StyleSheet } from 'react-native';
import TextInput from '../TextInput.js';
import Text from '../Text.js';
import { api } from '../api.js';
import { useSettings } from '../settings.jsx';
import { font, H2, Chip, AnimatedList } from '../ui.jsx';

const CARD_IMAGE_MAP = {
  'O Louco (0)': 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m00.jpg',
  'O Mago (I)': 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m01.jpg',
  'A Sacerdotisa (II)': 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m02.jpg',
  'A Imperatriz (III)': 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m03.jpg',
  'O Imperador (IV)': 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m04.jpg',
  'O Hierofante (V)': 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m05.jpg',
  'Os Enamorados (VI)': 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m06.jpg',
  'O Carro (VII)': 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m07.jpg',
  'A Força (VIII)': 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m08.jpg',
  'O Eremita (IX)': 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m09.jpg',
  'A Roda da Fortuna (X)': 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m10.jpg',
  'A Justiça (XI)': 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m11.jpg',
  'O Pendurado (XII)': 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m12.jpg',
  'A Morte (XIII)': 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m13.jpg',
  'A Temperança (XIV)': 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m14.jpg',
  'O Diabo (XV)': 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m15.jpg',
  'A Torre (XVI)': 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m16.jpg',
  'A Estrela (XVII)': 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m17.jpg',
  'A Lua (XVIII)': 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m18.jpg',
  'O Sol (XIX)': 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m19.jpg',
  'O Julgamento (XX)': 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m20.jpg',
  'O Mundo (XXI)': 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m21.jpg'
};

const getCardImage = (cardName) => CARD_IMAGE_MAP[cardName] || 'https://raw.githubusercontent.com/the-tarot-api/tarot-api/main/static/cards/m00.jpg';

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
  '1 Carta': { title: '1 Carta (Insight)', positions: ['Insight Principal'], didactic: 'Ideal para perguntas diretas ou intenção do dia.' },
  '3 Cartas': { title: '3 Cartas (Linha Temporal)', positions: ['Passado', 'Presente', 'Futuro'], didactic: 'Método clássico de evolução temporal.' },
  '5 Cartas': { title: '5 Cartas (Cruz Simples)', positions: ['Centro', 'Desafio', 'A Favor', 'Contra', 'Desfecho'], didactic: 'Dinâmicas de forças opostas em dilemas.' },
  'Cruz Celta': { title: 'Cruz Celta (10 Cartas)', positions: ['1. Atual', '2. Desafio', '3. Raiz', '4. Passado', '5. Objetivo', '6. Futuro', '7. Atitude', '8. Ambiente', '9. Anseio', '10. Desfecho'], didactic: 'O método mais completo da tradição.' }
};

/**
 * ANIMAÇÃO DE PARTÍCULAS EM CARREGAMENTO (MOBILE)
 */
function MobileParticleLoader({ palette }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 12 }}>
      <View style={{ width: 50, height: 50, borderRadius: 25, borderWidth: 3, borderColor: palette.acLite, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 20, color: palette.acLite }}>🔮</Text>
      </View>
      <Text style={{ fontSize: 12, fontWeight: 'bold', color: palette.acLite, letterSpacing: 1, textTransform: 'uppercase' }}>
        ✦ Invocando Oráculo LangChain...
      </Text>
    </View>
  );
}

export default function Espiritualidade() {
  const st = useSettings();
  const { palette } = st;

  const [activeTab, setActiveTab] = useState('tarot');
  const [selectedMethod, setSelectedMethod] = useState('3 Cartas');
  const [question, setQuestion] = useState('');
  const [drawnCards, setDrawnCards] = useState([]);
  const [expandedCardIdx, setExpandedCardIdx] = useState(null);
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
    setExpandedCardIdx(null);
    const config = METHOD_DESCRIPTIONS[selectedMethod];
    const deckShuffled = [...FULL_TAROT_DECK].sort(() => Math.random() - 0.5);
    const cardsDrawn = config.positions.map((pos, idx) => {
      const cardObj = deckShuffled[idx % deckShuffled.length];
      return { position: pos, card: cardObj.name, element: cardObj.element, symbol: cardObj.symbol, reversed: Math.random() < 0.2, phrase: cardObj.phrase };
    });
    setDrawnCards(cardsDrawn);

    const currentDateStr = new Date().toLocaleDateString('pt-BR');

    try {
      const json = await api.post('/v1/tarot/reading', {
        question: question || 'Orientações e clareza para o momento atual',
        readingType: selectedMethod,
        lunarPhase: 'Lua Crescente em Escorpião',
        userSign: 'Escorpião / Sol em Leão',
        currentDate: currentDateStr,
        drawnCards: cardsDrawn.map(c => ({ position: c.position, card: c.card, reversed: c.reversed }))
      });
      setReadingResult(json);
    } catch (e) {
      console.warn('Fallback no mobile:', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 14 }}>
      {/* Abas Superiores */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <Chip on={activeTab === 'tarot'} onPress={() => setActiveTab('tarot')}>☯ Tarot & Oráculo</Chip>
        <Chip on={activeTab === 'diario'} onPress={() => setActiveTab('diario')}>✍ Diário & Intuição</Chip>
        <Chip on={activeTab === 'rituais'} onPress={() => setActiveTab('rituais')}>🕯 Rituais & Hábitos</Chip>
      </View>

      {activeTab === 'tarot' && (
        <View style={{ gap: 16 }}>
          <Text style={{ fontFamily: font.display, fontSize: 20, fontWeight: 'bold', color: '#fff' }}>
            ☯ Oráculo & Tiragem de Tarot
          </Text>

          {/* Método de Tiragem */}
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: palette.acLite, textTransform: 'uppercase' }}>
            Selecione o Método
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {Object.keys(METHOD_DESCRIPTIONS).map(m => (
              <Pressable
                key={m}
                onPress={() => { setSelectedMethod(m); setDrawnCards([]); setReadingResult(null); setExpandedCardIdx(null); }}
                style={{
                  flex: 1, minWidth: '45%', paddingVertical: 10, borderRadius: 12,
                  borderWidth: 1, borderColor: selectedMethod === m ? palette.acLite : 'rgba(255,255,255,0.1)',
                  backgroundColor: selectedMethod === m ? palette.acDeep : 'rgba(0,0,0,0.3)',
                  alignItems: 'center'
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: selectedMethod === m ? '#fff' : palette.acLite }}>
                  {m}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Input de Intuição */}
          <TextInput
            placeholder="Qual a sua dúvida ou intenção para esta tiragem?"
            placeholderTextColor="rgba(255,255,255,.4)"
            value={question}
            onChangeText={setQuestion}
            style={{ backgroundColor: palette.acdAlpha(0.28), borderWidth: 1, borderColor: 'rgba(255,255,255,.15)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, color: '#fff', fontSize: 13.5 }}
          />

          <Pressable
            onPress={handlePerformReading}
            disabled={loading}
            style={{ backgroundColor: palette.acDeep, borderRadius: 14, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: palette.acLite }}
          >
            <Text style={{ color: '#fff', fontFamily: font.display, fontSize: 15, fontWeight: 'bold' }}>
              {loading ? '🔮 Consultando Oráculo...' : '✦ Sortear Cartas & Interpretar'}
            </Text>
          </Pressable>

          {/* Partículas de Carregamento */}
          {loading && <MobileParticleLoader palette={palette} />}

          {/* CARTAS EMPILHADAS VERTICALMENTE COM EXPANSÃO AO CLICAR */}
          {drawnCards.length > 0 && !loading && (
            <View style={{ gap: 14, marginTop: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: palette.acLite, textTransform: 'uppercase' }}>
                Cartas Sorteadas na Mesa (Toque para expandir):
              </Text>

              {drawnCards.map((c, i) => {
                const isExpanded = expandedCardIdx === i;
                const analysis = readingResult?.analise_cartas?.[i];
                const cardUri = getCardImage(c.card);

                return (
                  <View key={i} style={{ backgroundColor: 'rgba(12, 14, 24, 0.85)', borderRadius: 16, borderWidth: 1, borderColor: isExpanded ? palette.acLite : 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                    <Pressable
                      onPress={() => setExpandedCardIdx(isExpanded ? null : i)}
                      style={{ padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' }}
                    >
                      {/* Imagem da Carta no Mobile com URI Direto */}
                      <Image
                        source={{ uri: cardUri }}
                        style={{ width: 60, height: 95, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}
                        resizeMode="cover"
                      />

                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: palette.acLite, textTransform: 'uppercase' }}>
                          {c.position}
                        </Text>
                        <Text style={{ fontFamily: font.display, fontSize: 16, color: '#fff', fontWeight: 'bold' }}>
                          {c.card} {c.reversed && <Text style={{ fontSize: 12, color: '#ff7c7c' }}>(Invertida)</Text>}
                        </Text>
                        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
                          {c.element}
                        </Text>
                      </View>

                      <Text style={{ fontSize: 16, color: palette.acLite, fontWeight: 'bold' }}>
                        {isExpanded ? '▲' : '▼'}
                      </Text>
                    </Pressable>

                    {/* EXPANSÃO DO CONTEÚDO AO CLICAR (5 DIMENSÕES) */}
                    {isExpanded && (
                      <View style={{ padding: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', gap: 8, backgroundColor: 'rgba(0,0,0,0.3)' }}>
                        <Text style={{ fontSize: 12.5, color: '#fff', lineHeight: 18 }}>
                          <Text style={{ fontWeight: 'bold', color: palette.acLite }}>✦ Descrição: </Text>
                          {analysis?.descricao || c.phrase}
                        </Text>

                        <Text style={{ fontSize: 12.5, color: '#fff', lineHeight: 18 }}>
                          <Text style={{ fontWeight: 'bold', color: palette.acLite }}>🔮 Simbologia: </Text>
                          {analysis?.simbologia || 'Chaves esotéricas da regência elemental.'}
                        </Text>

                        <Text style={{ fontSize: 12.5, color: '#fff', lineHeight: 18 }}>
                          <Text style={{ fontWeight: 'bold', color: palette.acLite }}>📅 Data de Hoje: </Text>
                          {analysis?.conexao_data || 'Alinhamento temporal do dia atual.'}
                        </Text>

                        <Text style={{ fontSize: 12.5, color: '#fff', lineHeight: 18 }}>
                          <Text style={{ fontWeight: 'bold', color: palette.acLite }}>♏︎ Seu Signo (Escorpião): </Text>
                          {analysis?.conexao_signo || 'Intensidade e foco intuitivo.'}
                        </Text>

                        <Text style={{ fontSize: 12.5, color: '#fff', lineHeight: 18 }}>
                          <Text style={{ fontWeight: 'bold', color: palette.acLite }}>🎯 Sua Intenção: </Text>
                          {analysis?.conexao_intencao || analysis?.interpretacao || 'Resposta clara ao seu questionamento.'}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Síntese Geral da Tiragem no Mobile */}
          {readingResult && !loading && (
            <View style={{ padding: 14, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: palette.ac2Alpha(0.4), gap: 8 }}>
              <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.2, color: palette.ac2, fontWeight: 'bold' }}>
                ✦ Interpretação do Oráculo LangChain
              </Text>
              <Text style={{ fontSize: 13.5, fontWeight: 'bold', color: '#fff', fontStyle: 'italic' }}>
                "{readingResult.resumo_astrologico}"
              </Text>
              <Text style={{ fontSize: 12.5, lineHeight: 17, color: 'rgba(255,255,255,0.9)' }}>
                <Text style={{ fontWeight: 'bold' }}>Síntese Global: </Text>{readingResult.sintese_leitura}
              </Text>
              <Text style={{ fontSize: 13, color: '#7ce0a8', fontWeight: 'bold', marginTop: 4 }}>
                ✦ Conselho: {readingResult.conselho_pratico}
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
