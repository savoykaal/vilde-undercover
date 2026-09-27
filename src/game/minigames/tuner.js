// Tune the radio: drag the knob until your wave lines up with the signal.
// Static fades and a clean tone rises as she gets closer; hold it to lock on.

import { strings } from '../../i18n.js';
import { h } from '../../components/dom.js';
import { staticNoise } from '../audio.js';

export function tunerGame(body, params, ctl) {
  const t = strings.game.mg.tuner;
  const canvas = h('canvas', { class: 'scope' });
  const freqEl = h('span', { class: 'scope-freq mono' });
  const bars = h('div', { class: 'signal-bars' }, Array.from({ length: 5 }, () => h('i')));
  const lockFill = h('i');
  const lockBar = h('div', { class: 'lock-bar' }, lockFill);
  const knob = h('div', { class: 'tuner-knob' }, h('span'));
  const track = h('div', { class: 'tuner-track' }, h('div', { class: 'tuner-ticks' }), knob);
  body.append(h('div', { class: 'scope-wrap' }, canvas, h('div', { class: 'scope-top' }, freqEl, bars)), lockBar, track);

  const target = 0.22 + Math.random() * 0.56;
  let value = target > 0.5 ? 0.06 : 0.94;
  let lock = 0;
  let raf = 0;
  let last = performance.now();
  let dragging = null;
  const noise = staticNoise();
  const ctx = canvas.getContext('2d');

  function size() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function setValue(v) {
    value = Math.max(0, Math.min(1, v));
    knob.style.left = `${value * 100}%`;
    freqEl.textContent = `${(88 + value * 20).toFixed(1)} MHz`;
  }

  function fromPointer(e) {
    const r = track.getBoundingClientRect();
    setValue((e.clientX - r.left) / r.width);
  }

  track.addEventListener('pointerdown', (e) => {
    dragging = e.pointerId;
    track.setPointerCapture?.(e.pointerId);
    fromPointer(e);
    e.preventDefault();
  });
  track.addEventListener('pointermove', (e) => {
    if (e.pointerId === dragging) fromPointer(e);
  });
  const release = (e) => {
    if (e.pointerId === dragging) dragging = null;
  };
  track.addEventListener('pointerup', release);
  track.addEventListener('pointercancel', release);

  function onKey(e) {
    if (e.key === 'ArrowLeft') setValue(value - 0.01);
    if (e.key === 'ArrowRight') setValue(value + 0.01);
  }
  document.addEventListener('keydown', onKey);

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const off = Math.abs(value - target);
    const clarity = Math.max(0, 1 - off / 0.25);
    const close = off < 0.03;
    if (!ctl.done) {
      lock = close ? Math.min(1, lock + dt / 1.2) : Math.max(0, lock - dt * 1.5);
      if (lock >= 1) {
        noise.set(1, 660);
        ctl.success(params.successText ?? t.lock);
      }
    }
    noise.set(ctl.done ? 1 : clarity * 0.9, 330 + clarity * 330);
    lockFill.style.width = `${lock * 100}%`;
    const lit = Math.round(clarity * 5);
    [...bars.children].forEach((b, i) => b.classList.toggle('on', i < lit));
    if (!ctl.done) ctl.message(close ? t.locking : clarity > 0.5 ? t.near : t.far, close ? 'good' : '');

    const w = canvas.clientWidth;
    const hgt = canvas.clientHeight;
    ctx.clearRect(0, 0, w, hgt);
    ctx.strokeStyle = 'rgba(139,209,124,.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, hgt);
      ctx.stroke();
    }
    for (let y = 0; y < hgt; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    const time = now / 1000;
    const wave = (freq, amp, jitter, color, width, dash = []) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash(dash);
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const y = hgt / 2 + Math.sin((x / w) * Math.PI * 2 * freq + time * 3) * amp + (Math.random() - 0.5) * jitter;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };
    wave(2 + target * 8, hgt * 0.28, 0, 'rgba(255,255,255,.28)', 2, [6, 6]);
    wave(2 + value * 8, hgt * 0.28, (1 - clarity) * hgt * 0.5, ctl.done || close ? '#8bd17c' : '#ff3f9e', 3);
  }

  setValue(value);
  requestAnimationFrame(() => {
    size();
    raf = requestAnimationFrame(frame);
  });
  window.addEventListener('resize', size);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      noise.stop();
      window.removeEventListener('resize', size);
      document.removeEventListener('keydown', onKey);
    },
  };
}
