import { PEOPLE } from '../data.js';

// PEOPLE é tupla: [nome, sub, ondeConheci, últimoContato, nAnotações, confiança, proximidade, resumo, flags, aniversário, signo, dossiê]
export function peopleView(hides) {
  return PEOPLE.map((p, i) => ({
    name: p[0], sub: p[1], from: p[2], last: p[3], noteCount: String(p[4]),
    trust: p[5], prox: p[6], note: hides('people') ? '•••••• ••••• •••••• ••• ••••••' : p[7],
    flags: p[8], birth: p[9], sign: p[10], dossier: hides('people') ? '••••••' : p[11],
    initials: p[0].replace(/"/g, '').split(' ').filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join(''),
    delay: (i * 45) + 'ms'
  }));
}
