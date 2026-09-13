// Muldvarpen rules, kept free of DOM so they can be tested.
//
// Four chapters, played in order: intro beats → develop three clues on the wall →
// accuse a suspect on the deduction board → resolution beats.
// Each correct answer develops the clue in focus one step, then focus moves to the
// next unfinished clue. An answer that needed revealing leaves the clue blurry and
// moves on; it comes back later. A wrong accusation only rules that suspect out.

export const CHAPTERS = 4;
export const CLUES = ['photo', 'shoe', 'phone'];
export const CLUE_STEPS = 3;
export const TOTAL_STEPS = CLUES.length * CLUE_STEPS;

// Each clue alone matches two suspects; any two clues together match exactly one.
export const SUSPECTS = {
  holm: { photo: 'roed', shoe: 39, phone: '17' },
  kasper: { photo: 'blaa', shoe: 44, phone: '17' },
  nora: { photo: 'roed', shoe: 44, phone: '83' },
  ib: { photo: 'blaa', shoe: 39, phone: '83' },
};
export const SUSPECT_IDS = Object.keys(SUSPECTS);

// Who did it in each chapter. The last one is the mole.
export const CULPRITS = ['kasper', 'ib', 'nora', 'holm'];

export function moleState(profile) {
  profile.missions.mole ??= {};
  const state = profile.missions.mole;
  state.solved ??= [];
  state.chapters ??= {};
  return state;
}

export const isUnlocked = (state, chapter) => chapter === 0 || state.solved.includes(chapter - 1);
export const hasProgress = (state, chapter) => Boolean(state.chapters[chapter]);

export function chapterProgress(state, chapter) {
  state.chapters[chapter] ??= {
    phase: 'intro',
    beat: 0,
    clues: { photo: 0, shoe: 0, phone: 0 },
    focus: CLUES[0],
    ruledOut: [],
  };
  return state.chapters[chapter];
}

export const clueValue = (chapter, clue) => SUSPECTS[CULPRITS[chapter]][clue];
export const stepsDeveloped = (progress) => CLUES.reduce((sum, clue) => sum + progress.clues[clue], 0);
export const allCluesClear = (progress) => CLUES.every((clue) => progress.clues[clue] >= CLUE_STEPS);

function nextUnfinished(progress, after) {
  const start = CLUES.indexOf(after);
  for (let i = 1; i <= CLUES.length; i++) {
    const clue = CLUES[(start + i) % CLUES.length];
    if (progress.clues[clue] < CLUE_STEPS) return clue;
  }
  return after;
}

// Correct answer: develop the clue in focus. Returns { clue, level, clear, allClear }.
export function developClue(progress) {
  if (progress.clues[progress.focus] >= CLUE_STEPS) progress.focus = nextUnfinished(progress, progress.focus);
  const clue = progress.focus;
  progress.clues[clue] = Math.min(CLUE_STEPS, progress.clues[clue] + 1);
  const level = progress.clues[clue];
  const allClear = allCluesClear(progress);
  if (allClear) progress.phase = 'deduce';
  else progress.focus = nextUnfinished(progress, clue);
  return { clue, level, clear: level >= CLUE_STEPS, allClear };
}

// Revealed answer: the clue stays blurry and focus moves on.
export function skipClue(progress) {
  progress.focus = nextUnfinished(progress, progress.focus);
  return progress.focus;
}

// The first clue that doesn't fit a suspect, for the "grav videre" explanation.
export function mismatch(chapter, suspect) {
  const culprit = SUSPECTS[CULPRITS[chapter]];
  const own = SUSPECTS[suspect];
  const clue = CLUES.find((c) => own[c] !== culprit[c]);
  return clue ? { clue, evidence: culprit[clue], suspectValue: own[clue] } : null;
}

export function accuse(state, chapter, suspect) {
  const progress = chapterProgress(state, chapter);
  if (progress.phase !== 'deduce') return null;
  if (suspect === CULPRITS[chapter]) {
    progress.phase = 'resolution';
    progress.beat = 0;
    return { correct: true };
  }
  if (!progress.ruledOut.includes(suspect)) progress.ruledOut.push(suspect);
  return { correct: false, mismatch: mismatch(chapter, suspect) };
}

// Story beats in the intro and resolution. Returns { done, phaseChanged }.
export function advanceBeat(state, chapter, beatCount) {
  const progress = chapterProgress(state, chapter);
  progress.beat++;
  if (progress.beat < beatCount) return { done: false, phaseChanged: false };
  if (progress.phase === 'intro') {
    progress.phase = 'clues';
    progress.beat = 0;
    return { done: false, phaseChanged: true };
  }
  delete state.chapters[chapter];
  if (!state.solved.includes(chapter)) state.solved.push(chapter);
  state.solved.sort((a, b) => a - b);
  return { done: true, phaseChanged: true };
}

export function nextOpenChapter(state) {
  for (let ch = 0; ch < CHAPTERS; ch++) if (!state.solved.includes(ch)) return ch;
  return null;
}
