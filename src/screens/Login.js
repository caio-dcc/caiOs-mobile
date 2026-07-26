import { useState, useRef, useEffect } from 'react';
import { View, Pressable, ActivityIndicator, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withRepeat, Easing, FadeIn } from 'react-native-reanimated';
import Text from '../Text.js';
import TextInput from '../TextInput.js';
import Background from '../Background.js';
import { useSettings } from '../settings.jsx';
import { login } from '../api.js';
import { saveSession } from '../auth.js';

// Tela de senha no espirito do greeter do Linux Mint: fundo animado do app,
// um campo unico centralizado, e o foco todo no input.
export default function Login({ onAuthenticated }) {
  const { palette } = useSettings();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const shake = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    // respiracao suave do halo do avatar
    pulse.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const pulseStyle = useAnimatedStyle(() => ({ opacity: 0.35 + pulse.value * 0.4 }));

  const submit = async () => {
    if (busy || !password.trim()) return;
    Keyboard.dismiss();
    setBusy(true);
    setError(null);
    try {
      const data = await login(password.trim());
      await saveSession({ token: data.token, expiresAt: data.expiresAt });
      onAuthenticated();
    } catch (e) {
      // o login() já normaliza a mensagem; o fallback evita que qualquer outro
      // erro (rede, parse) despeje detalhe do servidor na tela
      setError(e.message || 'Não foi possível entrar.');
      setPassword('');
      // sacudida horizontal, como o greeter do Mint em senha errada
      shake.value = withSequence(
        withTiming(-9, { duration: 55 }), withTiming(9, { duration: 55 }),
        withTiming(-7, { duration: 55 }), withTiming(7, { duration: 55 }),
        withTiming(0, { duration: 55 })
      );
      inputRef.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Background />

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28, paddingBottom: insets.bottom + 40 }}>
        <Animated.View entering={FadeIn.duration(420)} style={{ width: '100%', maxWidth: 340, alignItems: 'center' }}>

          {/* "avatar" do greeter: inicial dentro de um circulo com halo neon */}
          <View style={{ width: 92, height: 92, alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
            <Animated.View
              style={[{
                position: 'absolute', width: 92, height: 92, borderRadius: 999,
                backgroundColor: palette.ac, shadowColor: palette.ac
              }, pulseStyle]}
            />
            <View style={{
              width: 78, height: 78, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,.55)', borderWidth: 1.5, borderColor: palette.ac2Alpha(0.6)
            }}>
              <Text style={{
                fontSize: 34, fontWeight: '700', color: '#fff',
                textShadowColor: palette.ac, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16
              }}>c</Text>
            </View>
          </View>

          <Text style={{ fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 4 }}>caiOs</Text>
          <Text style={{ fontSize: 13.5, color: 'rgba(255,255,255,.55)', marginBottom: 26, textAlign: 'center' }}>
            sessão protegida · informe a senha para continuar
          </Text>

          <Animated.View style={[{ width: '100%' }, shakeStyle]}>
            <TextInput
              ref={inputRef}
              value={password}
              onChangeText={t => { setPassword(t); if (error) setError(null); }}
              onSubmitEditing={submit}
              placeholder="senha"
              placeholderTextColor="rgba(255,255,255,.35)"
              secureTextEntry
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              editable={!busy}
              // fonte do sistema: a VT323 nao tem o glifo "•" do mascaramento
              systemFont
              style={{
                width: '100%', textAlign: 'center', fontSize: 18, color: '#fff',
                paddingVertical: 14, paddingHorizontal: 18, borderRadius: 14,
                backgroundColor: 'rgba(0,0,0,.5)',
                borderWidth: 1.5,
                borderColor: error ? 'rgba(255,120,120,.8)' : palette.ac2Alpha(0.45),
                letterSpacing: 3
              }}
            />
          </Animated.View>

          {/* altura reservada para a mensagem nao empurrar o layout */}
          <View style={{ minHeight: 40, justifyContent: 'center', paddingTop: 10 }}>
            {error ? (
              <Text style={{ fontSize: 12.5, color: '#ff9d9d', textAlign: 'center' }}>{error}</Text>
            ) : null}
          </View>

          <Pressable
            onPress={submit}
            disabled={busy || !password.trim()}
            style={{
              width: '100%', alignItems: 'center', justifyContent: 'center',
              paddingVertical: 13, borderRadius: 14,
              backgroundColor: password.trim() ? palette.acDeep : 'rgba(255,255,255,.06)',
              borderWidth: 1, borderColor: password.trim() ? palette.ac2Alpha(0.5) : 'transparent',
              opacity: busy ? 0.7 : 1
            }}
          >
            {busy
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Entrar</Text>}
          </Pressable>

        </Animated.View>
      </View>
    </View>
  );
}
