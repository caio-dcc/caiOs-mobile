import 'react-native-gesture-handler';
import React, { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { SettingsProvider } from './src/settings.jsx';
import DrawerContent from './src/navigation/DrawerContent.js';
import ScreenShell from './src/navigation/ScreenShell.js';
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

const Drawer = createDrawerNavigator();

SplashScreen.preventAutoHideAsync().catch(() => {});

function withShell(routeId, Screen) {
  return function Wrapped({ navigation }) {
    return <ScreenShell routeId={routeId} Screen={Screen} navigation={navigation} />;
  };
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    VT323: require('./assets/fonts/VT323-Regular.ttf'),
    Orbitron: require('./assets/fonts/Orbitron-Regular.ttf'),
    Quantico: require('./assets/fonts/Quantico-Regular.ttf')
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) await SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <SettingsProvider>
          <NavigationContainer>
            <Drawer.Navigator
              screenOptions={{ headerShown: false, drawerType: 'front', drawerStyle: { width: 250 } }}
              drawerContent={props => <DrawerContent {...props} />}
              initialRouteName={ROUTE_SCREEN_NAMES[0]}
            >
              {Object.entries(SCREENS).map(([id, Screen]) => (
                <Drawer.Screen key={id} name={ROUTE_SCREEN_NAMES[id]} component={withShell(Number(id), Screen)} />
              ))}
            </Drawer.Navigator>
          </NavigationContainer>
          <StatusBar style="light" />
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
