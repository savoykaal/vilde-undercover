// Kapitel 4 — Den stjålne fil. A dark archive: follow the beeping signal to
// drawer G-42, find it empty, steal the keycard from the guards' break room and
// crack the director's safe by feel.

import { strings } from '../../i18n.js';

const L = strings.levels.c4;

function signal(g, dt) {
  const d = g.entity('drawer');
  const dist = Math.hypot(d.x - g.player.x, d.y - g.player.y);
  const strength = Math.max(0, Math.min(1, 1 - (dist - 1) / 13));
  g.hud.meter = { label: L.signal, value: strength, tone: strength > 0.75 ? 'ok' : 'warn' };
  g.data.beep = (g.data.beep ?? 0) - dt;
  if (g.data.beep <= 0) {
    g.sfx('ping');
    g.data.beep = 0.18 + (1 - strength) * 1.3;
  }
}

export default {
  id: 'c4',
  theme: 'archive',
  music: 'sneak',
  hideProp: 'locker',
  copy: L,
  items: { card: { color: '#e0566b', label: L.card } },
  map: [
    '#################',
    '#*....#####k...h#',
    '#..v..#####.TT..#',
    '#.....#####&....#',
    '###o#########b###',
    '#..............*#',
    '#.SSSSSS.SSSSSS.#',
    '#.......3.......#',
    '#.SSSSSSSSSSSSS.#',
    '#1.............2#',
    '#.SSSSSS.SSSSSS.#',
    '#...............#',
    '#.SSSSdSSSSSSSS.#',
    '#&..............#',
    '#.SSSSSS.SSSSSS.#',
    '#4......5......6#',
    '#.SSSSSSSSSSSSS.#',
    '#*.............&#',
    '#.SSSSSS.SSSSSS.#',
    '#.......e......*#',
    '########@########',
  ],
  startAngle: -Math.PI / 2,
  entities: [
    { type: 'task', id: 'drawer', at: 'd', prop: 'drawer', game: 'lockpick', label: 'drawer', params: { pins: 4 } },
    { type: 'task', id: 'safe', at: 'v', prop: 'safe', game: 'safe', label: 'safe', params: { count: 3 } },
    { type: 'item', id: 'card', at: 'k', item: 'card', color: '#e0566b', label: L.cardFound, active: false },
    { type: 'door', id: 'o', at: 'o', locked: 'card', cardColor: '#e0566b' },
    { type: 'door', id: 'b', at: 'b' },
    { type: 'person', id: 'g1', look: 'nightguard', path: ['1', '2', '6', '4'], speed: 1.25, wait: 1.4, vision: { fov: 60, range: 5 } },
    { type: 'person', id: 'g2', look: 'nightguard', path: [[1, 7], [15, 7]], pingpong: true, speed: 1.1, wait: 2, vision: { fov: 60, range: 5 }, active: false },
    { type: 'person', id: 'pause', look: 'guard', at: 'h', facing: 150, scan: [150, 70], scanPeriod: 9, catches: true, vision: { fov: 64, range: 4.5 }, caughtSpeaker: 'soeren', caughtLine: L.breakCaught },
    { type: 'lamp', at: [12, 2], r: 2.6, a: 0.8 },
    { type: 'lamp', at: 'e', r: 1.8, a: 0.7 },
    { type: 'exit', id: 'exit', at: 'e', active: false },
  ],
  steps: [
    {
      goal: L.goals.signal,
      target: null,
      tick: signal,
      until: 'near:drawer',
      nearRange: 1.6,
      say: L.lines.start,
    },
    {
      goal: L.goals.drawer,
      target: 'drawer',
      tick: signal,
      until: 'task:drawer',
      done(g) {
        g.hud.meter = null;
        g.enable('g2');
        g.enable('card');
      },
      sayDone: L.lines.empty,
    },
    {
      goal: L.goals.card,
      target: 'card',
      checkpoint: [6, 11],
      until: 'pickup:card',
      enter(g) {
        g.enable('g2');
        g.enable('card');
      },
      sayDone: L.lines.gotCard,
    },
    {
      goal: L.goals.office,
      target: 'o',
      until: 'near:o',
      nearRange: 1.3,
    },
    {
      goal: L.goals.safe,
      target: 'safe',
      checkpoint: [3, 3],
      until: 'task:safe',
      say: L.lines.safe,
      sayDone: L.lines.file,
    },
    {
      goal: L.goals.exit,
      target: 'exit',
      enter(g) {
        g.enable('exit');
      },
      until: 'exit:exit',
      say: L.lines.out,
    },
  ],
};
