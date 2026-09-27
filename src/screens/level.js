// #/play/<id>: one story or Muldvarpen level, with saving, stars and "next".

import { playLevel } from '../game/play.js';
import { showResult } from '../game/results.js';
import { levelById } from '../game/levels/index.js';
import { h } from '../components/dom.js';
import { addPart, finishLevel, gameState, isUnlocked, nextInCase, resumeStep, saveResume } from '../engine/progress.js';
import { labState, perks } from '../engine/lab.js';

export function renderLevel({ store, go, params }) {
  const profile = store.activeProfile();
  const id = params[0];
  const level = levelById(id);
  const el = h('div', { class: 'level-host' });
  let game = null;

  if (!level || !isUnlocked(profile, id)) {
    setTimeout(() => go('home'), 0);
    return { el };
  }

  function start(fromStep) {
    game?.destroy();
    const g = gameState(profile);
    game = playLevel({
      root: el,
      level,
      profile,
      resumeStep: fromStep,
      extra: perks(labState(profile)),
      foundParts: new Set(g.parts),
      onPart: (partId) => {
        addPart(profile, partId);
        store.save();
      },
      onStep: (index) => {
        saveResume(profile, id, index);
        store.save();
      },
      onQuit: () => go('home'),
      onDone: (result, ui) => {
        const outcome = finishLevel(profile, id, result);
        store.save();
        const next = nextInCase(id);
        showResult(ui, {
          level,
          profile,
          outcome,
          result,
          onNext: next ? () => go(`play/${next}`) : null,
          onAgain: () => start(0),
          onMap: () => go('home'),
        });
      },
    });
  }

  start(resumeStep(profile, id));
  return {
    el,
    destroy() {
      game?.destroy();
    },
  };
}
