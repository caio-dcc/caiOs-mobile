// Dados estáticos / mock — espelha react/src/data.js. Ver BACKEND.md para o contrato de API pretendido.

// [rótulo, id da rota] — a ordem de exibição é independente do id da rota
export const NAV = [
  ['⌂ Início', 0], ['⌘ Assistente', 1], ['◈ Financeiro', 2], ['☍ Social', 3], ['✎ Anotações', 4],
  ['☌ Eventos', 5], ['❖ Itens', 6], ['⚥ Pessoas', 7], ['☤ Memória', 8], ['⎘ Bucket', 9],
  ['⚏ Calendário', 10], ['☉ Inteligência', 11], ['☯ Espiritualidade', 13], ['⌬ Filmes', 14], ['⚎ Livros', 15], ['⚙ Configurações', 12]
];

export const SWATCHES = [
  ['#5b7cff', 'azul padrão'], ['#e62e5c', 'vermelho rubi'], ['#4f9dff', 'azul céu'], ['#7c8cff', 'índigo'], ['#a97cff', 'violeta'],
  ['#e07cc3', 'magenta'], ['#ff8f6b', 'âmbar quente'], ['#5bd6a8', 'verde terminal'], ['#d6c15b', 'ouro velho']
];

export const PROMPT_PRESETS = [
  ['Analista frio', 'Responda como analista de dados do meu próprio histórico. Sem consolo, sem rodeio: número, padrão, divergência. Cite sempre a origem do dado e a data. Quando não houver registro suficiente, diga que não há — nunca preencha lacuna com suposição.'],
  ['Confidente', 'Fale comigo como alguém que me conhece há anos e não tem medo de me contrariar. Lembre do que eu disse em outras semanas. Pergunte antes de concluir. Prefira uma pergunta certeira a três parágrafos de resumo.'],
  ['Estrategista', 'Trate cada pessoa e cada gasto como movimento num tabuleiro. Aponte incentivo, dependência e risco antes de opinar. Sempre termine com a próxima ação concreta e o custo dela.'],
  ['Zero ruído', 'Máximo de 4 linhas. Sem introdução, sem repetir a pergunta, sem oferecer ajuda extra. Só o que eu preciso saber agora.']
];

export const WORK_RULES = [
  ['money', 'Valores financeiros', 'R$ ••••'],
  ['people', 'Dossiês e anotações de pessoas', 'texto oculto'],
  ['audit', 'Geolocalização, IP e dispositivo', 'na Memória'],
  ['osint', 'Rota Inteligência inteira', 'fica trancada'],
  ['bucket', 'Nomes de arquivos do Bucket', 'miniatura fica']
];

export const OSINT = [
  ['Lemmit API', 'busca posts e comunidades espelhadas do Lemmit por termo ou autor', 'termo · @autor', 'desconectado', 'passivo', 'termo, comunidade ou @autor', 'a Lemmit API responde em JSON público; cada consulta entra na Memória com termo, hora e IP de saída.', []],
  ['Câmeras públicas próximas', 'feeds abertos de trânsito e praças num raio da sua localidade', 'raio em km', 'desconectado', 'passivo', 'raio em km', 'só feeds declaradamente públicos.', []],
  ['Sherlock', 'script de username em 400+ sites, roda local e devolve só os hits', 'username', 'desconectado', 'ativo', 'username sem @', 'sherlock consulta os sites direto.', []],
  ['Holehe', 'descobre em quais serviços um e-mail tem conta, sem enviar e-mail', 'e-mail', 'desconectado', 'passivo', 'e-mail do alvo', 'holehe usa fluxos de recuperação de senha.', []],
  ['Vazamentos de credencial', 'cruza e-mail e senha em bases públicas de leak', 'e-mail · domínio', '0 achados', 'passivo', 'e-mail ou domínio', 'só hashes e metadados de vazamentos já públicos.', []],
  ['Shodan / dispositivos expostos', 'serviços e câmeras IP abertos num IP, faixa ou cidade', 'ip · cidade', 'desconectado', 'passivo', 'ip, faixa CIDR ou cidade', 'consulta o índice do Shodan.', []],
  ['theHarvester', 'e-mails, subdomínios e hosts de um domínio via buscadores', 'domínio', 'desconectado', 'passivo', 'domínio alvo', 'coleta indireta por buscadores.', []],
  ['Imagem reversa & EXIF', 'rosto, foto de perfil e metadados escondidos no arquivo', 'imagem', '0 achados', 'ativo', 'arraste a imagem ou cole a url', 'a busca reversa envia a imagem pra terceiros.', []],
  ['Registros públicos BR', 'processos, sócios de empresa e diário oficial', 'nome · CPF/CNPJ', '0 achados', 'passivo', 'nome completo, CPF ou CNPJ', 'fontes oficiais e abertas.', []],
  ['Domínios & WHOIS', 'registro, DNS histórico, certificados e subdomínios', 'domínio', 'desconectado', 'passivo', 'domínio ou url', 'whois e transparência de certificados.', []],
  ['Arquivo da web', 'versões antigas de páginas, bios e perfis apagados', 'url', 'desconectado', 'passivo', 'url ou perfil', 'o Wayback guarda o que o alvo já apagou.', []],
  ['Grafo de relações', 'cruza achados e pessoas do seu cadastro num mapa de ligações', 'alvo · pessoa', '0 nós', 'passivo', 'alvo ou pessoa do cadastro', 'o grafo só liga o que já está registrado.', []]
];

export const META = {
  0: ['sábado, 25 de julho', 'Painel de Registro', 'tudo que aconteceu hoje, cruzado: gasto, pessoa, item, foto e anotação.'],
  1: ['conversa com contexto total', 'Assistente', 'ela lê tudo que você registrou. use @ pra apontar pessoa, item, evento, anotação ou dia.'],
  2: ['julho 2026', 'Financeiro', 'gasto do dia sempre atrelado a um evento ou a uma pessoa. o resto é ruído.'],
  3: ['contato de hoje', 'Social', 'cada pessoa que cruzou seu dia espera uma anotação. a análise vem depois.'],
  4: ['caderno', 'Anotações', 'texto solto que se amarra em pessoa, evento, item ou dia.'],
  5: ['agenda', 'Eventos', 'o que aconteceu e o que vem — com quem, onde e quanto custou.'],
  6: ['inventário', 'Itens', 'o que você possui e o que saiu de casa com você hoje.'],
  7: ['cadastro', 'Pessoas', 'quem é, o que faz, e de onde você conhece.'],
  8: ['auditoria zero trust', 'Memória', 'onde o dado foi editado, quando, por qual dispositivo e de onde.'],
  9: ['arquivo por data', 'Bucket', 'documento e foto guardados pelo dia, atrelados a evento, pessoa e anotação.'],
  10: ['julho 2026', 'Calendário', 'toque um dia pra anexar foto, evento, pessoa, item ou anotação.'],
  11: ['osint · fonte aberta', 'Inteligência', 'ferramentas de coleta pública sobre um alvo. tudo que volta é registrado com origem e hora.'],
  12: ['preferências', 'Configurações', 'cor, nome, o que a assistente pode fazer e o que o Modo Trabalho esconde.'],
  13: ['práticas & conexão', 'Espiritualidade', 'registro de rituais, leituras de tarot/oráculo, momentos de presença e reflexões de sabedoria.'],
  14: ['cinema & opiniões', 'Filmes', 'diário de cinema: filmes assistidos, notas com estrelas, ranking e opiniões.'],
  15: ['estante', 'Livros', 'diário de leitura: livros lidos, notas, gênero e opiniões.']
};

export const PEOPLE = [];
export const STATS = [];
export const TIMELINE = [];
export const EVENTS = [];
export const PENDING = [];
export const FINSTATS = [];
export const EXPENSES = [];
export const BILLS = [];
export const NOTES = [];
export const EVENTLIST = [];
export const ITEMS = [];
export const AUDIT = [];
export const BUCKETDAYS = [];
export const ITEMHISTORY = [];
export const ITEMSTATS = [];
export const CHAT = [];
export const CHATREFS = [];
export const PERSONASOURCES = [];
export const MODALPHOTOS = [];
export const OSINTFINDINGS = [];

export const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export const PERSONAS = ['Analista frio', 'Terapeuta', 'Amigo direto', 'Advogado do diabo'];
export const PERSONA_SLIDERS = [
  { label: 'Humor', left: 'seco', right: 'caloroso' },
  { label: 'Tamanho da resposta', left: 'curta', right: 'longa' },
  { label: 'Confronto', left: 'gentil', right: 'brutal' },
  { label: 'Especulação', left: 'só dados', right: 'interpreta' }
];
export const PERSONA_OFFERS = ['Resumos', 'Alertas de manipulação', 'Inconsistências', 'Reflexões filosóficas', 'Sugestão de gasto', 'Lembretes do dia'];
export const AUDIT_FILTERS = ['Tudo', 'Financeiro', 'Pessoas', 'Bucket', 'Calendário'];
export const INTEL_SOURCES = ['Redes sociais', 'Bases de vazamento', 'Registros públicos', 'Imagens', 'Arquivo da web', 'Domínios'];
export const INTEL_MODES = ['Passivo', 'Ativo', 'Agendado'];
export const AI_SCOPES = ['Financeiro', 'Social e pessoas', 'Anotações', 'Eventos e calendário', 'Itens', 'Inteligência'];
export const AI_NEVER = ['Julgar minhas escolhas', 'Inventar sem fonte', 'Dar conselho médico', 'Falar de dinheiro sem eu pedir'];
export const MODAL_TABS = ['Foto', 'Evento', 'Interação', 'Pessoa', 'Anotação', 'Item', 'Gasto', 'Inteligência', 'Espiritualidade', 'Filme'];

// calendário de julho/2026
export const CAL_SEEDS = {};
export const CAL_SPEND = {};
export const CAL_PHOTO = {};
export const CAL_TINT = { e: 'ac', g: '#7ce0a8', a: '#e0c47c', p: '#c37ce0' };

export const RIO_TECH_POSTS = [
  { id: 'p1', tag: 'Rio', title: 'Chuvas fortes previstas para o fim de semana na Zona Oeste', img: 'https://images.unsplash.com/photo-1516214104703-d870798883c5?w=800&q=60', summary: 'Defesa Civil emite alerta para acumulados acima de 60mm em 24h.' },
  { id: 'p2', tag: 'Tech', title: 'Novo modelo de IA reduz custo de inferência em 40%', img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=60', summary: 'Empresas de infraestrutura cloud already testando em produção.' },
  { id: 'p3', tag: 'Rio', title: 'BRT anuncia nova linha expressa para a Barra', img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=60', summary: 'Previsão de redução de 15 minutos no trajeto até o Centro.' },
  { id: 'p4', tag: 'Tech', title: 'Chip nacional de silício entra em fase de testes', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=60', summary: 'Projeto brasileiro mira independência em semicondutores até 2028.' }
];
