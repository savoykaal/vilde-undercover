// Crack the safe by feel: turn the dial, watch the listening meter, and stop
// on the number where it peaks. Hold still for a moment to lock each number in.

import { strings } from '../../i18n.js';
import { h } from '../../components/dom.js';

const NUMBERS = 40;
const TAU = Math.PI * 2;

export function safeGame(body, params, ctl) {
  const t = strings.game.mg.safe;
  const count = params.count ?? 3;
  const targets = [];
  while (targets.length < count) {
    const n = 3 + Math.floor(Math.random() * (NUMBERS - 6));
    if (!targets.some((x) => Math.abs(x - n) < 6)) targets.push(n);
  }
  let index = 0;
  let angle = 0; // radians; number under the pointer = round(-angle / TAU * NUMBERS)
  let hold = 0;
  let lastNum = 0;
  let raf = 0;
  let last = performance.now();
  let drag = null;

  const canvas = h('canvas', { class: 'dial' });
  const leds = h('div', { class: 'safe-leds' }, targets.map(() => h('span', { class: 'led' }, '––')));
  const meterFill = h('i');
  const meter = h('div', { class: 'listen' }, h('span', { class: 'mono' }, t.listen), h('b', {}, meterFill));
  const dirEl = h('p', { class: 'safe-dir mono' });
  body.append(leds, meter, h('div', { class: 'dial-wrap' }, canvas), dirEl);
  const ctx = canvas.getContext('2d');

  const current = () => (((Math.round((-angle / TAU) * NUMBERS) % NUMBERS) + NUMBERS) % NUMBERS);
  const ringDist = (a, b) => Math.min(Math.abs(a - b), NUMBERS - Math.abs(a - b));

  function size() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function pointerAngle(e) {
    const r = canvas.getBoundingClientRect();
    return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
  }

  canvas.addEventListener('pointerdown', (e) => {
    drag = { id: e.pointerId, a: pointerAngle(e) };
    canvas.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id || ctl.done) return;
    const a = pointerAngle(e);
    let d = a - drag.a;
    if (d > Math.PI) d -= TAU;
    if (d < -Math.PI) d += TAU;
    angle += d;
    drag.a = a;
  });
  const end = () => (drag = null);
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  function onKey(e) {
    if (e.key === 'ArrowLeft') angle += TAU / NUMBERS;
    if (e.key === 'ArrowRight') angle -= TAU / NUMBERS;
  }
  document.addEventListener('keydown', onKey);

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const num = current();
    if (num !== lastNum) {
      ctl.sfx('tick');
      lastNum = num;
      hold = 0;
    }
    const target = targets[index];
    const closeness = target == null ? 0 : Math.max(0, 1 - ringDist(num, target) / 8);
    meterFill.style.width = `${closeness * 100}%`;
    meter.classList.toggle('is-hot', num === target);
    if (!ctl.done && num === target) {
      if (hold === 0) ctl.sfx('click');
      hold += dt;
      if (hold > 0.6) {
        const led = leds.children[index];
        led.textContent = String(target).padStart(2, '0');
        led.classList.add('is-on');
        ctl.sfx('clunk');
        index++;
        hold = -99;
        if (index >= count) ctl.success(params.successText ?? t.open);
        else ctl.message(t.got, 'good');
      }
    }
    dirEl.textContent = ctl.done ? '' : t.number(index + 1, count);
    draw(num);
  }

  function draw(num) {
    const w = canvas.clientWidth;
    const hgt = canvas.clientHeight;
    const cx = w / 2;
    const cy = hgt / 2;
    const R = Math.min(w, hgt) / 2 - 12;
    ctx.clearRect(0, 0, w, hgt);
    // body
    let g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
    g.addColorStop(0, '#6b7185');
    g.addColorStop(1, '#2b2f3b');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.fill();
    // numbers ring (rotates)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.fillStyle = '#e9e4f5';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${Math.max(11, R * 0.11)}px ui-monospace, Menlo, monospace`;
    for (let i = 0; i < NUMBERS; i++) {
      const a = (i / NUMBERS) * TAU - Math.PI / 2;
      const major = i % 5 === 0;
      ctx.strokeStyle = major ? '#e9e4f5' : 'rgba(233,228,245,.5)';
      ctx.lineWidth = major ? 2.5 : 1.2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * R * 0.9, Math.sin(a) * R * 0.9);
      ctx.lineTo(Math.cos(a) * R * (major ? 0.78 : 0.83), Math.sin(a) * R * (major ? 0.78 : 0.83));
      ctx.stroke();
      if (major) ctx.fillText(String(i), Math.cos(a) * R * 0.66, Math.sin(a) * R * 0.66);
    }
    ctx.restore();
    // knob
    g = ctx.createRadialGradient(cx - R * 0.1, cy - R * 0.1, 2, cx, cy, R * 0.42);
    g.addColorStop(0, '#9aa0b3');
    g.addColorStop(1, '#3a3f4f');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.42, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    for (let i = 0; i < 12; i++) {
      ctx.rotate(TAU / 12);
      ctx.fillRect(R * 0.34, -3, R * 0.08, 6);
    }
    ctx.restore();
    // pointer
    ctx.fillStyle = '#ff3f9e';
    ctx.beginPath();
    ctx.moveTo(cx, cy - R - 2);
    ctx.lineTo(cx - 10, cy - R - 16);
    ctx.lineTo(cx + 10, cy - R - 16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `700 ${Math.max(16, R * 0.2)}px ui-monospace, Menlo, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(num).padStart(2, '0'), cx, cy);
  }

  requestAnimationFrame(() => {
    size();
    raf = requestAnimationFrame(frame);
  });
  window.addEventListener('resize', size);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
      document.removeEventListener('keydown', onKey);
    },
  };
}
