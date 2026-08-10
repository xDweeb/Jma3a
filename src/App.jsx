import { useEffect, useState } from 'react';
import { CATEGORIES, WORD_BANK } from './data/wordBank';
import { LANGUAGES, translations } from './i18n/translations';

const screens = { welcome: 'welcome', setup: 'setup', reveal: 'reveal', discussion: 'discussion', result: 'result' };
const DEFAULT_LANGUAGE = 'ar';

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function initialLanguage() {
  const saved = localStorage.getItem('braSalfaLanguage');
  return translations[saved] ? saved : DEFAULT_LANGUAGE;
}

export default function App() {
  const [language, setLanguage] = useState(initialLanguage);
  const [screen, setScreen] = useState(screens.welcome);
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [category, setCategory] = useState('global');
  const [usePairs, setUsePairs] = useState(true);
  const [outsiderCount, setOutsiderCount] = useState(1);
  const [game, setGame] = useState(null);
  const [revealIndex, setRevealIndex] = useState(0);
  const [isRoleVisible, setIsRoleVisible] = useState(false);
  const [pair, setPair] = useState(null);

  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const currentPlayer = game?.order[revealIndex];
  const isCurrentOutsider = currentPlayer ? game.outsiders.includes(currentPlayer) : false;
  const canUseTwoOutsiders = players.length >= 6;

  function t(key, values = {}) {
    const value = key.split('.').reduce((item, part) => item?.[part], translations[language]);
    if (typeof value !== 'string') return value ?? key;
    return Object.entries(values).reduce((text, [token, replacement]) => text.replaceAll(`{${token}}`, replacement), value);
  }

  function roundWord() {
    return game ? WORD_BANK[game.wordCategory][language][game.wordIndex] : '';
  }

  useEffect(() => {
    localStorage.setItem('braSalfaLanguage', language);
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [language, direction]);

  function addPlayer(event) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setNameError('emptyName');
      return;
    }
    if (players.some((player) => player.toLocaleLowerCase() === cleanName.toLocaleLowerCase())) {
      setNameError('duplicate');
      return;
    }
    setPlayers([...players, cleanName]);
    setName('');
    setNameError('');
  }

  function removePlayer(player) {
    const nextPlayers = players.filter((item) => item !== player);
    setPlayers(nextPlayers);
    if (nextPlayers.length < 6) setOutsiderCount(1);
  }

  function startRound(samePlayers = players) {
    const wordCategory = category === 'global' ? pickRandom(Object.keys(WORD_BANK)) : category;
    const wordIndex = Math.floor(Math.random() * WORD_BANK[wordCategory][language].length);
    const order = shuffle(samePlayers);
    setGame({ order, wordCategory, wordIndex, outsiders: shuffle(order).slice(0, outsiderCount) });
    setRevealIndex(0);
    setIsRoleVisible(false);
    setPair(null);
    setScreen(screens.reveal);
  }

  function nextReveal() {
    setIsRoleVisible(false);
    if (revealIndex + 1 >= game.order.length) {
      setScreen(screens.discussion);
      if (usePairs) generatePair();
    } else {
      setRevealIndex(revealIndex + 1);
    }
  }

  function generatePair() {
    const asker = pickRandom(players);
    let target = pickRandom(players);
    while (target === asker) target = pickRandom(players);
    setPair({ asker, target });
  }

  function resetAll() {
    setPlayers([]);
    setName('');
    setNameError('');
    setCategory('global');
    setUsePairs(true);
    setOutsiderCount(1);
    setGame(null);
    setScreen(screens.welcome);
  }

  return (
    <main className="app-shell" dir={direction}>
      <section className="hero-card">
        <div className="language-control">
          <label htmlFor="language">{t('language')}</label>
          <select id="language" value={language} onChange={(event) => setLanguage(event.target.value)}>
            {LANGUAGES.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
          </select>
        </div>

        {screen === screens.welcome && (
          <div className="center-stack fade-in">
            <span className="badge">{t('badge')}</span>
            <h1>{t('brand')}</h1>
            <p className="subtitle">{t('subtitle')}</p>
            <button className="primary-btn" onClick={() => setScreen(screens.setup)}>{t('play')}</button>
          </div>
        )}

        {screen === screens.setup && (
          <div className="fade-in">
            <header className="section-header"><h2>{t('setupTitle')}</h2><p>{t('minimum')}</p></header>
            <form className="add-form" onSubmit={addPlayer}>
              <input value={name} onChange={(event) => { setName(event.target.value); setNameError(''); }} placeholder={t('playerPlaceholder')} aria-label={t('playerPlaceholder')} aria-describedby={nameError ? 'name-error' : undefined} />
              <button type="submit">{t('add')}</button>
            </form>
            {nameError && <p className="form-error" id="name-error" role="alert">{t(nameError)}</p>}
            <div className="players-list">
              {players.map((player) => <span className="player-pill" key={player}>{player}<button onClick={() => removePlayer(player)} aria-label={t('remove', { player })}>×</button></span>)}
            </div>
            <label className="field-label">{t('category')}</label>
            <div className="category-grid">
              {CATEGORIES.map((item) => <button key={item.id} className={category === item.id ? 'selected' : ''} onClick={() => setCategory(item.id)}>{item.emoji} {t(`categories.${item.id}`)}</button>)}
            </div>
            <label className="switch-row"><input type="checkbox" checked={usePairs} onChange={(event) => setUsePairs(event.target.checked)} /> {t('usePairs')}</label>
            <label className="field-label">{t('outsiderCount')}</label>
            <div className="segmented"><button className={outsiderCount === 1 ? 'selected' : ''} onClick={() => setOutsiderCount(1)}>1</button><button disabled={!canUseTwoOutsiders} className={outsiderCount === 2 ? 'selected' : ''} onClick={() => setOutsiderCount(2)}>2 {!canUseTwoOutsiders && `(${t('sixPlus')})`}</button></div>
            <button className="primary-btn full" disabled={players.length < 3} onClick={() => startRound()}>{t('start')}</button>
          </div>
        )}

        {screen === screens.reveal && currentPlayer && (
          <div className="center-stack fade-in safe-card">
            <span className="badge">{revealIndex + 1} / {game.order.length}</span>
            <h2>{t('turn', { player: currentPlayer })}</h2>
            {!isRoleVisible ? <button className="primary-btn" onClick={() => setIsRoleVisible(true)}>{t('revealRole')}</button> : <div className="role-box">{isCurrentOutsider ? t('outsider') : t('normal', { word: roundWord() })}</div>}
            {isRoleVisible && <button className="ghost-btn" onClick={nextReveal}>{t('hideNext')}</button>}
          </div>
        )}

        {screen === screens.discussion && game && (
          <div className="fade-in">
            <header className="section-header"><h2>{t('discussion')}</h2><p>{t('selectedCategory', { category: t(`categories.${category}`) })}</p></header>
            <ol className="rules">{t('rules').map((rule) => <li key={rule}>{rule}</li>)}</ol>
            {usePairs && pair && <div className="pair-card"><div>{t('pair', { asker: pair.asker, target: pair.target })}</div><button onClick={generatePair}>{t('anotherQuestion')}</button></div>}
            <button className="primary-btn full" onClick={() => setScreen(screens.result)}>{t('revealResult')}</button>
          </div>
        )}

        {screen === screens.result && game && (
          <div className="center-stack fade-in">
            <span className="badge">{t('result')}</span>
            <h2>{t('outsidersWere', { names: game.outsiders.join(t('and')) })}</h2>
            <div className="word-result">{t('wordWas', { word: roundWord() })}</div>
            <button className="primary-btn" onClick={() => startRound(players)}>{t('samePlayers')}</button>
            <button className="ghost-btn" onClick={resetAll}>{t('newGame')}</button>
          </div>
        )}
      </section>
    </main>
  );
}
