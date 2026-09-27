// Draws the world on a canvas: floor, vision cones, people, 3/4 walls and props,
// lasers, darkness with flashlights, markers and effects.

import { kindAt } from './map.js';
import { LOOKS, drawCard, drawGear, drawPerson, drawProp, drawRobot, hexA, pedestrianLook, roundRect, shade } from './sprites.js';
import { laserOn, laserWarn, visionActive } from './world.js';
import { themeFor } from './themes.js';

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const HEIGHT = { wall: 0.45, shelf: 0.42, crate: 0.42, table: 0.2, car: 0.28, bench: 0.1, glass: 0.35, rail: 0.22, plant: 0 };

const hash = (x, y) => {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const light = document.createElement('canvas');
  const lctx = light.getContext('2d');
  let W = 1;
  let H = 1;
  let dpr = 1;
  let tile = 40;
  const insets = { top: 0, bottom: 0 };
  const cam = { x: 0, y: 0, shake: 0, sx: 0, sy: 0, zoom: 1 };
  let groupBoxes = null;
  let groupMap = null;
  let fog = null;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    light.width = canvas.width;
    light.height = canvas.height;
    tile = Math.max(34, Math.min(64, Math.round(Math.min(W, 620) / 8.2)));
  }

  function setInsets(top, bottom) {
    insets.top = top;
    insets.bottom = bottom;
  }

  function boundsFor(map) {
    const t = tile * cam.zoom;
    const halfW = W / 2 / t;
    const halfH = H / 2 / t;
    const top = insets.top / t;
    const bottom = insets.bottom / t;
    const bx = map.w < halfW * 2 ? [map.w / 2, map.w / 2] : [halfW, map.w - halfW];
    const minY = halfH - top;
    const maxY = map.h - halfH + bottom;
    const by = minY > maxY ? [(minY + maxY) / 2, (minY + maxY) / 2] : [minY, maxY];
    return { bx, by };
  }

  function follow(world, dt, snap = false) {
    const p = world.player;
    const target = world.pan ?? { x: p.x + p.vx * 0.22, y: p.y + p.vy * 0.22 };
    const k = snap ? 1 : 1 - Math.exp(-dt * (world.pan ? 3.2 : 6));
    cam.x += (target.x - cam.x) * k;
    cam.y += (target.y - cam.y) * k;
    const { bx, by } = boundsFor(world.map);
    cam.x = Math.min(bx[1], Math.max(bx[0], cam.x));
    cam.y = Math.min(by[1], Math.max(by[0], cam.y));
    cam.shake = Math.max(0, cam.shake - dt * 1.6);
    const s = cam.shake * cam.shake * 0.35;
    cam.sx = (Math.random() - 0.5) * s;
    cam.sy = (Math.random() - 0.5) * s;
  }

  function toScreen(x, y) {
    const t = tile * cam.zoom;
    return { x: W / 2 + (x - cam.x - cam.sx) * t, y: H / 2 + (y - cam.y - cam.sy) * t };
  }

  function worldTransform(c) {
    const t = tile * cam.zoom * dpr;
    c.setTransform(t, 0, 0, t, dpr * W / 2 - (cam.x + cam.sx) * t, dpr * H / 2 - (cam.y + cam.sy) * t);
  }

  function prepareGroups(map) {
    if (groupMap === map) return;
    groupMap = map;
    groupBoxes = new Map();
    for (let y = 0; y < map.h; y++) {
      for (let x = 0; x < map.w; x++) {
        const g = map.group[y * map.w + x];
        if (g < 0) continue;
        const b = groupBoxes.get(g);
        if (!b) groupBoxes.set(g, { x0: x, y0: y, x1: x, y1: y });
        else {
          b.x0 = Math.min(b.x0, x);
          b.y0 = Math.min(b.y0, y);
          b.x1 = Math.max(b.x1, x);
          b.y1 = Math.max(b.y1, y);
        }
      }
    }
    fog = Array.from({ length: 14 }, (_, i) => ({ x: hash(i, 3) * map.w, y: hash(i, 7) * map.h, r: 2.5 + hash(i, 11) * 3, v: 0.15 + hash(i, 5) * 0.25 }));
  }

  // ---------- Floor ----------

  function drawFloorTile(map, th, kind, x, y, t) {
    const r = hash(x, y);
    switch (kind) {
      case 'void':
        ctx.fillStyle = th.bg;
        ctx.fillRect(x, y, 1.02, 1.02);
        return;
      case 'road':
      case 'stripe':
      case 'zebra':
        ctx.fillStyle = th.road ?? th.floor3;
        ctx.fillRect(x, y, 1.02, 1.02);
        if (kind === 'zebra') {
          ctx.fillStyle = 'rgba(240,240,250,.8)';
          const horiz = kindAt(map, x - 1, y) === 'zebra' || kindAt(map, x + 1, y) === 'zebra';
          if (horiz) {
            ctx.fillRect(x + 0.08, y + 0.1, 0.34, 0.8);
            ctx.fillRect(x + 0.58, y + 0.1, 0.34, 0.8);
          } else {
            ctx.fillRect(x + 0.1, y + 0.08, 0.8, 0.34);
            ctx.fillRect(x + 0.1, y + 0.58, 0.8, 0.34);
          }
        } else if (kind === 'stripe') {
          ctx.fillStyle = 'rgba(240,240,250,.7)';
          const horiz = kindAt(map, x - 1, y) === 'stripe' || kindAt(map, x + 1, y) === 'stripe';
          if (horiz) ctx.fillRect(x + 0.15, y + 0.45, 0.7, 0.1);
          else ctx.fillRect(x + 0.45, y + 0.15, 0.1, 0.7);
        } else if (r > 0.93) {
          ctx.fillStyle = 'rgba(0,0,0,.18)';
          ctx.fillRect(x + r * 0.5, y + 0.3, 0.3, 0.2);
        }
        return;
      case 'water': {
        ctx.fillStyle = th.water ?? '#1d3a5a';
        ctx.fillRect(x, y, 1.02, 1.02);
        ctx.strokeStyle = 'rgba(180,220,255,.18)';
        ctx.lineWidth = 0.04;
        ctx.beginPath();
        const off = (t * 0.4 + r) % 1;
        ctx.moveTo(x + off * 0.5, y + 0.3 + r * 0.3);
        ctx.quadraticCurveTo(x + off * 0.5 + 0.2, y + 0.2 + r * 0.3, x + off * 0.5 + 0.4, y + 0.3 + r * 0.3);
        ctx.stroke();
        return;
      }
      case 'rug':
        ctx.fillStyle = th.rug ?? th.floor2;
        ctx.fillRect(x, y, 1.02, 1.02);
        ctx.fillStyle = 'rgba(255,255,255,.06)';
        if ((x + y) % 2 === 0) ctx.fillRect(x + 0.3, y + 0.3, 0.4, 0.4);
        return;
      default: {
        const base = kind === 'floor2' ? th.floor2 : kind === 'floor3' ? th.floor3 : th.floor;
        ctx.fillStyle = base;
        ctx.fillRect(x, y, 1.02, 1.02);
        if (r > 0.86) {
          ctx.fillStyle = 'rgba(255,255,255,.025)';
          ctx.fillRect(x, y, 1, 1);
        }
        ctx.fillStyle = th.grid;
        ctx.fillRect(x, y, 1, 0.03);
        ctx.fillRect(x, y, 0.03, 1);
        if (kind === 'floor2' && th === themeFor('city')) {
          ctx.fillStyle = 'rgba(160,230,150,.25)';
          for (let i = 0; i < 3; i++) ctx.fillRect(x + hash(x + i, y) * 0.9, y + hash(x, y + i) * 0.9, 0.04, 0.1);
        }
      }
    }
  }

  // ---------- Walls and props (3/4 view) ----------

  function drawSolid(map, th, kind, x, y, t, cityish) {
    const h = cityish && kind === 'wall' ? 0.7 : HEIGHT[kind] ?? 0.4;
    const below = kindAt(map, x, y + 1);
    const g = map.group[y * map.w + x];
    switch (kind) {
      case 'wall': {
        const top = cityish ? th.roofs[(g * 7 + Math.floor((y + g) / 4) + Math.floor(x / 5)) % th.roofs.length] : th.wallTop;
        if (below !== 'wall') {
          ctx.fillStyle = cityish ? shade(top, -45) : th.wallFace;
          ctx.fillRect(x, y + 1 - h, 1.01, h);
          if (cityish) {
            ctx.fillStyle = hash(x, y) > 0.35 ? 'rgba(255,220,140,.75)' : 'rgba(20,20,40,.6)';
            ctx.fillRect(x + 0.2, y + 1 - h + 0.15, 0.25, 0.3);
            ctx.fillStyle = hash(y, x) > 0.4 ? 'rgba(255,220,140,.75)' : 'rgba(20,20,40,.6)';
            ctx.fillRect(x + 0.58, y + 1 - h + 0.15, 0.25, 0.3);
          } else {
            ctx.fillStyle = 'rgba(0,0,0,.18)';
            ctx.fillRect(x, y + 1 - h * 0.45, 1.01, 0.03);
            if (hash(x, y) > 0.5) ctx.fillRect(x + 0.5, y + 1 - h, 0.03, h * 0.55);
            else ctx.fillRect(x + 0.2, y + 1 - h * 0.45, 0.03, h * 0.45);
          }
        }
        ctx.fillStyle = top;
        ctx.fillRect(x, y - h, 1.01, 1.01);
        ctx.fillStyle = cityish ? 'rgba(255,255,255,.18)' : th.wallEdge;
        const e = 0.05;
        if (kindAt(map, x - 1, y) !== 'wall') ctx.fillRect(x, y - h, e, 1);
        if (kindAt(map, x + 1, y) !== 'wall') ctx.fillRect(x + 1 - e, y - h, e, 1);
        if (kindAt(map, x, y - 1) !== 'wall') ctx.fillRect(x, y - h, 1, e);
        if (below !== 'wall') ctx.fillRect(x, y + 1 - h - e, 1, e);
        if (cityish && hash(x, y) > 0.8) {
          ctx.fillStyle = 'rgba(0,0,0,.15)';
          ctx.fillRect(x + 0.25, y - h + 0.25, 0.3, 0.3);
        }
        break;
      }
      case 'shelf': {
        if (below !== 'shelf') {
          ctx.fillStyle = th.shelf[1];
          ctx.fillRect(x, y + 1 - h, 1.01, h);
          const colors = ['#c0616f', '#6a8fd0', '#d8b04a', '#6fb07a', '#9b72c9', '#e9e4f5'];
          for (let i = 0; i < 5; i++) {
            ctx.fillStyle = colors[Math.floor(hash(x * 5 + i, y) * colors.length)];
            ctx.fillRect(x + 0.06 + i * 0.18, y + 1 - h + 0.08, 0.13, h - 0.16 - hash(i, x) * 0.12);
          }
        }
        ctx.fillStyle = th.shelf[0];
        ctx.fillRect(x, y - h, 1.01, 1.01);
        ctx.fillStyle = 'rgba(255,255,255,.08)';
        ctx.fillRect(x, y - h + 0.45, 1.01, 0.08);
        ctx.fillStyle = 'rgba(0,0,0,.2)';
        if (kindAt(map, x - 1, y) !== 'shelf') ctx.fillRect(x, y - h, 0.05, 1);
        if (kindAt(map, x + 1, y) !== 'shelf') ctx.fillRect(x + 0.95, y - h, 0.05, 1);
        break;
      }
      case 'crate': {
        const color = th.crate[g % th.crate.length];
        const same = (dx, dy) => {
          const nx = x + dx;
          const ny = y + dy;
          return nx >= 0 && ny >= 0 && nx < map.w && ny < map.h && map.group[ny * map.w + nx] === g;
        };
        const b = groupBoxes.get(g);
        const horizontal = b ? b.x1 - b.x0 >= b.y1 - b.y0 : true;
        const l = same(-1, 0) ? 0 : 0.05;
        const r = same(1, 0) ? 0 : 0.05;
        const tp = same(0, -1) ? 0 : 0.05;
        if (!same(0, 1)) {
          ctx.fillStyle = shade(color, -55);
          ctx.fillRect(x + l, y + 1 - h, 1 - l - r + 0.01, h);
          ctx.fillStyle = 'rgba(0,0,0,.2)';
          for (let i = 1; i < 3; i++) ctx.fillRect(x + i / 3, y + 1 - h, 0.03, h);
        }
        ctx.fillStyle = color;
        ctx.fillRect(x + l, y - h + tp, 1 - l - r + 0.01, 1 - tp + (same(0, 1) ? 0.01 : 0));
        ctx.fillStyle = 'rgba(0,0,0,.16)';
        for (let i = 1; i < 3; i++) {
          if (horizontal) ctx.fillRect(x + i / 3, y - h + tp, 0.035, 1 - tp);
          else ctx.fillRect(x + l, y - h + i / 3, 1 - l - r, 0.035);
        }
        ctx.fillStyle = 'rgba(255,255,255,.2)';
        if (!same(0, -1)) ctx.fillRect(x + l, y - h + tp, 1 - l - r, 0.05);
        if (!same(-1, 0)) ctx.fillRect(x + l, y - h + tp, 0.05, 1 - tp);
        break;
      }
      case 'car': {
        const b = groupBoxes.get(g);
        if (!b || b.x0 !== x || b.y0 !== y) break;
        const w = b.x1 - b.x0 + 1;
        const d = b.y1 - b.y0 + 1;
        const color = th.car?.[g % th.car.length] ?? '#d0566b';
        ctx.fillStyle = 'rgba(0,0,0,.3)';
        roundRect(ctx, x + 0.12, y + 0.18, w - 0.2, d - 0.2, 0.2);
        ctx.fill();
        ctx.fillStyle = color;
        roundRect(ctx, x + 0.08, y + 0.05 - h * 0.5, w - 0.16, d - 0.1, 0.22);
        ctx.fill();
        ctx.fillStyle = 'rgba(20,30,50,.75)';
        if (w >= d) {
          ctx.fillRect(x + w * 0.28, y + 0.12 - h * 0.5, w * 0.14, d - 0.24);
          ctx.fillRect(x + w * 0.62, y + 0.12 - h * 0.5, w * 0.1, d - 0.24);
        } else {
          ctx.fillRect(x + 0.12, y + d * 0.28 - h * 0.5, w - 0.24, d * 0.14);
          ctx.fillRect(x + 0.12, y + d * 0.62 - h * 0.5, w - 0.24, d * 0.1);
        }
        break;
      }
      case 'table': {
        const top = th.table[0];
        if (below !== 'table') {
          ctx.fillStyle = th.table[1];
          ctx.fillRect(x + 0.02, y + 1 - h, 0.98, h);
        }
        ctx.fillStyle = top;
        ctx.fillRect(x + 0.02, y - h + (kindAt(map, x, y - 1) === 'table' ? 0 : 0.08), 0.98, 1);
        const r = hash(x, y);
        if (r > 0.72) {
          ctx.fillStyle = '#e9e4f5';
          ctx.save();
          ctx.translate(x + 0.5, y + 0.3 - h);
          ctx.rotate(r * 2);
          ctx.fillRect(-0.18, -0.12, 0.36, 0.26);
          ctx.restore();
        } else if (r > 0.5) {
          ctx.fillStyle = '#1b1f2b';
          ctx.fillRect(x + 0.25, y + 0.15 - h, 0.5, 0.34);
          ctx.fillStyle = 'rgba(111,179,210,.6)';
          ctx.fillRect(x + 0.29, y + 0.19 - h, 0.42, 0.26);
        } else if (r > 0.38) {
          ctx.fillStyle = '#e9e4f5';
          ctx.beginPath();
          ctx.arc(x + 0.7, y + 0.35 - h, 0.09, 0, TAU);
          ctx.fill();
          ctx.fillStyle = '#6b3f2a';
          ctx.beginPath();
          ctx.arc(x + 0.7, y + 0.35 - h, 0.06, 0, TAU);
          ctx.fill();
        }
        break;
      }
      case 'plant': {
        const big = cityish;
        const rr = big ? 0.62 : 0.36;
        ctx.fillStyle = 'rgba(0,0,0,.28)';
        ctx.beginPath();
        ctx.ellipse(x + 0.55, y + 0.62, rr, rr * 0.8, 0, 0, TAU);
        ctx.fill();
        if (!big) {
          ctx.fillStyle = '#7a4a3a';
          ctx.fillRect(x + 0.3, y + 0.45, 0.4, 0.4);
        }
        const leaf = th.plant;
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * TAU + hash(x, y) * 3;
          ctx.fillStyle = i % 2 ? leaf : shade(leaf, 22);
          ctx.beginPath();
          ctx.arc(x + 0.5 + Math.cos(a) * rr * 0.4, y + 0.3 + Math.sin(a) * rr * 0.4 - (big ? 0.3 : 0.1), rr * 0.62, 0, TAU);
          ctx.fill();
        }
        ctx.fillStyle = 'rgba(255,255,255,.12)';
        ctx.beginPath();
        ctx.arc(x + 0.38, y + 0.12 - (big ? 0.3 : 0.1), rr * 0.3, 0, TAU);
        ctx.fill();
        break;
      }
      case 'bench': {
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(x + 0.05, y + 0.25, 0.9, 0.55);
        ctx.fillStyle = '#9a6a3a';
        for (let i = 0; i < 3; i++) ctx.fillRect(x + 0.05, y + 0.18 + i * 0.2, 0.9, 0.12);
        break;
      }
      case 'glass': {
        ctx.fillStyle = 'rgba(160,210,255,.18)';
        ctx.fillRect(x, y - h + 0.35, 1.01, 0.3 + h);
        ctx.fillStyle = 'rgba(200,235,255,.55)';
        ctx.fillRect(x, y - h + 0.35, 1.01, 0.05);
        ctx.fillRect(x + 0.2 + hash(x, y) * 0.4, y - h + 0.42, 0.06, h * 0.8);
        break;
      }
      case 'rail': {
        ctx.fillStyle = '#6b7080';
        ctx.fillRect(x, y + 0.45 - h, 1.01, 0.1);
        ctx.fillStyle = '#4a4e5c';
        ctx.fillRect(x + 0.45, y + 0.45 - h, 0.1, h + 0.1);
        break;
      }
      default:
        break;
    }
  }

  function drawDoor(e, th) {
    const x = e.tx;
    const y = e.ty;
    const o = e.open;
    const locked = e.locked === true || typeof e.locked === 'string';
    const color = e.color ?? (e.glass ? 'rgba(160,210,255,.45)' : '#5e5480');
    const lamp = locked ? (typeof e.locked === 'string' ? e.cardColor ?? '#e0566b' : '#e0566b') : '#4cc27a';
    if (e.horizontal) {
      const h = 0.5;
      const leaf = 0.5 * (1 - o);
      ctx.fillStyle = shade('#2c2548', 0);
      ctx.fillRect(x, y + 0.35 - h, 1, 0.3);
      ctx.fillStyle = e.glass ? color : color;
      ctx.fillRect(x, y + 0.3 - h, leaf, h + 0.2);
      ctx.fillRect(x + 1 - leaf, y + 0.3 - h, leaf, h + 0.2);
      ctx.fillStyle = 'rgba(255,255,255,.18)';
      ctx.fillRect(x, y + 0.3 - h, leaf, 0.05);
      ctx.fillRect(x + 1 - leaf, y + 0.3 - h, leaf, 0.05);
      ctx.fillStyle = lamp;
      ctx.fillRect(x + 0.42, y - 0.28, 0.16, 0.08);
    } else {
      const leaf = 0.5 * (1 - o);
      ctx.fillStyle = color;
      ctx.fillRect(x + 0.35, y - 0.25, 0.3, leaf + 0.1);
      ctx.fillRect(x + 0.35, y + 0.75 - leaf, 0.3, leaf + 0.1);
      ctx.fillStyle = lamp;
      ctx.fillRect(x + 0.44, y - 0.3, 0.12, 0.1);
    }
  }

  function drawHide(e, player, t) {
    const x = e.tx;
    const y = e.ty;
    const inside = player.hidden === e;
    const on = !inside && Math.abs(player.x - e.x) < 0.7 && Math.abs(player.y - e.y) < 0.7;
    ctx.save();
    if (on) ctx.globalAlpha = 0.45;
    switch (e.prop) {
      case 'bush':
      case 'hedge': {
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * TAU;
          ctx.fillStyle = i % 2 ? '#2f7a45' : '#3f9a58';
          ctx.beginPath();
          ctx.arc(x + 0.5 + Math.cos(a) * 0.22, y + 0.35 + Math.sin(a) * 0.18, 0.34, 0, TAU);
          ctx.fill();
        }
        break;
      }
      case 'locker': {
        ctx.fillStyle = '#3a4a6a';
        ctx.fillRect(x + 0.08, y - 0.45, 0.84, 1.3);
        ctx.fillStyle = '#4d5f85';
        ctx.fillRect(x + 0.08, y - 0.45, 0.84, 1.0);
        ctx.fillStyle = 'rgba(0,0,0,.35)';
        for (let i = 0; i < 3; i++) ctx.fillRect(x + 0.3, y - 0.3 + i * 0.1, 0.4, 0.04);
        break;
      }
      case 'barrel': {
        ctx.fillStyle = '#2d5a8a';
        ctx.beginPath();
        ctx.ellipse(x + 0.5, y + 0.2, 0.4, 0.4, 0, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = '#1a3a5a';
        ctx.lineWidth = 0.05;
        ctx.stroke();
        break;
      }
      case 'kiosk': {
        ctx.fillStyle = '#c0616f';
        ctx.fillRect(x - 0.05, y - 0.5, 1.1, 1.3);
        ctx.fillStyle = '#f3e9d2';
        for (let i = 0; i < 4; i++) ctx.fillRect(x - 0.05 + i * 0.28, y - 0.5, 0.14, 0.5);
        break;
      }
      default: {
        // cardboard box
        ctx.fillStyle = '#8a6a3e';
        ctx.fillRect(x + 0.06, y + 0.2, 0.88, 0.7);
        ctx.fillStyle = '#b08a52';
        ctx.fillRect(x + 0.06, y - 0.2, 0.88, 0.7);
        ctx.fillStyle = 'rgba(0,0,0,.2)';
        ctx.fillRect(x + 0.47, y - 0.2, 0.06, 0.7);
        ctx.fillStyle = '#d8c090';
        ctx.fillRect(x + 0.1, y - 0.16, 0.2, 0.06);
      }
    }
    if (inside) {
      // eyes peeking out
      const blink = Math.sin(t * 1.3) > 0.97 ? 0.01 : 0.05;
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 0.34, y + 0.05, 0.1, blink);
      ctx.fillRect(x + 0.56, y + 0.05, 0.1, blink);
    }
    ctx.restore();
  }

  function drawTaskGlow(e, t) {
    if (e.done || e.hidden || !e.active) return;
    const pulse = 0.5 + 0.5 * Math.sin(t * 4);
    ctx.strokeStyle = `rgba(255,63,158,${0.35 + pulse * 0.45})`;
    ctx.lineWidth = 0.06;
    ctx.beginPath();
    ctx.ellipse(e.x, e.y + 0.1, 0.62 + pulse * 0.06, 0.44 + pulse * 0.05, 0, 0, TAU);
    ctx.stroke();
  }

  function drawCone(world, x, y, angle, vision, meter, kind) {
    const pts = world.cone(x, y, angle, vision.fov, vision.range * world.stealth.range);
    const g = ctx.createRadialGradient(x, y, 0.2, x, y, vision.range);
    let rgb = kind === 'camera' ? '255,63,158' : '255,226,120';
    if (meter > 0.02) rgb = meter > 0.6 ? '255,70,70' : '255,150,60';
    g.addColorStop(0, `rgba(${rgb},${0.34 + meter * 0.3})`);
    g.addColorStop(1, `rgba(${rgb},0.04)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (const [px, py] of pts) ctx.lineTo(px, py);
    ctx.closePath();
    ctx.fill();
  }

  function drawCameraBody(e) {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.angle);
    ctx.fillStyle = e.active ? '#d8d4e8' : '#6b6880';
    ctx.fillRect(-0.18, -0.12, 0.36, 0.24);
    ctx.fillStyle = '#2a2838';
    ctx.fillRect(0.14, -0.08, 0.1, 0.16);
    ctx.fillStyle = e.active ? (e.meter > 0.05 ? '#ff4646' : '#ff3f9e') : '#3a3848';
    ctx.beginPath();
    ctx.arc(-0.08, 0, 0.04, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawLaser(world, e, t) {
    const on = laserOn(world, e);
    const warn = laserWarn(world, e);
    for (const [px, py] of [
      [e.ax, e.ay],
      [e.bx, e.by],
    ]) {
      ctx.fillStyle = '#3a3848';
      ctx.fillRect(px - 0.14, py - 0.14, 0.28, 0.28);
      ctx.fillStyle = on ? '#ff4646' : e.active ? '#6a2a3a' : '#2a2838';
      ctx.fillRect(px - 0.07, py - 0.07, 0.14, 0.14);
    }
    if (!e.active) return;
    if (on) {
      ctx.strokeStyle = 'rgba(255,40,60,.28)';
      ctx.lineWidth = 0.22 + Math.sin(t * 30) * 0.03;
      ctx.beginPath();
      ctx.moveTo(e.ax, e.ay);
      ctx.lineTo(e.bx, e.by);
      ctx.stroke();
      ctx.strokeStyle = '#ff5a6e';
      ctx.lineWidth = 0.06;
      ctx.stroke();
      ctx.strokeStyle = '#ffe0e4';
      ctx.lineWidth = 0.02;
      ctx.stroke();
    } else if (warn > 0 && warn < 0.6 && Math.sin(t * 50) > 0) {
      ctx.strokeStyle = 'rgba(255,90,110,.45)';
      ctx.lineWidth = 0.02;
      ctx.beginPath();
      ctx.moveTo(e.ax, e.ay);
      ctx.lineTo(e.bx, e.by);
      ctx.stroke();
    }
  }

  function drawExit(e, t) {
    const pulse = 0.5 + 0.5 * Math.sin(t * 4);
    const g = ctx.createRadialGradient(e.x, e.y, 0.05, e.x, e.y, 0.7);
    g.addColorStop(0, `rgba(139,209,124,${0.45 + pulse * 0.3})`);
    g.addColorStop(1, 'rgba(139,209,124,0)');
    ctx.fillStyle = g;
    ctx.fillRect(e.x - 0.7, e.y - 0.7, 1.4, 1.4);
    ctx.strokeStyle = `rgba(200,255,190,${0.6 + pulse * 0.4})`;
    ctx.lineWidth = 0.05;
    ctx.strokeRect(e.tx + 0.12, e.ty + 0.12, 0.76, 0.76);
  }

  function personLook(e) {
    if (e.look === 'pedestrian') return (e._look ??= pedestrianLook(e.seed ?? e.x * 3 + e.y));
    const look = LOOKS[e.look] ?? LOOKS.guard;
    return e.bag ? { ...look, bag: e.bag } : look;
  }

  // ---------- Frame ----------

  function draw(world, fx, { t, target, showCones = true } = {}) {
    const th = themeFor(world.level.theme);
    const map = world.map;
    prepareGroups(map);
    const cityish = world.level.theme === 'city';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = th.bg;
    ctx.fillRect(0, 0, W, H);

    worldTransform(ctx);
    const ts = tile * cam.zoom;
    const x0 = Math.max(0, Math.floor(cam.x - W / 2 / ts) - 1);
    const x1 = Math.min(map.w - 1, Math.ceil(cam.x + W / 2 / ts) + 1);
    const y0 = Math.max(0, Math.floor(cam.y - H / 2 / ts) - 1);
    const y1 = Math.min(map.h - 1, Math.ceil(cam.y + H / 2 / ts) + 2);

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const kind = map.kinds[y * map.w + x];
        const floorKind = map.solid[y * map.w + x] && kind !== 'water' && kind !== 'void' ? (cityish ? 'floor' : 'floor') : kind;
        drawFloorTile(map, th, floorKind, x, y, t);
      }
    }

    // floor-level things
    for (const e of world.entities) {
      if (!e.active) continue;
      if (e.type === 'exit') drawExit(e, t);
      else if (e.type === 'task') drawTaskGlow(e, t);
      else if (e.type === 'deco' && e.floor) drawProp(ctx, e.prop, e.tx, e.ty, t);
    }

    // vision cones
    if (showCones) {
      for (const e of world.entities) {
        if (e.type === 'person' && visionActive(e) && (e.catches || e.spots)) drawCone(world, e.x, e.y, e.angle, e.vision, e.meter, 'person');
        if (e.type === 'camera' && e.active) drawCone(world, e.x, e.y, e.angle, e.vision, e.meter, 'camera');
      }
    }

    // walls, props, doors, row by row so nearer rows overlap further ones
    const rowThings = new Map();
    for (const e of world.entities) {
      if (!e.active && e.type !== 'camera' && e.type !== 'laser') continue;
      if (e.type === 'door' || (e.type === 'task' && !e.hidden) || (e.type === 'deco' && !e.floor)) {
        const list = rowThings.get(e.ty) ?? [];
        list.push(e);
        rowThings.set(e.ty, list);
      }
    }
    for (let y = y0; y <= y1 + 1 && y < map.h; y++) {
      for (let x = x0; x <= x1; x++) {
        const i = y * map.w + x;
        if (!map.solid[i]) continue;
        const kind = map.kinds[i];
        if (kind === 'void' || kind === 'water') continue;
        drawSolid(map, th, kind, x, y, t, cityish);
      }
      for (const e of rowThings.get(y) ?? []) {
        if (e.type === 'door') drawDoor(e, th);
        else drawProp(ctx, e.prop, e.tx, e.ty, t, { done: e.done, glow: !e.done });
      }
    }

    // items, people and the player, back to front
    const bodies = [];
    for (const e of world.entities) {
      if (!e.active) continue;
      if (e.type === 'person' || e.type === 'item' || e.type === 'part') bodies.push(e);
    }
    bodies.push({ type: 'player', y: world.player.y });
    bodies.sort((a, b) => a.y - b.y);
    for (const e of bodies) {
      if (e.type === 'player') {
        const p = world.player;
        if (!p.hidden) drawPerson(ctx, p.x, p.y, p.angle, LOOKS.vilde, { walk: p.walk, moving: p.moving });
      } else if (e.type === 'person') {
        if (e.look === 'robot') drawRobot(ctx, e.x, e.y, e.angle, t);
        else drawPerson(ctx, e.x, e.y, e.angle, personLook(e), { walk: e.walk, moving: e.moving });
      } else if (e.type === 'part') drawGear(ctx, e.x, e.y, t, { ghost: e.ghost });
      else if (e.type === 'item') drawCard(ctx, e.x, e.y, t, e.color ?? '#6fb3d2');
    }

    for (const e of world.entities) if (e.type === 'hide' && e.active) drawHide(e, world.player, t);

    for (const e of world.entities) {
      if (e.type === 'laser') drawLaser(world, e, t);
      if (e.type === 'camera') drawCameraBody(e);
    }

    // darkness and light
    const dark = world.dark ?? world.level.dark ?? th.dark;
    if (dark > 0) drawLight(world, th, dark, t);

    fx.draw(ctx);

    // screen-space overlay
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawAlerts(world, t);
    if (target) drawTarget(target, t);
    drawFloaters(fx);
    drawVignette(world);
  }

  function drawLight(world, th, dark, t) {
    lctx.setTransform(1, 0, 0, 1, 0, 0);
    lctx.globalCompositeOperation = 'source-over';
    lctx.clearRect(0, 0, light.width, light.height);
    lctx.fillStyle = `rgba(${th.darkColor ?? '0,0,0'},${dark})`;
    lctx.fillRect(0, 0, light.width, light.height);
    lctx.globalCompositeOperation = 'destination-out';
    worldTransform(lctx);

    const glow = (x, y, r, a = 1) => {
      const g = lctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(0,0,0,${a})`);
      g.addColorStop(0.55, `rgba(0,0,0,${a * 0.75})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      lctx.fillStyle = g;
      lctx.fillRect(x - r, y - r, r * 2, r * 2);
    };

    const p = world.player;
    glow(p.x, p.y, (th.light ?? 3) * (world.extra.lightBoost ?? 1), 1);
    for (const e of world.entities) {
      if (!e.active) continue;
      if (e.type === 'lamp') glow(e.x, e.y, e.r ?? 3, e.a ?? 0.9);
      else if (e.type === 'task' && !e.done) glow(e.x, e.y, 1.1, 0.6);
      else if (e.type === 'exit') glow(e.x, e.y, 1.4, 0.7);
      else if (e.type === 'part' && !e.ghost) glow(e.x, e.y, 0.7, 0.5 + 0.3 * Math.sin(t * 3));
      else if (e.type === 'laser' && laserOn(world, e)) {
        lctx.strokeStyle = 'rgba(0,0,0,.6)';
        lctx.lineWidth = 0.5;
        lctx.beginPath();
        lctx.moveTo(e.ax, e.ay);
        lctx.lineTo(e.bx, e.by);
        lctx.stroke();
      } else if (e.type === 'person') {
        glow(e.x, e.y, 0.9, 0.5);
        const look = LOOKS[e.look];
        if (look?.torch || e.torch) {
          const range = (e.vision?.range ?? 5) * world.stealth.range;
          const pts = world.cone(e.x, e.y, e.angle, e.vision?.fov ?? 60, range, 20);
          const g = lctx.createRadialGradient(e.x, e.y, 0.1, e.x, e.y, range);
          g.addColorStop(0, 'rgba(0,0,0,.95)');
          g.addColorStop(1, 'rgba(0,0,0,.25)');
          lctx.fillStyle = g;
          lctx.beginPath();
          lctx.moveTo(e.x, e.y);
          for (const [px, py] of pts) lctx.lineTo(px, py);
          lctx.closePath();
          lctx.fill();
        }
      } else if (e.type === 'camera') glow(e.x, e.y, 0.8, 0.5);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(light, 0, 0);
    worldTransform(ctx);

    if (th.fog) {
      for (const f of fog) {
        const fx = (f.x + t * f.v) % (world.map.w + 6) - 3;
        const g = ctx.createRadialGradient(fx, f.y, 0, fx, f.y, f.r);
        g.addColorStop(0, 'rgba(170,190,215,.13)');
        g.addColorStop(1, 'rgba(170,190,215,0)');
        ctx.fillStyle = g;
        ctx.fillRect(fx - f.r, f.y - f.r, f.r * 2, f.r * 2);
      }
    }
  }

  function drawAlerts(world, t) {
    for (const e of world.entities) {
      if (!e.active || (e.type !== 'person' && e.type !== 'camera')) continue;
      if (e.meter <= 0.02 && !e.alert) continue;
      const s = toScreen(e.x, e.y - 0.75);
      const full = e.alert || e.meter >= 1;
      const r = 13;
      ctx.fillStyle = full ? '#ff4646' : '#1b1730';
      ctx.strokeStyle = full ? '#ffe0e0' : e.meter > 0.6 ? '#ff4646' : '#ff9a3c';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, TAU);
      ctx.fill();
      if (!full) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, -Math.PI / 2, -Math.PI / 2 + e.meter * TAU);
        ctx.stroke();
      } else ctx.stroke();
      ctx.fillStyle = full ? '#fff' : ctx.strokeStyle;
      ctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(full ? '!' : '?', s.x, s.y + 1);
    }
  }

  function drawTarget(target, t) {
    const s = toScreen(target.x, target.y);
    const margin = 34;
    const top = insets.top + 16;
    const bottom = H - insets.bottom - 16;
    const inside = s.x > margin && s.x < W - margin && s.y > top && s.y < bottom;
    ctx.save();
    if (inside) {
      const bob = Math.sin(t * 5) * 5;
      const y = s.y - tile * 0.95 + bob;
      ctx.fillStyle = '#ff3f9e';
      ctx.strokeStyle = '#1b1730';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s.x - 11, y - 12);
      ctx.lineTo(s.x + 11, y - 12);
      ctx.lineTo(s.x, y + 2);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    } else {
      const cx = W / 2;
      const cy = (top + bottom) / 2;
      const a = Math.atan2(s.y - cy, s.x - cx);
      // project onto the screen edge rectangle
      const hw = W / 2 - margin;
      const hh = (bottom - top) / 2 - 10;
      const k = Math.min(Math.abs(hw / Math.cos(a)), Math.abs(hh / Math.sin(a)));
      const ex = cx + Math.cos(a) * k;
      const ey = cy + Math.sin(a) * k;
      const pulse = 1 + Math.sin(t * 6) * 0.08;
      ctx.translate(ex, ey);
      ctx.rotate(a);
      ctx.scale(pulse, pulse);
      ctx.fillStyle = 'rgba(12,10,23,.75)';
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#ff3f9e';
      ctx.beginPath();
      ctx.moveTo(13, 0);
      ctx.lineTo(-7, -10);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-7, 10);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawFloaters(fx) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 16px system-ui, -apple-system, sans-serif';
    for (const f of fx.floaters) {
      const k = f.age / f.life;
      const s = toScreen(f.x, f.y - k * 0.9);
      ctx.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(12,10,23,.85)';
      ctx.strokeText(f.text, s.x, s.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, s.x, s.y);
    }
    ctx.globalAlpha = 1;
  }

  function drawVignette(world) {
    let m = 0;
    for (const e of world.entities) if (e.active && (e.type === 'person' || e.type === 'camera') && e.meter > m) m = e.meter;
    if (m <= 0.02) return;
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, 'rgba(255,40,60,0)');
    g.addColorStop(1, `rgba(255,40,60,${m * 0.45})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  return {
    ctx,
    cam,
    resize,
    setInsets,
    follow,
    draw,
    toScreen,
    get tile() {
      return tile;
    },
    shake(amount) {
      cam.shake = Math.min(1.2, cam.shake + amount);
    },
    snap(world) {
      follow(world, 0, true);
    },
  };
}

export { hexA };
