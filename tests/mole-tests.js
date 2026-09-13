import { strings } from '../src/i18n.js';
import {
  CHAPTERS,
  CLUES,
  CLUE_STEPS,
  CULPRITS,
  SUSPECTS,
  SUSPECT_IDS,
  TOTAL_STEPS,
  accuse,
  advanceBeat,
  chapterProgress,
  developClue,
  isUnlocked,
  moleState,
  skipClue,
  stepsDeveloped,
} from '../src/engine/mole.js';
import { newProfile } from '../src/engine/storage.js';

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

const fresh = () => moleState(newProfile('T', 0));

function toDeduction(state, ch) {
  const p = chapterProgress(state, ch);
  const intro = strings.mole.chapters[ch].intro.length;
  for (let i = 0; i < intro; i++) advanceBeat(state, ch, intro);
  for (let i = 0; i < TOTAL_STEPS; i++) developClue(p);
  return p;
}

const tests = {
  'each clue matches two suspects, any two clues identify exactly one'() {
    for (const clue of CLUES) {
      const values = new Set(SUSPECT_IDS.map((id) => SUSPECTS[id][clue]));
      for (const v of values) {
        const n = SUSPECT_IDS.filter((id) => SUSPECTS[id][clue] === v).length;
        assert(n === 2, `${clue}=${v} matches ${n}`);
      }
    }
    for (const id of SUSPECT_IDS) {
      for (let i = 0; i < CLUES.length; i++) {
        for (let j = i + 1; j < CLUES.length; j++) {
          const [a, b] = [CLUES[i], CLUES[j]];
          const matches = SUSPECT_IDS.filter((s) => SUSPECTS[s][a] === SUSPECTS[id][a] && SUSPECTS[s][b] === SUSPECTS[id][b]);
          assert(matches.length === 1, `${id} by ${a}+${b}: ${matches}`);
        }
      }
    }
    assert(new Set(CULPRITS).size === CHAPTERS, 'a different culprit each chapter');
  },

  'nine correct answers develop the wall, rotating between clues'() {
    const state = fresh();
    const p = chapterProgress(state, 0);
    p.phase = 'clues';
    const order = [];
    for (let i = 0; i < TOTAL_STEPS; i++) order.push(developClue(p).clue);
    assert(order.slice(0, 3).join() === 'photo,shoe,phone', order.join());
    assert(stepsDeveloped(p) === TOTAL_STEPS && p.phase === 'deduce', `phase ${p.phase}`);
  },

  'a revealed answer leaves the clue blurry and moves on'() {
    const state = fresh();
    const p = chapterProgress(state, 0);
    p.phase = 'clues';
    assert(skipClue(p) === 'shoe' && p.clues.photo === 0, 'skip photo');
    developClue(p);
    assert(p.clues.shoe === 1 && p.focus === 'phone', JSON.stringify(p));
    developClue(p);
    assert(p.focus === 'photo', 'photo comes back');
  },

  'a wrong accusation costs nothing and explains the mismatch'() {
    const state = fresh();
    const p = toDeduction(state, 0); // culprit: kasper
    const res = accuse(state, 0, 'holm');
    assert(!res.correct && p.ruledOut.includes('holm'), 'holm ruled out');
    assert(res.mismatch.clue === 'photo' && res.mismatch.evidence === 'blaa', JSON.stringify(res.mismatch));
    assert(p.phase === 'deduce' && stepsDeveloped(p) === TOTAL_STEPS, 'clues kept, still deducing');
    assert(accuse(state, 0, 'kasper').correct && p.phase === 'resolution', 'kasper is right');
  },

  'the right accusation leads to resolution and unlocks the next chapter'() {
    const state = fresh();
    toDeduction(state, 0);
    accuse(state, 0, CULPRITS[0]);
    const beats = strings.mole.chapters[0].resolution.length;
    let res;
    for (let i = 0; i < beats; i++) res = advanceBeat(state, 0, beats);
    assert(res.done && state.solved.includes(0) && !state.chapters[0], 'solved and cleared');
    assert(isUnlocked(state, 1) && !isUnlocked(state, 2), 'chapter 2 open only');
  },

  'every chapter and suspect has complete copy'() {
    const m = strings.mole;
    assert(m.chapters.length === CHAPTERS, 'four chapters');
    for (const [i, c] of m.chapters.entries()) {
      assert(c.title && c.teaser, `ch${i + 1}: title/teaser`);
      for (const part of ['intro', 'resolution']) {
        assert(c[part].length >= 2 && c[part].length <= 5, `ch${i + 1} ${part}: ${c[part].length} beats`);
        for (const [speaker] of c[part]) assert(strings.speakers[speaker] && strings.roles[speaker], `ch${i + 1}: speaker ${speaker}`);
      }
    }
    for (const id of SUSPECT_IDS) {
      const s = m.suspects[id];
      assert(s?.name && s.short && s.role && s.about, `suspect ${id}`);
    }
    for (const clue of CLUES) assert(m.clues[clue]?.name && m.mismatch[clue], `clue ${clue}`);
    assert(CLUE_STEPS === 3, 'three steps per clue');
  },
};

export function runMoleTests() {
  return Object.entries(tests).map(([name, fn]) => {
    try {
      fn();
      return { name, ok: true };
    } catch (err) {
      return { name, ok: false, error: err.message };
    }
  });
}
