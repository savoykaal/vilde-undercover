// Kapitel 2 — Skygge i byen. Tail the man in the grey hat through town:
// not too close, not too far, and out of sight when he looks back.
// Then two grey hats swap bags — follow the bag, not the hat.

import { strings } from '../../i18n.js';

const L = strings.levels.c2;
const NEAR = 1.7;
const FAR = 7;

// The tailing rule, run every frame while a target is being followed.
function tail(g, dt, id) {
  const t = g.entity(id);
  const p = g.player;
  const d = Math.hypot(t.x - p.x, t.y - p.y);
  const s = (g.data.tail ??= { far: 0, near: 0 });
  s.far = d > FAR ? s.far + dt : Math.max(0, s.far - dt * 2);
  s.near = d < NEAR && !p.hidden ? s.near + dt : Math.max(0, s.near - dt * 2);
  if (s.far > 5) {
    s.far = s.near = 0;
    g.fail('janni', L.lost);
    return;
  }
  if (s.near > 2.2) {
    s.far = s.near = 0;
    g.fail('frej', L.tooClose);
    return;
  }
  const worry = Math.max(s.far / 5, s.near / 2.2);
  g.hud.meter = {
    label: d > FAR ? L.meter.far : d < NEAR ? L.meter.near : L.meter.good,
    value: 1 - worry,
    tone: worry > 0.45 ? 'bad' : d > FAR || d < NEAR ? 'warn' : 'ok',
  };
}

const HAT_PATH = ['0', '1', '2', '3', '4', '5', '6', '7', 'w'];
const HAT2_PATH = ['v', '8', [7, 12], [7, 10], '9', 'g'];

export default {
  id: 'c2',
  theme: 'city',
  music: 'sneak',
  hideProp: 'bush',
  copy: L,
  map: [
    '################',
    '################',
    '#######g########',
    '#,,,,,,.,,,,,,,#',
    '#,P,,,,.,,,,,P,#',
    '#,,,&,,.,,,,,,,#',
    '#,,,,,,.,,,,,,,#',
    '#,,P,B,.,B,P,,,#',
    '#,,,,,,9,,,,,,,#',
    '#,,,,&,.,&,,,,,#',
    '#======.=======#',
    '#..............#',
    '#.TT......BB...#',
    's......w8......v',
    '#.TT...........#',
    '#......7...&...#',
    '~~~~~=...=~~~~~~',
    '~~~~~=...=~~~~~~',
    '~~~~~=.u.=~~~~~~',
    '======...=======',
    '#..............#',
    '#*.....6...5...#',
    '###..__-__..####',
    '###..__-__..####',
    '###P.__-__..####',
    '###..__-__..####',
    '###..__-__P.####',
    '###..__-__.4####',
    '###..__-__..####',
    '###..K_-_K..####',
    '###..K_-_KP.####',
    '###..__-__&.####',
    '###..__-__..####',
    '###.2ZZZZZ.3####',
    '###..__-__..####',
    '###P.__-__..####',
    '###..__-__..####',
    '###.1__-__..####',
    '###..K_-__..####',
    '###..K_-__P.####',
    '###..__-__.*####',
    '###.0__-__..####',
    '###..__-__..####',
    '###k.__-__..####',
    '###.@__-__..####',
    '###..__-__..####',
    '################',
  ],
  start: '@',
  entities: [
    { type: 'hide', id: 'kiosk', at: 'k', prop: 'kiosk' },
    {
      type: 'person',
      id: 'hat',
      look: 'courier',
      bag: '#141418',
      path: HAT_PATH,
      mode: 'route',
      speed: 1.55,
      wait: 0,
      waits: { 1: 2.2, 4: 3.2, 8: 9999 },
      faces: { 1: 180, 4: 90, 8: 0 },
      vision: { fov: 80, range: 6.5, when: 'still' },
      caughtSpeaker: 'mynthe',
      caughtLine: L.spotted,
      friendly: true,
    },
    {
      type: 'person',
      id: 'hat2',
      look: 'hat2',
      bag: '#8a5a2b',
      path: HAT2_PATH,
      mode: 'route',
      speed: 1.55,
      wait: 0,
      waits: { 1: 9999, 4: 3.2 },
      faces: { 1: 180, 4: 90 },
      vision: { fov: 80, range: 6.5, when: 'still' },
      caughtSpeaker: 'mynthe',
      caughtLine: L.spotted,
      friendly: true,
      active: false,
    },
    { type: 'person', id: 'ped1', look: 'pedestrian', seed: 3, path: [[4, 22], [4, 32]], pingpong: true, speed: 1.2, wait: 0.5, vision: false, friendly: true },
    { type: 'person', id: 'ped2', look: 'pedestrian', seed: 8, path: [[11, 44], [11, 34]], pingpong: true, speed: 1.1, wait: 0.8, vision: false, friendly: true },
    { type: 'person', id: 'ped3', look: 'pedestrian', seed: 13, path: [[2, 11], [13, 11]], pingpong: true, speed: 1.0, wait: 1, vision: false, friendly: true },
    { type: 'person', id: 'ped4', look: 'pedestrian', seed: 21, path: [[1, 20], [14, 20]], pingpong: true, speed: 1.3, wait: 0.6, vision: false, friendly: true },
    { type: 'person', id: 'ped5', look: 'pedestrian', seed: 5, path: [[2, 3], [13, 3]], pingpong: true, speed: 0.9, wait: 1.5, vision: false, friendly: true },
  ],
  steps: [
    {
      goal: L.goals.follow,
      target: 'hat',
      checkpoint: '@',
      enter(g, { respawn }) {
        if (respawn) g.place('hat', '0', { wp: 1, angle: -90 });
      },
      tick: (g, dt) => tail(g, dt, 'hat'),
      until: 'arrive:hat:7',
      say: L.lines.start,
    },
    {
      goal: L.goals.square,
      target: 'hat',
      checkpoint: 'u',
      checkpointAngle: -90,
      enter(g, { respawn }) {
        g.enable('hat2');
        if (respawn) {
          g.place('hat', '7', { wp: 8, angle: -90 });
          g.place('hat2', 'v', { wp: 1, angle: 180 });
        }
      },
      tick: (g, dt) => tail(g, dt, 'hat'),
      until: 'arrive:hat2:1',
      sayDone: L.lines.twist,
    },
    {
      goal: L.goals.swap,
      target: 'hat2',
      enter(g) {
        g.hud.meter = null;
        g.after(1.6, () => {
          g.confetti(7.9, 13.2, 6);
          g.sfx('whoosh');
          g.entity('hat').bag = '#8a5a2b';
          g.entity('hat2').bag = '#141418';
          g.fire('swapped');
        });
      },
      until: 'swapped',
    },
    {
      goal: L.goals.bag,
      target: 'hat2',
      checkpoint: 'u',
      checkpointAngle: -90,
      enter(g, { respawn, replay }) {
        const hat = g.entity('hat');
        const hat2 = g.entity('hat2');
        hat.bag = '#8a5a2b';
        hat2.bag = '#141418';
        hat.path = [g.point('w'), g.point('s')];
        hat.waits = {};
        hat.faces = {};
        hat.vision = null;
        hat.active = true;
        hat2.active = true;
        hat2.waits = { 4: 3.2 };
        g.place('hat', 'w', { wp: 1, angle: 180 });
        g.place('hat2', '8', { wp: 2, angle: -90 });
        if (!respawn && !replay) {
          hat.state = 'wait';
          hat.waitT = 0.4;
        }
      },
      tick(g, dt) {
        const hat = g.entity('hat');
        if (hat.active && hat.state === 'done') g.disable('hat');
        const p = g.player;
        const d1 = Math.hypot(hat.x - p.x, hat.y - p.y);
        const d2 = Math.hypot(g.entity('hat2').x - p.x, g.entity('hat2').y - p.y);
        if (hat.active && d1 < 3.5 && d2 > 7.5) {
          g.data.tail = { far: 0, near: 0 };
          g.fail('janni', L.wrongHat);
          return;
        }
        tail(g, dt, 'hat2');
      },
      until: 'done:hat2',
      done(g) {
        g.hud.meter = null;
      },
      say: L.lines.bag,
      sayDone: L.lines.done,
    },
  ],
};
