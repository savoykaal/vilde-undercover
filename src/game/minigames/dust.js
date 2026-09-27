// Brush the dust away with a finger to reveal a print, then read it.
// params: { shape: 'shoe' | 'finger', result: 'Str. 44' }

import { strings } from '../../i18n.js';
import { h } from '../../components/dom.js';

function shoePath(w, hgt) {
  const p = new Path2D();
  const cx = w / 2;
  const s = Math.min(w, hgt) / 300;
  p.ellipse(cx, hgt * 0.36, 58 * s, 92 * s, -0.12, 0, Math.PI * 2);
  p.ellipse(cx + 10 * s, hgt * 0.76, 44 * s, 52 * s, -0.12, 0, Math.PI * 2);
  return p;
}

function fingerPath(w, hgt) {
  const p = new Path2D();
  p.ellipse(w / 2, hgt / 2, w * 0.3, hgt * 0.4, 0, 0, Math.PI * 2);
  return p;
}

export function dustGame(body, params, ctl) {
  const t = strings.game.mg.dust;
  const shape = params.shape ?? 'shoe';
  const canvas = h('canvas', { class: 'dust' });
  const brushHint = h('div', { class: 'dust-brush' });
  const result = h('p', { class: 'dust-result mono', hidden: true });
  body.append(h('div', { class: 'dust-wrap' }, canvas, brushHint), result);

  const ctx = canvas.getContext('2d');
  const dust = document.createElement('canvas');
  const dctx = dust.getContext('2d');
  let W = 0;
  let H = 0;
  let dpr = 1;
  let samples = [];
  let raf = 0;
  let checkT = 0;
  let revealed = false;
  let path = null;
  let drag = null;

  function setup() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width;
    H = r.height;
    canvas.width = dust.width = Math.round(W * dpr);
    canvas.height = dust.height = Math.round(H * dpr);
    path = shape === 'finger' ? fingerPath(W, H) : shoePath(W, H);
    // dust layer
    dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dctx.fillStyle = '#9a93a8';
    dctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 900; i++) {
      dctx.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '40,30,60'},${0.05 + Math.random() * 0.12})`;
      const s = 2 + Math.random() * 7;
      dctx.fillRect(Math.random() * W, Math.random() * H, s, s);
    }
    samples = [];
    for (let y = 6; y < H; y += 12) for (let x = 6; x < W; x += 12) if (ctx.isPointInPath(path, x, y)) samples.push([x, y]);
  }

  function drawPrint() {
    ctx.fillStyle = '#2a2436';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,.035)';
    for (let x = 0; x < W; x += 30) ctx.fillRect(x, 0, 2, H);
    ctx.save();
    ctx.clip(path);
    ctx.fillStyle = '#f2c14e';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#2a2436';
    if (shape === 'finger') {
      ctx.strokeStyle = '#2a2436';
      ctx.lineWidth = 4;
      for (let i = 1; i < 12; i++) {
        ctx.beginPath();
        ctx.ellipse(W / 2, H / 2 + 8, i * W * 0.026, i * H * 0.034, 0, Math.PI * 0.1, Math.PI * 1.95);
        ctx.stroke();
      }
    } else {
      for (let y = 0; y < H; y += 16) {
        ctx.save();
        ctx.translate(W / 2, y);
        ctx.rotate(-0.12);
        ctx.fillRect(-80, 0, 160, 7);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawPrint();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(dust, 0, 0);
    if (!revealed && now - checkT > 200) {
      checkT = now;
      const data = dctx.getImageData(0, 0, dust.width, dust.height).data;
      let clear = 0;
      for (const [x, y] of samples) {
        const i = (Math.round(y * dpr) * dust.width + Math.round(x * dpr)) * 4 + 3;
        if (data[i] < 90) clear++;
      }
      if (samples.length && clear / samples.length > 0.62) reveal();
    }
  }

  function reveal() {
    revealed = true;
    dctx.clearRect(0, 0, W, H);
    brushHint.hidden = true;
    result.hidden = false;
    result.textContent = params.result ?? '';
    ctl.success(params.successText ?? params.result);
  }

  function brush(x, y, px, py) {
    dctx.save();
    dctx.globalCompositeOperation = 'destination-out';
    dctx.lineCap = 'round';
    dctx.lineWidth = 34;
    dctx.strokeStyle = 'rgba(0,0,0,.85)';
    dctx.beginPath();
    dctx.moveTo(px, py);
    dctx.lineTo(x, y);
    dctx.stroke();
    dctx.restore();
  }

  function local(e) {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  canvas.addEventListener('pointerdown', (e) => {
    drag = { id: e.pointerId, p: local(e) };
    canvas.setPointerCapture?.(e.pointerId);
    brushHint.hidden = true;
    brush(...drag.p, ...drag.p);
    e.preventDefault();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id || revealed) return;
    const p = local(e);
    brush(...p, ...drag.p);
    if (Math.hypot(p[0] - drag.p[0], p[1] - drag.p[1]) > 18) ctl.sfx('hide');
    drag.p = p;
    e.preventDefault();
  });
  const end = () => (drag = null);
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  requestAnimationFrame(() => {
    setup();
    raf = requestAnimationFrame(frame);
  });

  // keyboard fallback on a laptop: space brushes a random stripe
  function onKey(e) {
    if (e.key === ' ' && !revealed) {
      e.preventDefault();
      const y = Math.random() * H;
      brush(0, y, W, y + (Math.random() - 0.5) * 60);
    }
  }
  document.addEventListener('keydown', onKey);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
    },
  };
}
