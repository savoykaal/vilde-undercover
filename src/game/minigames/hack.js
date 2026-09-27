// Hack the system: rotate the pipe tiles until power flows from the left
// socket to the right one. Every puzzle is generated with a guaranteed solution.

import { strings } from '../../i18n.js';
import { h } from '../../components/dom.js';

const N = 1;
const E = 2;
const S = 4;
const W = 8;
const DIRS = [
  [N, 0, -1, S],
  [E, 1, 0, W],
  [S, 0, 1, N],
  [W, -1, 0, E],
];

export const rotateMask = (m, times = 1) => {
  let r = m;
  for (let i = 0; i < ((times % 4) + 4) % 4; i++) r = ((r << 1) | (r >> 3)) & 15;
  return r;
};

function shuffled(list, rng) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function generatePipes(size, rng = Math.random) {
  const source = Math.floor(rng() * size);
  const target = Math.floor(rng() * size);
  const seen = new Set();
  const path = [];
  function dfs(x, y) {
    path.push([x, y]);
    seen.add(`${x},${y}`);
    if (x === size - 1 && y === target && path.length >= size + 1) return true;
    for (const [, dx, dy] of shuffled(DIRS, rng)) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= size || ny >= size || seen.has(`${nx},${ny}`)) continue;
      if (dfs(nx, ny)) return true;
    }
    path.pop();
    return false;
  }
  if (!dfs(0, source)) return generatePipes(size, rng);

  const masks = new Array(size * size).fill(0);
  path.forEach(([x, y], i) => {
    let m = 0;
    const link = (px, py) => {
      for (const [bit, dx, dy] of DIRS) if (px - x === dx && py - y === dy) m |= bit;
    };
    if (i === 0) m |= W;
    else link(...path[i - 1]);
    if (i === path.length - 1) m |= E;
    else link(...path[i + 1]);
    masks[y * size + x] = m;
  });
  const fillers = [N | S, N | E, N | E | S, N | E];
  for (let i = 0; i < masks.length; i++) if (!masks[i]) masks[i] = rotateMask(fillers[Math.floor(rng() * fillers.length)], Math.floor(rng() * 4));

  const rot = masks.map(() => Math.floor(rng() * 4));
  const puzzle = { size, source, target, masks, rot, path };
  for (const [x, y] of path) {
    if (!flow(puzzle).solved) break;
    puzzle.rot[y * size + x] = (puzzle.rot[y * size + x] + 1) % 4;
  }
  if (flow(puzzle).solved) return generatePipes(size, rng);
  return puzzle;
}

export const currentMask = (p, i) => rotateMask(p.masks[i], p.rot[i]);

// Which tiles carry power, and whether it reaches the target.
export function flow(p) {
  const { size } = p;
  const on = new Set();
  const start = p.source * size;
  if (!(currentMask(p, start) & W)) return { on, solved: false };
  const queue = [start];
  on.add(start);
  while (queue.length) {
    const i = queue.shift();
    const x = i % size;
    const y = (i / size) | 0;
    const m = currentMask(p, i);
    for (const [bit, dx, dy, opp] of DIRS) {
      if (!(m & bit)) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
      const j = ny * size + nx;
      if (on.has(j) || !(currentMask(p, j) & opp)) continue;
      on.add(j);
      queue.push(j);
    }
  }
  const end = p.target * size + size - 1;
  return { on, solved: on.has(end) && Boolean(currentMask(p, end) & E) };
}

function pipeSvg(mask) {
  const arms = [];
  if (mask & N) arms.push('M50 50V0');
  if (mask & E) arms.push('M50 50H100');
  if (mask & S) arms.push('M50 50V100');
  if (mask & W) arms.push('M50 50H0');
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><path class="pipe-bg" d="${arms.join('')}"/><path class="pipe-fg" d="${arms.join('')}"/><circle class="pipe-hub" cx="50" cy="50" r="12"/></svg>`;
}

export function hackGame(body, params, ctl) {
  const size = params.size ?? 4;
  const p = generatePipes(size);
  const turns = [...p.rot];
  const cells = p.masks.map((m, i) =>
    h('button', {
      type: 'button',
      class: 'pipe',
      'aria-label': `${(i % size) + 1},${Math.floor(i / size) + 1}`,
      html: pipeSvg(m),
      onclick: () => turn(i),
    }),
  );
  const grid = h('div', { class: 'pipe-grid', style: `--n:${size}` }, cells);
  const src = h('div', { class: 'pipe-port src', style: `--row:${p.source}` });
  const dst = h('div', { class: 'pipe-port dst', style: `--row:${p.target}` });
  body.append(h('div', { class: 'pipe-board', style: `--n:${size}` }, src, grid, dst));

  function render() {
    const { on, solved } = flow(p);
    cells.forEach((c, i) => {
      c.firstChild.style.transform = `rotate(${turns[i] * 90}deg)`;
      c.classList.toggle('is-on', on.has(i));
    });
    src.classList.add('is-on');
    dst.classList.toggle('is-on', solved);
    return solved;
  }

  function turn(i) {
    if (ctl.done) return;
    p.rot[i] = (p.rot[i] + 1) % 4;
    turns[i]++;
    ctl.sfx('tick');
    if (render()) ctl.success(params.successText);
  }

  render();
  return {};
}
