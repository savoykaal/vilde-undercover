// A light gate in front of the parent view: answer 12 × 11 on the vault keypad.
// Not a lock, just enough to keep it out of the way.

import { strings } from '../i18n.js';
import { h } from './dom.js';
import { createKeypad } from './keypad.js';

const A = 12;
const B = 11;

export function openParentGate({ onSuccess }) {
  const slot = h('span', { class: 'slot is-empty' }, '?');
  const message = h('p', { class: 'gate-msg', 'aria-live': 'polite' }, strings.parentGate.intro);

  const keypad = createKeypad({
    maxDigits: 3,
    onChange: (v) => {
      slot.textContent = v || '?';
      slot.classList.toggle('is-empty', !v);
    },
    onConfirm: (v) => {
      if (Number(v) === A * B) {
        close();
        onSuccess();
      } else {
        message.textContent = strings.parentGate.retry;
        keypad.clear();
      }
    },
  });

  const dialog = h(
    'div',
    { class: 'gate', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'gate-title' },
    h('button', { type: 'button', class: 'gate-close', 'aria-label': strings.parentGate.close, onclick: () => close() }, '×'),
    h('p', { class: 'eyebrow mono' }, strings.parentGate.eyebrow),
    h('h2', { id: 'gate-title' }, strings.parentGate.title),
    h(
      'div',
      { class: 'qcard-prompt gate-prompt', 'aria-label': `${A} × ${B}` },
      h('span', { class: 'num' }, A),
      h('span', { class: 'op' }, '×'),
      h('span', { class: 'num' }, B),
      h('span', { class: 'op' }, '='),
      slot,
    ),
    message,
    keypad.el,
  );

  const overlay = h('div', { class: 'overlay' }, dialog);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  function onKey(e) {
    if (e.key === 'Escape') close();
  }

  function close() {
    keypad.destroy();
    document.removeEventListener('keydown', onKey);
    overlay.remove();
  }

  document.addEventListener('keydown', onKey);
  document.body.append(overlay);
  return { close };
}
