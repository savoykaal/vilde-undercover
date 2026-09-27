// Drag each wire to the socket with the same colour (and symbol).

import { strings } from '../../i18n.js';
import { h } from '../../components/dom.js';
import { shuffle } from '../../engine/facts.js';

const WIRES = [
  { color: '#e0566b', symbol: '●' },
  { color: '#f2c14e', symbol: '▲' },
  { color: '#4c86e8', symbol: '■' },
  { color: '#8bd17c', symbol: '★' },
  { color: '#b98bff', symbol: '◆' },
];
const NS = 'http://www.w3.org/2000/svg';

export function wiresGame(body, params, ctl) {
  const t = strings.game.mg.wires;
  const n = Math.min(WIRES.length, params.count ?? 4);
  const wires = WIRES.slice(0, n).map((w, id) => ({ ...w, id }));
  let rightOrder = shuffle(wires);
  const leftOrder = shuffle(wires);
  while (n > 1 && rightOrder.every((w, i) => w.id === leftOrder[i].id)) rightOrder = shuffle(wires);
  const connected = new Map(); // wire id -> true
  let drag = null;

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'wires-svg');
  const plugs = leftOrder.map((w) =>
    h('div', { class: 'plug', dataset: { id: w.id }, style: `--c:${w.color}` }, h('span', {}, w.symbol)),
  );
  const sockets = rightOrder.map((w) =>
    h('div', { class: 'socket', dataset: { id: w.id }, style: `--c:${w.color}` }, h('span', {}, w.symbol)),
  );
  const board = h('div', { class: 'wires-board' }, svg, h('div', { class: 'wires-col' }, plugs), h('div', { class: 'wires-col right' }, sockets));
  body.append(board);

  function center(node) {
    const b = board.getBoundingClientRect();
    const r = node.getBoundingClientRect();
    return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 };
  }

  function pathD(a, b) {
    const mx = (a.x + b.x) / 2;
    return `M${a.x} ${a.y} C${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`;
  }

  function line(a, b, color, cls = '') {
    const g = document.createElementNS(NS, 'g');
    for (const [w, c] of [
      [14, 'rgba(0,0,0,.45)'],
      [9, color],
      [3, 'rgba(255,255,255,.35)'],
    ]) {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', pathD(a, b));
      p.setAttribute('stroke', c);
      p.setAttribute('stroke-width', w);
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke-linecap', 'round');
      g.append(p);
    }
    if (cls) g.setAttribute('class', cls);
    return g;
  }

  function redraw(pointer) {
    svg.replaceChildren();
    for (const w of wires) {
      if (!connected.has(w.id)) continue;
      const a = center(plugs[leftOrder.indexOf(w)]);
      const b = center(sockets[rightOrder.indexOf(w)]);
      svg.append(line(a, b, w.color));
    }
    if (drag && pointer) svg.append(line(center(drag.plug), pointer, drag.wire.color, 'is-drag'));
  }

  function local(e) {
    const b = board.getBoundingClientRect();
    return { x: e.clientX - b.left, y: e.clientY - b.top };
  }

  function down(e) {
    const plug = e.target.closest('.plug');
    if (!plug || ctl.done) return;
    const wire = wires[Number(plug.dataset.id)];
    if (connected.has(wire.id)) return;
    drag = { plug, wire, pointer: e.pointerId };
    plug.classList.add('is-held');
    board.setPointerCapture?.(e.pointerId);
    ctl.sfx('tap');
    redraw(local(e));
    e.preventDefault();
  }

  function move(e) {
    if (!drag || e.pointerId !== drag.pointer) return;
    redraw(local(e));
    e.preventDefault();
  }

  function up(e) {
    if (!drag || e.pointerId !== drag.pointer) return;
    const p = local(e);
    let hit = null;
    for (const s of sockets) {
      const c = center(s);
      if (Math.hypot(c.x - p.x, c.y - p.y) < 42) hit = s;
    }
    const { wire, plug } = drag;
    plug.classList.remove('is-held');
    drag = null;
    if (hit) {
      if (Number(hit.dataset.id) === wire.id) {
        connected.set(wire.id, true);
        plug.classList.add('is-done');
        hit.classList.add('is-done');
        ctl.sfx('wire');
        ctl.message('');
      } else {
        hit.classList.remove('is-spark');
        void hit.offsetWidth;
        hit.classList.add('is-spark');
        ctl.sfx('spark');
        ctl.message(t.wrong, 'soft');
      }
    }
    redraw();
    if (connected.size === wires.length) ctl.success(params.successText);
  }

  board.addEventListener('pointerdown', down);
  board.addEventListener('pointermove', move);
  board.addEventListener('pointerup', up);
  board.addEventListener('pointercancel', up);
  const onResize = () => redraw();
  window.addEventListener('resize', onResize);
  requestAnimationFrame(() => redraw());

  return {
    destroy() {
      window.removeEventListener('resize', onResize);
    },
  };
}
