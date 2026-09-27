// Muldvarpen case data, kept free of DOM so it can be tested.
//
// Four chapters, each with a different culprit. The evidence in a chapter
// (shirt colour, shoe size, phone ending) always points to that chapter's
// culprit: each clue alone matches two suspects, any two match exactly one.

export const CHAPTERS = 4;
export const CLUES = ['photo', 'shoe', 'phone'];

export const SUSPECTS = {
  holm: { photo: 'roed', shoe: 39, phone: '17' },
  kasper: { photo: 'blaa', shoe: 44, phone: '17' },
  nora: { photo: 'roed', shoe: 44, phone: '83' },
  ib: { photo: 'blaa', shoe: 39, phone: '83' },
};
export const SUSPECT_IDS = Object.keys(SUSPECTS);

// Who did it in each chapter. The last one is the mole.
export const CULPRITS = ['kasper', 'ib', 'nora', 'holm'];

export const clueValue = (chapter, clue) => SUSPECTS[CULPRITS[chapter]][clue];

// The first clue that doesn't fit a suspect, for the "grav videre" explanation.
export function mismatch(chapter, suspect) {
  const culprit = SUSPECTS[CULPRITS[chapter]];
  const own = SUSPECTS[suspect];
  const clue = CLUES.find((c) => own[c] !== culprit[c]);
  return clue ? { clue, evidence: culprit[clue], suspectValue: own[clue] } : null;
}
