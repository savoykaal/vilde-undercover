// Pick the lock: each pin bobs up and down. Tap when it's in the green band.
// A miss just lets the pin drop back; there is no limit on tries.

import { strings } from '../../i18n.js';
import { h } from '../../components/dom.js';

export function lockpickGame(body, params, ctl) {
  const t = strings.game.mg.lockpick;
  const n = params.pins ?? 4;
  const pins = Array.from({ length: n }, (_, i) => ({
    el: h('div', { class: 'pin' }, h('i', { class: 'pin-top' }), h('i', { class: 'pin-bottom' })),
    speed: 1.6 + i * 0.45 + Math.random() * 0.3,
    phase: Math.random() * 6,
    set: false,
  }));
  let current = 0;
  let raf = 0;
  const start = performance.now();
  const lockEl = h('div', { class: 'lock-body' }, h('div', { class: 'shear' }), pins.map((p) => p.el));
  const btn = h('button', { type: 'button', class: 'btn primary big pick-btn', onclick: () => tap() }, t.button);
  body.append(lockEl, btn);

  // position 0..1 where 1 = pushed all the way up; green band is 0.72–0.9
  const pos = (p, now) => 0.5 + 0.5 * Math.sin((now - start) / 1000 * p.speed * 2 + p.phase);
  const BAND = [0.7, 0.9];

  function tap() {
    if (ctl.done) return;
    const p = pins[current];
    const v = pos(p, performance.now());
    if (v >= BAND[0] - 0.02 && v <= BAND[1] + 0.02) {
      p.set = true;
      p.el.classList.add('is-set');
      p.el.style.setProperty('--y', BAND[0] + 0.1);
      ctl.sfx('click');
      current++;
      if (current >= n) ctl.success(params.successText ?? t.open);
      else ctl.message(t.set, 'good');
    } else {
      ctl.sfx('soft');
      p.el.classList.remove('is-miss');
      void p.el.offsetWidth;
      p.el.classList.add('is-miss');
      ctl.message(v < BAND[0] ? t.early : t.late, 'soft');
    }
  }

  function onKey(e) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      tap();
    }
  }
  document.addEventListener('keydown', onKey);

  function frame(now) {
    raf = requestAnimationFrame(frame);
    pins.forEach((p, i) => {
      if (p.set) return;
      const v = i === current ? pos(p, now) : 0.12;
      p.el.style.setProperty('--y', v.toFixed(3));
      p.el.classList.toggle('is-active', i === current);
      p.el.classList.toggle('is-green', i === current && v >= BAND[0] && v <= BAND[1]);
    });
  }
  raf = requestAnimationFrame(frame);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
    },
  };
}
