// Mynthe's workshop. Gadget parts are found hidden in the levels; with enough
// parts she builds a gadget, and every built gadget gives a small perk in the field.
// Built gadgets never go away.

import { gameState } from './progress.js';

export const GADGETS = [
  { id: 'hook', parts: 3, perk: { towerLife: 1 } },
  { id: 'voice', parts: 4, perk: { detectMul: 0.85 } },
  { id: 'shoes', parts: 4, perk: { speedBoost: 1.12 } },
  { id: 'smoke', parts: 5, perk: { smoke: 1 } },
  { id: 'gloves', parts: 5, perk: { magnet: 1.9 } },
  { id: 'drone', parts: 6, perk: { lightBoost: 1.3 } },
];

export const gadgetById = (id) => GADGETS.find((g) => g.id === id) ?? null;

export function labState(profile) {
  const g = gameState(profile);
  g.built ??= [];
  g.spent ??= 0;
  return g;
}

export const freeParts = (state) => state.parts.length - state.spent;

// The next gadget on the bench: the first one not built yet.
export const benchGadget = (state) => GADGETS.find((gd) => !state.built.includes(gd.id)) ?? null;

export function canBuild(state, id) {
  const gd = gadgetById(id);
  return Boolean(gd) && !state.built.includes(id) && benchGadget(state)?.id === id && freeParts(state) >= gd.parts;
}

export function build(state, id) {
  if (!canBuild(state, id)) return false;
  state.spent += gadgetById(id).parts;
  state.built.push(id);
  return true;
}

// Perks from every built gadget, merged for the World's `extra` options.
export function perks(state) {
  const out = {};
  for (const id of state.built) Object.assign(out, gadgetById(id)?.perk);
  return out;
}
