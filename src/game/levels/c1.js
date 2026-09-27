// Kapitel 1 — Den kodede besked. The basement HQ, and the tutorial:
// walk, use things, sneak past Frej's training patrol, crack two codes.

import { strings } from '../../i18n.js';

const L = strings.levels.c1;

export default {
  id: 'c1',
  theme: 'basement',
  music: 'calm',
  moveHint: true,
  copy: L,
  map: [
    '#############',
    '#SS#.....#SS#',
    '#*.#..e..#..#',
    '#..###x###..#',
    '#...........#',
    '#.TTT...TTT.#',
    '#.TcT...TkT.#',
    '#.....j.....#',
    '#P....o.....#',
    '######a######',
    '#...........#',
    '#.1.......2.#',
    '#...CC.CC...#',
    '#&..C...C..&#',
    '#...CC.CC...#',
    '#.4.......3.#',
    '#....C.C....#',
    '#*....q.....#',
    '######b######',
    '#...........#',
    '#.RRR..#TTT.#',
    '#.RRR..#TrT.#',
    '#.RRR..#...m#',
    '#......#....#',
    '#...........#',
    '#.TT.......*#',
    '#.TT......s.#',
    '#.....@.....#',
    '#############',
  ],
  entities: [
    { type: 'person', id: 'mynthe', look: 'mynthe', at: 'm', facing: 180, vision: false, solid: true, friendly: true, lines: L.talk.mynthe },
    { type: 'person', id: 'soeren', look: 'soeren', at: 's', facing: 180, vision: false, solid: true, friendly: true, lines: L.talk.soeren },
    { type: 'person', id: 'janni', look: 'janni', at: 'j', facing: 90, vision: false, solid: true, friendly: true, lines: L.talk.janni },
    {
      type: 'person',
      id: 'frej',
      look: 'frej',
      path: ['1', '2', '3', '4'],
      speed: 1.25,
      wait: 1.2,
      torch: true,
      vision: { fov: 70, range: 4.2 },
      caughtSpeaker: 'frej',
      caughtLine: L.caught,
    },
    { type: 'task', id: 'radio', at: 'r', prop: 'radio', game: 'tuner', label: 'radio' },
    { type: 'task', id: 'codebook', at: 'c', prop: 'codebook', game: 'cipher', label: 'codebook', params: { words: ['KURER', 'TORVEGADE'] } },
    { type: 'task', id: 'keypad', at: 'k', prop: 'terminal', game: 'keypad', label: 'keypad', params: { fixed: [[3, 5], [5, 6]], hint: L.keypadHint } },
    { type: 'door', id: 'b', at: 'b', locked: true },
    { type: 'door', id: 'a', at: 'a' },
    { type: 'door', id: 'x', at: 'x', locked: true },
    { type: 'exit', id: 'exit', at: 'e', active: false },
  ],
  steps: [
    {
      goal: L.goals.mynthe,
      target: 'mynthe',
      until: 'near:mynthe',
      nearRange: 2.2,
      say: L.lines.start,
    },
    {
      goal: L.goals.radio,
      target: 'radio',
      until: 'task:radio',
      done(g) {
        g.open('b', { pan: true });
      },
      sayDone: L.lines.radioDone,
    },
    {
      goal: L.goals.sneak,
      target: 'a',
      checkpoint: 'q',
      until: 'near:a',
      nearRange: 1.2,
      enter(g, { replay }) {
        if (!replay) g.music('sneak');
      },
      say: L.lines.sneak,
    },
    {
      goal: L.goals.codebook,
      target: 'codebook',
      checkpoint: 'o',
      until: 'task:codebook',
      enter(g, { replay }) {
        if (!replay) g.music('calm');
      },
      say: L.lines.office,
      sayDone: L.lines.codebookDone,
    },
    {
      goal: L.goals.keypad,
      target: 'keypad',
      until: 'task:keypad',
      done(g) {
        g.open('x', { pan: true });
        g.enable('exit');
      },
      sayDone: L.lines.keypadDone,
    },
    {
      goal: L.goals.exit,
      target: 'exit',
      until: 'exit:exit',
      enter(g) {
        g.enable('exit');
      },
      say: L.lines.exit,
    },
  ],
};
