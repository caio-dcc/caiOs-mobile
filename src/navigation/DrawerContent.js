import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../settings.jsx';
import NavPills from '../components/NavPills.js';
import { ROUTE_SCREEN_NAMES } from './routes.js';

// Conteudo custom da drawer — espelha a sidebar fixa esquerda do App.jsx web
// (logo caiOs, NavPills, botao Modo Trabalho + saudacao no rodape).
export default function DrawerContent({ navigation, state }) {
  const st = useSettings();
  const insets = useSafeAreaInsets();

  const activeRouteName = state.routes[state.index]?.name;
  const activeId = Object.entries(ROUTE_SCREEN_NAMES).find(([, name]) => name === activeRouteName)?.[0];
  const route = activeId !== undefined ? Number(activeId) : 0;

  const go = id => {
    navigation.navigate(ROUTE_SCREEN_NAMES[id]);
    navigation.closeDrawer();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000', paddingTop: insets.top + 16, paddingBottom: insets.bottom + 14, paddingHorizontal: 14 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ fontFamily: 'VT323', fontSize: 34, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 18 }}>
          caiOs
        </Text>
        <NavPills route={route} onGo={go} />
      </ScrollView>

      <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.08)', paddingTop: 14, marginTop: 14, gap: 10 }}>
        {st.work && (
          <Pressable
            onPress={() => go(12)}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
              borderWidth: 1, borderColor: st.palette.ac2Alpha(0.5), backgroundColor: st.palette.acdAlpha(0.45),
              paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10
            }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: st.palette.ac }} />
            <Text style={{ color: st.palette.acLite, fontFamily: 'VT323', fontSize: 15, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 }}>
              modo trabalho
            </Text>
          </Pressable>
        )}
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', textAlign: 'center' }}>{st.greeting()}</Text>
      </View>
    </View>
  );
}
