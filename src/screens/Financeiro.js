import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSettings } from '../settings.jsx';
import { useApp } from '../AppContext.js';
import { FINSTATS, EXPENSES } from '../data.js';
import { StatCard, Tag, GridRow, font } from '../ui.jsx';

export default function Financeiro() {
  const st = useSettings();
  const { openModal } = useApp();
  const [incomes] = useState([]);

  const hasExpenses = EXPENSES && EXPENSES.length > 0;
  const hasIncomes = incomes && incomes.length > 0;

  const stats = FINSTATS.length > 0 ? FINSTATS : [
    { label: 'receitas do mês', value: 'R$ 0,00', hint: '0 lançamentos', color: '#7ce0a8' },
    { label: 'despesas', value: 'R$ 0,00', hint: '0 lançamentos', color: '#ff9d9d' },
    { label: 'recorrentes', value: 'R$ 0,00', hint: '0 lançamentos', color: '#fff' },
    { label: 'saldo', value: 'R$ 0,00', hint: 'projetado', color: st.palette.acInk }
  ];

  return (
    <View style={{ gap: 22 }}>
      <GridRow min={200}>
        {stats.map(s => <StatCard key={s.label} {...s} value={st.money(s.value)} />)}
      </GridRow>

      <GridRow min={320}>
        <View style={{ padding: 20, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' }}>
          <Text style={{ fontFamily: font.display, fontSize: 18, fontWeight: '600', color: '#fff' }}>Gastos & Despesas</Text>
          <Text style={{ fontSize: 13, marginBottom: 14, opacity: 0.7, color: '#fff' }}>cada gasto puxa evento e pessoa — é assim que o dia fecha</Text>

          {hasExpenses ? (
            <View style={{ gap: 8 }}>
              {EXPENSES.map((x, i) => (
                <View key={i} style={{ paddingVertical: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#fff' }}>{x.title}</Text>
                    <Text style={{ fontFamily: font.display, fontSize: 14.5, color: x.color }}>{st.money(x.value)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 9 }}>
                    {x.links.map(l => <Tag key={l}>{l}</Tag>)}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <Text style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)', marginBottom: 14 }}>Nenhum gasto registrado ainda neste mês.</Text>
              <Pressable onPress={() => openModal({ kind: 'add', defaultTab: 6 })}>
                <Text style={{ color: '#fff', fontFamily: font.display, fontSize: 18, fontWeight: '700' }}>+ Registrar Gasto</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={{ padding: 20, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' }}>
          <Text style={{ fontFamily: font.display, fontSize: 18, fontWeight: '600', color: '#7ce0a8' }}>Receitas & Income</Text>
          <Text style={{ fontSize: 13, marginBottom: 14, opacity: 0.7, color: '#fff' }}>entradas do mês, salários, freelas e recebimentos</Text>

          {hasIncomes ? (
            <View style={{ gap: 8 }}>
              {incomes.map((inc, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 11, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(124,224,168,.2)', backgroundColor: 'rgba(124,224,168,.04)' }}>
                  <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: '#7ce0a8' }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>{inc.title}</Text>
                    <Text style={{ fontSize: 12, marginTop: 2, opacity: 0.7, color: '#fff' }}>{inc.category} · {inc.date}</Text>
                  </View>
                  <Text style={{ fontFamily: font.display, fontSize: 16, fontWeight: '700', color: '#7ce0a8' }}>+ {st.money(inc.value)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ paddingVertical: 28, alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 16 }}>Nenhuma receita / income cadastrada.</Text>
              <Pressable onPress={() => openModal({ kind: 'add', defaultTab: 6 })}>
                <Text style={{ color: '#fff', fontFamily: font.display, fontSize: 19, fontWeight: '700' }}>+ Cadastrar Receita / Income</Text>
              </Pressable>
            </View>
          )}
        </View>
      </GridRow>
    </View>
  );
}
