// Gadget-laboratoriet rules, kept free of DOM so they can be tested.
//
// Each correct answer earns one part for the gadget on the bench. When all its
// parts are in, the gadget is built and goes on the shelf, which unlocks a
// five-step micro-mission. Built gadgets and solved missions never go away.

export const GADGETS = [
  { id: 'hook', parts: 4 },
  { id: 'voice', parts: 4 },
  { id: 'shoes', parts: 5 },
  { id: 'smoke', parts: 5 },
  { id: 'gloves', parts: 6 },
  { id: 'drone', parts: 6 },
];

export const MISSION_STEPS = 5;

export const gadgetById = (id) => GADGETS.find((g) => g.id === id) ?? null;

export function labState(profile) {
  profile.missions.lab ??= {};
  const state = profile.missions.lab;
  state.built ??= [];
  state.parts ??= {};
  state.current ??= null;
  state.solved ??= [];
  state.missionSteps ??= {};
  return state;
}

// The gadget on the bench: the chosen blueprint, else the first unbuilt one.
export function currentGadget(state) {
  const unbuilt = (g) => !state.built.includes(g.id);
  const pick = GADGETS.find((g) => g.id === state.current && unbuilt(g)) ?? GADGETS.find(unbuilt) ?? null;
  state.current = pick?.id ?? null;
  return pick;
}

export function selectBlueprint(state, id) {
  if (gadgetById(id) && !state.built.includes(id)) state.current = id;
}

export const partsFor = (state, id) => state.parts[id] ?? 0;

// Returns { gadgetId, partIndex, completed }, or null when everything is built.
export function addPart(state) {
  const gadget = currentGadget(state);
  if (!gadget) return null;
  const partIndex = partsFor(state, gadget.id);
  state.parts[gadget.id] = partIndex + 1;
  const completed = state.parts[gadget.id] >= gadget.parts;
  if (completed) {
    state.built.push(gadget.id);
    state.current = null;
    currentGadget(state);
  }
  return { gadgetId: gadget.id, partIndex, completed };
}

export const missionStep = (state, id) => state.missionSteps[id] ?? 0;

// Returns { step, solved }, or null if the gadget isn't built yet.
export function advanceMission(state, id) {
  if (!state.built.includes(id)) return null;
  const step = missionStep(state, id) + 1;
  if (step >= MISSION_STEPS) {
    delete state.missionSteps[id];
    if (!state.solved.includes(id)) state.solved.push(id);
    return { step, solved: true };
  }
  state.missionSteps[id] = step;
  return { step, solved: false };
}

export function unfinishedMission(state) {
  return GADGETS.find((g) => state.built.includes(g.id) && missionStep(state, g.id) > 0) ?? null;
}
