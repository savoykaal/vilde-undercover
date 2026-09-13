// Engine self-tests. Run in the browser via test.html or in Node:
//   node tests/run.js

import { allFactKeys, choices, distractors, factKey, factPool, isHardFact, parseKey } from '../src/engine/facts.js';
import {
  MAX_BOX,
  createSession,
  getRecord,
  isMastered,
  nextQuestion,
  recordResult,
} from '../src/engine/mastery.js';
import { emptyState, migrate, newProfile } from '../src/engine/storage.js';

export function seededRng(seed = 1) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const profileWith = (difficulty = 'let') => {
  const p = newProfile('Test', 0);
  p.settings.difficulty = difficulty;
  return p;
};
const q = (key) => {
  const [a, b] = parseKey(key);
  return { key, a, b };
};

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

const tests = {
  'correct answer promotes one box, capped at 4'() {
    const p = profileWith();
    const s = createSession();
    for (let i = 1; i <= 6; i++) {
      recordResult(p, s, q('3x4'), { firstTry: true, ms: 1500 });
      assert(getRecord(p, '3x4').box === Math.min(i, MAX_BOX), `box after ${i} = ${getRecord(p, '3x4').box}`);
    }
  },

  'miss drops the fact to box 0'() {
    const p = profileWith();
    const s = createSession();
    for (let i = 0; i < 3; i++) recordResult(p, s, q('6x7'), { firstTry: true, ms: 1500 });
    recordResult(p, s, q('6x7'), { firstTry: false, ms: 9000 });
    assert(getRecord(p, '6x7').box === 0, 'box should be 0');
    assert(getRecord(p, '6x7').streak === 0, 'streak should be 0');
  },

  'mastery needs box 4, streak 3 and median under 4 s'() {
    const fast = profileWith();
    const slow = profileWith();
    const s = createSession();
    for (let i = 0; i < 4; i++) {
      recordResult(fast, s, q('8x9'), { firstTry: true, ms: 2000 });
      recordResult(slow, s, q('8x9'), { firstTry: true, ms: 6000 });
    }
    assert(isMastered(getRecord(fast, '8x9')), 'fast should be mastered');
    assert(!isMastered(getRecord(slow, '8x9')), 'slow must not be mastered');
    assert(getRecord(slow, '8x9').box === 4, 'slow still reaches box 4');
  },

  'twin fact gets partial credit (3×7 helps 7×3)'() {
    const p = profileWith();
    const s = createSession();
    recordResult(p, s, q('3x7'), { firstTry: true, ms: 1500 });
    assert(getRecord(p, '7x3').box === 0, 'half credit is not a full box');
    recordResult(p, s, q('3x7'), { firstTry: true, ms: 1500 });
    assert(getRecord(p, '7x3').box === 1, `twin box = ${getRecord(p, '7x3').box}`);
  },

  'shortcut tip is shown only the first 3 times'() {
    const p = profileWith();
    const s = createSession();
    let shown = 0;
    for (const key of ['2x3', '4x5', '6x7', '8x9', '3x5']) {
      if (recordResult(p, s, q(key), { firstTry: true, ms: 1500 }).shortcut) shown++;
    }
    assert(shown === 3, `shown ${shown} times`);
  },

  'never the same fact twice in a row (all levels, 3000 questions)'() {
    for (const level of ['let', 'mellem', 'svaer']) {
      const rng = seededRng(7);
      const p = profileWith(level);
      let s = createSession();
      let prev = null;
      for (let i = 0; i < 3000; i++) {
        if (i % 25 === 0) s = createSession();
        const question = nextQuestion(p, s, { rng });
        if (s.count > 1) assert(question.key !== prev, `${level}: repeated ${question.key}`);
        prev = question.key;
        recordResult(p, s, question, { firstTry: rng() < 0.75, ms: 1000 + rng() * 5000 });
      }
    }
  },

  'session opens with two facts she reliably knows'() {
    const p = profileWith('svaer');
    const known = ['2x5', '10x4', '3x3'];
    const s0 = createSession();
    for (const key of known) for (let i = 0; i < 4; i++) recordResult(p, s0, q(key), { firstTry: true, ms: 1200 });
    recordResult(p, s0, q('7x8'), { firstTry: false, ms: 9000 });
    for (let seed = 1; seed < 30; seed++) {
      const s = createSession();
      const rng = seededRng(seed);
      const first = nextQuestion(p, s, { rng });
      const second = nextQuestion(p, s, { rng });
      const twins = known.flatMap((k) => [k, k.split('x').reverse().join('x')]);
      assert(twins.includes(first.key) && twins.includes(second.key), `warm-up gave ${first.key}, ${second.key}`);
    }
  },

  'new agent starts with anchor facts (×1, ×2, ×10)'() {
    const p = profileWith('let');
    const s = createSession();
    const rng = seededRng(3);
    for (let i = 0; i < 2; i++) {
      const [a, b] = parseKey(nextQuestion(p, s, { rng }).key);
      assert([1, 2, 10].includes(a) || [1, 2, 10].includes(b), `warm-up ${a}x${b}`);
    }
  },

  'missed fact comes back soon'() {
    const p = profileWith('svaer');
    const s = createSession();
    const rng = seededRng(11);
    for (let i = 0; i < 5; i++) recordResult(p, s, nextQuestion(p, s, { rng }), { firstTry: true, ms: 1500 });
    const missed = nextQuestion(p, s, { rng });
    recordResult(p, s, missed, { firstTry: false, ms: 8000 });
    const upcoming = [];
    for (let i = 0; i < 5; i++) {
      const next = nextQuestion(p, s, { rng });
      upcoming.push(next.key);
      recordResult(p, s, next, { firstTry: true, ms: 1500 });
    }
    assert(upcoming.includes(missed.key), `${missed.key} not in ${upcoming.join(', ')}`);
  },

  'weak facts are served far more often than mastered ones'() {
    const p = profileWith('let');
    const s0 = createSession();
    const pool = factPool('let');
    const weak = new Set(pool.slice(0, 10));
    for (const key of pool) {
      if (weak.has(key)) recordResult(p, s0, q(key), { firstTry: false, ms: 7000 });
      else for (let i = 0; i < 5; i++) recordResult(p, s0, q(key), { firstTry: true, ms: 1500 });
    }
    const rng = seededRng(5);
    let s = createSession();
    let weakHits = 0;
    const N = 3000;
    for (let i = 0; i < N; i++) {
      if (s.count >= 40) s = createSession();
      if (weak.has(nextQuestion(p, s, { rng }).key)) weakHits++;
    }
    // 10 of 75 facts would be ~13% at random.
    assert(weakHits / N > 0.4, `weak share ${(weakHits / N).toFixed(2)}`);
  },

  'Let and Mellem only use tables 1–5; Svær uses all 100 facts'() {
    assert(factPool('let').length === 75, 'let pool size');
    assert(factPool('mellem').length === 75, 'mellem pool size');
    assert(factPool('svaer').length === 100, 'svaer pool size');
    assert(factPool('let').every((k) => Math.min(...parseKey(k)) <= 5), 'let contains a 6–10 only fact');
  },

  'Svær draws about 70% from tables 6–10'() {
    const p = profileWith('svaer');
    const rng = seededRng(21);
    let s = createSession();
    let hard = 0;
    let counted = 0;
    for (let i = 0; i < 6000; i++) {
      if (s.count >= 30) s = createSession();
      const question = nextQuestion(p, s, { rng });
      recordResult(p, s, question, { firstTry: true, ms: 1500 });
      if (question.warmup) continue;
      counted++;
      if (isHardFact(question.key)) hard++;
    }
    const share = hard / counted;
    assert(share > 0.65 && share < 0.75, `hard share ${share.toFixed(3)}`);
  },

  'missing-factor questions only on Svær, with a correct answer'() {
    for (const level of ['let', 'mellem', 'svaer']) {
      const p = profileWith(level);
      const rng = seededRng(9);
      const s = createSession();
      let missing = 0;
      for (let i = 0; i < 400; i++) {
        const question = nextQuestion(p, s, { rng });
        if (question.type === 'missing') {
          missing++;
          const other = question.hidden === 'a' ? question.b : question.a;
          assert(other * question.answer === question.product, 'missing-factor answer wrong');
        }
        recordResult(p, s, question, { firstTry: true, ms: 1500 });
      }
      assert(level === 'svaer' ? missing > 50 : missing === 0, `${level}: ${missing} missing-factor questions`);
    }
  },

  'Let questions have 4 choices with plausible distractors'() {
    const rng = seededRng(2);
    for (const key of allFactKeys()) {
      const [a, b] = parseKey(key);
      const d = distractors(a, b, 3, rng);
      assert(d.length === 3, `${key}: ${d.length} distractors`);
      assert(new Set(d).size === 3, `${key}: duplicate distractor`);
      assert(!d.includes(a * b), `${key}: distractor equals answer`);
      assert(d.every((n) => n > 0), `${key}: non-positive distractor`);
      const c = choices(a, b, rng);
      assert(c.length === 4 && c.includes(a * b), `${key}: choices ${c}`);
    }
    const plausible = new Set([15, 8, 16, 9, 7, 20, 6, 11, 13, 14, 10, 22, 2]);
    for (let seed = 0; seed < 50; seed++) {
      for (const n of distractors(4, 3, 3, seededRng(seed))) assert(plausible.has(n), `4×3 got implausible ${n}`);
    }
  },

  'storage migrates garbage to a clean state and keeps valid data'() {
    assert(JSON.stringify(migrate(null)) === JSON.stringify(emptyState()), 'null');
    assert(JSON.stringify(migrate({ foo: 1 })) === JSON.stringify(emptyState()), 'no version');
    const p = newProfile('Vilde', 1);
    p.facts[factKey(3, 4)] = { box: 2 };
    delete p.meta;
    const state = migrate({ version: 1, activeProfileId: 'missing', profiles: { [p.id]: p } });
    assert(state.activeProfileId === p.id, 'active profile fixed');
    assert(state.profiles[p.id].meta.totalAnswered === 0, 'meta filled in');
    assert(state.profiles[p.id].facts['3x4'].box === 2, 'facts kept');
  },
};

export function runEngineTests() {
  return Object.entries(tests).map(([name, fn]) => {
    try {
      fn();
      return { name, ok: true };
    } catch (err) {
      return { name, ok: false, error: err.message };
    }
  });
}
