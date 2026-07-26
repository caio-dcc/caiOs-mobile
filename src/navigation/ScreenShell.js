import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSettings } from '../settings.jsx';
import Background from '../Background.js';
import ModalScreen from '../screens/Modal.js';
import { META } from '../data.js';
import { AppProvider } from '../AppContext.js';
import { ROUTE_TAB_MAP } from './routes.js';

// Envelope de cada tela: cabecalho (kicker + titulo + descricao), Background,
// e o Modal de cadastro compartilhado — equivalente ao <main> do App.jsx web.
export default function ScreenShell({ routeId, Screen, navigation }) {
  const st = useSettings();
  const insets = useSafeAreaInsets();
  const [modal, setModal] = useState(null);
  const [assistantPrompt, setAssistantPrompt] = useState('');

  const go = (id, opts = {}) => {
    if (opts.assistantPrompt !== undefined) setAssistantPrompt(opts.assistantPrompt);
    const { ROUTE_SCREEN_NAMES } = require('./routes.js');
    navigation.navigate(ROUTE_SCREEN_NAMES[id]);
  };

  const openModal = (options = {}) => {
    const defaultTab = options.defaultTab ?? ROUTE_TAB_MAP[routeId] ?? 1;
    setModal({ kind: 'add', defaultTab, ...options });
  };

  const meta = META[routeId] || META[0];
  const locked = routeId === 11 && st.hides('osint');

  return (
    <AppProvider value={{ go, openModal, assistantPrompt, setAssistantPrompt }}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <Background />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: 40 }}
        >
          <Animated.View entering={FadeIn.duration(280)} style={{ marginBottom: 22 }}>
            <Text style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: st.palette.ac2Alpha(0.75), fontWeight: '600', marginBottom: 8 }}>
              {meta[0]}
            </Text>
            <Text style={{ fontFamily: 'VT323', fontSize: 32, fontWeight: '600', color: '#fff' }}>
              {routeId === 0 ? st.greeting() : meta[1]}
            </Text>
            <Text style={{ fontSize: 13.5, color: 'rgba(255,255,255,.6)', marginTop: 8 }}>{meta[2]}</Text>
          </Animated.View>

          {locked ? (
            <View style={{ maxWidth: 520, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', backgroundColor: st.palette.acdAlpha(0.18), padding: 26 }}>
              <Text style={{ fontSize: 11.5, letterSpacing: 1.5, textTransform: 'uppercase', color: st.palette.ac2, fontWeight: '700' }}>modo trabalho ativo</Text>
              <Text style={{ fontFamily: 'VT323', fontSize: 20, fontWeight: '600', color: '#fff', marginTop: 12, marginBottom: 8 }}>Esta rota está oculta</Text>
              <Text style={{ fontSize: 13.5, opacity: .6, color: '#fff' }}>nada foi apagado. desligue o Modo Trabalho em Configurações para ver os alvos, as varreduras e os achados.</Text>
            </View>
          ) : (
            <Screen />
          )}
        </ScrollView>

        {modal && <ModalScreen modal={modal} onClose={() => setModal(null)} go={go} />}
      </View>
    </AppProvider>
  );
}
