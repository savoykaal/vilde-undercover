// Tests for hints, praise rotation and the Danish copy.

import { strings } from '../src/i18n.js';
import { allFactKeys, parseKey } from '../src/engine/facts.js';
import { hintFor, revealFor } from '../src/components/hint.js';
import { createPraisePicker } from '../src/components/praise.js';
import { seededRng } from './engine-tests.js';

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

const questions = () =>
  allFactKeys().flatMap((key) => {
    const [a, b] = parseKey(key);
    const product = { key, a, b, product: a * b, type: 'product', hidden: null, answer: a * b };
    return [product, { ...product, type: 'missing', hidden: 'a', answer: a }, { ...product, type: 'missing', hidden: 'b', answer: b }];
  });

function collectStrings(value, out = []) {
  const sample = { a: 7, b: 8, product: 56, type: 'product', hidden: null, answer: 56 };
  if (typeof value === 'string') out.push(value);
  else if (typeof value === 'function') {
    for (const args of [[sample], [7, 8, 56, 8, [8, 16], 7]]) {
      try {
        collectStrings(value(...args), out);
      } catch {
        // wrong signature for this sample, try the next
      }
    }
  } else if (value && typeof value === 'object') Object.values(value).forEach((v) => collectStrings(v, out));
  return out;
}

const tests = {
  'first hint never states the answer'() {
    for (const q of questions()) {
      // When the answer equals a factor (1 × 7), that number is already on screen.
      if (q.type !== 'product' || q.answer === q.a || q.answer === q.b) continue;
      const { text } = hintFor(q);
      assert(!new RegExp(`(^|[^\\d])${q.answer}([^\\d]|$)`).test(text), `${q.a}×${q.b} hint "${text}"`);
    }
  },

  'hint for 4 × 6 uses the ×5 anchor from the brief'() {
    const text = hintFor({ a: 4, b: 6, product: 24, type: 'product', answer: 24 }).text;
    assert(text === '4 × 5 = 20, så 4 × 6 er 4 mere.', text);
  },

  'reveal always shows the answer and a skip-count ending on the product'() {
    for (const q of questions()) {
      const { text } = revealFor(q);
      assert(text.includes(`${q.a} × ${q.b} = ${q.product}`), `${q.key} ${q.type}: "${text}"`);
      assert(text.includes(`${q.product}.`) || text.includes(`${q.product} –`), `${q.key}: skip-count ends wrong "${text}"`);
    }
  },

  'praise never repeats within a pool and speakers alternate'() {
    const picker = createPraisePicker(seededRng(4));
    const seen = new Set();
    let last = null;
    for (let i = 0; i < picker.size; i++) {
      const line = picker.next({ a: 3, b: 4, product: 12 });
      assert(!seen.has(line.text), `repeated "${line.text}"`);
      assert(line.speaker !== last || i === picker.size - 1, `same speaker twice: ${line.speaker}`);
      seen.add(line.text);
      last = line.speaker;
    }
  },

  'no shaming words anywhere in the copy'() {
    const banned = /forkert|fejl|dårlig|dum|taber|skam|straf|øv/i;
    for (const text of collectStrings(strings)) assert(!banned.test(text), `"${text}"`);
  },
};

export function runContentTests() {
  return Object.entries(tests).map(([name, fn]) => {
    try {
      fn();
      return { name, ok: true };
    } catch (err) {
      return { name, ok: false, error: err.message };
    }
  });
}
