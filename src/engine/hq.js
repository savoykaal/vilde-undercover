// Kælder-HQ campaign rules, kept free of DOM so they can be tested.
//
// Five chapters, played in order. Each chapter is a fixed script:
//   brief (story beats) → partA (5 questions) → twist (beats) → partB (5 questions) → resolution (beats)
// A beat advances on tap, a question part on each correct answer. Position is saved
// after every step, so a chapter resumes exactly where she left it.

export const CHAPTERS = 5;
export const QUESTIONS_PER_PART = 5;
export const TOTAL_CLUES = QUESTIONS_PER_PART * 2;
export const SEGMENTS = ['brief', 'partA', 'twist', 'partB', 'resolution'];

export const isQuestionSegment = (segment) => segment === 'partA' || segment === 'partB';

export function hqState(profile) {
  profile.missions.hq ??= {};
  const state = profile.missions.hq;
  state.solved ??= [];
  state.progress ??= {};
  return state;
}

export const isUnlocked = (state, chapter) => chapter === 0 || state.solved.includes(chapter - 1);

export const positionFor = (state, chapter) => state.progress[chapter] ?? { segment: 0, index: 0 };

// lengths: number of beats in { brief, twist, resolution }.
const segmentLength = (segment, lengths) => (isQuestionSegment(segment) ? QUESTIONS_PER_PART : lengths[segment]);

export function advanceChapter(state, chapter, lengths) {
  const pos = { ...positionFor(state, chapter) };
  pos.index++;
  let segmentChanged = false;
  while (pos.segment < SEGMENTS.length && pos.index >= segmentLength(SEGMENTS[pos.segment], lengths)) {
    pos.segment++;
    pos.index = 0;
    segmentChanged = true;
  }
  if (pos.segment >= SEGMENTS.length) {
    delete state.progress[chapter];
    if (!state.solved.includes(chapter)) state.solved.push(chapter);
    state.solved.sort((a, b) => a - b);
    return { done: true, segmentChanged: true, pos: null };
  }
  state.progress[chapter] = pos;
  return { done: false, segmentChanged, pos };
}

// Clues found so far in a chapter (0–10).
export function cluesFound(pos) {
  if (!pos) return TOTAL_CLUES;
  const finishedParts = SEGMENTS.slice(0, pos.segment).filter(isQuestionSegment).length;
  return finishedParts * QUESTIONS_PER_PART + (isQuestionSegment(SEGMENTS[pos.segment]) ? pos.index : 0);
}

export function nextOpenChapter(state) {
  for (let ch = 0; ch < CHAPTERS; ch++) if (!state.solved.includes(ch)) return ch;
  return null;
}
