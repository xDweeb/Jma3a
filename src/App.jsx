import React from 'react';
import { useEffect, useState } from 'react';
import { BriefcaseBusiness, BusFront, Cat, Clapperboard, Cpu, EyeOff, Gamepad2, Globe, GraduationCap, House, Leaf, MapPinned, MessagesSquare, Music4, Package, PlaneTakeoff, Quote, Shield, Smile, Sparkles, Trophy, UtensilsCrossed, UsersRound } from 'lucide-react';
import { CATEGORIES, WORD_BANK } from './data/wordBank';
import { WORD_PAIRS } from './data/wordPairs';
import { LANGUAGES, translations } from './i18n/translations';
import { buildQuestionPairQueue } from './utils/questionPairing';

const screens = { welcome: 'welcome', setup: 'setup', reveal: 'reveal', discussion: 'discussion', voting: 'voting', mrWhiteGuess: 'mrWhiteGuess', result: 'result' };
const DEFAULT_LANGUAGE = 'ar';
const games = [{ id: 'intrus', nameKey: 'intrus', descriptionKey: 'intrusDescription', available: true }];
const MODE_CARDS = [
  { id: 'classic', labelKey: 'classic', helpKey: 'classicHelp', icon: Shield, image: `${import.meta.env.BASE_URL}assets/games/intrus/classic-mode.png`, available: true },
  { id: 'undercover', labelKey: 'undercover', helpKey: 'undercoverHelp', icon: EyeOff, image: `${import.meta.env.BASE_URL}assets/games/intrus/undercover-mode.png`, available: true },
];
const CATEGORY_ICONS = {
  global: Globe,
  food: UtensilsCrossed,
  animals: Cat,
  objects: Package,
  places: MapPinned,
  jobs: BriefcaseBusiness,
  school: GraduationCap,
  home: House,
  moroccanStreet: BusFront,
  sport: Trophy,
  tech: Cpu,
  moviesTv: Clapperboard,
  musicArt: Music4,
  nature: Leaf,
  travel: PlaneTakeoff,
  emotionsActions: Smile,
  moroccanCulture: UsersRound,
  internetSocial: MessagesSquare,
  characters: Gamepad2,
};
const assetBase = `${import.meta.env.BASE_URL}assets`;
const appIcon = `${assetBase}/brand/jma3a-icon.png`;
const intrusCover = `${assetBase}/games/intrus/intrus-cover.png`;
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

function Icon({ component: Component }) {
  return <Component className="chip-icon" aria-hidden="true" />;
}

function initialLanguage() {
  const saved = localStorage.getItem('jma3aLanguage');
  return translations[saved] ? saved : DEFAULT_LANGUAGE;
}

export default function App() {
  const [language, setLanguage] = useState(initialLanguage);
  const [screen, setScreen] = useState(screens.welcome);
  const [setupStep, setSetupStep] = useState(1);
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [mode, setMode] = useState('classic');
  const [playStyle, setPlayStyle] = useState('questions');
  const [outsiderCount, setOutsiderCount] = useState(1);
  const [enableMrWhite, setEnableMrWhite] = useState(false);
  const [game, setGame] = useState(null);
  const [revealIndex, setRevealIndex] = useState(0);
  const [isRoleVisible, setIsRoleVisible] = useState(false);
  const [pair, setPair] = useState(null);
  const [questionPairQueue, setQuestionPairQueue] = useState([]);
  const [lastQuestionPair, setLastQuestionPair] = useState(null);
  const [votes, setVotes] = useState([]);
  const [voteIndex, setVoteIndex] = useState(0);
  const [selectedVote, setSelectedVote] = useState('');
  const [isVoterReady, setIsVoterReady] = useState(false);
  const [mrWhiteGuess, setMrWhiteGuess] = useState('');
  const [score, setScore] = useState({ group: 0, hidden: 0 });

  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const currentPlayer = game?.order[revealIndex];
  const isCurrentOutsider = currentPlayer ? game.outsiders.includes(currentPlayer) : false;
  const isCurrentMrWhite = currentPlayer === game?.mrWhitePlayer;
  const canUseTwoOutsiders = players.length >= 6;
  const resultType = game?.leaders?.length > 1 ? null : game?.groupWon ? 'group' : 'intrus';
  const selectedCategoryLabels = selectedCategories.map((item) => t(`categories.${item}`));

  function t(key, values = {}) {
    const value = key.split('.').reduce((item, part) => item?.[part], translations[language]);
    if (typeof value !== 'string') return value ?? key;
    return Object.entries(values).reduce((text, [token, replacement]) => text.replaceAll(`{${token}}`, replacement), value);
  }

  function roundWord() { return game?.normalWords[language] ?? ''; }
  function intrusWord() { return game?.intrusWords?.[language] ?? ''; }

  function normalizeGuess(value) {
    return value.trim().toLocaleLowerCase().replace(/\s+/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function toggleCategory(categoryId) {
    if (categoryId === 'global') {
      setSelectedCategories([]);
      return;
    }
    setSelectedCategories((current) => current.includes(categoryId) ? current.filter((item) => item !== categoryId) : [...current, categoryId]);
  }

  function serveQuestionPair() {
    setQuestionPairQueue((currentQueue) => {
      let queue = currentQueue;
      if (queue.length === 0) queue = buildQuestionPairQueue(players, lastQuestionPair);
      const [nextPair, ...rest] = queue;
      if (nextPair) {
        setPair(nextPair);
        setLastQuestionPair(nextPair);
      }
      return rest;
    });
  }

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
    if (nextPlayers.length < 4) setEnableMrWhite(false);
  }

  function selectMode(nextMode) {
    setMode(nextMode);
    if (nextMode !== 'undercover') setEnableMrWhite(false);
  }

  function startRound(samePlayers = players) {
    const source = mode === 'undercover' ? WORD_PAIRS : WORD_BANK;
    const wordCategory = pickRandom(selectedCategories.length ? selectedCategories : Object.keys(source));
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
    const hasMrWhite = mode === 'undercover' && enableMrWhite && samePlayers.length >= 4;
    const roleOrder = shuffle(order);
    const effectiveOutsiderCount = hasMrWhite ? 1 : outsiderCount;
    const outsiders = roleOrder.slice(0, effectiveOutsiderCount);
    const mrWhitePlayer = hasMrWhite ? roleOrder[effectiveOutsiderCount] : null;
    setGame({ order, wordCategory, normalWords, intrusWords, outsiders, mrWhitePlayer, enableMrWhite: hasMrWhite, mode, playStyle });
    setRevealIndex(0);
    setIsRoleVisible(false);
    setPair(null);
    setQuestionPairQueue([]);
    setLastQuestionPair(null);
    setVotes([]);
    setVoteIndex(0);
    setSelectedVote('');
    setIsVoterReady(false);
    setMrWhiteGuess('');
    setScreen(screens.reveal);
  }

  function nextReveal() {
    setIsRoleVisible(false);
    if (revealIndex + 1 >= game.order.length) {
      setScreen(screens.discussion);
      if (game.playStyle === 'questions') serveQuestionPair();
    } else {
      setRevealIndex(revealIndex + 1);
    }
  }

  function resetAll() {
    setPlayers([]);
    setName('');
    setNameError('');
    setSelectedCategories([]);
    setMode('classic');
    setPlayStyle('questions');
    setOutsiderCount(1);
    setEnableMrWhite(false);
    setGame(null);
    setQuestionPairQueue([]);
    setLastQuestionPair(null);
    setMrWhiteGuess('');
    setScore({ group: 0, hidden: 0 });
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
    if (leaders.length > 1) {
      setGame((current) => ({ ...current, voteTotals: totals, leaders, groupWon: false, resultReason: 'tie' }));
      setScreen(screens.result);
      return;
    }
    const votedPlayer = leaders[0];
    if (game.enableMrWhite && votedPlayer === game.mrWhitePlayer) {
      setGame((current) => ({ ...current, voteTotals: totals, leaders }));
      setMrWhiteGuess('');
      setScreen(screens.mrWhiteGuess);
      return;
    }
    const groupWon = game.outsiders.includes(votedPlayer);
    const resultReason = groupWon ? game.mode === 'undercover' ? 'caughtUndercover' : 'caughtClassic' : 'wrongVote';
    setGame((current) => ({ ...current, voteTotals: totals, leaders, groupWon, resultReason }));
    setScore((current) => ({ ...current, [groupWon ? 'group' : 'hidden']: current[groupWon ? 'group' : 'hidden'] + 1 }));
    setScreen(screens.result);
  }

  function submitMrWhiteGuess(event) {
    event.preventDefault();
    if (!mrWhiteGuess.trim()) return;
    const guessedCorrectly = normalizeGuess(mrWhiteGuess) === normalizeGuess(roundWord());
    const groupWon = !guessedCorrectly;
    setGame((current) => ({ ...current, groupWon, mrWhiteGuess, mrWhiteGuessResult: guessedCorrectly, resultReason: guessedCorrectly ? 'mrWhiteCorrect' : 'mrWhiteWrong' }));
    setScore((current) => ({ ...current, [groupWon ? 'group' : 'hidden']: current[groupWon ? 'group' : 'hidden'] + 1 }));
    setScreen(screens.result);
  }

  function goHome() {
    setGame(null);
    setRevealIndex(0);
    setIsRoleVisible(false);
    setPair(null);
    setQuestionPairQueue([]);
    setLastQuestionPair(null);
    setSetupStep(1);
    setScreen(screens.welcome);
  }

  function openSetup() {
    setSetupStep(1);
    setScreen(screens.setup);
  }

  useEffect(() => {
    if (screen !== screens.discussion || !game || game.playStyle !== 'questions' || pair || players.length < 2) return;
    serveQuestionPair();
  }, [screen, game, pair, players, lastQuestionPair]);

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
                  <div className="game-card-image-wrap"><img className="game-card-image" src={intrusCover} alt={`${t('intrus')} cover art`} loading="lazy" decoding="async" /></div>
                  <h2>{t(item.nameKey)}</h2>
                  <p>{t(item.descriptionKey)}</p>
                  <button className="primary-btn full" disabled={!item.available} onClick={openSetup}>{t('playIntrus')}</button>
                </article>
              ))}
            </div>
            <a className="creator-credit home-credit" href="https://github.com/xdweeb" target="_blank" rel="noreferrer">{t('creator')}</a>
          </div>
        )}

        {screen !== screens.welcome && <button className="back-btn" onClick={goHome}>← <span>{t('backToGames')}</span></button>}

        {screen === screens.setup && (
          <div className="fade-in setup-screen">
            <header className="section-header setup-header"><span className="setup-eyebrow">{t('stepOf', { current: setupStep, total: 4 })}</span><h2>{t(`setupSteps.${setupStep}`)}</h2></header>
            <nav className="setup-stepper" aria-label={t('setupProgress')}>
              {[1, 2, 3, 4].map((step) => <button key={step} type="button" className={setupStep === step ? 'active' : setupStep > step ? 'complete' : ''} aria-current={setupStep === step ? 'step' : undefined} onClick={() => step < setupStep && setSetupStep(step)}><span>{setupStep > step ? '✓' : step}</span><small>{t(`setupStepShort.${step}`)}</small></button>)}
            </nav>
            {(score.group > 0 || score.hidden > 0) && <div className="score-strip"><strong>{t('scores')}</strong><span>{t('groupScore')} {score.group}</span><span>{t('hiddenScore')} {score.hidden}</span></div>}
            <div className="setup-step-content" key={setupStep}>
            {setupStep === 1 && <>
              <p className="step-intro">{t('minimum')}</p>
              <form className="add-form" onSubmit={addPlayer}>
                <input value={name} onChange={(event) => { setName(event.target.value); setNameError(''); }} placeholder={t('playerPlaceholder')} aria-label={t('playerPlaceholder')} aria-describedby={nameError ? 'name-error' : undefined} />
                <button type="submit">{t('add')}</button>
              </form>
              {nameError && <p className="form-error" id="name-error" role="alert">{t(nameError)}</p>}
              <div className="players-list">
                {players.map((player) => <span className="player-pill" key={player}>{player}<button type="button" onClick={() => removePlayer(player)} aria-label={t('remove', { player })}>×</button></span>)}
              </div>
            </>}
            {setupStep === 2 && <div className="mode-grid">
              {MODE_CARDS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = mode === item.id;
                return (
                  <button key={item.id} type="button" className={`mode-card ${isSelected ? 'selected' : ''}`} onClick={() => selectMode(item.id)}>
                    {item.image ? <div className="option-card-image-wrap"><img className="option-card-image" src={item.image} alt={`${t(item.labelKey)} ${t('mode')}`} loading="lazy" decoding="async" /></div> : <div className="mode-icon-wrap"><IconComponent className="mode-icon" aria-hidden="true" /></div>}
                    <strong>{t(item.labelKey)}</strong>
                    <small>{t(item.helpKey)}</small>
                  </button>
                );
              })}
              {mode === 'undercover' && <button type="button" className={`mr-white-option ${enableMrWhite ? 'selected' : ''}`} disabled={players.length < 4} aria-pressed={enableMrWhite} onClick={() => { setEnableMrWhite((enabled) => !enabled); setOutsiderCount(1); }}>
                <span className="mr-white-icon"><Sparkles aria-hidden="true" /></span>
                <span><strong>{t('addMrWhite')}</strong><small>{t('mrWhiteDescription')}</small>{players.length < 4 && <em>{t('mrWhiteMinimum')}</em>}</span>
                <span className="toggle" aria-hidden="true"><i /></span>
              </button>}
            </div>}
            {setupStep === 3 && <div className="option-grid">
              {['questions', 'oneWord'].map((item) => {
                const OptionIcon = item === 'questions' ? MessagesSquare : Quote;
                return <button key={item} type="button" className={playStyle === item ? 'selected' : ''} onClick={() => setPlayStyle(item)}><div className="option-card-image-wrap"><img className="option-card-image" src={playStyleImages[item]} alt={`${t(item)} style`} loading="lazy" decoding="async" /></div><span className="option-title"><OptionIcon className="option-inline-icon" aria-hidden="true" /><strong>{t(item)}</strong></span><small>{t(`${item}Help`)}</small></button>;
              })}
            </div>}
            {setupStep === 4 && <>
            <label className="field-label first-label">{t('category')}</label>
            <p className="helper-text">{t('selectCategoriesHint')}</p>
            <div className="category-grid">
              <button type="button" className={`category-chip global-chip ${selectedCategories.length === 0 ? 'selected' : ''}`} onClick={() => toggleCategory('global')}>
                <Globe className="chip-icon" aria-hidden="true" />
                <span>{t('allCategories')}</span>
              </button>
              {CATEGORIES.filter((item) => item.id !== 'global').map((item) => {
                const CategoryIcon = CATEGORY_ICONS[item.id] ?? Globe;
                return (
                  <button key={item.id} type="button" aria-pressed={selectedCategories.includes(item.id)} className={`category-chip ${selectedCategories.includes(item.id) ? 'selected' : ''}`} onClick={() => toggleCategory(item.id)}>
                    <CategoryIcon className="chip-icon" aria-hidden="true" />
                    <span>{t(`categories.${item.id}`)}</span>
                  </button>
                );
              })}
            </div>
            {selectedCategoryLabels.length > 0 && <div className="selection-summary">{selectedCategoryLabels.join(' · ')}</div>}
            <label className="field-label">{t('outsiderCount')}</label>
            <div className="segmented"><button className={outsiderCount === 1 ? 'selected' : ''} onClick={() => setOutsiderCount(1)}>1</button><button disabled={!canUseTwoOutsiders || enableMrWhite} className={outsiderCount === 2 ? 'selected' : ''} onClick={() => setOutsiderCount(2)}>2 {(!canUseTwoOutsiders || enableMrWhite) && `(${enableMrWhite ? t('mrWhiteUsesOne') : t('sixPlus')})`}</button></div>
            <aside className="setup-summary"><strong>{t('summary')}</strong><div><span>{t('summaryPlayers')}</span><b>{players.length}</b></div><div><span>{t('summaryMode')}</span><b>{t(mode)}</b></div><div><span>{t('summaryStyle')}</span><b>{t(playStyle)}</b></div><div><span>{t('summaryCategories')}</span><b>{selectedCategories.length || t('allCategories')}</b></div><div><span>{t('summaryOutsiders')}</span><b>{enableMrWhite ? `1 + Mr White` : outsiderCount}</b></div></aside>
            </>}
            </div>
            <div className="wizard-actions">
              {setupStep > 1 && <button type="button" className="ghost-btn" onClick={() => setSetupStep((step) => step - 1)}>{t('back')}</button>}
              {setupStep < 4 ? <button type="button" className="primary-btn" disabled={setupStep === 1 && players.length < 3} onClick={() => setSetupStep((step) => step + 1)}>{t('next')}</button> : <button type="button" className="primary-btn" disabled={players.length < 3} onClick={() => startRound()}>{t('start')}</button>}
            </div>
          </div>
        )}

        {screen === screens.reveal && currentPlayer && (
          <div className="center-stack fade-in safe-card">
            <span className="badge">{revealIndex + 1} / {game.order.length}</span>
            <h2>{t('turn', { player: currentPlayer })}</h2>
            {!isRoleVisible ? <button className="primary-btn" onClick={() => setIsRoleVisible(true)}>{t('revealRole')}</button> : <div className="role-box">{isCurrentMrWhite ? t('mrWhiteReveal') : isCurrentOutsider && game.mode === 'classic' ? t('outsider') : t('normal', { word: isCurrentOutsider ? intrusWord() : roundWord() })}</div>}
            {isRoleVisible && <button className="ghost-btn" onClick={nextReveal}>{t('hideNext')}</button>}
          </div>
        )}

        {screen === screens.discussion && game && (
          <div className="fade-in">
            <header className="section-header"><h2>{t('discussion')}</h2><p>{t('selectedCategory', { category: t(`categories.${game.wordCategory}`) })}</p></header>
            <ol className="rules">{t(game.enableMrWhite ? 'mrWhiteRules' : game.playStyle === 'questions' ? 'questionRules' : 'oneWordRules').map((rule) => <li key={rule}>{rule}</li>)}</ol>
            {game.playStyle === 'questions' && <p className="flow-note">{t('questionFlowHint')}</p>}
            {game.playStyle === 'questions' && pair && <div className="pair-card"><div>{t('pair', { asker: pair.asker, target: pair.target })}</div><button onClick={serveQuestionPair}>{t('anotherQuestion')}</button></div>}
            <button className="primary-btn full" onClick={() => setScreen(screens.voting)}>{t('startVoting')}</button>
          </div>
        )}

        {screen === screens.voting && game && (
          <div className="fade-in voting-screen">
            <header className="section-header"><span className="badge">{voteIndex + 1} / {game.order.length}</span><h2>{t('voting')}</h2><p>{t('votePrompt')}</p><p>{t('voteTurn', { player: game.order[voteIndex] })}</p></header>
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

        {screen === screens.mrWhiteGuess && game && (
          <div className="center-stack fade-in guess-screen">
            <span className="badge">Mr White</span>
            <h2>{t('mrWhiteCaught')}</h2>
            <p className="subtitle">{t('mrWhiteGuessSubtitle')}</p>
            <form className="guess-form" onSubmit={submitMrWhiteGuess}>
              <input autoFocus value={mrWhiteGuess} onChange={(event) => setMrWhiteGuess(event.target.value)} placeholder={t('mrWhiteGuessPlaceholder')} aria-label={t('mrWhiteGuessPlaceholder')} />
              <button className="primary-btn" disabled={!mrWhiteGuess.trim()}>{t('confirmGuess')}</button>
            </form>
          </div>
        )}

        {screen === screens.result && game && (
          <div className="center-stack fade-in">
            <span className="badge">{t('result')}</span>
            {resultType && <div className="result-illustration-wrap"><img className="result-illustration" src={resultImages[resultType]} alt={game.groupWon ? t('groupWins') : t('intrusWins')} loading="lazy" decoding="async" /></div>}
            <h2>{game.leaders.length > 1 ? t('tie') : game.groupWon ? t('groupWins') : t('intrusWins')}</h2>
            <p className="subtitle">{t('mostVoted', { names: game.leaders.join(t('and')) })}</p>
            {game.resultReason !== 'tie' && <p className="result-explanation">{t(`resultReasons.${game.resultReason}`)}</p>}
            <div className="result-details">
              <div>{t('normalWord', { word: roundWord() })}</div>
              {game.mode === 'undercover' && <div>{t('intrusWord', { word: intrusWord() })}</div>}
              {game.enableMrWhite && <div>{t('mrWhiteWas', { player: game.mrWhitePlayer })}</div>}
              <div className="role-reveal"><strong>{t('allRoles')}</strong>{game.order.map((player) => <span key={player}><b>{player}</b><em>{t(player === game.mrWhitePlayer ? 'roles.mrWhite' : game.outsiders.includes(player) ? game.mode === 'undercover' ? 'roles.undercover' : 'roles.outsider' : 'roles.civilian')}</em></span>)}</div>
            </div>
            <div className="score-card"><strong>{t('scores')}</strong><span>{t('groupScore')}: {score.group}</span><span>{t('hiddenScore')}: {score.hidden}</span></div>
            <button className="primary-btn" onClick={() => startRound(players)}>{t('samePlayers')}</button>
            <button className="ghost-btn" onClick={resetAll}>{t('newGame')}</button>
          </div>
        )}
        {screen !== screens.welcome && <a className="creator-credit app-footer" href="https://github.com/xdweeb" target="_blank" rel="noreferrer">{t('creator')}</a>}
      </section>
    </main>
  );
}
