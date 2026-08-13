import React from 'react';
import { useEffect, useState } from 'react';
import { CATEGORIES, WORD_BANK } from './data/wordBank';
import { WORD_PAIRS } from './data/wordPairs';
import { LANGUAGES, translations } from './i18n/translations';

const screens = { welcome: 'welcome', setup: 'setup', reveal: 'reveal', discussion: 'discussion', voting: 'voting', result: 'result' };
const DEFAULT_LANGUAGE = 'ar';
const games = [{ id: 'intrus', nameKey: 'intrus', descriptionKey: 'intrusDescription', available: true }];
const assetBase = `${import.meta.env.BASE_URL}assets`;
const appIcon = `${assetBase}/brand/jma3a-icon.png`;
const intrusCover = `${assetBase}/games/intrus/intrus-cover.png`;
const modeImages = {
  classic: `${assetBase}/games/intrus/classic-mode.png`,
  undercover: `${assetBase}/games/intrus/undercover-mode.png`,
};
const playStyleImages = {
  questions: `${assetBase}/games/intrus/questions-style.png`,
  oneWord: `${assetBase}/games/intrus/hint-style.png`,
};
const resultImages = {
  group: `${assetBase}/games/intrus/group-wins.png`,
  intrus: `${assetBase}/games/intrus/intrus-wins.png`,
};

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function initialLanguage() {
  const saved = localStorage.getItem('jma3aLanguage');
  return translations[saved] ? saved : DEFAULT_LANGUAGE;
}

export default function App() {
  const [language, setLanguage] = useState(initialLanguage);
  const [screen, setScreen] = useState(screens.welcome);
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [category, setCategory] = useState('global');
  const [mode, setMode] = useState('classic');
  const [playStyle, setPlayStyle] = useState('questions');
  const [outsiderCount, setOutsiderCount] = useState(1);
  const [game, setGame] = useState(null);
  const [revealIndex, setRevealIndex] = useState(0);
  const [isRoleVisible, setIsRoleVisible] = useState(false);
  const [pair, setPair] = useState(null);
  const [votes, setVotes] = useState([]);
  const [voteIndex, setVoteIndex] = useState(0);
  const [selectedVote, setSelectedVote] = useState('');
  const [isVoterReady, setIsVoterReady] = useState(false);
  const [score, setScore] = useState({ group: 0, intrus: 0 });

  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const currentPlayer = game?.order[revealIndex];
  const isCurrentOutsider = currentPlayer ? game.outsiders.includes(currentPlayer) : false;
  const canUseTwoOutsiders = players.length >= 6;
  const resultType = game?.leaders?.length > 1 ? null : game?.groupWon ? 'group' : 'intrus';

  function t(key, values = {}) {
    const value = key.split('.').reduce((item, part) => item?.[part], translations[language]);
    if (typeof value !== 'string') return value ?? key;
    return Object.entries(values).reduce((text, [token, replacement]) => text.replaceAll(`{${token}}`, replacement), value);
  }

  function roundWord() { return game?.normalWords[language] ?? ''; }
  function intrusWord() { return game?.intrusWords?.[language] ?? ''; }

  useEffect(() => {
    localStorage.setItem('jma3aLanguage', language);
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
    const source = mode === 'undercover' ? WORD_PAIRS : WORD_BANK;
    const wordCategory = category === 'global' ? pickRandom(Object.keys(source)) : category;
    let normalWords;
    let intrusWords = null;
    if (mode === 'undercover') {
      const selectedPair = pickRandom(WORD_PAIRS[wordCategory]);
      const swap = Math.random() < 0.5;
      normalWords = Object.fromEntries(LANGUAGES.map(({ code }) => [code, selectedPair[code][swap ? 1 : 0]]));
      intrusWords = Object.fromEntries(LANGUAGES.map(({ code }) => [code, selectedPair[code][swap ? 0 : 1]]));
    } else {
      const wordIndex = Math.floor(Math.random() * WORD_BANK[wordCategory][language].length);
      normalWords = Object.fromEntries(LANGUAGES.map(({ code }) => [code, WORD_BANK[wordCategory][code][wordIndex]]));
    }
    const order = shuffle(samePlayers);
    setGame({ order, wordCategory, normalWords, intrusWords, outsiders: shuffle(order).slice(0, outsiderCount), mode, playStyle });
    setRevealIndex(0);
    setIsRoleVisible(false);
    setPair(null);
    setVotes([]);
    setVoteIndex(0);
    setSelectedVote('');
    setIsVoterReady(false);
    setScreen(screens.reveal);
  }

  function nextReveal() {
    setIsRoleVisible(false);
    if (revealIndex + 1 >= game.order.length) {
      setScreen(screens.discussion);
      if (game.playStyle === 'questions') generatePair();
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
    setMode('classic');
    setPlayStyle('questions');
    setOutsiderCount(1);
    setGame(null);
    setScore({ group: 0, intrus: 0 });
    setScreen(screens.welcome);
  }

  function submitVote() {
    if (!selectedVote) return;
    const nextVotes = [...votes, { voter: game.order[voteIndex], target: selectedVote }];
    setVotes(nextVotes);
    setSelectedVote('');
    if (voteIndex + 1 < game.order.length) {
      setVoteIndex(voteIndex + 1);
      setIsVoterReady(false);
    }
    else finishVoting(nextVotes);
  }

  function finishVoting(finalVotes) {
    const totals = Object.fromEntries(players.map((player) => [player, 0]));
    finalVotes.forEach(({ target }) => { totals[target] += 1; });
    const highest = Math.max(...Object.values(totals));
    const leaders = Object.keys(totals).filter((player) => totals[player] === highest);
    const groupWon = leaders.length === 1 && game.outsiders.includes(leaders[0]);
    setGame((current) => ({ ...current, voteTotals: totals, leaders, groupWon }));
    setScore((current) => ({ ...current, [groupWon ? 'group' : 'intrus']: current[groupWon ? 'group' : 'intrus'] + 1 }));
    setScreen(screens.result);
  }

  function goHome() {
    setGame(null);
    setRevealIndex(0);
    setIsRoleVisible(false);
    setPair(null);
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
          <div className="hub-screen center-stack fade-in">
            <img className="app-icon" src={appIcon} alt={`${t('brand')} icon`} loading="lazy" decoding="async" />
            <h1>{t('brand')}</h1>
            <p className="subtitle">{t('subtitle')}</p>
            <div className="games-grid">
              {games.map((item) => (
                <article className="game-card" key={item.id}>
                  <img className="game-card-image" src={intrusCover} alt={`${t('intrus')} cover art`} loading="lazy" decoding="async" />
                  <h2>{t(item.nameKey)}</h2>
                  <p>{t(item.descriptionKey)}</p>
                  <button className="primary-btn full" disabled={!item.available} onClick={() => setScreen(screens.setup)}>{t('playIntrus')}</button>
                </article>
              ))}
            </div>
            <a className="creator-credit home-credit" href="https://github.com/xdweeb" target="_blank" rel="noreferrer">{t('creator')}</a>
          </div>
        )}

        {screen !== screens.welcome && <button className="back-btn" onClick={goHome}>← <span>{t('backToGames')}</span></button>}

        {screen === screens.setup && (
          <div className="fade-in">
            <header className="section-header"><h2>{t('setupTitle')}</h2><p>{t('minimum')}</p></header>
            {(score.group > 0 || score.intrus > 0) && <div className="score-strip"><strong>{t('scores')}</strong><span>{t('groupScore')} {score.group}</span><span>{t('intrusScore')} {score.intrus}</span></div>}
            <form className="add-form" onSubmit={addPlayer}>
              <input value={name} onChange={(event) => { setName(event.target.value); setNameError(''); }} placeholder={t('playerPlaceholder')} aria-label={t('playerPlaceholder')} aria-describedby={nameError ? 'name-error' : undefined} />
              <button type="submit">{t('add')}</button>
            </form>
            {nameError && <p className="form-error" id="name-error" role="alert">{t(nameError)}</p>}
            <div className="players-list">
              {players.map((player) => <span className="player-pill" key={player}>{player}<button onClick={() => removePlayer(player)} aria-label={t('remove', { player })}>×</button></span>)}
            </div>
            <label className="field-label">{t('mode')}</label>
            <div className="option-grid">
              {['classic', 'undercover'].map((item) => <button key={item} className={mode === item ? 'selected' : ''} onClick={() => setMode(item)}><img className="option-card-image" src={modeImages[item]} alt={`${t(item)} mode`} loading="lazy" decoding="async" /><strong>{t(item)}</strong><small>{t(`${item}Help`)}</small></button>)}
            </div>
            <label className="field-label">{t('playStyle')}</label>
            <div className="option-grid">
              {['questions', 'oneWord'].map((item) => <button key={item} className={playStyle === item ? 'selected' : ''} onClick={() => setPlayStyle(item)}><img className="option-card-image" src={playStyleImages[item]} alt={`${t(item)} style`} loading="lazy" decoding="async" /><strong>{t(item)}</strong><small>{t(`${item}Help`)}</small></button>)}
            </div>
            <label className="field-label">{t('category')}</label>
            <div className="category-grid">
              {CATEGORIES.map((item) => <button key={item.id} className={category === item.id ? 'selected' : ''} onClick={() => setCategory(item.id)}>{item.emoji} {t(`categories.${item.id}`)}</button>)}
            </div>
            <label className="field-label">{t('outsiderCount')}</label>
            <div className="segmented"><button className={outsiderCount === 1 ? 'selected' : ''} onClick={() => setOutsiderCount(1)}>1</button><button disabled={!canUseTwoOutsiders} className={outsiderCount === 2 ? 'selected' : ''} onClick={() => setOutsiderCount(2)}>2 {!canUseTwoOutsiders && `(${t('sixPlus')})`}</button></div>
            <button className="primary-btn full" disabled={players.length < 3} onClick={() => startRound()}>{t('start')}</button>
          </div>
        )}

        {screen === screens.reveal && currentPlayer && (
          <div className="center-stack fade-in safe-card">
            <span className="badge">{revealIndex + 1} / {game.order.length}</span>
            <h2>{t('turn', { player: currentPlayer })}</h2>
            {!isRoleVisible ? <button className="primary-btn" onClick={() => setIsRoleVisible(true)}>{t('revealRole')}</button> : <div className="role-box">{isCurrentOutsider && game.mode === 'classic' ? t('outsider') : t('normal', { word: isCurrentOutsider ? intrusWord() : roundWord() })}</div>}
            {isRoleVisible && <button className="ghost-btn" onClick={nextReveal}>{t('hideNext')}</button>}
          </div>
        )}

        {screen === screens.discussion && game && (
          <div className="fade-in">
            <header className="section-header"><h2>{t('discussion')}</h2><p>{t('selectedCategory', { category: t(`categories.${game.wordCategory}`) })}</p></header>
            <ol className="rules">{t(game.playStyle === 'questions' ? 'questionRules' : 'oneWordRules').map((rule) => <li key={rule}>{rule}</li>)}</ol>
            {game.playStyle === 'questions' && pair && <div className="pair-card"><div>{t('pair', { asker: pair.asker, target: pair.target })}</div><button onClick={generatePair}>{t('anotherQuestion')}</button></div>}
            <button className="primary-btn full" onClick={() => setScreen(screens.voting)}>{t('startVoting')}</button>
          </div>
        )}

        {screen === screens.voting && game && (
          <div className="fade-in voting-screen">
            <header className="section-header"><span className="badge">{voteIndex + 1} / {game.order.length}</span><h2>{t('voting')}</h2><p>{t('voteTurn', { player: game.order[voteIndex] })}</p></header>
            {!isVoterReady ? (
              <div className="pass-card">
                <span aria-hidden="true">📱</span>
                <p>{t('votePrivacy', { player: game.order[voteIndex] })}</p>
                <button className="primary-btn full" onClick={() => setIsVoterReady(true)}>{t('readyToVote')}</button>
              </div>
            ) : (
              <>
                <div className="vote-grid">
                  {players.map((player) => <button key={player} aria-pressed={selectedVote === player} className={selectedVote === player ? 'selected' : ''} onClick={() => setSelectedVote(player)}>{player}</button>)}
                </div>
                <button className="primary-btn full" disabled={!selectedVote} onClick={submitVote}>{voteIndex + 1 === game.order.length ? t('finishVoting') : t('confirmVote')}</button>
              </>
            )}
          </div>
        )}

        {screen === screens.result && game && (
          <div className="center-stack fade-in">
            <span className="badge">{t('result')}</span>
            {resultType && <img className="result-illustration" src={resultImages[resultType]} alt={game.groupWon ? t('groupWins') : t('intrusWins')} loading="lazy" decoding="async" />}
            <h2>{game.leaders.length > 1 ? t('tie') : game.groupWon ? t('groupWins') : t('intrusWins')}</h2>
            <p className="subtitle">{t('mostVoted', { names: game.leaders.join(t('and')) })}</p>
            <div className="result-details">
              <div>{t('outsidersWere', { names: game.outsiders.join(t('and')) })}</div>
              <div>{t('normalWord', { word: roundWord() })}</div>
              {game.mode === 'undercover' && <div>{t('intrusWord', { word: intrusWord() })}</div>}
            </div>
            <div className="score-card"><strong>{t('scores')}</strong><span>{t('groupScore')}: {score.group}</span><span>{t('intrusScore')}: {score.intrus}</span></div>
            <button className="primary-btn" onClick={() => startRound(players)}>{t('samePlayers')}</button>
            <button className="ghost-btn" onClick={resetAll}>{t('newGame')}</button>
          </div>
        )}
        {screen !== screens.welcome && <a className="creator-credit app-footer" href="https://github.com/xdweeb" target="_blank" rel="noreferrer">{t('creator')}</a>}
      </section>
    </main>
  );
}
