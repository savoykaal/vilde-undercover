// A cipher wheel: every letter is shifted the same number of steps.
// Turn the wheel until the scrambled word turns into a real one.

import { strings } from '../../i18n.js';
import { h } from '../../components/dom.js';

const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const shiftChar = (ch, n) => {
  const i = ABC.indexOf(ch);
  return i < 0 ? ch : ABC[(i + n + 26 * 10) % 26];
};

export function cipherGame(body, params, ctl) {
  const t = strings.game.mg.cipher;
  const words = params.words ?? ['KURER'];
  let wi = 0;
  let turn = 0;
  let secret = 0;
  let locked = false;

  const progress = h('p', { class: 'code-progress mono' });
  const coded = h('div', { class: 'cipher-row coded mono' });
  const decoded = h('div', { class: 'cipher-row decoded mono' });
  const ring = h('div', { class: 'cipher-ring mono' });
  const strip = h('div', { class: 'cipher-strip' }, ring);
  const left = h('button', { type: 'button', class: 'cipher-btn', 'aria-label': '◀', onclick: () => rotate(-1) }, '◀');
  const right = h('button', { type: 'button', class: 'cipher-btn', 'aria-label': '▶', onclick: () => rotate(1) }, '▶');
  body.append(progress, coded, h('div', { class: 'cipher-arrow' }, '↓'), decoded, h('div', { class: 'cipher-wheel' }, left, strip, right));

  function setupWord() {
    const word = words[wi];
    secret = params.shifts?.[wi] ?? 3 + Math.floor(Math.random() * 18);
    turn = 0;
    locked = false;
    progress.textContent = words.length > 1 ? t.word(wi + 1, words.length) : '';
    coded.replaceChildren(...[...word].map((ch) => h('span', {}, ch === ' ' ? ' ' : shiftChar(ch, secret))));
    render();
  }

  function render() {
    const word = words[wi];
    decoded.replaceChildren(
      ...[...word].map((ch) => h('span', { class: locked ? 'is-right' : '' }, ch === ' ' ? ' ' : shiftChar(shiftChar(ch, secret), -turn))),
    );
    // wheel shows the alphabet with the current offset
    ring.replaceChildren(
      ...Array.from({ length: 9 }, (_, i) => {
        const k = i - 4;
        return h('span', { class: k === 0 ? 'is-mid' : '' }, `${ABC[(((k + turn) % 26) + 26) % 26]}`);
      }),
    );
  }

  function rotate(dir) {
    if (locked || ctl.done) return;
    turn = (turn + dir + 26) % 26;
    ctl.sfx('tick');
    render();
    if ((turn - secret) % 26 === 0) {
      locked = true;
      render();
      ctl.sfx('good');
      if (wi + 1 < words.length) {
        ctl.message(t.gotWord(words[wi]), 'good');
        setTimeout(() => {
          wi++;
          setupWord();
          ctl.message('');
        }, 1100);
      } else ctl.success(params.successText ?? t.gotWord(words[wi]));
    }
  }

  // drag the strip left/right to turn
  let drag = null;
  strip.addEventListener('pointerdown', (e) => {
    drag = { id: e.pointerId, x: e.clientX };
    strip.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  });
  strip.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const step = 30;
    while (e.clientX - drag.x > step) {
      drag.x += step;
      rotate(-1);
    }
    while (drag.x - e.clientX > step) {
      drag.x -= step;
      rotate(1);
    }
  });
  const end = () => (drag = null);
  strip.addEventListener('pointerup', end);
  strip.addEventListener('pointercancel', end);

  function onKey(e) {
    if (e.key === 'ArrowLeft') rotate(-1);
    if (e.key === 'ArrowRight') rotate(1);
  }
  document.addEventListener('keydown', onKey);

  setupWord();
  return {
    destroy() {
      document.removeEventListener('keydown', onKey);
    },
  };
}
