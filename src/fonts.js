// ── Fontes: paridade com o web ──
//
// O web (react/index.html) carrega VT323, Quantico e Fira Code, e aplica a fonte
// global com CSS `* { font-family: ... !important }`, trocada pelas classes
// `.fmv-font-quantico` / `.fmv-font-firacode` conforme o setting `globalFont`.
//
// RN nao tem heranca de fonte: cada <Text> resolve a sua isoladamente e, sem
// `fontFamily`, cai na fonte de sistema (Roboto no Android). Por isso:
//   1. este modulo e a fonte unica de verdade sobre nomes de familia;
//   2. `src/Text.js` embute a familia default em todo texto do app, imitando a
//      heranca do CSS;
//   3. `globalFont` troca a familia em runtime, como as classes do web.
//
// Nota: o web tambem pede 'Orbitron' em App.jsx, mas nunca a carrega no
// index.html — e o `!important` do VT323 sobrescreve o inline style de qualquer
// forma. Ou seja, o titulo no web e VT323, nao Orbitron. O mobile carregava
// Orbitron sem usar; foi removida.

// Mapa dos arquivos .ttf -> nome da familia registrado no expo-font.
export const FONT_ASSETS = {
  VT323: require('../assets/fonts/VT323-Regular.ttf'),
  Quantico: require('../assets/fonts/Quantico-Regular.ttf'),
  'Quantico-Bold': require('../assets/fonts/Quantico-Bold.ttf'),
  FiraCode: require('../assets/fonts/FiraCode-Regular.ttf'),
  'FiraCode-Bold': require('../assets/fonts/FiraCode-Bold.ttf')
};

// As 3 opcoes do seletor "Fonte Global do Sistema" em Configuracoes, iguais ao web.
export const FONT_CHOICES = [
  ['default', 'Padrão (VT323 / Retrô)'],
  ['quantico', 'Quantico (Cyber)'],
  ['firacode', 'Fira Code (Dev)']
];

// Em RN, fontWeight nao sintetiza bold em fonte customizada no Android: e preciso
// apontar para o arquivo bold. VT323 tem peso unico, entao repete.
const FAMILIES = {
  default: { regular: 'VT323', bold: 'VT323' },
  quantico: { regular: 'Quantico', bold: 'Quantico-Bold' },
  firacode: { regular: 'FiraCode', bold: 'FiraCode-Bold' }
};

export function familyFor(globalFont, bold = false) {
  const set = FAMILIES[globalFont] || FAMILIES.default;
  return bold ? set.bold : set.regular;
}

// VT323 e desenhada pequena; nas outras o mesmo fontSize parece maior. Este
// fator mantem o ritmo visual proximo entre as 3 opcoes.
export function scaleFor(globalFont) {
  return globalFont === 'default' || !globalFont ? 1 : 0.86;
}
