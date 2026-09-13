// Hints for a question: a first nudge that doesn't give the answer away,
// and a plain reveal with the skip-count laid out.

import { strings } from '../i18n.js';
import { skipCount } from '../engine/facts.js';

// factor -> [nearest easy anchor, difference]
const ANCHORS = { 4: [5, -1], 6: [5, 1], 7: [5, 2], 8: [10, -2], 9: [10, -1] };

function productHint(a, b) {
  const options = [];
  for (const [f, n] of [
    [b, a],
    [a, b],
  ]) {
    if (f === 1) options.push({ rank: 0, n, text: strings.hints.one(n) });
    else if (f === 10) options.push({ rank: 1, n, text: strings.hints.ten(n) });
    else if (f === 2) options.push({ rank: 2, n, text: strings.hints.double(n) });
    else if (f === 5) options.push({ rank: 3, n, text: strings.hints.half(n, n * 10) });
    else if (ANCHORS[f] && n > 3) {
      const [A, diff] = ANCHORS[f];
      options.push({ rank: Math.abs(diff) === 1 ? 5 : 6, n, text: strings.hints.anchor({ n, f, A, anchorProduct: n * A, diff }) });
    }
  }
  const small = Math.min(a, b);
  const big = Math.max(a, b);
  if (small <= 3) options.push({ rank: 4, n: small, text: strings.hints.skip(big, skipCount(big, small - 1)) });
  options.push({ rank: 9, n: small, text: strings.hints.skip(small, skipCount(small, Math.min(3, big - 1))) });
  options.sort((x, y) => x.rank - y.rank || x.n - y.n);
  return options[0].text;
}

const knownFactor = (q) => (q.hidden === 'a' ? q.b : q.a);

export function hintFor(q) {
  const text =
    q.type === 'missing'
      ? strings.hints.missing(knownFactor(q), q.product, skipCount(knownFactor(q), Math.min(3, q.answer)))
      : productHint(q.a, q.b);
  return { speaker: 'mynthe', text };
}

export function revealFor(q) {
  let text;
  if (q.type === 'missing') {
    const step = knownFactor(q);
    text = strings.reveal.missing(q.a, q.b, q.product, step, skipCount(step, q.answer), q.answer);
  } else {
    const small = Math.min(q.a, q.b);
    const big = Math.max(q.a, q.b);
    // Count by the bigger number (fewer steps), except ×1 where counting by 1 reads better.
    const [step, times] = small === 1 ? [1, big] : [big, small];
    text = strings.reveal.product(q.a, q.b, q.product, step, skipCount(step, times));
  }
  return { speaker: 'soeren', text: `${text} ${strings.reveal.outro}` };
}
