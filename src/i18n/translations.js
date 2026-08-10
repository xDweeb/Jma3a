export const LANGUAGES = [
  { code: 'ar', label: 'العربية' }, { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' }, { code: 'it', label: 'Italiano' },
];

export const translations = {
  ar: {
    language: 'اللغة', badge: 'لعبة صحابك فالسهرة', brand: 'برا السالفة', subtitle: 'دخل صحابك، كشف الدور ديالك، وحاول ما تبانش!', play: 'بدا اللعب',
    setupTitle: 'وجد اللاعبين', minimum: 'خاص على الأقل 3 لاعبين باش تبداو.', playerPlaceholder: 'سمية اللاعب', add: 'زيد', remove: 'حيد {player}', duplicate: 'هاد السمية كاينة من قبل.', emptyName: 'دخل سمية اللاعب.',
    category: 'الصنف', usePairs: 'خلي التطبيق يقول شكون يسول شكون', outsiderCount: 'عدد لي برا السالفة', sixPlus: '6+', start: 'خلط و بدا',
    turn: 'الدور ديال: {player}', revealRole: 'كشف الدور', outsider: 'نتا برا السالفة! حاول تفهم بلا ما تبان', normal: 'الكلمة هي: {word}', hideNext: 'خبي و دوز للي موراك',
    discussion: 'دابا بداو النقاش', selectedCategory: 'الصنف: {category}', rules: ['كل واحد يسول سؤال', 'ممنوع تقول الكلمة مباشرة', 'لي برا السالفة يحاول يفهم', 'الباقيين يحاولو يلقاو شكون برا'], pair: '{asker} يسول {target}', anotherQuestion: 'سؤال آخر', revealResult: 'كشف النتيجة',
    result: 'النتيجة', outsidersWere: 'برا السالفة كان: {names}', wordWas: 'الكلمة كانت: {word}', samePlayers: 'جولة جديدة بنفس اللاعبين', newGame: 'لعبة جديدة', and: ' و ',
    categories: { global: 'كولشي', food: 'ماكلة', animals: 'حيوانات', objects: 'جماد', places: 'مدن و بلايص', jobs: 'مهن', school: 'مدرسة', home: 'دار', moroccanStreet: 'شارع مغربي', characters: 'مشاهير و شخصيات', sport: 'رياضة', tech: 'تكنولوجيا' },
  },
  fr: {
    language: 'Langue', badge: 'Le jeu parfait entre amis', brand: 'Bra Salfa', subtitle: 'Ajoute tes amis, découvre ton rôle et essaie de ne pas te faire repérer !', play: 'Jouer',
    setupTitle: 'Prépare les joueurs', minimum: 'Il faut au moins 3 joueurs pour commencer.', playerPlaceholder: 'Nom du joueur', add: 'Ajouter', remove: 'Retirer {player}', duplicate: 'Ce nom est déjà dans la liste.', emptyName: 'Entre un nom de joueur.',
    category: 'Catégorie', usePairs: 'Laisser le jeu choisir qui questionne qui', outsiderCount: 'Nombre d’intrus', sixPlus: '6+', start: 'Mélanger et jouer',
    turn: 'Au tour de {player}', revealRole: 'Voir mon rôle', outsider: 'Tu es l’intrus ! Devine sans te faire repérer', normal: 'Le mot est : {word}', hideNext: 'Cacher et passer',
    discussion: 'Place à la discussion', selectedCategory: 'Catégorie : {category}', rules: ['Chacun pose une question', 'Ne dites pas le mot directement', 'L’intrus essaie de comprendre', 'Les autres cherchent l’intrus'], pair: '{asker} pose une question à {target}', anotherQuestion: 'Autre question', revealResult: 'Voir le résultat',
    result: 'Résultat', outsidersWere: 'L’intrus était : {names}', wordWas: 'Le mot était : {word}', samePlayers: 'Nouvelle manche, mêmes joueurs', newGame: 'Nouvelle partie', and: ' et ',
    categories: { global: 'Tout', food: 'Nourriture', animals: 'Animaux', objects: 'Objets', places: 'Villes et lieux', jobs: 'Métiers', school: 'École', home: 'Maison', moroccanStreet: 'Rue marocaine', characters: 'Personnages', sport: 'Sport', tech: 'Technologie' },
  },
  en: {
    language: 'Language', badge: 'A party game for friends', brand: 'Bra Salfa', subtitle: 'Add your friends, reveal your role, and try not to get caught!', play: 'Start playing',
    setupTitle: 'Set up players', minimum: 'You need at least 3 players to start.', playerPlaceholder: 'Player name', add: 'Add', remove: 'Remove {player}', duplicate: 'That name is already in the list.', emptyName: 'Enter a player name.',
    category: 'Category', usePairs: 'Let the game choose who asks whom', outsiderCount: 'Number of outsiders', sixPlus: '6+', start: 'Shuffle and start',
    turn: '{player}’s turn', revealRole: 'Reveal role', outsider: 'You are the outsider! Figure it out without getting caught', normal: 'The word is: {word}', hideNext: 'Hide and pass on',
    discussion: 'Let the discussion begin', selectedCategory: 'Category: {category}', rules: ['Everyone asks one question', 'Do not say the word directly', 'The outsider tries to figure it out', 'Everyone else tries to find the outsider'], pair: '{asker} asks {target}', anotherQuestion: 'Another question', revealResult: 'Reveal result',
    result: 'Result', outsidersWere: 'The outsider was: {names}', wordWas: 'The word was: {word}', samePlayers: 'New round, same players', newGame: 'New game', and: ' and ',
    categories: { global: 'Global', food: 'Food', animals: 'Animals', objects: 'Objects', places: 'Cities and places', jobs: 'Jobs', school: 'School', home: 'Home', moroccanStreet: 'Moroccan street', characters: 'Characters', sport: 'Sport', tech: 'Technology' },
  },
  it: {
    language: 'Lingua', badge: 'Il gioco da festa tra amici', brand: 'Bra Salfa', subtitle: 'Aggiungi gli amici, scopri il tuo ruolo e cerca di non farti beccare!', play: 'Inizia a giocare',
    setupTitle: 'Prepara i giocatori', minimum: 'Servono almeno 3 giocatori per iniziare.', playerPlaceholder: 'Nome del giocatore', add: 'Aggiungi', remove: 'Rimuovi {player}', duplicate: 'Questo nome è già nella lista.', emptyName: 'Inserisci il nome di un giocatore.',
    category: 'Categoria', usePairs: 'Lascia scegliere al gioco chi fa la domanda', outsiderCount: 'Numero di intrusi', sixPlus: '6+', start: 'Mescola e inizia',
    turn: 'Tocca a {player}', revealRole: 'Scopri il ruolo', outsider: 'Sei l’intruso! Cerca di capire senza farti beccare', normal: 'La parola è: {word}', hideNext: 'Nascondi e passa',
    discussion: 'Che la discussione abbia inizio', selectedCategory: 'Categoria: {category}', rules: ['Ognuno fa una domanda', 'Non dite direttamente la parola', 'L’intruso cerca di capire', 'Gli altri cercano di trovare l’intruso'], pair: '{asker} fa una domanda a {target}', anotherQuestion: 'Altra domanda', revealResult: 'Scopri il risultato',
    result: 'Risultato', outsidersWere: 'L’intruso era: {names}', wordWas: 'La parola era: {word}', samePlayers: 'Nuovo round, stessi giocatori', newGame: 'Nuova partita', and: ' e ',
    categories: { global: 'Globale', food: 'Cibo', animals: 'Animali', objects: 'Oggetti', places: 'Città e luoghi', jobs: 'Mestieri', school: 'Scuola', home: 'Casa', moroccanStreet: 'Strada marocchina', characters: 'Personaggi', sport: 'Sport', tech: 'Tecnologia' },
  },
};
