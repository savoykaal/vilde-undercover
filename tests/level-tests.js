// Level checks: every map parses, every marker resolves, everything she has to
// reach is reachable, guard routes don't walk through walls, and every goal and
// line has copy.

import { LEVELS } from '../src/game/levels/index.js';
import { World } from '../src/game/world.js';
import { clearWalk, findPath } from '../src/game/geometry.js';

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

// Walkable ignoring doors (they all open at some point) and people.
function reachable(world, from, to) {
  const { map } = world;
  const doorTiles = new Set(world.entities.filter((e) => e.type === 'door').map((e) => e.ty * map.w + e.tx));
  const solid = (x, y) => {
    if (x < 0 || y < 0 || x >= map.w || y >= map.h) return true;
    const i = y * map.w + x;
    if (doorTiles.has(i)) return false;
    return map.solid[i] === 1 || world.dynSolid[i] > 0;
  };
  // A solid target (a terminal, a safe) counts as reached from any free neighbour.
  const tx = Math.floor(to.x);
  const ty = Math.floor(to.y);
  const goals = solid(tx, ty)
    ? [
        [tx + 1, ty],
        [tx - 1, ty],
        [tx, ty + 1],
        [tx, ty - 1],
      ].filter(([x, y]) => !solid(x, y))
    : [[tx, ty]];
  return goals.some((g) => findPath(solid, map.w, map.h, [from.x, from.y], g));
}

function strings(value, where) {
  if (Array.isArray(value)) value.forEach((v, i) => strings(v, `${where}[${i}]`));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([k, v]) => strings(v, `${where}.${k}`));
  else if (value === undefined) throw new Error(`Missing copy at ${where}`);
}

function checkRoute(w, id, pts) {
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    assert(
      clearWalk((x, y) => w.map.solid[y * w.map.w + x] === 1, a.x, a.y, b.x, b.y, 0.2),
      `${id} walks through a wall between ${a.x},${a.y} and ${b.x},${b.y}`,
    );
  }
}

const tests = {};

for (const [id, level] of Object.entries(LEVELS)) {
  tests[`${id}: builds, every marker resolves`] = () => {
    const w = new World(level);
    assert(w.entities.length > 0, 'no entities');
  };

  tests[`${id}: everything to reach is reachable from the start`] = () => {
    const w = new World(level);
    const start = w.player;
    for (const e of w.entities) {
      if (!['task', 'item', 'part', 'exit', 'zone', 'hide'].includes(e.type) || e.x == null) continue;
      assert(reachable(w, start, e), `${e.type} ${e.id ?? ''} at ${e.tx},${e.ty} is unreachable`);
    }
    for (const step of level.steps) {
      if (step.checkpoint) {
        const p = w.point(step.checkpoint);
        assert(reachable(w, start, p), `checkpoint ${step.checkpoint} unreachable`);
      }
    }
  };

  tests[`${id}: guard routes stay off walls`] = () => {
    const w = new World(level);
    const free = (x, y) => w.map.solid[y * w.map.w + x] !== 1;
    for (const e of w.entities) {
      if (e.type !== 'person' || e.path.length < 2) continue;
      for (const p of e.path) assert(free(Math.floor(p.x), Math.floor(p.y)), `${e.id} waypoint ${p.x},${p.y} inside a wall`);
      const pts = e.mode === 'route' || e.pingpong ? e.path : [...e.path, e.path[0]];
      checkRoute(w, e.id, pts);
    }
    for (const [name, route] of Object.entries(level.routes ?? {})) checkRoute(w, name, route.map((p) => w.point(p)));
  };

  tests[`${id}: steps have goals, targets and copy`] = () => {
    const w = new World(level);
    level.steps.forEach((step, i) => {
      if (step.goal !== undefined) assert(typeof step.goal === 'string' || typeof step.goal === 'function', `step ${i} goal missing`);
      if (step.target) assert(w.byId.has(step.target), `step ${i} target "${step.target}" missing`);
      strings(step.say ?? [], `${id}.steps[${i}].say`);
      strings(step.sayDone ?? [], `${id}.steps[${i}].sayDone`);
    });
    strings(level.copy, `${id}.copy`);
    assert(level.copy.title && level.copy.eyebrow, 'title/eyebrow missing');
  };

  tests[`${id}: script replays to every step without errors`] = () => {
    for (let k = 0; k < level.steps.length; k++) {
      const w = new World(level);
      w.start(k);
      assert(w.stepIndex === k, `resume at ${k} landed on ${w.stepIndex}`);
      for (let i = 0; i < 30; i++) w.update(1 / 30, { x: 0, y: 0 });
    }
  };
}

export function runLevelTests() {
  return Object.entries(tests).map(([name, fn]) => {
    try {
      fn();
      return { name, ok: true };
    } catch (error) {
      return { name, ok: false, error: error.message };
    }
  });
}
