import { useMemo, useState } from 'react';
import { CATEGORIES, WORD_BANK } from './data/wordBank';

const screens = { welcome: 'welcome', setup: 'setup', reveal: 'reveal', discussion: 'discussion', result: 'result' };

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getWords(category) {
  return category === 'global' ? Object.values(WORD_BANK).flat() : WORD_BANK[category];
}

export default function App() {
  const [screen, setScreen] = useState(screens.welcome);
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('global');
  const [usePairs, setUsePairs] = useState(true);
  const [outsiderCount, setOutsiderCount] = useState(1);
  const [game, setGame] = useState(null);
  const [revealIndex, setRevealIndex] = useState(0);
  const [isRoleVisible, setIsRoleVisible] = useState(false);
  const [pair, setPair] = useState(null);

  const canUseTwoOutsiders = players.length >= 6;
  const currentPlayer = game?.order[revealIndex];
  const isCurrentOutsider = currentPlayer ? game.outsiders.includes(currentPlayer) : false;
  const categoryLabel = useMemo(() => CATEGORIES.find((item) => item.id === category)?.label, [category]);

  function addPlayer(event) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName || players.includes(cleanName)) return;
    setPlayers([...players, cleanName]);
    setName('');
  }

  function removePlayer(player) {
    const nextPlayers = players.filter((item) => item !== player);
    setPlayers(nextPlayers);
    if (nextPlayers.length < 6) setOutsiderCount(1);
  }

  function startRound(samePlayers = players) {
    const order = shuffle(samePlayers);
    const words = getWords(category);
    const secretWord = pickRandom(words);
    const outsiders = shuffle(order).slice(0, outsiderCount);
    setGame({ order, secretWord, outsiders });
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
      return;
    }
    setRevealIndex(revealIndex + 1);
  }

  function generatePair() {
    const asker = pickRandom(players);
    let asked = pickRandom(players);
    while (asked === asker) asked = pickRandom(players);
    setPair({ asker, asked });
  }

  function resetAll() {
    setPlayers([]);
    setName('');
    setCategory('global');
    setUsePairs(true);
    setOutsiderCount(1);
    setGame(null);
    setScreen(screens.welcome);
  }

  return (
    <main className="app-shell" dir="rtl">
      <section className="hero-card">
        {screen === screens.welcome && (
          <div className="center-stack fade-in">
            <span className="badge">لعبة صحابك فالسهرة</span>
            <h1>برا السالفة</h1>
            <p className="subtitle">دخل صحابك، كشف الدور ديالك، وحاول ما تبانش!</p>
            <button className="primary-btn" onClick={() => setScreen(screens.setup)}>بدا اللعب</button>
          </div>
        )}

        {screen === screens.setup && (
          <div className="fade-in">
            <header className="section-header"><h2>وجد اللاعبين</h2><p>خاص على الأقل 3 لاعبين باش تبداو.</p></header>
            <form className="add-form" onSubmit={addPlayer}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="سمية اللاعب" aria-label="سمية اللاعب" />
              <button type="submit">زيد</button>
            </form>
            <div className="players-list">
              {players.map((player) => <span className="player-pill" key={player}>{player}<button onClick={() => removePlayer(player)} aria-label={`حيد ${player}`}>×</button></span>)}
            </div>
            <label className="field-label">الصنف</label>
            <div className="category-grid">
              {CATEGORIES.map((item) => <button key={item.id} className={category === item.id ? 'selected' : ''} onClick={() => setCategory(item.id)}>{item.emoji} {item.label}</button>)}
            </div>
            <label className="switch-row"><input type="checkbox" checked={usePairs} onChange={(e) => setUsePairs(e.target.checked)} /> خلي التطبيق يقول شكون يسول شكون</label>
            <label className="field-label">عدد لي برا السالفة</label>
            <div className="segmented"><button className={outsiderCount === 1 ? 'selected' : ''} onClick={() => setOutsiderCount(1)}>1</button><button disabled={!canUseTwoOutsiders} className={outsiderCount === 2 ? 'selected' : ''} onClick={() => setOutsiderCount(2)}>2 {canUseTwoOutsiders ? '' : '(6+)'}</button></div>
            <button className="primary-btn full" disabled={players.length < 3} onClick={() => startRound()}>خلط و بدا</button>
          </div>
        )}

        {screen === screens.reveal && currentPlayer && (
          <div className="center-stack fade-in safe-card">
            <span className="badge">{revealIndex + 1} / {game.order.length}</span>
            <h2>الدور ديال: {currentPlayer}</h2>
            {!isRoleVisible ? <button className="primary-btn" onClick={() => setIsRoleVisible(true)}>كشف الدور</button> : <div className="role-box">{isCurrentOutsider ? 'نتا برا السالفة 😈 حاول تفهم بلا ما تبان' : `الكلمة هي: ${game.secretWord}`}</div>}
            {isRoleVisible && <button className="ghost-btn" onClick={nextReveal}>خبي و دوز للي موراك</button>}
          </div>
        )}

        {screen === screens.discussion && game && (
          <div className="fade-in">
            <header className="section-header"><h2>دابا بداو النقاش</h2><p>الصنف: {categoryLabel}</p></header>
            <ol className="rules"><li>كل واحد يسول سؤال</li><li>ممنوع تقول الكلمة مباشرة</li><li>لي برا السالفة يحاول يفهم</li><li>الباقيين يحاولو يلقاو شكون برا</li></ol>
            {usePairs && pair && <div className="pair-card"><strong>{pair.asker}</strong> يسول <strong>{pair.asked}</strong><button onClick={generatePair}>سؤال آخر</button></div>}
            <button className="primary-btn full" onClick={() => setScreen(screens.result)}>كشف النتيجة</button>
          </div>
        )}

        {screen === screens.result && game && (
          <div className="center-stack fade-in">
            <span className="badge">النتيجة</span>
            <h2>برا السالفة كان: {game.outsiders.join(' و ')}</h2>
            <div className="word-result">الكلمة كانت: {game.secretWord}</div>
            <button className="primary-btn" onClick={() => startRound(players)}>جولة جديدة بنفس اللاعبين</button>
            <button className="ghost-btn" onClick={resetAll}>لعبة جديدة</button>
          </div>
        )}
      </section>
    </main>
  );
}
