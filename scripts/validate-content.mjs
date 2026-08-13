import { CATEGORIES, WORD_BANK } from '../src/data/wordBank.js';
import { WORD_PAIRS } from '../src/data/wordPairs.js';
import { LANGUAGES, translations } from '../src/i18n/translations.js';
import { buildQuestionPairQueue } from '../src/utils/questionPairing.js';

const codes = LANGUAGES.map(({ code }) => code);
const categories = Object.keys(WORD_BANK);

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function assertNonEmpty(value, message) {
  assert(typeof value === 'string' && value.trim().length > 0, message);
}

for (const code of codes) {
  assert(translations[code], `Missing translation block for ${code}`);
  assert(translations[code].categories, `Missing categories block for ${code}`);
  assertNonEmpty(translations[code].allCategories, `Missing allCategories for ${code}`);
  assertNonEmpty(translations[code].selectCategoriesHint, `Missing selectCategoriesHint for ${code}`);
  assertNonEmpty(translations[code].mrWhiteComingSoon, `Missing mrWhiteComingSoon for ${code}`);
  assertNonEmpty(translations[code].questionFlowHint, `Missing questionFlowHint for ${code}`);
}

assert(CATEGORIES.some((item) => item.id === 'global'), 'Missing global category in CATEGORIES');

for (const category of categories) {
  const bank = WORD_BANK[category];
  const lengths = codes.map((code) => bank[code]?.length ?? -1);
  assert(lengths.every((length) => length > 0), `Empty word list in ${category}`);
  assert(new Set(lengths).size === 1, `Mismatched word counts in ${category}`);
  for (const code of codes) {
    for (const word of bank[code]) assertNonEmpty(word, `Empty classic word in ${category}.${code}`);
    assertNonEmpty(translations[code].categories[category], `Missing category label ${category} in ${code}`);
  }
}

for (const [category, pairs] of Object.entries(WORD_PAIRS)) {
  assert(categories.includes(category), `Pair category without classic bank: ${category}`);
  assert(pairs.length > 0, `No pairs defined for ${category}`);
  for (const pair of pairs) {
    for (const code of codes) {
      const [first, second] = pair[code] ?? [];
      assertNonEmpty(first, `Missing first pair word in ${category}.${code}`);
      assertNonEmpty(second, `Missing second pair word in ${category}.${code}`);
      assert(first !== second, `Pair words are identical in ${category}.${code}: ${first}`);
    }
  }
}

console.log(`Validated ${categories.length} classic categories and ${Object.keys(WORD_PAIRS).length} undercover categories.`);
for (const category of categories) {
  const sampleCount = WORD_BANK[category].ar.length;
  console.log(`${category}: ${sampleCount} classic words, ${WORD_PAIRS[category]?.length ?? 0} pairs`);
}

function validateQuestionPairs(players, iterations) {
  let lastPair = null;
  let queue = [];
  let immediateRepeats = 0;
  let selfPairs = 0;
  let bothChanged = 0;

  for (let index = 0; index < iterations; index += 1) {
    if (queue.length === 0) queue = buildQuestionPairQueue(players, lastPair);
    const [pair, ...rest] = queue;
    queue = rest;
    assert(pair, `Question pair generator returned no pair for ${players.length} players`);
    if (pair.asker === pair.target) selfPairs += 1;
    if (lastPair) {
      if (pair.asker === lastPair.asker && pair.target === lastPair.target) immediateRepeats += 1;
      if (players.length >= 4 && pair.asker !== lastPair.asker && pair.target !== lastPair.target) bothChanged += 1;
    }
    lastPair = pair;
  }

  assert(selfPairs === 0, `Self-pair found for ${players.length} players`);
  assert(immediateRepeats === 0, `Immediate repeated pair found for ${players.length} players`);
  if (players.length >= 4) assert(bothChanged >= Math.floor(iterations / 5), `Question variation too low for ${players.length} players`);
}

validateQuestionPairs(['A', 'B', 'C'], 50);
validateQuestionPairs(['A', 'B', 'C', 'D'], 50);

console.log('Validated question-pair fairness for 3-player and 4-player cases.');