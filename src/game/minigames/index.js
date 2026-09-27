// The minigame frame: a device panel over the paused world. Closing it is always
// free — the task simply waits. Each game calls ctl.success() when solved.

import { strings } from '../../i18n.js';
import { h } from '../../components/dom.js';
import { beep, sfx } from '../audio.js';
import { keypadGame } from './keypad.js';
import { wiresGame } from './wires.js';
import { tunerGame } from './tuner.js';
import { cipherGame } from './cipher.js';
import { safeGame } from './safe.js';
import { lockpickGame } from './lockpick.js';
import { hackGame } from './hack.js';
import { simonGame } from './simon.js';
import { riddleGame } from './riddle.js';
import { dustGame } from './dust.js';
import { photoGame } from './photo.js';
import { deduceGame } from './deduce.js';
import { assembleGame } from './assemble.js';

const GAMES = {
  keypad: keypadGame,
  wires: wiresGame,
  tuner: tunerGame,
  cipher: cipherGame,
  safe: safeGame,
  lockpick: lockpickGame,
  hack: hackGame,
  simon: simonGame,
  riddle: riddleGame,
  dust: dustGame,
  photo: photoGame,
  deduce: deduceGame,
  assemble: assembleGame,
};

export function openMinigame(host, kind, params = {}, api = {}) {
  const t = strings.game.mg;
  const game = GAMES[kind];
  let done = false;
  let inst = null;

  if (!game) {
    // Simple actions (pull a lever, take a book) succeed straight away.
    setTimeout(() => api.onSuccess?.(), 0);
    return { destroy() {} };
  }

  const copy = t[kind] ?? {};
  const msg = h('p', { class: 'mg-msg', 'aria-live': 'polite' });
  const body = h('div', { class: 'mg-body' });
  const closeBtn = h('button', { type: 'button', class: 'mg-close', 'aria-label': t.close }, '×');
  const titleEl = h('h2', { class: 'mg-title' }, params.title && params.title !== kind ? params.title : copy.title);
  const hintEl = h('p', { class: 'mg-hint' }, params.hint ?? copy.hint ?? '');
  const panel = h('div', { class: `mg mg-${kind}`, role: 'dialog', 'aria-modal': 'true' }, h('div', { class: 'mg-head' }, titleEl, closeBtn), hintEl, body, msg);
  const wrap = h('div', { class: 'mg-wrap' }, panel);
  host.append(wrap);
  requestAnimationFrame(() => wrap.classList.add('is-in'));

  let msgTimer = 0;
  const ctl = {
    profile: api.profile,
    world: api.world,
    say: api.say,
    sfx,
    beep,
    panel,
    message(text, tone = '') {
      msg.textContent = text ?? '';
      msg.dataset.tone = tone;
      msg.classList.remove('is-fresh');
      void msg.offsetWidth;
      msg.classList.add('is-fresh');
      clearTimeout(msgTimer);
    },
    hint(text) {
      hintEl.textContent = text;
    },
    success(text) {
      if (done) return;
      done = true;
      panel.classList.add('is-solved');
      ctl.message(text ?? t.solved, 'good');
      sfx('task');
      setTimeout(() => {
        close();
        api.onSuccess?.();
      }, 1100);
    },
    get done() {
      return done;
    },
  };

  function close() {
    clearTimeout(msgTimer);
    inst?.destroy?.();
    document.removeEventListener('keydown', onKey);
    wrap.remove();
  }

  function onKey(e) {
    if (e.key === 'Escape' && !done) {
      close();
      api.onClose?.();
    }
  }
  document.addEventListener('keydown', onKey);
  closeBtn.addEventListener('click', () => {
    if (done) return;
    sfx('tap');
    close();
    api.onClose?.();
  });

  inst = game(body, params, ctl);
  return { destroy: close };
}
