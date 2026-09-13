// Vault-style number keypad. Replaces the system keyboard on phones and
// mirrors physical number keys, Backspace and Enter on laptops.

import { strings } from '../i18n.js';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'];

export function createKeypad({ maxDigits = 3, onChange, onConfirm } = {}) {
  let value = '';
  let enabled = true;
  const buttons = new Map();

  const el = document.createElement('div');
  el.className = 'keypad';

  for (const k of KEYS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.tabIndex = -1;
    b.className = 'key' + (k === 'ok' ? ' key-ok' : k === 'del' ? ' key-del' : '');
    b.textContent = k === 'del' ? '⌫' : k === 'ok' ? strings.card.confirm : k;
    b.setAttribute('aria-label', k === 'del' ? strings.card.delete : k === 'ok' ? strings.card.confirm : k);
    b.addEventListener('click', () => press(k));
    buttons.set(k, b);
    el.append(b);
  }

  function press(k) {
    if (!enabled) return;
    if (k === 'ok') return onConfirm?.(value);
    if (k === 'del') value = value.slice(0, -1);
    else if (value.length < maxDigits) value += k;
    onChange?.(value);
  }

  function flash(k) {
    const b = buttons.get(k);
    b.classList.add('is-pressed');
    setTimeout(() => b.classList.remove('is-pressed'), 120);
  }

  function onKey(e) {
    if (!enabled || e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    let k = null;
    if (/^[0-9]$/.test(e.key)) k = e.key;
    else if (e.key === 'Backspace' || e.key === 'Delete') k = 'del';
    else if (e.key === 'Enter') k = 'ok';
    if (!k) return;
    e.preventDefault();
    flash(k);
    press(k);
  }
  document.addEventListener('keydown', onKey);

  return {
    el,
    get value() {
      return value;
    },
    clear() {
      value = '';
      onChange?.(value);
    },
    setEnabled(on) {
      enabled = on;
      el.classList.toggle('is-disabled', !on);
    },
    destroy() {
      document.removeEventListener('keydown', onKey);
      el.remove();
    },
  };
}
