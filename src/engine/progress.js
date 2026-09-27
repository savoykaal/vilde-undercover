// Game progress per agent: solved levels, stars (only ever gained), gadget
// parts found, and where to resume a level she left mid-way.

export const CAMPAIGN = ['c1', 'c2', 'c3', 'c4', 'c5'];
export const MOLE = ['m1', 'm2', 'm3', 'm4'];

export function gameState(profile) {
  profile.game ??= {};
  const g = profile.game;
  g.levels ??= {};
  g.parts ??= [];
  g.resume ??= {};
  return g;
}

export const levelRecord = (profile, id) => gameState(profile).levels[id] ?? null;
export const isSolved = (profile, id) => Boolean(levelRecord(profile, id)?.done);

// A chapter opens when the one before it in its case is solved. The first of each case is always open.
export function isUnlocked(profile, id) {
  for (const list of [CAMPAIGN, MOLE]) {
    const i = list.indexOf(id);
    if (i >= 0) return i === 0 || isSolved(profile, list[i - 1]);
  }
  return true;
}

export function nextInCase(id) {
  for (const list of [CAMPAIGN, MOLE]) {
    const i = list.indexOf(id);
    if (i >= 0) return list[i + 1] ?? null;
  }
  return null;
}

export function addPart(profile, id) {
  const g = gameState(profile);
  if (g.parts.includes(id)) return false;
  g.parts.push(id);
  return true;
}

export function saveResume(profile, id, step) {
  const g = gameState(profile);
  if (step > 0) g.resume[id] = step;
  else delete g.resume[id];
}

export const resumeStep = (profile, id) => gameState(profile).resume[id] ?? 0;

// result: { caught, partsTotal: [ids] }. Returns the stars and which are new.
export function finishLevel(profile, id, result) {
  const g = gameState(profile);
  const rec = (g.levels[id] ??= { done: false, stars: { done: false, parts: false, ghost: false }, plays: 0 });
  const before = { ...rec.stars };
  rec.done = true;
  rec.plays++;
  rec.stars.done = true;
  if ((result.partsTotal ?? []).every((p) => g.parts.includes(p))) rec.stars.parts = true;
  if (result.caught === 0) rec.stars.ghost = true;
  delete g.resume[id];
  const fresh = Object.keys(rec.stars).filter((k) => rec.stars[k] && !before[k]);
  return { stars: { ...rec.stars }, fresh, first: !before.done };
}

export const starCount = (profile, id) => {
  const s = levelRecord(profile, id)?.stars;
  return s ? Number(s.done) + Number(s.parts) + Number(s.ghost) : 0;
};
