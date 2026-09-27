import { strings } from '../src/i18n.js';
import { CHAPTERS, CLUES, CULPRITS, SUSPECTS, SUSPECT_IDS, clueValue, mismatch } from '../src/engine/mole.js';

function assert(cond, message) {
  if (!cond) throw new Error(message);
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

  'the evidence in each chapter fits only its culprit'() {
    for (let ch = 0; ch < CHAPTERS; ch++) {
      const fits = SUSPECT_IDS.filter((id) => CLUES.every((c) => SUSPECTS[id][c] === clueValue(ch, c)));
      assert(fits.length === 1 && fits[0] === CULPRITS[ch], `chapter ${ch + 1}: ${fits}`);
    }
  },

  'a wrong accusation is explained by the first clue that does not fit'() {
    const m = mismatch(0, 'holm'); // culprit: kasper
    assert(m.clue === 'photo' && m.evidence === 'blaa' && m.suspectValue === 'roed', JSON.stringify(m));
    assert(mismatch(0, 'kasper') === null, 'the culprit fits everything');
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
    for (const clue of CLUES) assert(m.clues[clue]?.clear && m.mismatch[clue], `clue ${clue}`);
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
