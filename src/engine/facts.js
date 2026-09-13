// Fact generation and difficulty rules.
//
// A fact is an ordered pair a × b with a, b in 1..10, keyed "axb".
// A fact belongs to the table min(a, b): 3 × 9 is part of the 3-table,
// so "tables 1–5" means every fact that uses at least one factor from 1–5.

export const MIN_FACTOR = 1;
export const MAX_FACTOR = 10;

export const DIFFICULTIES = {
  let: {
    id: 'let',
    tables: [1, 5],
    input: 'choice',
    timer: null,
    missingFactorShare: 0,
    hardShare: null,
  },
  mellem: {
    id: 'mellem',
    tables: [1, 5],
    input: 'keypad',
    timer: { defaultOn: false, seconds: 20 },
    missingFactorShare: 0,
    hardShare: null,
  },
  svaer: {
    id: 'svaer',
    tables: [1, 10],
    input: 'keypad',
    timer: { defaultOn: true, seconds: 10 },
    missingFactorShare: 0.25,
    hardShare: 0.7, // share of questions drawn from the 6–10 tables
  },
};

export const factKey = (a, b) => `${a}x${b}`;
export const parseKey = (key) => key.split('x').map(Number);
export const twinKey = (key) => {
  const [a, b] = parseKey(key);
  return factKey(b, a);
};
export const tableOf = (a, b) => Math.min(a, b);
export const isHardFact = (key) => tableOf(...parseKey(key)) >= 6;

export function allFactKeys() {
  const keys = [];
  for (let a = MIN_FACTOR; a <= MAX_FACTOR; a++) {
    for (let b = MIN_FACTOR; b <= MAX_FACTOR; b++) keys.push(factKey(a, b));
  }
  return keys;
}

export function factPool(difficultyId) {
  const [lo, hi] = (DIFFICULTIES[difficultyId] ?? DIFFICULTIES.let).tables;
  return allFactKeys().filter((key) => {
    const t = tableOf(...parseKey(key));
    return t >= lo && t <= hi;
  });
}

export function shuffle(list, rng = Math.random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Plausible wrong answers: neighbouring multiples, the sum, the
// off-by-one row, near misses. Never random numbers.
export function distractors(a, b, count = 3, rng = Math.random) {
  const p = a * b;
  const seen = new Set([p]);
  const clean = (list) =>
    shuffle(list, rng).filter((n) => {
      if (!Number.isInteger(n) || n <= 0 || seen.has(n)) return false;
      seen.add(n);
      return true;
    });

  const neighbours = clean([a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b]);
  const tricky = clean([a + b, (a + 1) * (b + 1), (a - 1) * (b - 1), p + 1, p - 1]);
  const nearMisses = clean([p + 2, p - 2, p + 10, p - 10, p + 3, p + 4, p + 5]);

  const picked = [...neighbours.slice(0, 2), ...tricky.slice(0, 1)];
  const rest = [...neighbours.slice(2), ...tricky.slice(1), ...nearMisses];
  while (picked.length < count && rest.length) picked.push(rest.shift());
  return picked.slice(0, count);
}

export function choices(a, b, rng = Math.random) {
  return shuffle([a * b, ...distractors(a, b, 3, rng)], rng);
}

// "3, 6, 9, 12" — used by hints.
export function skipCount(step, times) {
  return Array.from({ length: times }, (_, i) => step * (i + 1));
}
