import { FLOORS, climb, createRun, finishRun, formatTime, patrolStep, tick, vaultState } from '../src/engine/vault.js';
import { newProfile } from '../src/engine/storage.js';

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

const tests = {
  'ten correct codes reach the roof'() {
    const run = createRun('mellem', false);
    let outcome = null;
    for (let i = 0; i < FLOORS; i++) outcome = climb(run);
    assert(outcome === 'roof' && run.floor === 10, `floor ${run.floor}, outcome ${outcome}`);
  },

  'patrol reaches her after the track length (6 on Let, 5 otherwise)'() {
    for (const [level, length] of [['let', 6], ['mellem', 5], ['svaer', 5]]) {
      const run = createRun(level, true);
      let outcome = null;
      let steps = 0;
      while (!outcome) {
        outcome = patrolStep(run);
        steps++;
      }
      assert(outcome === 'caught' && steps === length, `${level}: caught after ${steps}`);
    }
  },

  'Let never has a round clock; Mellem 90 s and Svær 60 s when on'() {
    assert(createRun('let', true).remainingMs === null, 'let has clock');
    assert(createRun('mellem', true).remainingMs === 90000, 'mellem');
    assert(createRun('svaer', true).remainingMs === 60000, 'svaer');
    assert(createRun('svaer', false).remainingMs === null, 'svaer off');
    const run = createRun('let', false);
    assert(tick(run, 999999) === null, 'let ran out of time');
  },

  'clock runs out and tracks elapsed time'() {
    const run = createRun('svaer', true);
    assert(tick(run, 30000) === null, 'too early');
    assert(tick(run, 30000) === 'time', 'should be out of time');
    assert(run.elapsedMs === 60000 && run.remainingMs === 0, 'elapsed/remaining');
  },

  'personal bests never go down'() {
    const state = vaultState(newProfile('T', 0));
    const good = createRun('let', false);
    for (let i = 0; i < 7; i++) climb(good);
    assert(finishRun(state, good, 'caught').floorRecord, 'first 7 is a record');
    const worse = createRun('let', false);
    climb(worse);
    const summary = finishRun(state, worse, 'caught');
    assert(!summary.floorRecord && state.bestFloor === 7, `best ${state.bestFloor}`);
    assert(state.run === null && state.runs === 2, 'run cleared and counted');
  },

  'fastest roof time is kept per level'() {
    const state = vaultState(newProfile('T', 0));
    const roof = (level, ms) => {
      const run = createRun(level, false);
      for (let i = 0; i < FLOORS; i++) climb(run);
      tick(run, ms);
      return finishRun(state, run, 'roof');
    };
    assert(roof('let', 50000).timeRecord, 'first roof is a record');
    assert(!roof('let', 70000).timeRecord, 'slower is not a record');
    assert(roof('let', 40000).timeRecord && state.bestRoofMs.let === 40000, 'faster replaces');
    assert(roof('svaer', 90000).timeRecord && state.bestRoofMs.let === 40000, 'levels are separate');
  },

  'time formats as m:ss'() {
    assert(formatTime(90000) === '1:30', formatTime(90000));
    assert(formatTime(9001) === '0:10', formatTime(9001));
    assert(formatTime(0) === '0:00', formatTime(0));
  },
};

export function runVaultTests() {
  return Object.entries(tests).map(([name, fn]) => {
    try {
      fn();
      return { name, ok: true };
    } catch (err) {
      return { name, ok: false, error: err.message };
    }
  });
}
