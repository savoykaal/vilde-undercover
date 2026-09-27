// Muldvarpen — four detective rooms at night. Search the dark with your
// flashlight for three pieces of evidence (a torn photo, a dusty shoe print,
// a phone to redial), then point out the culprit on the deduction board.

import { strings } from '../../i18n.js';
import { clueValue } from '../../engine/mole.js';

const T = strings.mole;
const G = strings.levels.mole;

function moleLevel(ch, { map, hazards, extra = [], hideProp = 'locker' }) {
  const copy = T.chapters[ch];
  const shirt = clueValue(ch, 'photo');
  const shoe = clueValue(ch, 'shoe');
  const phone = clueValue(ch, 'phone');
  const evidence = ['photo', 'shoe', 'phone'];
  const found = (g) => evidence.filter((id) => g.entity(id).done).length;

  return {
    id: `m${ch + 1}`,
    theme: 'night',
    music: 'calm',
    hideProp,
    mole: ch,
    copy: {
      eyebrow: T.chapterOf(ch + 1),
      title: copy.title,
      teaser: copy.teaser,
      briefSpeaker: copy.intro[0][0],
      brief: copy.intro[0][1],
      tips: G.tips,
      done: copy.resolution,
    },
    map,
    entities: [
      { type: 'task', id: 'photo', at: 'p', prop: 'monitor', game: 'photo', label: 'photo', params: { shirt, result: T.clues.photo.clear(T.colors[shirt]) } },
      { type: 'task', id: 'shoe', at: 's', prop: 'print', solid: false, game: 'dust', label: 'print', params: { shape: 'shoe', result: T.clues.shoe.clear(shoe) } },
      { type: 'task', id: 'phone', at: 'f', prop: 'phone', game: 'simon', label: 'phone', params: { style: 'phone', rounds: [3, 4], digits: `28${phone}`, successText: T.clues.phone.clear(phone), hint: G.phoneHint } },
      { type: 'task', id: 'board', at: 'b', prop: 'board', game: 'deduce', label: 'board', params: { chapter: ch }, active: false },
      ...hazards,
      ...extra,
    ],
    steps: [
      {
        goal: G.goals.search(0),
        target: null,
        tick(g) {
          const n = found(g);
          if (n !== g.data.found) {
            if (g.data.found != null && n > g.data.found) g.say('mynthe', G.found[n - 1]);
            g.data.found = n;
            g.goal(G.goals.search(n));
          }
        },
        until: (g) => found(g) === 3,
        say: [...copy.intro.slice(1), ['mynthe', G.start]],
      },
      {
        goal: G.goals.board,
        target: 'board',
        enter(g) {
          g.enable('board');
        },
        until: 'task:board',
        say: [['janni', G.toBoard]],
      },
    ],
  };
}

// Robot vacuum: slow, short-sighted, beeps if it bumps into you.
const robot = (id, path, extra = {}) => ({
  type: 'person',
  id,
  look: 'robot',
  path,
  speed: 0.9,
  wait: 0.6,
  lookAround: false,
  vision: { fov: 110, range: 2.4 },
  caughtSpeaker: 'frej',
  caughtLine: G.robotCaught,
  ...extra,
});

const guard = (id, path, extra = {}) => ({
  type: 'person',
  id,
  look: 'nightguard',
  path,
  speed: 1.15,
  wait: 1.6,
  vision: { fov: 60, range: 4.6 },
  ...extra,
});

export const m1 = moleLevel(0, {
  map: [
    '#############',
    '#CC..SSS..CC#',
    '#...........#',
    '#.p.......f.#',
    '#.1.......2.#',
    '#....TTT....#',
    '#....TTT....#',
    '#.4.......3.#',
    '#...........#',
    '#SS..&....SS#',
    '#.....s.....#',
    '#*..........#',
    '#....b.....*#',
    '#...........#',
    '#.....@.....#',
    '#############',
  ],
  hazards: [robot('robot', ['1', '2', '3', '4'])],
  extra: [{ type: 'lamp', at: [6, 1], r: 2, a: 0.5 }],
});

export const m2 = moleLevel(1, {
  map: [
    '#############',
    '#SSS.f...SSS#',
    '#...........#',
    '#.CC..1..CC.#',
    '#.CC.....CC.#',
    '#...........#',
    '#*.SSS.SSS..#',
    '#...........#',
    '#.2.......3.#',
    '#.CC..s..CC.#',
    '#.CC.....CC.#',
    '#...........#',
    '#p....&....*#',
    '#.....b.....#',
    '#.....@.....#',
    '#############',
  ],
  hazards: [robot('robot', [[1, 2], [11, 2], [11, 5], [1, 5]], { speed: 1.05 }), robot('robot2', [[1, 11], [11, 11]], { pingpong: true, speed: 0.8 })],
});

export const m3 = moleLevel(2, {
  map: [
    '###############',
    '#TTTTT.f.TTTTT#',
    '#.............#',
    '#.1..........2#',
    '#..TT..TT..TT.#',
    '#..TT..TT..TT.#',
    '#*............#',
    '#..TT..TT..TT.#',
    '#..TT..TT..TT.#',
    '#.4....s.....3#',
    '#.............#',
    '#p...&..&....*#',
    '#......b......#',
    '#......@......#',
    '###############',
  ],
  hideProp: 'box',
  hazards: [guard('guard', ['1', '2', '3', '4'])],
  extra: [
    { type: 'lamp', at: [7, 1], r: 2.4, a: 0.6 },
  ],
});

export const m4 = moleLevel(3, {
  map: [
    '###############',
    '#p....S...S..f#',
    '#.SS..S.1.S...#',
    '#.SS......S.SS#',
    '#....SSSS.....#',
    '#.S.........S.#',
    '#.S.SS.2.SS.S.#',
    '#.S....s....S.#',
    '#*..SS...SS..&#',
    '#.............#',
    '#SSS.SS.SS.SSS#',
    '#.3.........4.#',
    '#......b.....*#',
    '#......@......#',
    '###############',
  ],
  hazards: [
    guard('guard', [[1, 9], [13, 9]], { pingpong: true, speed: 1.1, wait: 2 }),
    guard('guard2', [[3, 5], [11, 5]], { pingpong: true, speed: 0.95, wait: 2.4, vision: { fov: 60, range: 4 } }),
    robot('robot', ['3', '4'], { pingpong: true }),
  ],
});
