import { Text as RNText } from 'react-native';
import { useSettings } from './settings.jsx';
import { familyFor, scaleFor } from './fonts.js';

// <Text> do app: aplica a fonte global em TODO texto, imitando a heranca do CSS
// web (`* { font-family: ... !important }`). Sem isto, os ~280 <Text> do app que
// nao declaram fontFamily caem na fonte de sistema do Android (Roboto) — era a
// causa de "varias fontes diferentes aparecendo na tela".
//
// Regras:
//  - a familia vem do setting `globalFont` (default | quantico | firacode);
//  - `fontWeight >= 600` resolve para o ARQUIVO bold, porque no Android o RN nao
//    sintetiza bold em fonte customizada (ficaria igual ao regular);
//  - um `fontFamily` explicito no style ainda ganha, para casos especificos;
//  - `fontSize` recebe um leve fator de escala por familia (ver scaleFor).
export default function Text({ style, ...rest }) {
  const { globalFont } = useSettings();

  const flat = flatten(style);
  const weight = flat.fontWeight;
  const isBold = weight === 'bold' || (weight && parseInt(weight, 10) >= 600);

  const base = { fontFamily: familyFor(globalFont, isBold) };

  // O peso e expresso pela familia, nao pelo fontWeight — deixar o fontWeight
  // junto faz o Android tentar sintetizar por cima e borrar o glifo.
  if (isBold) base.fontWeight = 'normal';

  const scale = scaleFor(globalFont);
  if (scale !== 1 && typeof flat.fontSize === 'number') {
    base.fontSize = Math.round(flat.fontSize * scale * 10) / 10;
  }

  return <RNText {...rest} style={[base, style, flat.fontFamily ? { fontFamily: flat.fontFamily } : null]} />;
}

// style pode ser objeto, array ou aninhado; precisamos ler fontWeight/fontSize/
// fontFamily do resultado final.
function flatten(style) {
  if (!style) return {};
  if (Array.isArray(style)) {
    return style.reduce((acc, s) => Object.assign(acc, flatten(s)), {});
  }
  return style;
}
