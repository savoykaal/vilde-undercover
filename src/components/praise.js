// In-character praise, rotated so no line repeats until the pool is used up
// and the same character never speaks twice in a row.

import { strings } from '../i18n.js';

export function createPraisePicker(rng = Math.random) {
  const all = Object.entries(strings.praise).flatMap(([speaker, lines]) =>
    lines.map((line, i) => ({ id: `${speaker}:${i}`, speaker, line })),
  );
  let used = new Set();
  let lastSpeaker = null;

  return {
    size: all.length,
    next(question) {
      let pool = all.filter((x) => !used.has(x.id));
      if (!pool.length) {
        used = new Set();
        pool = all;
      }
      const varied = pool.filter((x) => x.speaker !== lastSpeaker);
      const list = varied.length ? varied : pool;
      const pick = list[Math.floor(rng() * list.length)];
      used.add(pick.id);
      lastSpeaker = pick.speaker;
      return { speaker: pick.speaker, text: typeof pick.line === 'function' ? pick.line(question) : pick.line };
    },
  };
}

// One shared picker per app session, so missions don't repeat each other's lines.
export const praise = createPraisePicker();
