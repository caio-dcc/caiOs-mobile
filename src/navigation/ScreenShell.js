import { useState, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import Text from '../Text.js';
import { ScrollView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSettings } from '../settings.jsx';
import ModalScreen from '../screens/Modal.js';
import { META, NAV } from '../data.js';
import { AppProvider } from '../AppContext.js';
import { ROUTE_TAB_MAP, ROUTE_SCREEN_NAMES } from './routes.js';

// Envelope de cada tela: cabecalho (kicker + titulo + descricao) e o Modal de
// cadastro compartilhado — equivalente ao <main> do App.jsx web.
//
// O Background NAO vive aqui: ele e montado uma unica vez em App.js, acima do
// navigator. Uma copia por tela significava ~780 nos animados apos visitar as
// 16 rotas.
export default function ScreenShell({ routeId, Screen, navigation }) {
  const st = useSettings();
  const insets = useSafeAreaInsets();
  const [modal, setModal] = useState(null);
  const [assistantPrompt, setAssistantPrompt] = useState('');

  const go = useCallback((id, opts = {}) => {
    if (opts.assistantPrompt !== undefined) setAssistantPrompt(opts.assistantPrompt);
    navigation.navigate(ROUTE_SCREEN_NAMES[id]);
  }, [navigation]);

  const openModal = useCallback((options = {}) => {
    const defaultTab = options.defaultTab ?? ROUTE_TAB_MAP[routeId] ?? 1;
    setModal({ kind: 'add', defaultTab, ...options });
  }, [routeId]);

  // Swipe horizontal troca de rota na direcao do gesto (esquerda = proxima).
  // Ativa so com deslocamento X claramente maior que o Y, para nao roubar o
  // scroll vertical nem os carrosseis horizontais internos.
  //
  // A ordem seguida e a do NAV (a mesma que a tab bar mostra), NAO a ordem
  // numerica dos ids: no NAV, Configuracoes (12) e o ULTIMO item, depois de
  // Espiritualidade (13), Filmes (14) e Livros (15). Ordenar por id levava de
  // Inteligencia (11) direto para Configuracoes (12), fora da ordem visivel.
  const order = useMemo(
    () => NAV.map(([, id]) => id).filter(id => !(id === 11 && st.hides('osint'))),
    [st]
  );

  const goRelative = useCallback(dir => {
    const idx = order.indexOf(routeId);
    if (idx === -1) return;
    const next = idx + dir;
    if (next < 0 || next >= order.length) return;
    navigation.navigate(ROUTE_SCREEN_NAMES[order[next]]);
  }, [routeId, navigation, order]);

  const swipe = useMemo(() => Gesture.Pan()
    .activeOffsetX([-24, 24])
    .failOffsetY([-18, 18])
    .onEnd(e => {
      'worklet';
      if (Math.abs(e.translationX) < 55 || Math.abs(e.translationX) < Math.abs(e.translationY)) return;
      scheduleOnRN(goRelative, e.translationX < 0 ? 1 : -1);
    }), [goRelative]);

  const appValue = useMemo(
    () => ({ go, openModal, assistantPrompt, setAssistantPrompt }),
    [go, openModal, assistantPrompt]
  );

  const meta = META[routeId] || META[0];
  const locked = routeId === 11 && st.hides('osint');

  return (
    <AppProvider value={appValue}>
      <GestureDetector gesture={swipe}>
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: insets.bottom + 110 }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            <Animated.View entering={FadeIn.duration(220)} style={{ marginBottom: 22 }}>
              <Text style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: st.palette.ac2Alpha(0.75), fontWeight: '600', marginBottom: 8 }}>
                {meta[0]}
              </Text>
              <Text style={{ fontSize: 32, fontWeight: '600', color: '#fff' }}>
                {routeId === 0 ? st.greeting() : meta[1]}
              </Text>
              <Text style={{ fontSize: 13.5, color: 'rgba(255,255,255,.6)', marginTop: 8 }}>{meta[2]}</Text>
            </Animated.View>

            {locked ? (
              <View style={{ maxWidth: 520, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', backgroundColor: st.palette.acdAlpha(0.18), padding: 26 }}>
                <Text style={{ fontSize: 11.5, letterSpacing: 1.5, textTransform: 'uppercase', color: st.palette.ac2, fontWeight: '700' }}>modo trabalho ativo</Text>
                <Text style={{ fontSize: 20, fontWeight: '600', color: '#fff', marginTop: 12, marginBottom: 8 }}>Esta rota está oculta</Text>
                <Text style={{ fontSize: 13.5, opacity: .6, color: '#fff' }}>nada foi apagado. desligue o Modo Trabalho em Configurações para ver os alvos, as varreduras e os achados.</Text>
              </View>
            ) : (
              <Screen />
            )}
          </ScrollView>

          {modal && <ModalScreen modal={modal} onClose={() => setModal(null)} go={go} />}
        </View>
      </GestureDetector>
    </AppProvider>
  );
}
