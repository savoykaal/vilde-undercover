// Kapitel 5 — Kureren. Foggy harbour: sneak through the container yard past the
// courier's helpers, stall him with riddles, then lights out and a chase —
// straight into Frej and a cloud of confetti.

import { strings } from '../../i18n.js';

const L = strings.levels.c5;
const LOOP = ['1', '2', '3', '4'];

export default {
  id: 'c5',
  theme: 'harbour',
  music: 'sneak',
  hideProp: 'barrel',
  copy: L,
  routes: { chase: [...LOOP, LOOP[0]] },
  map: [
    '~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~',
    '~~~~~~~~~~~~~~~~~',
    '====....w....====',
    '#*..............#',
    '#..B...v.....B..#',
    '#...............#',
    '#1.............2#',
    '#.CCC.CCCCC.CCC.#',
    '#.CCC.CCCCC.CCC.#',
    '#...............#',
    '#..............*#',
    '#.CCCC.CCC.CCCC.#',
    '#.CCCC.CCC.CCCC.#',
    '#4....l........3#',
    '#CC.CCCC.CCCC.CC#',
    '#CC.CCCC.CCCC.CC#',
    '#...............#',
    '#.CCC.CC.CC.CCC.#',
    '#.CCC.CC.CC.CCC.#',
    '#*.............&#',
    '#CCCCC.CCC.CCCCC#',
    '#CCCCC.CCC.CCCCC#',
    '#...............#',
    '#.CC.CCC.CCC.CC.#',
    '#.CC.CCC.CCC.CC.#',
    '#&.............*#',
    '#..CC.......CC..#',
    '#..CC..@....CC..#',
    '#.f.....s.......#',
    '#...............#',
    '#################',
  ],
  entities: [
    { type: 'deco', id: 'boat', at: [8, 1], prop: 'boat', floor: true, active: false },
    { type: 'deco', id: 'van', at: [3, 30], prop: 'van', solid: true, cells: [[-1, 0], [0, 0], [1, 0]] },
    { type: 'deco', id: 'case', at: [4, 5], prop: 'suitcase' },
    { type: 'person', id: 'frej', look: 'frej', at: 'f', facing: -90, vision: false, solid: true, friendly: true, lines: L.talk.frej },
    { type: 'person', id: 'soeren', look: 'soeren', at: 's', facing: -90, vision: false, solid: true, friendly: true, lines: L.talk.soeren },
    { type: 'person', id: 'h1', look: 'henchman', path: [[1, 17], [15, 17]], pingpong: true, speed: 1.3, wait: 1.4, vision: { fov: 62, range: 5 } },
    { type: 'person', id: 'h2', look: 'henchman', path: [[15, 23], [1, 23]], pingpong: true, speed: 1.2, wait: 1.8, vision: { fov: 62, range: 5 } },
    { type: 'person', id: 'h3', look: 'henchman', at: [8, 20], facing: 215, scan: [215, 325], scanPeriod: 7, catches: true, vision: { fov: 58, range: 4.6 } },
    {
      type: 'person',
      id: 'courier',
      look: 'courier',
      bag: '#141418',
      path: ['w', 'v'],
      mode: 'route',
      speed: 1.3,
      wait: 0,
      vision: false,
      friendly: true,
      active: false,
    },
    { type: 'task', id: 'talk', at: 'v', solid: false, hidden: true, game: 'riddle', label: 'riddle', title: L.riddleTitle, params: { count: 3, speaker: 'kureren' }, active: false },
    { type: 'lamp', id: 'lamp1', at: [2, 6], r: 3.2, a: 0.75 },
    { type: 'lamp', id: 'lamp2', at: [14, 6], r: 3.2, a: 0.75 },
    { type: 'lamp', id: 'lamp3', at: [8, 17], r: 2.4, a: 0.55 },
    { type: 'lamp', id: 'headlights', at: [5, 28], r: 6, a: 0.9, active: false },
    { type: 'zone', id: 'lookout', at: 'l', marker: 'l' },
  ],
  steps: [
    {
      goal: L.goals.yard,
      target: 'lookout',
      until: 'zone:lookout',
      say: L.lines.start,
    },
    {
      goal: L.goals.watch,
      target: 'courier',
      checkpoint: 'l',
      checkpointAngle: -90,
      enter(g, { replay }) {
        g.enable('boat');
        g.enable('courier');
        if (!replay) {
          g.place('courier', 'w', { wp: 1, angle: 90 });
          g.panTo(g.entity('courier'), 2.2);
          g.sfx('whoosh');
        }
      },
      until: 'arrive:courier:1',
      say: L.lines.boat,
    },
    {
      goal: L.goals.talk,
      target: 'courier',
      checkpoint: 'l',
      enter(g) {
        const c = g.entity('courier');
        g.place('courier', 'v');
        c.state = 'still';
        c.angle = Math.PI / 2;
        g.enable('talk');
      },
      tick(g, dt) {
        const c = g.entity('courier');
        const p = g.player;
        c.angle = Math.atan2(p.y - c.y, p.x - c.x);
      },
      until: 'task:talk',
      say: L.lines.twist,
    },
    {
      goal: L.goals.chase,
      target: 'courier',
      enter(g, { replay, respawn }) {
        const c = g.entity('courier');
        c.path = LOOP.map((m) => g.point(m));
        c.mode = 'flee';
        c.speed = 2.85;
        c.state = 'move';
        // Run for the corner furthest from her, with a head start while the lights go out.
        const p = g.player;
        c.wp = c.path.reduce((best, q, i, all) => (Math.hypot(q.x - p.x, q.y - p.y) > Math.hypot(all[best].x - p.x, all[best].y - p.y) ? i : best), 0);
        if (!replay) p.stun = 1.4;
        c.friendly = true;
        for (const id of ['lamp1', 'lamp2', 'lamp3']) g.disable(id);
        g.enable('headlights');
        g.dark = 0.9;
        for (const id of ['h1', 'h2', 'h3']) g.disable(id);
        if (!replay) g.music('chase');
        if (replay || respawn) g.place('courier', 'v', { wp: c.wp });
      },
      tick(g) {
        const c = g.entity('courier');
        if (g.player.stun > 0) return;
        if (Math.hypot(c.x - g.player.x, c.y - g.player.y) < 0.9) g.fire('gotcha');
      },
      until: 'gotcha',
      say: L.lines.lightsOut,
    },
    {
      goal: L.goals.caught,
      target: null,
      enter(g, { replay }) {
        const c = g.entity('courier');
        c.mode = 'still';
        c.state = 'still';
        c.speed = 0;
        const f = g.entity('frej');
        g.place('frej', { x: c.x + Math.cos(c.angle) * 0.7, y: c.y + Math.sin(c.angle) * 0.7 });
        f.angle = c.angle + Math.PI;
        if (!replay) {
          g.confetti(c.x, c.y - 0.4, 140);
          g.shake(0.7);
          g.banner(L.gotcha, 'is-good');
          g.freeze = 2.8;
          g.after(3, () => g.fire('finale'));
        } else g.fire('finale');
      },
      until: 'finale',
      say: L.lines.caught,
    },
  ],
};
