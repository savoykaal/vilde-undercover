// Fix the torn surveillance photo: tap tiles to turn them until the picture fits.
// params: { shirt: 'roed' | 'blaa', stamp: 'CAM 2 · 23:14', result }

import { h } from '../../components/dom.js';

const SHIRTS = { roed: '#e0566b', blaa: '#4c86e8' };

function paintPhoto(size, shirt, stamp) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const x = c.getContext('2d');
  const s = size / 300;
  x.fillStyle = '#3b3550';
  x.fillRect(0, 0, size, size);
  // floor and wall
  x.fillStyle = '#4a4466';
  x.fillRect(0, 170 * s, size, 130 * s);
  x.fillStyle = '#2f2a44';
  x.fillRect(0, 0, size, 40 * s);
  // copier / shelf
  x.fillStyle = '#6b6f86';
  x.fillRect(200 * s, 110 * s, 80 * s, 90 * s);
  x.fillStyle = '#9aa0b8';
  x.fillRect(206 * s, 118 * s, 68 * s, 14 * s);
  x.fillStyle = '#e9e4f5';
  x.fillRect(215 * s, 100 * s, 40 * s, 12 * s);
  // a door
  x.fillStyle = '#2a2436';
  x.fillRect(30 * s, 60 * s, 60 * s, 115 * s);
  x.fillStyle = '#f2c14e';
  x.fillRect(80 * s, 118 * s, 5 * s, 5 * s);
  // the person, from behind
  x.fillStyle = 'rgba(0,0,0,.35)';
  x.beginPath();
  x.ellipse(145 * s, 262 * s, 55 * s, 12 * s, 0, 0, Math.PI * 2);
  x.fill();
  x.fillStyle = SHIRTS[shirt] ?? '#e0566b';
  x.beginPath();
  x.moveTo(95 * s, 262 * s);
  x.quadraticCurveTo(96 * s, 160 * s, 145 * s, 158 * s);
  x.quadraticCurveTo(194 * s, 160 * s, 195 * s, 262 * s);
  x.closePath();
  x.fill();
  x.fillStyle = '#2a2230';
  x.beginPath();
  x.arc(145 * s, 128 * s, 30 * s, 0, Math.PI * 2);
  x.fill();
  // scanlines + stamp
  x.fillStyle = 'rgba(255,255,255,.05)';
  for (let y = 0; y < size; y += 4 * s) x.fillRect(0, y, size, 1.5 * s);
  x.fillStyle = '#8bd17c';
  x.font = `${16 * s}px ui-monospace, Menlo, monospace`;
  x.fillText(stamp, 12 * s, 26 * s);
  x.fillStyle = '#ff4646';
  x.beginPath();
  x.arc(280 * s, 20 * s, 6 * s, 0, Math.PI * 2);
  x.fill();
  return c;
}

export function photoGame(body, params, ctl) {
  const n = 3;
  const size = 600;
  const photo = paintPhoto(size, params.shirt ?? 'roed', params.stamp ?? 'CAM 2 · 23:14');
  const rots = Array.from({ length: n * n }, () => Math.floor(Math.random() * 4));
  if (rots.filter((r) => r).length < 5) for (let i = 0; i < 5; i++) rots[i * 2] = 1 + (i % 3);
  const turns = [...rots];
  const tiles = rots.map((r, i) => {
    const c = document.createElement('canvas');
    c.width = c.height = size / n;
    c.getContext('2d').drawImage(photo, (i % n) * (size / n), Math.floor(i / n) * (size / n), size / n, size / n, 0, 0, size / n, size / n);
    const b = h('button', { type: 'button', class: 'photo-tile', onclick: () => turn(i) }, c);
    return b;
  });
  const grid = h('div', { class: 'photo-grid' }, tiles);
  const result = h('p', { class: 'dust-result mono', hidden: true });
  body.append(h('div', { class: 'photo-frame' }, grid), result);

  function render() {
    tiles.forEach((b, i) => {
      b.firstChild.style.transform = `rotate(${turns[i] * 90}deg)`;
      b.classList.toggle('is-right', rots[i] % 4 === 0);
    });
  }

  function turn(i) {
    if (ctl.done) return;
    rots[i] = (rots[i] + 1) % 4;
    turns[i]++;
    ctl.sfx('tick');
    render();
    if (rots.every((r) => r === 0)) {
      grid.classList.add('is-solved');
      result.hidden = false;
      result.textContent = params.result ?? '';
      ctl.success(params.successText ?? params.result);
    }
  }

  render();
  return {};
}
