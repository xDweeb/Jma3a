function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function pairKey(pair) {
  return `${pair.asker}→${pair.target}`;
}

function buildDerangedPairs(askers, lastPair) {
  const players = [...new Set(askers)];
  if (players.length < 2) return [];

  const attempts = Math.max(24, players.length * 12);
  let bestPairs = null;
  let bestScore = -Infinity;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const targets = shuffle(players);
    if (targets.some((target, index) => target === askers[index])) continue;

    const pairs = askers.map((asker, index) => ({ asker, target: targets[index] }));
    const firstPair = pairs[0];

    if (lastPair && pairKey(firstPair) === pairKey(lastPair)) continue;

    let score = 0;
    if (lastPair) {
      if (firstPair.asker !== lastPair.asker) score += 4;
      if (firstPair.target !== lastPair.target) score += 4;
      if (firstPair.asker !== lastPair.asker && firstPair.target !== lastPair.target) score += 6;
      if (players.length >= 4) {
        if (pairs.every((pair) => pair.asker !== lastPair.asker)) score += 2;
        if (pairs.every((pair) => pair.target !== lastPair.target)) score += 2;
      }
    }

    score += new Set(pairs.map((pair) => pair.asker)).size;
    score += new Set(pairs.map((pair) => pair.target)).size;

    if (score > bestScore) {
      bestScore = score;
      bestPairs = pairs;
    }
  }

  if (bestPairs) return bestPairs;

  const rotatedTargets = shuffle(players);
  for (let offset = 1; offset < rotatedTargets.length; offset += 1) {
    const targets = rotatedTargets.slice(offset).concat(rotatedTargets.slice(0, offset));
    if (targets.some((target, index) => target === askers[index])) continue;
    const pairs = askers.map((asker, index) => ({ asker, target: targets[index] }));
    if (!lastPair || pairKey(pairs[0]) !== pairKey(lastPair)) return pairs;
  }

  return askers.map((asker, index) => ({ asker, target: players[(index + 1) % players.length] }));
}

export function buildQuestionPairQueue(players, lastPair = null) {
  if (players.length < 2) return [];

  const askers = shuffle(players);
  return buildDerangedPairs(askers, lastPair);
}