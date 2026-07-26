import React from 'react';
import { View, Pressable } from 'react-native';
import Text from '../Text.js';
import { font } from '../ui.jsx';

export default function EmptyState({ title, subtitle, ctaLabel, onPress }) {
  return (
    <View style={{ paddingVertical: 40, alignItems: 'center' }}>
      <Text style={{ fontFamily: font.display, fontSize: 22, color: '#fff', marginBottom: 8, textAlign: 'center' }}>{title}</Text>
      <Text style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.7)', marginBottom: 18, textAlign: 'center' }}>{subtitle}</Text>
      {ctaLabel && (
        <Pressable onPress={onPress}>
          <Text style={{ color: '#fff', fontFamily: font.display, fontSize: 20, fontWeight: '700' }}>{ctaLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
