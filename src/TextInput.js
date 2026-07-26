import { forwardRef } from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { useSettings } from './settings.jsx';
import { familyFor, scaleFor } from './fonts.js';

// Mesmo papel do <Text> global (src/Text.js), para campos de formulario: em RN o
// TextInput tambem nao herda fonte, entao os 18 campos do app apareciam em
// Roboto enquanto o resto da tela usava VT323.
//
// forwardRef porque `ref` nao passa por props em function component — sem isso o
// .focus() da tela de login (e qualquer outro) seria silenciosamente ignorado.
//
// `systemFont`: escapa para a fonte do sistema. Necessario em campos de senha —
// o secureTextEntry mascara com "•" (U+2022), glifo que a VT323 nao tem, e o
// resultado sao "?" no lugar dos pontos. Nao da para fazer isso so com
// `fontFamily: undefined` no style, porque este wrapper reimpoe a familia.
export default forwardRef(function TextInput({ style, systemFont, ...rest }, ref) {
  const { globalFont } = useSettings();

  if (systemFont) {
    return <RNTextInput ref={ref} {...rest} style={style} />;
  }

  const flat = flatten(style);
  const weight = flat.fontWeight;
  const isBold = weight === 'bold' || (weight && parseInt(weight, 10) >= 600);

  const base = { fontFamily: familyFor(globalFont, isBold) };
  if (isBold) base.fontWeight = 'normal';

  const scale = scaleFor(globalFont);
  if (scale !== 1 && typeof flat.fontSize === 'number') {
    base.fontSize = Math.round(flat.fontSize * scale * 10) / 10;
  }

  return <RNTextInput ref={ref} {...rest} style={[base, style, flat.fontFamily ? { fontFamily: flat.fontFamily } : null]} />;
});

function flatten(style) {
  if (!style) return {};
  if (Array.isArray(style)) {
    return style.reduce((acc, s) => Object.assign(acc, flatten(s)), {});
  }
  return style;
}
