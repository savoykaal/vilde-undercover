// Build a gadget: drag each part onto a glowing slot on Mynthe's blueprint.
// params: { gadget: 'hook', parts: 3 }

import { strings } from '../../i18n.js';
import { h } from '../../components/dom.js';
import { gadgetArt } from '../../components/art.js';

export function assembleGame(body, params, ctl) {
  const t = strings.game.mg.assemble;
  const n = params.parts ?? 4;
  const names = strings.lab.gadgets[params.gadget]?.parts ?? [];
  const slots = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return h('div', { class: 'slot-dot', style: `left:${50 + Math.cos(a) * 40}%;top:${50 + Math.sin(a) * 40}%` });
  });
  const art = h('div', { class: 'bp-art', html: gadgetArt[params.gadget] ?? '' });
  const board = h('div', { class: 'blueprint-board' }, art, slots);
  const tray = h(
    'div',
    { class: 'parts-tray' },
    Array.from({ length: n }, (_, i) => h('div', { class: 'part-chip', dataset: { i } }, h('i', { class: 'gear-icon' }), h('span', {}, names[i] ?? ''))),
  );
  body.append(board, tray);
  let filled = 0;
  let drag = null;

  function down(e) {
    const chip = e.target.closest('.part-chip');
    if (!chip || chip.classList.contains('is-used') || ctl.done) return;
    const r = chip.getBoundingClientRect();
    const ghost = chip.cloneNode(true);
    ghost.classList.add('is-ghost');
    ghost.style.width = `${r.width}px`;
    document.body.append(ghost);
    drag = { chip, ghost, id: e.pointerId, dx: e.clientX - r.left, dy: e.clientY - r.top, sx: e.clientX, sy: e.clientY };
    place(e);
    body.setPointerCapture?.(e.pointerId);
    ctl.sfx('tap');
    e.preventDefault();
  }

  function place(e) {
    drag.ghost.style.transform = `translate(${e.clientX - drag.dx}px, ${e.clientY - drag.dy}px)`;
    const target = hitSlot(e);
    slots.forEach((s) => s.classList.toggle('is-hover', s === target));
  }

  function hitSlot(e) {
    let best = null;
    let bestD = 60;
    for (const s of slots) {
      if (s.classList.contains('is-filled')) continue;
      const r = s.getBoundingClientRect();
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      if (d < bestD) {
        best = s;
        bestD = d;
      }
    }
    return best;
  }

  function move(e) {
    if (!drag || e.pointerId !== drag.id) return;
    place(e);
    e.preventDefault();
  }

  function up(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const tapped = Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 8;
    const target = hitSlot(e) ?? (tapped ? slots.find((s) => !s.classList.contains('is-filled')) : null);
    drag.ghost.remove();
    slots.forEach((s) => s.classList.remove('is-hover'));
    if (target) {
      target.classList.add('is-filled');
      drag.chip.classList.add('is-used');
      filled++;
      ctl.sfx('click');
      art.style.setProperty('--built', filled / n);
      if (filled >= n) {
        board.classList.add('is-built');
        ctl.success(t.built(strings.lab.gadgets[params.gadget]?.name ?? ''));
      }
    }
    drag = null;
  }

  body.addEventListener('pointerdown', down);
  body.addEventListener('pointermove', move);
  body.addEventListener('pointerup', up);
  body.addEventListener('pointercancel', up);

  return {
    destroy() {
      drag?.ghost.remove();
    },
  };
}
