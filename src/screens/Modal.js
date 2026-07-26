import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Modal as RNModal } from 'react-native';
import { useSettings } from '../settings.jsx';
import { OSINT, MODAL_TABS, ITEMSTATS, ITEMHISTORY } from '../data.js';
import { Chip, ChipRow, font, label } from '../ui.jsx';

const DEFAULT_FORM_FIELDS_BY_TAB = {
  0: [
    ['Tipo de Arquivo', ['Foto', 'Documento', 'Áudio', 'Recibo', '+ Tipo'], false],
    ['Evento vinculado', ['Nenhum', '+ Novo evento'], false],
    ['Pessoa vinculada', ['+ Buscar'], true]
  ],
  1: [
    ['Tipo de Evento', ['Encontro', 'Festa', 'Reunião', 'Viagem', 'Compromisso', '+ Tipo'], false],
    ['Participantes (Pessoas)', ['+ Buscar'], true],
    ['Itens levados / EDC', ['+ Inventário'], true]
  ],
  2: [
    ['Tipo de Interação', ['Conversa Importante', 'Promessa / Acordo', 'Desentendimento', 'Fofoca / Relato', 'Elogio / Gratidão', 'Segredo compartilhado', '+ Tipo'], false],
    ['Pessoas envolvidas', ['+ Buscar'], true],
    ['Impacto no Relacionamento', ['Neutro', 'Fortaleceu elo', 'Gerou tensão', 'Pendente de resposta', '+ Impacto'], false]
  ],
  3: [
    ['Onde conheci', ['Social', 'Trabalho', 'Evento', 'Faculdade', '+ Onde'], false],
    ['Signo', ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', '+ Signo'], false],
    ['Eventos em comum', ['+ Novo evento'], true]
  ],
  4: [
    ['Categoria / Tag', ['Ideia', 'Insight', 'Lembrete', 'Reflexão', 'Rascunho', '+ Tag'], false],
    ['Pessoas mencionadas', ['+ Buscar'], true],
    ['Evento vinculado', ['Nenhum', '+ Novo evento'], false]
  ],
  5: [
    ['Slot no Corpo / EDC', ['Bolsos', 'Cabeça', 'Torso', 'Pulso', 'Costas', 'Pés', 'Armário', '+ Slot'], false],
    ['Status Inicial', ['No corpo (em uso)', 'No armário (guardado)', '+ Status'], false],
    ['Pessoa responsável / Dono', ['Eu mesmo', '+ Buscar'], false]
  ],
  6: [
    ['Tipo de Lançamento', ['Gasto (Despesa)', 'Receita (Income / Entrada)', '+ Tipo'], false],
    ['Categoria', ['Salário / Proventos', 'Freela / Projeto', 'Investimentos', 'Alimentação', 'Transporte', 'Moradia', 'Lazer', '+ Categoria'], false],
    ['Recorrente?', ['Não (pontual)', 'Mensal', 'Anual', '+ Frequência'], false],
    ['Pessoa associada', ['Nenhuma', '+ Buscar'], false],
    ['Evento associado', ['Nenhum', '+ Novo evento'], false]
  ],
  7: [
    ['Tipo de Consulta', ['Username', 'E-mail', 'Domínio / IP', 'Registro Público', 'Leak', '+ Tipo'], false],
    ['Alvo / Pessoa vinculada', ['Nenhum', '+ Buscar'], false]
  ],
  8: [
    ['Tipo de Prática', ['Meditação', 'Tarot / Oráculo', 'Leitura Stoica', 'Respiração', 'Ritual', '+ Tipo'], false],
    ['Duração / Grandeza', ['10 min', '20 min', '30 min', '1 Carta', '+ Duração'], false]
  ],
  9: [
    ['Gênero', ['Sci-Fi', 'Épico', 'Neo-Noir', 'Drama', 'Ação', 'Terror', '+ Gênero'], false],
    ['Avaliação (Estrelas)', ['5 ★ (Obra-prima)', '4 ★ (Muito bom)', '3 ★ (Bom)', '2 ★ (Regular)', '1 ★ (Ruim)'], false],
    ['Pessoas que assistiram juntas', ['Nenhuma', '+ Buscar'], false],
    ['Evento de cinema associado', ['Nenhum', '+ Novo evento'], false]
  ]
};

function Input({ palette, ...props }) {
  return (
    <TextInput
      placeholderTextColor="rgba(255,255,255,.4)"
      style={{
        borderRadius: 12, borderWidth: 1, borderColor: palette.ac2Alpha(0.25),
        backgroundColor: palette.acdAlpha(0.28), color: '#fff', fontFamily: font.body,
        fontSize: 15, paddingVertical: 10, paddingHorizontal: 12
      }}
      {...props}
    />
  );
}

function TextArea({ palette, ...props }) {
  return (
    <TextInput
      multiline
      placeholderTextColor="rgba(255,255,255,.4)"
      style={{
        minHeight: 84, textAlignVertical: 'top', borderRadius: 14, borderWidth: 1,
        borderColor: palette.ac2Alpha(0.25), backgroundColor: palette.acdAlpha(0.24),
        color: '#fff', fontFamily: font.body, fontSize: 14, lineHeight: 20, padding: 13
      }}
      {...props}
    />
  );
}

export default function ModalScreen({ modal, onClose, go }) {
  const st = useSettings();
  const { palette } = st;
  const [tab, setTab] = useState(modal.defaultTab ?? 0);
  const [sel, setSel] = useState({});
  const [tabFields, setTabFields] = useState(DEFAULT_FORM_FIELDS_BY_TAB);

  useEffect(() => {
    if (modal.defaultTab !== undefined) setTab(modal.defaultTab);
  }, [modal.defaultTab]);

  const handleAddOption = (fieldLabel, newItems) => {
    setTabFields(prev => {
      const currentFields = prev[tab] || [];
      const updatedFields = currentFields.map(([l, chips, multi]) => {
        if (l !== fieldLabel) return [l, chips, multi];
        const plusIdx = chips.findIndex(c => typeof c === 'string' && c.trim().startsWith('+'));
        const insertAt = plusIdx >= 0 ? plusIdx : chips.length;
        const existing = chips.filter(c => !c.trim().startsWith('+'));
        const newUnique = newItems.filter(item => !existing.includes(item));
        if (newUnique.length === 0) return [l, chips, multi];
        const updatedChips = [...chips.slice(0, insertAt), ...newUnique, ...chips.slice(insertAt)];
        return [l, updatedChips, multi];
      });
      return { ...prev, [tab]: updatedFields };
    });
  };

  const kind = modal.kind;
  const isForm = kind === 'day' || kind === 'add';
  const p = modal.person;
  const tool = kind === 'osint' ? OSINT[modal.i] : null;

  const kicker = kind === 'osint' ? 'osint · ' + tool[2]
    : kind === 'day' ? 'Dia ' + modal.n + ' de julho de 2026'
    : kind === 'person' ? p.from + ' · ' + p.sub
    : kind === 'item' ? 'Histórico de uso · ' + modal.meta
    : 'Formulário de Cadastro · ' + MODAL_TABS[tab];

  const title = kind === 'osint' ? tool[0]
    : kind === 'day' ? 'O que rolou nesse dia'
    : kind === 'item' || kind === 'person' ? (p ? p.name : modal.name)
    : 'Cadastrar ' + MODAL_TABS[tab];

  const pick = (k, i, multi) => setSel(s => {
    const prev = Array.isArray(s[k]) ? s[k] : (s[k] !== undefined ? [s[k]] : [0]);
    return { ...s, [k]: multi ? (prev.includes(i) ? prev.filter(x => x !== i) : prev.concat(i)) : [i] };
  });

  const currentTabFields = tabFields[tab] || [];

  const TAB_CONTENT = {
    0: (
      <View>
        <Text style={label}>Nome do Arquivo / Foto</Text>
        <Input palette={palette} placeholder="ex: recibo_almoço.pdf ou foto_grupo.jpg" />
      </View>
    ),
    1: (
      <View style={{ gap: 12 }}>
        <View><Text style={label}>Título do Evento</Text><Input palette={palette} placeholder="ex: Almoço de negócios, Consulta médica..." /></View>
        <View><Text style={label}>Data & Horário</Text><Input palette={palette} placeholder="ex: 25 jul · 14:30" /></View>
        <View><Text style={label}>Local / Formato</Text><Input palette={palette} placeholder="ex: Restaurante Sato, Online, Clínica Vita" /></View>
        <View><Text style={label}>Orçamento / Gasto Previsto (R$)</Text><Input palette={palette} placeholder="R$ 0,00" /></View>
      </View>
    ),
    2: (
      <View style={{ gap: 12 }}>
        <View><Text style={label}>Resumo / Título da Interação</Text><Input palette={palette} placeholder="ex: Fulano prometeu entregar o projeto..." /></View>
        <View><Text style={label}>Relato do Ocorrido / Detalhes Efêmeros</Text><TextArea palette={palette} placeholder="descreva quem disse o quê, promessas feitas, contexto..." /></View>
      </View>
    ),
    3: (
      <View style={{ gap: 12 }}>
        <View><Text style={label}>Nome Completo</Text><Input palette={palette} placeholder="ex: Gabriel Alves" /></View>
        <View><Text style={label}>Relação / Subtítulo</Text><Input palette={palette} placeholder="ex: Amigo de infância, Dev do time..." /></View>
        <View><Text style={label}>Data de Nascimento</Text><Input palette={palette} placeholder="DD/MM/AAAA" /></View>
        <View><Text style={label}>Dossiê Inicial / Observação</Text><TextArea palette={palette} placeholder="informações relevantes, contexto, histórico..." /></View>
      </View>
    ),
    4: (
      <View style={{ gap: 12 }}>
        <View><Text style={label}>Título da Anotação</Text><Input palette={palette} placeholder="ex: Reflexão sobre o projeto..." /></View>
        <View><Text style={label}>Conteúdo da Anotação</Text><TextArea palette={palette} placeholder="o que aconteceu, detalhes, pensamentos..." /></View>
      </View>
    ),
    5: (
      <View style={{ gap: 12 }}>
        <View><Text style={label}>Nome do Item</Text><Input palette={palette} placeholder="ex: Notebook 14, Fone Sony XM5..." /></View>
        <View><Text style={label}>Descrição / Modelo</Text><Input palette={palette} placeholder="ex: couro marrom, case preto..." /></View>
      </View>
    ),
    6: (
      <View style={{ gap: 12 }}>
        <View><Text style={label}>Valor do Gasto (R$)</Text><Input palette={palette} placeholder="R$ 0,00" /></View>
        <View><Text style={label}>Descrição (No quê?)</Text><Input palette={palette} placeholder="ex: Almoço no Sato, Uber ida e volta..." /></View>
      </View>
    ),
    7: (
      <View style={{ gap: 12 }}>
        <View><Text style={label}>Alvo / Termo de Busca</Text><Input palette={palette} placeholder="ex: @username, email@alvo.com" /></View>
        <View><Text style={label}>Objetivo / Contexto</Text><Input palette={palette} placeholder="ex: Mapeamento de presença..." /></View>
      </View>
    ),
    8: (
      <View style={{ gap: 12 }}>
        <View><Text style={label}>Nome da Prática ou Ritual</Text><Input palette={palette} placeholder="ex: Meditação Matinal 20min..." /></View>
        <View><Text style={label}>Insight / Sensação / Reflexão</Text><TextArea palette={palette} placeholder="anote insights da quietude..." /></View>
      </View>
    ),
    9: (
      <View style={{ gap: 12 }}>
        <View><Text style={label}>Título / Nome do Filme</Text><Input palette={palette} placeholder="ex: Blade Runner 2049..." /></View>
        <View><Text style={label}>Diretor / Anotações (Opcional)</Text><Input palette={palette} placeholder="ex: Denis Villeneuve..." /></View>
      </View>
    )
  };

  return (
    <RNModal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.75)', justifyContent: 'flex-end' }} onPress={onClose}>
        <Pressable onPress={e => e.stopPropagation?.()} style={{
          maxHeight: '90%', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22,
          backgroundColor: '#090a0f', borderWidth: 1, borderColor: palette.ac2Alpha(0.35)
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: palette.ac2Alpha(0.8), fontWeight: '600' }}>{kicker}</Text>
              <Text style={{ fontFamily: font.display, fontSize: 22, fontWeight: '600', color: '#fff', marginTop: 6 }}>{title}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={{ color: '#fff', fontSize: 26 }}>×</Text>
            </Pressable>
          </View>

          <ScrollView style={{ marginTop: 18 }} showsVerticalScrollIndicator={false}>
            {kind === 'person' && (
              <View style={{ gap: 14 }}>
                <View style={{ alignItems: 'center', gap: 10, padding: 16, borderRadius: 16, backgroundColor: palette.acdAlpha(0.24) }}>
                  <View style={{ width: 90, height: 90, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.acmAlpha(0.6) }}>
                    <Text style={{ fontFamily: font.display, fontSize: 32, color: palette.acLite }}>{p.initials}</Text>
                  </View>
                </View>
                {[['Nome', p.name], ['Subtítulo / Relação', p.sub], ['Aniversário', p.birth], ['Signo', p.sign], ['Onde conheci', p.from], ['Último contato', p.last]]
                  .filter(([, v]) => v)
                  .map(([l, v]) => (
                    <View key={l}>
                      <Text style={label}>{l}</Text>
                      <View style={{ borderRadius: 12, backgroundColor: palette.acdAlpha(0.26), padding: 12 }}>
                        <Text style={{ color: '#fff', fontSize: 14.5 }}>{v}</Text>
                      </View>
                    </View>
                  ))}
                <Pressable
                  onPress={() => { onClose(); go && go(1, { assistantPrompt: `Analisar histórico completo, insights e contexto sobre @${p.name}` }); }}
                  style={{ borderWidth: 1, borderColor: palette.ac2Alpha(0.5), backgroundColor: palette.acdAlpha(0.3), borderRadius: 14, padding: 14 }}
                >
                  <Text style={{ color: '#fff', fontFamily: font.display, fontSize: 17, fontWeight: '700', textAlign: 'center' }}>✦ Falar com Assistente sobre @{p.name}</Text>
                </Pressable>
              </View>
            )}

            {kind === 'item' && (
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
                  {ITEMSTATS.map(s => (
                    <View key={s.label} style={{ flexGrow: 1, minWidth: 120, padding: 12, borderRadius: 14, backgroundColor: palette.acdAlpha(0.26) }}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff' }}>{s.label}</Text>
                      <Text style={{ fontFamily: font.display, fontSize: 20, marginTop: 6, color: palette.acInk }}>{s.value}</Text>
                    </View>
                  ))}
                </View>
                {ITEMHISTORY.map((h, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 13, alignItems: 'center', padding: 12, borderRadius: 14, backgroundColor: 'rgba(255,255,255,.04)' }}>
                    <View style={{ minWidth: 42, alignItems: 'center' }}>
                      <Text style={{ fontFamily: font.display, fontSize: 17, color: '#fff' }}>{h.day}</Text>
                      <Text style={{ fontSize: 10, textTransform: 'uppercase', color: '#fff' }}>{h.mon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13.5, fontWeight: '500', color: '#fff' }}>{h.title}</Text>
                      <Text style={{ fontSize: 12.5, color: '#fff', marginTop: 2 }}>{h.meta}</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: palette.ac2Alpha(0.8) }}>{st.money(h.right)}</Text>
                  </View>
                ))}
              </View>
            )}

            {kind === 'osint' && tool && (
              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Input palette={palette} placeholder={tool[5]} style2={{ flex: 1 }} />
                  <Text style={{ color: '#fff', fontFamily: font.body, fontSize: 15, fontWeight: '700' }}>Consultar</Text>
                </View>
                {tool[7].map((r, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 13, flexWrap: 'wrap', padding: 13, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,.06)' }}>
                    <Text style={{ fontSize: 10.5, textTransform: 'uppercase', fontWeight: '700', color: palette.acLite }}>{r[0]}</Text>
                    <Text style={{ flex: 1, fontSize: 13.5, color: '#fff' }}>{r[1]}</Text>
                    <Text style={{ fontSize: 12, opacity: .55, color: '#fff' }}>{r[2]}</Text>
                  </View>
                ))}
                <Text style={{ fontSize: 12, opacity: .5, color: '#fff' }}>{tool[6]}</Text>
              </View>
            )}

            {isForm && (
              <View style={{ gap: 14 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {MODAL_TABS.map((t, i) => <Chip key={t} on={tab === i} onPress={() => setTab(i)}>{t}</Chip>)}
                </View>

                {TAB_CONTENT[tab]}

                {currentTabFields.map(([l, chips, multi]) => (
                  <View key={l}>
                    <Text style={label}>{l}</Text>
                    <ChipRow
                      options={chips}
                      value={sel[l] || [0]}
                      onPick={i => pick(l, i, multi)}
                      onAddOption={newItems => handleAddOption(l, newItems)}
                      fieldLabel={l}
                    />
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
            {isForm && (
              <Pressable onPress={onClose} style={{ flex: 1, paddingVertical: 12, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontFamily: font.body, fontSize: 16, fontWeight: '700' }}>Salvar Registro</Text>
              </Pressable>
            )}
            <Pressable onPress={onClose} style={{ paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,.7)', fontFamily: font.body, fontSize: 15 }}>{isForm ? 'Cancelar' : 'Fechar'}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
