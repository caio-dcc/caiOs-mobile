import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { SettingsProvider } from './src/settings.jsx';
import { FONT_ASSETS } from './src/fonts.js';
import { loadSession } from './src/auth.js';
import { setUnauthorizedHandler } from './src/api.js';
import Login from './src/screens/Login.js';
import FloatingTabBar from './src/navigation/FloatingTabBar.js';
import ScreenShell from './src/navigation/ScreenShell.js';
import Background from './src/Background.js';
import { ROUTE_SCREEN_NAMES } from './src/navigation/routes.js';

import Inicio from './src/screens/Inicio.js';
import Assistente from './src/screens/Assistente.js';
import Financeiro from './src/screens/Financeiro.js';
import Social from './src/screens/Social.js';
import Anotacoes from './src/screens/Anotacoes.js';
import Eventos from './src/screens/Eventos.js';
import Itens from './src/screens/Itens.js';
import Pessoas from './src/screens/Pessoas.js';
import Memoria from './src/screens/Memoria.js';
import Bucket from './src/screens/Bucket.js';
import Calendario from './src/screens/Calendario.js';
import Inteligencia from './src/screens/Inteligencia.js';
import Configuracoes from './src/screens/Configuracoes.js';
import Espiritualidade from './src/screens/Espiritualidade.js';
import Filmes from './src/screens/Filmes.js';
import Livros from './src/screens/Livros.js';

const SCREENS = {
  0: Inicio, 1: Assistente, 2: Financeiro, 3: Social, 4: Anotacoes, 5: Eventos, 6: Itens,
  7: Pessoas, 8: Memoria, 9: Bucket, 10: Calendario, 11: Inteligencia, 12: Configuracoes,
  13: Espiritualidade, 14: Filmes, 15: Livros
};

const Tab = createBottomTabNavigator();

SplashScreen.preventAutoHideAsync().catch(() => {});

// Um componente estavel por rota (fora do render), senao o navigator remonta a
// tela inteira a cada re-render do App.
const WRAPPED = Object.fromEntries(
  Object.entries(SCREENS).map(([id, Screen]) => {
    const routeId = Number(id);
    const Wrapped = ({ navigation }) => (
      <ScreenShell routeId={routeId} Screen={Screen} navigation={navigation} />
    );
    Wrapped.displayName = `Shell(${ROUTE_SCREEN_NAMES[id]})`;
    return [id, Wrapped];
  })
);

const SCREEN_ORDER = Object.keys(SCREENS).map(Number);

const SCREEN_OPTIONS = {
  headerShown: false,
  // fundo transparente em todas as camadas do navigator, para o Background
  // unico (montado no Gate) aparecer atraves das telas
  sceneStyle: { backgroundColor: 'transparent' },
  lazy: true,
  // cross-fade nativo do bottom-tabs v7 na troca de rota (equivale a transicao
  // de fade que o App.jsx web faz com a classe .fmv-fade)
  animation: 'fade',
  transitionSpec: { animation: 'timing', config: { duration: 220 } },
  detachInactiveScreens: true
};

// Gate de sessao: enquanto nao houver token valido, mostra a tela de senha.
// Fica DENTRO do SettingsProvider (o Login usa a paleta) e fora do navigator.
function Gate() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  // token de 6h guardado no AsyncStorage: se ainda vale, entra direto
  useEffect(() => {
    loadSession().then(s => { setAuthed(!!s); setChecking(false); });
  }, []);

  // qualquer 401 vindo da API derruba para a tela de senha
  useEffect(() => {
    setUnauthorizedHandler(() => setAuthed(false));
    return () => setUnauthorizedHandler(null);
  }, []);

  if (checking) return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  if (!authed) return <Login onAuthenticated={() => setAuthed(true)} />;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* UMA instancia do shader, atras de tudo. Antes era uma por tela. */}
      <Background />
      <NavigationContainer theme={NAV_THEME}>
        <Tab.Navigator
          screenOptions={SCREEN_OPTIONS}
          tabBar={props => <FloatingTabBar {...props} />}
          initialRouteName={ROUTE_SCREEN_NAMES[0]}
        >
          {SCREEN_ORDER.map(id => (
            <Tab.Screen key={id} name={ROUTE_SCREEN_NAMES[id]} component={WRAPPED[id]} />
          ))}
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  // Mesmas 3 familias do web (VT323, Quantico, Fira Code), com os arquivos bold
  // que o Android precisa. Ver src/fonts.js.
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      if (fontError) console.warn('Font load error:', fontError);
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <Gate />
          <StatusBar style="light" />
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Sem isto o NavigationContainer pinta um fundo branco/escuro opaco por cima
// do Background.
const NAV_THEME = {
  dark: true,
  colors: {
    primary: '#fff',
    background: 'transparent',
    card: 'transparent',
    text: '#fff',
    border: 'transparent',
    notification: '#fff'
  },
  fonts: {
    regular: { fontFamily: 'VT323', fontWeight: '400' },
    medium: { fontFamily: 'VT323', fontWeight: '500' },
    bold: { fontFamily: 'VT323', fontWeight: '700' },
    heavy: { fontFamily: 'VT323', fontWeight: '900' }
  }
};
