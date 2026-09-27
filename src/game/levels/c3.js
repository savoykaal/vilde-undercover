// Kapitel 3 — Syvende sal. Card reader, a camera to hack, an open-plan office
// with two guards, a laser hallway, and the coffee guard on the stairs.
// The back door code is multiplication.

import { strings } from '../../i18n.js';

const L = strings.levels.c3;

const beam = (x, phase) => ({
  type: 'laser',
  id: `laser${x}`,
  from: { x: x + 0.5, y: 8 },
  to: { x: x + 0.5, y: 10 },
  on: 1.5,
  off: 1.7,
  phase,
});

export default {
  id: 'c3',
  theme: 'office',
  music: 'sneak',
  hideProp: 'locker',
  copy: L,
  items: { card: { color: '#59c3ff', label: L.card, short: '' } },
  map: [
    '###############',
    '#####.....#####',
    '#####..e..#####',
    '#######x#######',
    '#CC.........TT#',
    '#C.........k.*#',
    '#C....r.......#',
    '###########c###',
    '#.q.......f..s#',
    '#*.......n#...#',
    '##.############',
    '#.............#',
    '#.SS.SS.SS.SS.#',
    '#.SS.SS.SS.SS*#',
    '#.............#',
    '#.SS.SS.SS.SS.#',
    '#.SS.SS.SS.SS.#',
    '#.............#',
    '#.SS.SS.SS.SS.#',
    '#&SS.SS.SS.SS&#',
    '#......o......#',
    '#######g#######',
    '####......m####',
    '####.......####',
    '#*.#.......####',
    '#..#.......####',
    '#t.#.......####',
    '#..d.......####',
    '####.......####',
    '######a########',
    '#......l......#',
    '#.PP.......PP.#',
    '#......@......#',
    '#.............#',
    '###############',
  ],
  entities: [
    { type: 'door', id: 'a', at: 'a', locked: 'card', cardColor: '#59c3ff' },
    { type: 'door', id: 'd', at: 'd' },
    { type: 'door', id: 'g', at: 'g' },
    { type: 'door', id: 'f', at: 'f', locked: true },
    { type: 'door', id: 'c', at: 'c' },
    { type: 'door', id: 'x', at: 'x', locked: true },
    { type: 'camera', id: 'cam', at: 'm', sweep: [95, 175], period: 7, vision: { fov: 52, range: 6.5 } },
    { type: 'task', id: 'hack', at: 't', prop: 'terminal', game: 'hack', label: 'terminal', params: { size: 4 } },
    { type: 'task', id: 'scanner', at: 'n', prop: 'keypad', game: 'wires', label: 'scanner', params: { count: 4, hint: L.scannerHint } },
    { type: 'task', id: 'keypad', at: 'k', prop: 'keypad', game: 'keypad', label: 'keypad', params: { count: 3, hint: L.keypadHint } },
    { type: 'person', id: 'g1', look: 'guard', path: [[1, 14], [13, 14]], pingpong: true, speed: 1.35, wait: 1.6, vision: { fov: 68, range: 5.2 } },
    { type: 'person', id: 'g2', look: 'guard', path: [[13, 17], [1, 17]], pingpong: true, speed: 1.15, wait: 2, vision: { fov: 68, range: 5.2 } },
    {
      type: 'person',
      id: 'coffee',
      look: 'guard',
      at: 's',
      facing: 0,
      scan: [0, 180],
      scanPeriod: 8,
      catches: true,
      vision: { fov: 70, range: 5 },
      caughtSpeaker: 'frej',
      caughtLine: L.coffeeCaught,
      active: false,
    },
    beam(4, 0),
    beam(6, 1.1),
    beam(8, 2.2),
    { type: 'zone', id: 'hall', at: 'q', marker: 'q' },
    { type: 'exit', id: 'exit', at: 'e', active: false },
  ],
  steps: [
    {
      goal: L.goals.card,
      target: 'a',
      until: 'near:a',
      nearRange: 1.4,
      enter(g) {
        g.give('card');
      },
      say: L.lines.start,
    },
    {
      goal: L.goals.hack,
      target: 'hack',
      checkpoint: 'l',
      until: 'task:hack',
      say: L.lines.camera,
      done(g) {
        g.disable('cam');
        g.entity('hack').prop = 'monitor';
      },
      sayDone: L.lines.hacked,
    },
    {
      goal: L.goals.office,
      target: 'hall',
      checkpoint: 'o',
      until: 'zone:hall',
      say: L.lines.office,
    },
    {
      goal: L.goals.lasers,
      target: 'scanner',
      checkpoint: 'q',
      checkpointAngle: 0,
      until: 'task:scanner',
      say: L.lines.lasers,
      done(g) {
        g.open('f', { pan: true });
      },
      sayDone: L.lines.scanned,
    },
    {
      goal: L.goals.hide,
      target: 'c',
      checkpoint: [9, 8],
      checkpointAngle: 0,
      enter(g) {
        g.enable('coffee');
        for (const id of ['laser4', 'laser6', 'laser8']) g.disable(id);
      },
      until: (g) => g.player.y < 7,
      say: L.lines.twist,
    },
    {
      goal: L.goals.keypad,
      target: 'keypad',
      checkpoint: 'r',
      until: 'task:keypad',
      say: L.lines.copyRoom,
      done(g) {
        g.open('x', { pan: true });
        g.enable('exit');
      },
      sayDone: L.lines.open,
    },
    {
      goal: L.goals.exit,
      target: 'exit',
      until: 'exit:exit',
      enter(g) {
        g.enable('exit');
      },
    },
  ],
};
