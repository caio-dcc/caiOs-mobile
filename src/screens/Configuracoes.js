import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import TextInput from '../TextInput.js';
import Text from '../Text.js';
import { useSettings } from '../settings.jsx';
import { SWATCHES, PROMPT_PRESETS, WORK_RULES } from '../data.js';
import { RAMP_KEYS } from '../theme.js';
import { Chip, ChipRow, Toggle, AnimatedList, card, field, label, muted, font, GridRow, H2 } from '../ui.jsx';
import { FONT_CHOICES, familyFor } from '../fonts.js';

const AI_SCOPES = ['Financeiro', 'Social e pessoas', 'Anotações', 'Eventos e calendário', 'Itens', 'Inteligência'];
const AI_NEVER = ['Julgar minhas escolhas', 'Inventar sem fonte', 'Dar conselho médico', 'Falar de dinheiro sem eu pedir'];
const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function RecurringExpensesManager() {
  const st = useSettings();
  const { palette } = st;
  const list = st.recurringExpenses || [];
  const [newDesc, setNewDesc] = useState('');
  const [newVal, setNewVal] = useState('');
  const [newDays, setNewDays] = useState([1, 2, 3, 4, 5]);

  const addExpense = () => {
    if (!newDesc.trim() || !newVal.trim()) return;
    const newItem = { id: Date.now(), name: newDesc.trim(), amount: newVal.trim().startsWith('R$') ? newVal.trim() : `R$ ${newVal.trim()}`, days: newDays };
    st.set({ recurringExpenses: [...list, newItem] });
    setNewDesc(''); setNewVal('');
  };

  const removeExpense = id => st.set({ recurringExpenses: list.filter(item => item.id !== id) });

  const toggleDay = (expenseId, dayIdx) => {
    st.set({
      recurringExpenses: list.map(item => {
        if (item.id !== expenseId) return item;
        const hasDay = item.days.includes(dayIdx);
        return { ...item, days: hasDay ? item.days.filter(d => d !== dayIdx) : [...item.days, dayIdx].sort() };
      })
    });
  };

  const toggleNewDay = dayIdx => setNewDays(prev => prev.includes(dayIdx) ? prev.filter(d => d !== dayIdx) : [...prev, dayIdx].sort());

  // Chip de dia da semana. Fica em componente proprio porque os 7 dias tem de
  // caber na largura do telefone: `flex: 1` distribui igualmente em vez de cada
  // chip pedir a largura do proprio texto e o ultimo ser cortado.
  const DayChip = ({ dayName, active, onPress }) => (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <Text style={{
        fontSize: 12, fontWeight: '700', textAlign: 'center',
        paddingVertical: 5, borderRadius: 6,
        backgroundColor: active ? palette.ac : 'rgba(255,255,255,.08)',
        color: active ? '#fff' : 'rgba(255,255,255,.5)'
      }}>{dayName}</Text>
    </Pressable>
  );

  return (
    <View style={{ gap: 12, marginTop: 6 }}>
      <Text style={{ fontSize: 13, color: 'rgba(255,255,255,.6)' }}>Estes gastos são inseridos automaticamente no formulário do dia selecionado.</Text>

      <View style={{ gap: 10 }}>
        {list.map(item => (
          <View key={item.id} style={{ gap: 10, padding: 12, borderRadius: 14, backgroundColor: palette.acdAlpha(0.3), borderWidth: 1, borderColor: 'rgba(255,255,255,.08)' }}>
            {/* nome + valor + remover numa linha; os dias na linha de baixo, com
                a largura toda — antes disputavam espaco e Sex/Sab eram cortados */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15.5, fontWeight: '600', color: '#fff' }}>{item.name}</Text>
                <Text style={{ fontSize: 14, color: palette.acLite, fontWeight: '700' }}>{item.amount}</Text>
              </View>
              <Pressable onPress={() => removeExpense(item.id)} hitSlop={8}>
                <Text style={{ color: '#ff7777', fontSize: 15, fontWeight: '700' }}>✕</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {DAYS_OF_WEEK.map((dayName, dayIdx) => (
                <DayChip
                  key={dayName + dayIdx}
                  dayName={dayName}
                  active={item.days.includes(dayIdx)}
                  onPress={() => toggleDay(item.id, dayIdx)}
                />
              ))}
            </View>
          </View>
        ))}

        <View style={{ gap: 10, padding: 14, borderRadius: 14, backgroundColor: 'rgba(255,255,255,.025)', borderWidth: 1.5, borderStyle: 'dashed', borderColor: palette.ac2Alpha(0.35) }}>
          <Text style={{ fontSize: 13.5, fontWeight: '600', color: palette.acLite }}>+ Criar Novo Gasto Recorrente</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <TextInput placeholder="Ex: R$ 15,00" placeholderTextColor="rgba(255,255,255,.4)" value={newVal} onChangeText={setNewVal}
              style={{ minWidth: 110, borderRadius: 10, backgroundColor: palette.acdAlpha(0.35), color: '#fff', fontSize: 14, padding: 8 }} />
            <TextInput placeholder="Ex: Passe VLT / Almoço" placeholderTextColor="rgba(255,255,255,.4)" value={newDesc} onChangeText={setNewDesc}
              style={{ flex: 1, minWidth: 140, borderRadius: 10, backgroundColor: palette.acdAlpha(0.35), color: '#fff', fontSize: 14, padding: 8 }} />
          </View>
          <View style={{ gap: 10 }}>
            <Text style={{ fontSize: 12, opacity: 0.7, color: '#fff' }}>Dias:</Text>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {DAYS_OF_WEEK.map((dayName, dayIdx) => (
                <DayChip
                  key={'new-' + dayName + dayIdx}
                  dayName={dayName}
                  active={newDays.includes(dayIdx)}
                  onPress={() => toggleNewDay(dayIdx)}
                />
              ))}
            </View>
            <Pressable onPress={addExpense} style={{ alignSelf: 'flex-start', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: palette.acDeep }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>+ Salvar Gasto Recorrente</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function Configuracoes() {
  const st = useSettings();
  const { palette } = st;
  const ramp = RAMP_KEYS.map(k => palette[k]);
  const swatchName = (SWATCHES.find(s => s[0].toLowerCase() === (st.accent || '').toLowerCase()) || [null, 'personalizada'])[1];

  return (
    <View style={{ gap: 20 }}>
      <GridRow min={330} gap={16} cols={1}>
        <View style={{ gap: 16 }}>
          <View style={card}>
            <H2 sub="é assim que o sistema e a assistente te chamam.">Você</H2>
            <View style={{ gap: 14 }}>
              <View>
                <Text style={label}>Nome</Text>
                <TextInput value={st.userName} onChangeText={v => st.set({ userName: v })} placeholder="seu nome" placeholderTextColor="rgba(255,255,255,.4)" style={{ ...field, backgroundColor: palette.acdAlpha(0.28) }} />
              </View>
              <View>
                <Text style={label}>Saudação do topo</Text>
                <ChipRow options={['Bom te ver', 'Olá', 'só "Início"']} value={st.greet} onPick={i => st.set({ greet: i })} />
                <Text style={{ ...muted, marginTop: 9 }}>agora aparece: <Text style={{ color: palette.ac2 }}>{st.greeting()}</Text></Text>
              </View>
            </View>
          </View>

          <View style={card}>
            <H2 sub="tinge navegação, gráficos, calendário e o fundo animado.">Cor principal</H2>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
              {SWATCHES.map(([hex, name]) => {
                const on = (st.accent || '').toLowerCase() === hex.toLowerCase();
                return (
                  <Pressable key={hex} onPress={() => st.set({ accent: hex })} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: hex, borderWidth: 2, borderColor: on ? '#fff' : 'rgba(255,255,255,.12)' }} />
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextInput value={st.accent} onChangeText={v => st.set({ accent: v })} style={{ ...field, flexGrow: 1, backgroundColor: palette.acdAlpha(0.28), fontFamily: font.display, fontSize: 13, textTransform: 'uppercase' }} />
              <Text style={{ fontSize: 12, opacity: 0.5, color: '#fff' }}>{swatchName}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 14 }}>
              {ramp.map((c, i) => <View key={i} style={{ flex: 1, height: 26, borderRadius: 8, backgroundColor: c }} />)}
            </View>
          </View>
        </View>

        <View style={{ ...card, gap: 18 }}>
          <H2 sub="o texto abaixo é lido antes de qualquer resposta. o que estiver aqui vale mais que a persona.">Assistente</H2>
          <View>
            <Text style={label}>System prompt</Text>
            <TextInput
              value={st.systemPrompt} onChangeText={v => st.set({ systemPrompt: v })} multiline
              placeholder="como ela deve pensar, o que priorizar, o que nunca dizer…" placeholderTextColor="rgba(255,255,255,.4)"
              style={{ ...field, minHeight: 150, textAlignVertical: 'top', backgroundColor: palette.acdAlpha(0.24), fontSize: 13.5, lineHeight: 20 }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 }}>
              <Text style={{ fontSize: 11.5, opacity: 0.45, color: '#fff' }}>{(st.systemPrompt || '').length} caracteres</Text>
              <Text style={{ fontSize: 11.5, opacity: 0.45, color: '#fff' }}>salvo neste dispositivo</Text>
            </View>
          </View>

          <View>
            <Text style={label}>Começar de um modelo</Text>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              {PROMPT_PRESETS.map(([name, text], i) => (
                <Chip key={name} on={st.preset === i} onPress={() => st.set({ preset: i, systemPrompt: text })}>{name}</Chip>
              ))}
            </View>
          </View>

          <View>
            <Text style={label}>O que ela pode ler</Text>
            <ChipRow options={AI_SCOPES} value={st.scopes} onPick={i => st.toggle('scopes', i)} />
            <Text style={{ fontSize: 12, opacity: 0.45, marginTop: 9, color: '#fff' }}>o que ficar de fora some do contexto — ela responde "não tenho acesso a isso" em vez de inventar.</Text>
          </View>

          <View>
            <Text style={label}>Nunca fazer</Text>
            <ChipRow options={AI_NEVER} value={st.never} onPick={i => st.toggle('never', i)} />
          </View>
        </View>

        <View style={{ gap: 16 }}>
          <View style={{ ...card, borderWidth: 1, borderColor: st.work ? palette.ac2Alpha(0.55) : 'rgba(255,255,255,.07)', backgroundColor: st.work ? palette.acdAlpha(0.42) : palette.acdAlpha(0.14) }}>
            <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <H2 sub="esconde o que não pode aparecer numa tela compartilhada. nada é apagado — só ocultado.">Modo Trabalho</H2>
              <Toggle on={st.work} onPress={() => st.set({ work: !st.work })} />
            </View>
            <Text style={{ fontSize: 11.5, textTransform: 'uppercase', fontWeight: '700', color: st.work ? palette.ac2 : 'rgba(255,255,255,.4)', marginTop: 16 }}>
              {st.work ? 'ligado · ' + (st.workRules || []).length + ' de 5 categorias ocultas' : 'desligado · tudo visível'}
            </Text>
          </View>

          <View style={card}>
            <Text style={label}>O que ele esconde</Text>
            <View style={{ gap: 10 }}>
              {WORK_RULES.map(([key, name, hint], i) => {
                const on = (st.workRules || []).includes(i);
                return (
                  <Pressable key={key} onPress={() => st.toggle('workRules', i)} style={{ flexDirection: 'row', alignItems: 'center', gap: 11, padding: 9, borderRadius: 12, backgroundColor: on ? palette.acdAlpha(0.3) : 'transparent' }}>
                    <View style={{ width: 17, height: 17, borderRadius: 6, alignItems: 'center', justifyContent: 'center', borderWidth: on ? 0 : 1.5, borderColor: 'rgba(255,255,255,.22)', backgroundColor: on ? '#fff' : 'transparent' }}>
                      {on && <Text style={{ fontSize: 11, color: '#000' }}>✓</Text>}
                    </View>
                    <Text style={{ flex: 1, fontSize: 13.5, color: '#fff' }}>{name}</Text>
                    <Text style={{ fontSize: 11.5, opacity: 0.45, color: '#fff' }}>{hint}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </GridRow>

      <View style={card}>
        <H2 sub="opções visuais, tipografia e padrão de inicialização de rotina diária.">Aparência & Rotina</H2>
        <GridRow min={320} gap={20} cols={1} style={{ marginTop: 16 }}>
          <View style={{ gap: 16, backgroundColor: 'rgba(255,255,255,.02)', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,.05)' }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: palette.acLite }}>Efeitos Visuais & Neon</Text>

            {[
              ['Neons Globais do Sistema', 'liga/desliga todos os brilhos neon', 'allNeons'],
              ['Fundo Animado Shader', 'fundo 100% preto absoluto se desligado', 'shaderBackground'],
              ['Texto Neon no Chat', 'brilho no assistente', 'chatNeon']
            ].map(([title, hint, key]) => (
              <View key={key} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>{title}</Text>
                  <Text style={{ fontSize: 12, opacity: 0.5, color: '#fff' }}>{hint}</Text>
                </View>
                <Toggle on={st[key] !== false} onPress={() => st.set({ [key]: st[key] === false })} />
              </View>
            ))}

            <View style={{ gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.08)' }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Fonte Global do Sistema</Text>
              <Text style={{ fontSize: 12, opacity: 0.5, marginBottom: 8, color: '#fff' }}>tipografia principal da interface</Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {FONT_CHOICES.map(([fKey, fLabel]) => {
                  const active = (st.globalFont || 'default') === fKey;
                  return (
                    <Pressable key={fKey} onPress={() => st.set({ globalFont: fKey })} style={{ borderWidth: 1, borderColor: active ? palette.ac2 : 'rgba(255,255,255,.15)', backgroundColor: active ? palette.acdAlpha(0.5) : 'rgba(255,255,255,.03)', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 }}>
                      {/* cada botao mostra o proprio tipo, como no web */}
                      <Text style={{ color: active ? '#fff' : 'rgba(255,255,255,.7)', fontSize: 14, fontWeight: '600', fontFamily: familyFor(fKey, true) }}>{fLabel}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={{ gap: 18, backgroundColor: 'rgba(255,255,255,.02)', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,.05)' }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: palette.acLite }}>Padrões de Inicialização</Text>
            <AnimatedList
              title="Itens de Rotina (Alianças / EDC)"
              items={st.routineItems || []}
              onRemove={idx => st.set({ routineItems: (st.routineItems || []).filter((_, i) => i !== idx) })}
              onAdd={newItems => st.set({ routineItems: [...(st.routineItems || []), ...newItems] })}
              fieldLabel="Item de Rotina"
              emptyText="Nenhum item de rotina cadastrado."
            />
            <AnimatedList
              title="Pessoas Recorrentes (Convívio diário)"
              items={st.dailyPeople || []}
              onRemove={idx => st.set({ dailyPeople: (st.dailyPeople || []).filter((_, i) => i !== idx) })}
              onAdd={newItems => st.set({ dailyPeople: [...(st.dailyPeople || []), ...newItems] })}
              fieldLabel="Pessoa Recorrente"
              emptyText="Nenhuma pessoa recorrente cadastrada."
            />
          </View>

          <View style={{ gap: 14, backgroundColor: 'rgba(255,255,255,.02)', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,.05)' }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: palette.acLite }}>Gastos Padrão do Dia</Text>
            <RecurringExpensesManager />
          </View>
        </GridRow>
      </View>
    </View>
  );
}
