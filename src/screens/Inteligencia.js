import React, { useState, useEffect } from 'react';
import { View, Pressable, Image, ScrollView } from 'react-native';
import TextInput from '../TextInput.js';
import Text from '../Text.js';
import { useSettings } from '../settings.jsx';
import { useApp } from '../AppContext.js';
import { api } from '../api.js';
import { OSINT, OSINTFINDINGS, INTEL_SOURCES, INTEL_MODES } from '../data.js';
import { ChipRow, Slider, GridRow, font } from '../ui.jsx';

export default function Inteligencia() {
  const st = useSettings();
  const { palette } = st;
  const { openModal } = useApp();
  const [cfg, setCfg] = useState(false);
  const [sources, setSources] = useState([0, 1, 2]);
  const [mode, setMode] = useState(0);
  const [limits, setLimits] = useState([55, 70]);
  const [cameras, setCameras] = useState([]);
  const [loadingCameras, setLoadingCameras] = useState(false);
  const [showCamerasView, setShowCamerasView] = useState(false);

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    setLoadingCameras(true);
    try {
      const data = await api.get('/v1/cameras/proximas?lat=-22.9068&lng=-43.1729&raio=15');
      if (Array.isArray(data)) {
        setCameras(data);
      }
    } catch (e) {
      console.error('Erro ao buscar câmeras mobile:', e);
    } finally {
      setLoadingCameras(false);
    }
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
        <TextInput
          placeholder="alvo: nome, e-mail, @usuário, telefone ou domínio"
          placeholderTextColor="rgba(255,255,255,.4)"
          style={{ flexGrow: 1, minWidth: 220, borderRadius: 14, borderWidth: 1, borderColor: palette.ac2Alpha(0.25), backgroundColor: palette.acdAlpha(0.28), color: '#fff', fontSize: 14, paddingVertical: 13, paddingHorizontal: 15 }}
        />
        <Pressable><Text style={{ color: '#fff', fontFamily: font.body, fontSize: 16, fontWeight: '700', paddingVertical: 13, paddingHorizontal: 10 }}>Varrer</Text></Pressable>
        <Pressable onPress={() => setCfg(v => !v)} style={{ width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 20, color: '#fff' }}>⚙</Text>
        </Pressable>
      </View>

      {cfg && (
        <View style={{ borderRadius: 18, borderWidth: 1, borderColor: palette.ac2Alpha(0.18), backgroundColor: palette.acdAlpha(0.18), padding: 18, marginBottom: 18 }}>
          <GridRow min={240} gap={20} cols={1}>
            <View>
              <Text style={{ fontFamily: font.display, fontSize: 13, marginBottom: 11, color: '#fff' }}>Fontes consultadas</Text>
              <ChipRow options={INTEL_SOURCES} value={sources} onPick={i => setSources(s => (s.includes(i) ? s.filter(k => k !== i) : s.concat(i)))} />
            </View>
            <View>
              <Text style={{ fontFamily: font.display, fontSize: 13, marginBottom: 11, color: '#fff' }}>Modo de coleta</Text>
              <ChipRow options={INTEL_MODES} value={mode} onPick={setMode} />
              <Text style={{ fontSize: 12, opacity: 0.55, marginTop: 14, color: '#fff' }}>passivo não toca no alvo: só lê o que já é público e indexado.</Text>
            </View>
            <View>
              <Text style={{ fontFamily: font.display, fontSize: 13, marginBottom: 11, color: '#fff' }}>Limites</Text>
              <View style={{ gap: 14 }}>
                {[['Profundidade da varredura', v => (v < 34 ? 'rasa' : v < 67 ? 'média' : 'profunda')], ['Corte de confiança', v => v + '%']].map(([l, fmt], i) => (
                  <View key={l}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 12, color: '#fff' }}>{l}</Text>
                      <Text style={{ fontSize: 12, opacity: 0.55, color: '#fff' }}>{fmt(limits[i])}</Text>
                    </View>
                    <Slider value={limits[i]} onChange={v => setLimits(a => a.map((x, k) => (k === i ? v : x)))} />
                  </View>
                ))}
              </View>
            </View>
          </GridRow>
        </View>
      )}

      <View style={{ gap: 12, marginBottom: 26 }}>
        <Text style={{ fontFamily: font.display, fontSize: 16, fontWeight: '600', color: palette.acLite }}>Ferramentas Principais de Inteligência</Text>
        {OSINT.slice(0, 3).map((t, i) => (
          <Pressable
            key={t[0]}
            onPress={() => openModal({ kind: 'osint', i })}
            style={{ borderRadius: 18, borderWidth: 1, borderColor: palette.ac2Alpha(0.2), backgroundColor: palette.acdAlpha(0.22), padding: 16, gap: 10 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 17, fontWeight: '600', color: '#fff' }}>{t[0]}</Text>
              <Text style={{
                fontSize: 10.5, textTransform: 'uppercase', fontWeight: '700', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 7,
                borderWidth: 1, borderColor: t[4] === 'ativo' ? 'rgba(255,160,160,.4)' : palette.ac2Alpha(0.35),
                color: t[4] === 'ativo' ? '#ffb3b3' : palette.acLite
              }}>{t[4]}</Text>
            </View>
            <Text style={{ fontSize: 13.5, opacity: 0.65, color: '#fff' }}>{t[1]}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <Text style={{ fontSize: 12.5, opacity: 0.5, color: '#fff' }}>entrada: {t[2]}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: t[3] === 'pronto' ? 'rgba(255,255,255,.5)' : '#8fe0b0' }}>{t[3]}</Text>
              <Text style={{ color: '#fff', fontFamily: font.body, fontSize: 14, fontWeight: '700' }}>Executar ➔</Text>
            </View>
          </Pressable>
        ))}

        {/* Card de Câmeras Públicas no Mobile */}
        <Pressable
          onPress={() => setShowCamerasView(v => !v)}
          style={{ borderRadius: 18, borderWidth: 1, borderColor: palette.ac2Alpha(0.4), backgroundColor: palette.acdAlpha(0.32), padding: 16, gap: 8 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>📹 Câmeras de Trânsito RJ</Text>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#7ce0a8', backgroundColor: 'rgba(124, 224, 168, 0.2)', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6 }}>
              AO VIVO ({cameras.length})
            </Text>
          </View>
          <Text style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)' }}>
            Feeds e monitoramento de trânsito em tempo real nas principais vias do Rio.
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: palette.acLite, marginTop: 4 }}>
            {showCamerasView ? 'Ocultar Câmeras ▲' : 'Visualizar Câmeras ▼'}
          </Text>
        </Pressable>

        {showCamerasView && (
          <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {loadingCameras ? (
                <Text style={{ color: palette.acLite, fontSize: 13 }}>Carregando câmeras de trânsito...</Text>
              ) : (
                cameras.map(cam => (
                  <View key={cam.id} style={{ width: 220, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, gap: 8 }}>
                    <Image source={{ uri: cam.imageUrl }} style={{ width: '100%', height: 120, borderRadius: 10 }} />
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#fff' }} numberOfLines={2}>{cam.nome}</Text>
                    <Text style={{ fontSize: 11, color: palette.acLite }}>📍 {cam.distanciaKm} km de distância</Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        )}
      </View>

      <Text style={{ fontFamily: font.display, fontSize: 14, marginBottom: 12, color: '#fff' }}>Achados recentes</Text>
      <View style={{ gap: 10 }}>
        {OSINTFINDINGS && OSINTFINDINGS.length > 0 ? (
          OSINTFINDINGS.map((f, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,.06)' }}>
              <Text style={{ fontSize: 10.5, textTransform: 'uppercase', fontWeight: '700', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 7, backgroundColor: palette.acdAlpha(0.5), color: palette.acLite }}>{f.tool}</Text>
              <Text style={{ flex: 1, fontSize: 13.5, color: '#fff' }}>{st.mask(f.body, 'osint')}</Text>
              <Text style={{ fontSize: 12, opacity: 0.55, color: '#fff' }}>{f.source}</Text>
              <Text style={{ fontSize: 12, color: f.confColor }}>confiança {f.conf}</Text>
            </View>
          ))
        ) : (
          <View style={{ padding: 24, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
            <Text style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>Nenhum achado registrado na inteligência.</Text>
            <Pressable onPress={() => openModal({ kind: 'add' })}>
              <Text style={{ color: '#fff', fontFamily: font.display, fontSize: 16 }}>+ Registrar Achado</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
