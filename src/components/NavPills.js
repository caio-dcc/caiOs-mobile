import React, { useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { NAV } from '../data.js';
import { useSettings } from '../settings.jsx';
import Particles from '../Particles.js';

// Sidebar/drawer vertical com pilula de selecao — equivalente RN do NavPills.jsx web.
export default function NavPills({ route, onGo }) {
  const st = useSettings();
  const visibleNav = NAV.filter(([_, id]) => !(id === 11 && st.hides('osint')));

  return (
    <View style={{ width: '100%' }}>
      {visibleNav.map(([labelText, id]) => {
        const isSelected = id === route;
        const particleRef = useRef(null);
        return (
          <Pressable
            key={id}
            onPress={() => {
              if (id !== route) particleRef.current?.burst();
              onGo(id);
            }}
            style={{
              borderRadius: 12,
              paddingVertical: 9,
              paddingHorizontal: 14,
              marginBottom: 5,
              backgroundColor: isSelected ? st.palette.acdAlpha(0.4) : 'transparent',
              position: 'relative'
            }}
          >
            <Text style={{
              fontSize: 17,
              fontWeight: isSelected ? '700' : '500',
              color: isSelected ? '#ffffff' : 'rgba(255,255,255,.65)'
            }}>
              {labelText}
            </Text>
            <Particles color={st.palette.ac} ref={particleRef} />
          </Pressable>
        );
      })}
    </View>
  );
}
