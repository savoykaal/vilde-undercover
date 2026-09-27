// Nordlystårnet (Kodelåsen): ten floors, one night. Each floor is a small room
// built from a hand-made template (sometimes mirrored): sneak to the door at the
// top, tap in the code — a multiplication answer — and climb.

import { strings } from '../i18n.js';

// markers: @ start, k keypad, d door, e stairs up, q spot for a gadget part,
// digits for guard waypoints, m camera.
const TEMPLATES = [
  {
    tier: 0,
    map: [
      '###########',
      '#####e#####',
      '#####d#####',
      '#...k.....#',
      '#........q#',
      '#.P.....P.#',
      '#1.......2#',
      '#.........#',
      '#..T...T..#',
      '#.........#',
      '#....@....#',
      '###########',
    ],
    entities: [{ type: 'person', look: 'guard', path: ['1', '2'], pingpong: true, speed: 1.1, wait: 1.6, vision: { fov: 64, range: 4.6 } }],
  },
  {
    tier: 0,
    map: [
      '###########',
      '#####e#####',
      '#####d#####',
      '#...k.....#',
      '#1.......2#',
      '#.TT...TT.#',
      '#q........#',
      '#.TT...TT.#',
      '#4.......3#',
      '#.........#',
      '#&...@...&#',
      '###########',
    ],
    entities: [{ type: 'person', look: 'guard', path: ['1', '2', '3', '4'], speed: 1.15, wait: 1, vision: { fov: 64, range: 4.6 } }],
  },
  {
    tier: 1,
    map: [
      '###########',
      '#####e#####',
      '#####d#####',
      '#...k....q#',
      '#1.......2#',
      '#..S...S..#',
      '#..S...S..#',
      '#3.......4#',
      '#.........#',
      '#....@....#',
      '###########',
    ],
    entities: [
      { type: 'person', look: 'guard', path: ['1', '2'], pingpong: true, speed: 1.2, wait: 1.4, vision: { fov: 64, range: 4.8 } },
      { type: 'person', look: 'guard', path: ['4', '3'], pingpong: true, speed: 1.0, wait: 1.8, vision: { fov: 64, range: 4.8 } },
    ],
  },
  {
    tier: 1,
    map: [
      '###########',
      '#####e#####',
      '#####d#####',
      '#m..k.....#',
      '#.........#',
      '#..C...C..#',
      '#..C...C.q#',
      '#.........#',
      '#1.......2#',
      '#.........#',
      '#....@....#',
      '###########',
    ],
    entities: [
      { type: 'camera', at: 'm', sweep: [15, 85], period: 6, vision: { fov: 48, range: 6 } },
      { type: 'person', look: 'guard', path: ['1', '2'], pingpong: true, speed: 1.2, wait: 1.4, vision: { fov: 64, range: 4.6 } },
    ],
  },
  {
    tier: 2,
    map: [
      '###########',
      '#####e#####',
      '#####d#####',
      '#...k.....#',
      '#1.......2#',
      '#.........#',
      '#..P...P..#',
      '#.........#',
      '#q........#',
      '#....@....#',
      '###########',
    ],
    entities: [
      { type: 'person', look: 'guard', path: ['1', '2'], pingpong: true, speed: 1.25, wait: 1.2, vision: { fov: 64, range: 4.6 } },
      { type: 'laser', from: { x: 1, y: 5.5 }, to: { x: 10, y: 5.5 }, on: 1.4, off: 1.8, phase: 0 },
      { type: 'laser', from: { x: 1, y: 7.5 }, to: { x: 10, y: 7.5 }, on: 1.4, off: 1.8, phase: 1.6 },
    ],
  },
  {
    tier: 2,
    map: [
      '###########',
      '#####e#####',
      '#####d#####',
      '#...k....m#',
      '#1...2....#',
      '#.SS...SS.#',
      '#.SS...SS.#',
      '#3.......4#',
      '#.......q.#',
      '#&...@...&#',
      '###########',
    ],
    entities: [
      { type: 'camera', at: 'm', sweep: [100, 170], period: 7, vision: { fov: 46, range: 6 } },
      { type: 'person', look: 'guard', path: ['1', '2'], pingpong: true, speed: 1.1, wait: 1.6, vision: { fov: 64, range: 4.4 } },
      { type: 'person', look: 'guard', path: ['3', '4'], pingpong: true, speed: 1.2, wait: 1.4, vision: { fov: 64, range: 4.6 } },
    ],
  },
];

export const TOWER_FLOORS = 10;
export const PART_FLOORS = [3, 6, 9];
export const templateCount = TEMPLATES.length;

const tierFor = (floor) => (floor <= 2 ? 0 : floor <= 5 ? 1 : floor <= 8 ? 2 : 2);

function mirrorPoint(p, w) {
  if (Array.isArray(p)) return [w - 1 - p[0], p[1]];
  if (p && typeof p === 'object') return { x: w - p.x, y: p.y };
  return p; // marker names move with the map
}

function mirrorEntity(e, w) {
  const out = { ...e };
  if (e.at) out.at = mirrorPoint(e.at, w);
  if (e.path) out.path = e.path.map((p) => mirrorPoint(p, w));
  if (e.from) out.from = mirrorPoint(e.from, w);
  if (e.to) out.to = mirrorPoint(e.to, w);
  if (e.sweep) out.sweep = e.sweep.map((a) => 180 - a).reverse();
  return out;
}

// floor: 1-based floor number being climbed. hooks: { onAttempt(correct) }.
export function towerFloor(floor, { rng = Math.random, templateIndex = null, mirror = null, hooks = {} } = {}) {
  const tier = tierFor(floor);
  const pool = TEMPLATES.map((t, i) => [t, i]).filter(([t]) => t.tier === tier || (tier === 2 && t.tier === 1 && floor < 9));
  const [tpl] = templateIndex != null ? [TEMPLATES[templateIndex]] : pool[Math.floor(rng() * pool.length)];
  const flip = mirror ?? rng() < 0.5;
  const w = tpl.map[0].length;
  const map = flip ? tpl.map.map((row) => [...row].reverse().join('')) : [...tpl.map];
  const t = strings.vault;

  const entities = tpl.entities.map((e, i) => ({ id: `${e.type}${i}`, ...(flip ? mirrorEntity(e, w) : e) }));
  const hasPartSpot = map.some((row) => row.includes('q'));
  if (PART_FLOORS.includes(floor) && hasPartSpot) entities.push({ type: 'part', id: `tower-${floor}`, at: 'q' });

  return {
    id: `tower${floor}`,
    theme: 'tower',
    music: 'sneak',
    hideProp: 'locker',
    tower: true,
    copy: { eyebrow: t.floorLabel(floor), title: strings.missions.vault.title },
    map,
    entities: [
      ...entities,
      { type: 'door', id: 'door', at: 'd', locked: true },
      {
        type: 'task',
        id: 'keypad',
        at: 'k',
        prop: 'keypad',
        game: 'keypad',
        label: 'keypad',
        params: { count: 1, hint: t.keypadHint, onAttempt: hooks.onAttempt },
      },
      { type: 'exit', id: 'exit', at: 'e', active: false },
    ],
    steps: [
      {
        goal: t.goals.door(floor),
        target: 'keypad',
        until: 'task:keypad',
        tick: hooks.tick,
        done(g) {
          g.open('door');
          g.enable('exit');
        },
      },
      {
        goal: t.goals.up,
        target: 'exit',
        tick: hooks.tick,
        until: 'exit:exit',
      },
    ],
  };
}

export const allTemplates = () => TEMPLATES.map((_, i) => [false, true].map((mirror) => towerFloor(PART_FLOORS[0], { templateIndex: i, mirror }))).flat();
