import { strings } from '../src/i18n.js';
import { GADGETS, benchGadget, build, canBuild, freeParts, labState, perks } from '../src/engine/lab.js';
import { addPart } from '../src/engine/progress.js';
import { newProfile } from '../src/engine/storage.js';
import { LEVELS } from '../src/game/levels/index.js';
import { PART_FLOORS } from '../src/game/tower.js';
import { World } from '../src/game/world.js';

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

const tests = {
  'there are enough hidden parts in the game to build every gadget'() {
    let parts = PART_FLOORS.length;
    for (const level of Object.values(LEVELS)) parts += new World(level).partsHere.length;
    const needed = GADGETS.reduce((sum, g) => sum + g.parts, 0);
    assert(parts >= needed, `${parts} parts hidden, ${needed} needed`);
  },

  'gadgets are built in shelf order once enough parts are found'() {
    const profile = newProfile('T', 0);
    const state = labState(profile);
    assert(benchGadget(state).id === 'hook' && !canBuild(state, 'hook'), 'nothing to build yet');
    for (let i = 0; i < 3; i++) addPart(profile, `p${i}`);
    assert(canBuild(state, 'hook') && !canBuild(state, 'voice'), 'hook first');
    assert(build(state, 'hook') && freeParts(state) === 0, 'parts spent');
    assert(!build(state, 'hook'), 'no double build');
    assert(benchGadget(state).id === 'voice', 'next on the bench');
  },

  'the same part is never counted twice'() {
    const profile = newProfile('T', 0);
    assert(addPart(profile, 'c1-1') && !addPart(profile, 'c1-1'), 'duplicate part');
    assert(labState(profile).parts.length === 1, 'one part');
  },

  'built gadgets add up to perks'() {
    const profile = newProfile('T', 0);
    const state = labState(profile);
    for (let i = 0; i < 40; i++) addPart(profile, `p${i}`);
    for (const g of GADGETS) build(state, g.id);
    const p = perks(state);
    assert(p.towerLife === 1 && p.speedBoost > 1 && p.smoke === 1 && p.magnet > 1 && p.lightBoost > 1 && p.detectMul < 1, JSON.stringify(p));
  },

  'every gadget has a name, a description, a perk and a line'() {
    for (const g of GADGETS) {
      const copy = strings.lab.gadgets[g.id];
      assert(copy?.name && copy.desc && copy.parts.length >= g.parts && copy.mission.outro.text, `copy for ${g.id}`);
      assert(strings.lab.perks[g.id], `perk text for ${g.id}`);
    }
  },
};

export function runLabTests() {
  return Object.entries(tests).map(([name, fn]) => {
    try {
      fn();
      return { name, ok: true };
    } catch (err) {
      return { name, ok: false, error: err.message };
    }
  });
}
