import { strings } from '../src/i18n.js';
import {
  CHAPTERS,
  QUESTIONS_PER_PART,
  SEGMENTS,
  advanceChapter,
  cluesFound,
  hqState,
  isUnlocked,
  nextOpenChapter,
  positionFor,
} from '../src/engine/hq.js';
import { newProfile } from '../src/engine/storage.js';

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

const lengths = (ch) => {
  const c = strings.hq.chapters[ch];
  return { brief: c.brief.length, twist: c.twist.length, resolution: c.resolution.length };
};

function playChapter(state, ch) {
  const steps = [];
  let res;
  do {
    res = advanceChapter(state, ch, lengths(ch));
    steps.push(res.done ? 'done' : SEGMENTS[res.pos.segment]);
  } while (!res.done);
  return steps;
}

const tests = {
  'chapters unlock in order'() {
    const state = hqState(newProfile('T', 0));
    assert(isUnlocked(state, 0) && !isUnlocked(state, 1), 'only chapter 1 open');
    playChapter(state, 0);
    assert(isUnlocked(state, 1) && !isUnlocked(state, 2), 'chapter 2 opens after 1');
    assert(nextOpenChapter(state) === 1, 'next open is 2');
  },

  'a chapter runs brief → 5 questions → twist → 5 questions → resolution'() {
    const state = hqState(newProfile('T', 0));
    const l = lengths(0);
    const steps = playChapter(state, 0);
    const total = l.brief + QUESTIONS_PER_PART + l.twist + QUESTIONS_PER_PART + l.resolution;
    assert(steps.length === total, `${steps.length} steps, expected ${total}`);
    assert(steps.at(-1) === 'done' && state.solved.includes(0), 'solved');
    assert(!state.progress[0], 'progress cleared');
  },

  'position is saved mid-chapter and clues count across both parts'() {
    const state = hqState(newProfile('T', 0));
    const l = lengths(2);
    for (let i = 0; i < l.brief + 3; i++) advanceChapter(state, 2, l);
    assert(cluesFound(positionFor(state, 2)) === 3, `clues ${cluesFound(positionFor(state, 2))}`);
    for (let i = 0; i < 2 + l.twist + 1; i++) advanceChapter(state, 2, l);
    const pos = positionFor(state, 2);
    assert(SEGMENTS[pos.segment] === 'partB' && pos.index === 1, JSON.stringify(pos));
    assert(cluesFound(pos) === 6, `clues ${cluesFound(pos)}`);
  },

  'replaying a solved chapter keeps it solved'() {
    const state = hqState(newProfile('T', 0));
    playChapter(state, 0);
    advanceChapter(state, 0, lengths(0));
    assert(state.solved.includes(0) && state.progress[0], 'replay in progress, still solved');
    playChapter(state, 0);
    assert(state.solved.filter((c) => c === 0).length === 1, 'listed once');
  },

  'every chapter has a full script with known speakers and 10 questions'() {
    assert(strings.hq.chapters.length === CHAPTERS, 'five chapters');
    for (const [i, c] of strings.hq.chapters.entries()) {
      assert(c.title && c.teaser, `ch${i + 1}: title/teaser`);
      assert(c.stepsA.length === QUESTIONS_PER_PART && c.stepsB.length === QUESTIONS_PER_PART, `ch${i + 1}: steps`);
      assert(c.setbacks.length >= 2, `ch${i + 1}: setbacks`);
      for (const part of ['brief', 'twist', 'resolution']) {
        assert(c[part].length >= 2 && c[part].length <= 5, `ch${i + 1} ${part}: ${c[part].length} beats`);
        for (const [speaker, text] of c[part]) {
          assert(strings.speakers[speaker], `ch${i + 1} ${part}: unknown speaker ${speaker}`);
          const shown = typeof text === 'function' ? text('Vilde') : text;
          assert(shown.length <= 140, `ch${i + 1} ${part}: beat too long (${shown.length}) "${shown}"`);
        }
      }
    }
  },
};

export function runHqTests() {
  return Object.entries(tests).map(([name, fn]) => {
    try {
      fn();
      return { name, ok: true };
    } catch (err) {
      return { name, ok: false, error: err.message };
    }
  });
}
