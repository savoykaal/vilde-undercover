// Tower floors and the generated pipe puzzles.

import { TOWER_FLOORS, allTemplates, towerFloor } from '../src/game/tower.js';
import { World } from '../src/game/world.js';
import { clearWalk, findPath } from '../src/game/geometry.js';
import { flow, generatePipes } from '../src/game/minigames/hack.js';
import { seededRng } from './engine-tests.js';

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

const tests = {
  'every tower template (and its mirror) is solvable and guards stay off walls'() {
    for (const level of allTemplates()) {
      const w = new World(level);
      const door = w.entity('door');
      const solid = (x, y) => (x === door.tx && y === door.ty ? false : w.solidAt(x, y));
      const keypad = w.entity('keypad');
      const next = [
        [keypad.tx + 1, keypad.ty],
        [keypad.tx - 1, keypad.ty],
        [keypad.tx, keypad.ty + 1],
      ].find(([x, y]) => !solid(x, y));
      assert(next && findPath(solid, w.map.w, w.map.h, [w.player.x, w.player.y], next), `${level.id}: keypad unreachable`);
      const exit = w.entity('exit');
      assert(findPath(solid, w.map.w, w.map.h, [w.player.x, w.player.y], [exit.x, exit.y]), `${level.id}: stairs unreachable`);
      for (const e of w.entities) {
        if (e.type !== 'person' || e.path.length < 2) continue;
        for (let i = 1; i < e.path.length; i++) {
          const a = e.path[i - 1];
          const b = e.path[i];
          assert(clearWalk((x, y) => w.map.solid[y * w.map.w + x] === 1, a.x, a.y, b.x, b.y, 0.2), `${level.id} ${e.id}: route through wall`);
        }
      }
    }
  },

  'every floor from 1 to 10 builds'() {
    const rng = seededRng(3);
    for (let f = 1; f <= TOWER_FLOORS; f++) {
      const w = new World(towerFloor(f, { rng }));
      w.start(0);
      for (let i = 0; i < 20; i++) w.update(1 / 30, { x: 0, y: 0 });
    }
  },

  'pipe puzzles always have a solution and never start solved'() {
    const rng = seededRng(11);
    for (let i = 0; i < 200; i++) {
      const size = 4 + (i % 2);
      const p = generatePipes(size, rng);
      assert(!flow(p).solved, 'starts solved');
      const solved = { ...p, rot: p.rot.map(() => 0) };
      assert(flow(solved).solved, 'unsolvable');
    }
  },
};

export function runTowerTests() {
  return Object.entries(tests).map(([name, fn]) => {
    try {
      fn();
      return { name, ok: true };
    } catch (error) {
      return { name, ok: false, error: error.message };
    }
  });
}
