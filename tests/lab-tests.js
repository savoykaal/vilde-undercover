import { strings } from '../src/i18n.js';
import { GADGETS, MISSION_STEPS, addPart, advanceMission, currentGadget, labState, missionStep, selectBlueprint, unfinishedMission } from '../src/engine/lab.js';
import { newProfile } from '../src/engine/storage.js';

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

const fresh = () => labState(newProfile('T', 0));

const tests = {
  'six gadgets need 30 parts in total, built in shelf order by default'() {
    const state = fresh();
    const order = [];
    let answers = 0;
    let result;
    while ((result = addPart(state))) {
      answers++;
      if (result.completed) order.push(result.gadgetId);
    }
    assert(answers === 30, `${answers} parts`);
    assert(order.join() === GADGETS.map((g) => g.id).join(), order.join());
    assert(currentGadget(state) === null, 'nothing left on the bench');
  },

  'switching blueprint keeps the parts already collected'() {
    const state = fresh();
    addPart(state);
    addPart(state);
    selectBlueprint(state, 'drone');
    assert(currentGadget(state).id === 'drone', 'drone on bench');
    addPart(state);
    selectBlueprint(state, 'hook');
    assert(state.parts.hook === 2 && state.parts.drone === 1, JSON.stringify(state.parts));
  },

  'a built gadget cannot go back on the bench'() {
    const state = fresh();
    for (let i = 0; i < 4; i++) addPart(state);
    selectBlueprint(state, 'hook');
    assert(currentGadget(state).id === 'voice', `bench: ${currentGadget(state).id}`);
    assert(state.built.includes('hook'), 'hook built');
  },

  'micro-mission takes five steps, resumes, and stays solved on replay'() {
    const state = fresh();
    assert(advanceMission(state, 'hook') === null, 'unbuilt gadget has no mission');
    for (let i = 0; i < 4; i++) addPart(state);
    advanceMission(state, 'hook');
    advanceMission(state, 'hook');
    assert(missionStep(state, 'hook') === 2 && unfinishedMission(state)?.id === 'hook', 'resume at step 2');
    let last;
    for (let i = 2; i < MISSION_STEPS; i++) last = advanceMission(state, 'hook');
    assert(last.solved && state.solved.includes('hook'), 'solved');
    assert(missionStep(state, 'hook') === 0 && unfinishedMission(state) === null, 'reset for replay');
    for (let i = 0; i < MISSION_STEPS; i++) advanceMission(state, 'hook');
    assert(state.solved.filter((id) => id === 'hook').length === 1, 'solved listed once');
  },

  'every gadget has names for all its parts and a full micro-mission story'() {
    for (const g of GADGETS) {
      const copy = strings.lab.gadgets[g.id];
      assert(copy?.name && copy.desc, `${g.id}: name/desc`);
      assert(copy.parts.length === g.parts, `${g.id}: ${copy.parts.length} part names for ${g.parts} parts`);
      const m = copy.mission;
      assert(m.title && m.intro.text && m.outro.text, `${g.id}: mission title/intro/outro`);
      assert(m.beats.length === MISSION_STEPS, `${g.id}: ${m.beats.length} beats`);
      assert(m.setbacks.length >= 2, `${g.id}: setbacks`);
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
