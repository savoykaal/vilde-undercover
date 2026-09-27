// Procedural top-down characters and props, drawn in world units (1 = one tile).
// Characters face `angle` (0 = right). Everything is plain canvas paths, no images.

const TAU = Math.PI * 2;

export const LOOKS = {
  vilde: { body: '#2b2350', trim: '#ff3f9e', skin: '#f1c7a5', hair: '#7a5230', style: 'ponytail' },
  frej: { body: '#e0784a', trim: '#ffd0b8', skin: '#efc19e', hair: '#c9a060', style: 'short', carry: 'chips' },
  mynthe: { body: '#5fae57', trim: '#c7f5b9', skin: '#f3cdb0', hair: '#3a2340', style: 'bun', streak: '#b98bff' },
  soeren: { body: '#4f8fb3', trim: '#c9e8f7', skin: '#e9bd98', hair: '#5b4636', style: 'short', glasses: true },
  janni: { body: '#d9a73a', trim: '#fff0c2', skin: '#f0c6a4', hair: '#2d1f1a', style: 'long' },
  guard: { body: '#2c4a7a', trim: '#9fc0f0', skin: '#e6b995', hair: '#2a2a2a', style: 'cap', cap: '#1a2c4d', torch: true },
  nightguard: { body: '#3a3f55', trim: '#aab3d6', skin: '#d9a987', hair: '#222', style: 'cap', cap: '#23263a', torch: true },
  henchman: { body: '#1d1d24', trim: '#555566', skin: '#e0b08a', hair: '#111', style: 'beanie', cap: '#3b3b48', torch: true },
  courier: { body: '#5f5c68', trim: '#8e8a99', skin: '#e5b894', hair: '#333', style: 'hat', hat: '#8d8998', bag: '#141418' },
  hat2: { body: '#56606b', trim: '#8f99a3', skin: '#dcae8a', hair: '#333', style: 'hat', hat: '#8d8998', bag: '#7a5230' },
  holm: { body: '#c9485f', trim: '#f2a0ae', skin: '#efc6a8', hair: '#b8b8c4', style: 'bun', glasses: true },
  kasper: { body: '#3f6fc4', trim: '#a8c4f5', skin: '#e8b996', hair: '#5a3b22', style: 'cap', cap: '#27447a' },
  nora: { body: '#c9485f', trim: '#f2a0ae', skin: '#c98e68', hair: '#1c1412', style: 'long' },
  ib: { body: '#3f6fc4', trim: '#a8c4f5', skin: '#f0c8a8', hair: '#8b5a2b', style: 'cap', cap: '#c0392b' },
};

const PEDESTRIAN_COLORS = ['#c0616f', '#6a8fd0', '#d8b04a', '#6fb07a', '#9b72c9', '#d9824a', '#5aa3a8', '#cfcfd8'];
const HAIR_COLORS = ['#2a1d16', '#6b4a2b', '#c9a060', '#1b1b1b', '#9a5b2e', '#d8d0c0'];

export function pedestrianLook(seed) {
  const pick = (list, s) => list[Math.abs(Math.floor(s)) % list.length];
  return {
    body: pick(PEDESTRIAN_COLORS, seed * 7.3),
    trim: 'rgba(255,255,255,.35)',
    skin: pick(['#f1c7a5', '#e0b08a', '#c98e68', '#8d5b3e'], seed * 3.1),
    hair: pick(HAIR_COLORS, seed * 5.7),
    style: pick(['short', 'long', 'bun', 'short'], seed * 2.3),
  };
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
}

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function drawShadow(ctx, x, y, r = 0.3) {
  ellipse(ctx, x + 0.04, y + 0.1, r * 1.05, r * 0.8, 'rgba(0,0,0,.35)');
}

// A person seen from above. walk: phase in radians, moving: 0..1.
export function drawPerson(ctx, x, y, angle, look, { walk = 0, moving = 0, alpha = 1, scale = 1.12 } = {}) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  drawShadow(ctx, x, y, 0.28 * scale);
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);

  const swing = Math.sin(walk) * 0.12 * moving;

  // feet
  ellipse(ctx, 0.05 + swing, -0.1, 0.09, 0.06, '#15121f');
  ellipse(ctx, 0.05 - swing, 0.1, 0.09, 0.06, '#15121f');

  // arms
  circle(ctx, -swing * 0.8, -0.24, 0.075, look.skin);
  circle(ctx, swing * 0.8, 0.24, 0.075, look.skin);

  // body / shoulders
  ellipse(ctx, 0, 0, 0.17, 0.26, look.body);
  ctx.beginPath();
  ctx.ellipse(0, 0, 0.17, 0.26, 0, -0.9, 0.9);
  ctx.strokeStyle = look.trim;
  ctx.lineWidth = 0.035;
  ctx.stroke();

  if (look.carry === 'chips') {
    ctx.fillStyle = '#f2c14e';
    ctx.fillRect(0.14 - swing * 0.5, 0.2, 0.14, 0.16);
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(0.14 - swing * 0.5, 0.25, 0.14, 0.05);
  }
  if (look.bag) {
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.fillRect(-0.08 + swing * 0.6, 0.23, 0.34, 0.22);
    ctx.fillStyle = look.bag;
    ctx.fillRect(-0.06 + swing * 0.6, 0.25, 0.3, 0.18);
    ctx.fillStyle = 'rgba(255,255,255,.25)';
    ctx.fillRect(-0.06 + swing * 0.6, 0.25, 0.3, 0.035);
  }
  if (look.torch) {
    ctx.fillStyle = '#2b2b33';
    ctx.fillRect(0.12 + swing * 0.8, -0.3, 0.2, 0.07);
    circle(ctx, 0.33 + swing * 0.8, -0.265, 0.045, '#fff3b0');
  }

  // head
  circle(ctx, 0.02, 0, 0.135, look.skin);
  switch (look.style) {
    case 'ponytail':
      ctx.beginPath();
      ctx.arc(-0.01, 0, 0.14, Math.PI * 0.35, Math.PI * 1.65);
      ctx.fillStyle = look.hair;
      ctx.fill();
      ellipse(ctx, -0.2 - Math.abs(swing) * 0.3, Math.sin(walk * 0.5) * 0.03 * moving, 0.1, 0.055, look.hair);
      circle(ctx, -0.13, 0, 0.035, look.trim);
      break;
    case 'bun':
      ctx.beginPath();
      ctx.arc(-0.01, 0, 0.14, Math.PI * 0.4, Math.PI * 1.6);
      ctx.fillStyle = look.hair;
      ctx.fill();
      circle(ctx, -0.14, 0, 0.07, look.hair);
      if (look.streak) {
        ctx.fillStyle = look.streak;
        ctx.fillRect(-0.06, -0.12, 0.05, 0.1);
      }
      break;
    case 'long':
      ctx.beginPath();
      ctx.arc(-0.02, 0, 0.15, Math.PI * 0.35, Math.PI * 1.65);
      ctx.fillStyle = look.hair;
      ctx.fill();
      ellipse(ctx, -0.12, 0, 0.1, 0.16, look.hair);
      break;
    case 'cap':
      circle(ctx, -0.005, 0, 0.14, look.cap);
      ctx.beginPath();
      ctx.ellipse(0.1, 0, 0.08, 0.12, 0, -Math.PI / 2, Math.PI / 2);
      ctx.fillStyle = look.cap;
      ctx.fill();
      break;
    case 'beanie':
      circle(ctx, -0.005, 0, 0.145, look.cap);
      circle(ctx, -0.02, 0, 0.04, 'rgba(255,255,255,.25)');
      break;
    case 'hat':
      circle(ctx, 0.01, 0, 0.22, look.hat);
      circle(ctx, 0.01, 0, 0.13, shade(look.hat, -18));
      ctx.beginPath();
      ctx.arc(0.01, 0, 0.13, 0, TAU);
      ctx.strokeStyle = '#2a2830';
      ctx.lineWidth = 0.03;
      ctx.stroke();
      break;
    default:
      ctx.beginPath();
      ctx.arc(-0.01, 0, 0.14, Math.PI * 0.45, Math.PI * 1.55);
      ctx.fillStyle = look.hair;
      ctx.fill();
  }
  if (look.glasses) {
    ctx.fillStyle = 'rgba(200,230,255,.8)';
    ctx.fillRect(0.1, -0.08, 0.035, 0.06);
    ctx.fillRect(0.1, 0.02, 0.035, 0.06);
  }
  ctx.restore();
}

export function drawRobot(ctx, x, y, angle, t) {
  drawShadow(ctx, x, y, 0.3);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  circle(ctx, 0, 0, 0.3, '#cfd3dc');
  circle(ctx, 0, 0, 0.24, '#e8ebf2');
  ctx.beginPath();
  ctx.arc(0, 0, 0.3, -0.7, 0.7);
  ctx.strokeStyle = '#4b5060';
  ctx.lineWidth = 0.06;
  ctx.stroke();
  circle(ctx, 0.05, 0, 0.06, (t * 2) % 1 < 0.5 ? '#59c3ff' : '#2a7fb0');
  ctx.restore();
}

export function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, v + amount));
  const r = c(n >> 16);
  const g = c((n >> 8) & 255);
  const b = c(n & 255);
  return `rgb(${r},${g},${b})`;
}

// ---------- Props (objects you can use) ----------
// Drawn with their base on tile (tx, ty); `h` lifts the top face like the walls.

function box(ctx, x, y, w, d, h, top, face) {
  ctx.fillStyle = face;
  ctx.fillRect(x, y + d - h, w, h);
  ctx.fillStyle = top;
  ctx.fillRect(x, y - h, w, d);
}

export function drawProp(ctx, kind, tx, ty, t, { done = false, glow = false } = {}) {
  const x = tx;
  const y = ty;
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  switch (kind) {
    case 'radio': {
      box(ctx, x + 0.08, y + 0.2, 0.84, 0.7, 0.3, '#3a3350', '#241f36');
      ctx.fillStyle = '#12101c';
      ctx.fillRect(x + 0.16, y - 0.02, 0.44, 0.32);
      ctx.strokeStyle = done ? '#8bd17c' : '#ff3f9e';
      ctx.lineWidth = 0.03;
      ctx.beginPath();
      for (let i = 0; i <= 10; i++) {
        const px = x + 0.18 + i * 0.04;
        const py = y + 0.14 + Math.sin(t * 8 + i * (done ? 0.6 : 1.7)) * (done ? 0.06 : 0.03 + 0.05 * Math.random());
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
      circle(ctx, x + 0.76, y + 0.06, 0.09, '#6a6385');
      circle(ctx, x + 0.76, y + 0.06, 0.035, '#12101c');
      ctx.strokeStyle = '#8f88aa';
      ctx.beginPath();
      ctx.moveTo(x + 0.84, y - 0.1);
      ctx.lineTo(x + 0.95, y - 0.55);
      ctx.stroke();
      circle(ctx, x + 0.95, y - 0.55, 0.035, glow ? `rgba(255,63,158,${0.5 + pulse * 0.5})` : '#ff3f9e');
      break;
    }
    case 'terminal': {
      box(ctx, x + 0.12, y + 0.25, 0.76, 0.6, 0.35, '#2c3444', '#1b212d');
      ctx.fillStyle = done ? '#1e4a33' : '#10242e';
      ctx.fillRect(x + 0.2, y - 0.04, 0.6, 0.38);
      ctx.fillStyle = done ? '#8bd17c' : `rgba(89,195,255,${0.6 + pulse * 0.4})`;
      for (let i = 0; i < 4; i++) ctx.fillRect(x + 0.25, y + 0.02 + i * 0.075, 0.2 + ((i * 37) % 30) / 100, 0.03);
      break;
    }
    case 'keypad': {
      ctx.fillStyle = '#1a1826';
      ctx.fillRect(x + 0.28, y + 0.05, 0.44, 0.62);
      ctx.fillStyle = '#2d2a40';
      ctx.fillRect(x + 0.31, y + 0.08, 0.38, 0.56);
      ctx.fillStyle = done ? '#4cc27a' : `rgba(255,63,158,${0.55 + pulse * 0.45})`;
      ctx.fillRect(x + 0.35, y + 0.12, 0.3, 0.1);
      ctx.fillStyle = '#6d6890';
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) ctx.fillRect(x + 0.36 + c * 0.1, y + 0.3 + r * 0.1, 0.07, 0.06);
      break;
    }
    case 'safe': {
      box(ctx, x + 0.1, y + 0.2, 0.8, 0.72, 0.5, '#555b6e', '#3a3f4f');
      ctx.fillStyle = '#2b2f3b';
      ctx.fillRect(x + 0.16, y + 0.42, 0.68, 0.44);
      circle(ctx, x + 0.5, y + 0.64, 0.14, '#c9ced9');
      circle(ctx, x + 0.5, y + 0.64, 0.05, '#2b2f3b');
      ctx.strokeStyle = '#2b2f3b';
      ctx.lineWidth = 0.025;
      ctx.beginPath();
      const a = done ? 0 : t * 0.5;
      ctx.moveTo(x + 0.5, y + 0.64);
      ctx.lineTo(x + 0.5 + Math.cos(a) * 0.13, y + 0.64 + Math.sin(a) * 0.13);
      ctx.stroke();
      if (done) {
        ctx.fillStyle = '#4cc27a';
        ctx.fillRect(x + 0.7, y + 0.46, 0.08, 0.08);
      }
      break;
    }
    case 'fusebox': {
      box(ctx, x + 0.16, y + 0.1, 0.68, 0.4, 0.55, '#6b6f7e', '#4a4e5c');
      ctx.fillStyle = '#3a3d48';
      ctx.fillRect(x + 0.22, y + 0.12, 0.56, 0.36);
      ctx.fillStyle = '#f2c14e';
      ctx.beginPath();
      ctx.moveTo(x + 0.5, y + 0.15);
      ctx.lineTo(x + 0.42, y + 0.32);
      ctx.lineTo(x + 0.52, y + 0.3);
      ctx.lineTo(x + 0.46, y + 0.45);
      ctx.lineTo(x + 0.6, y + 0.26);
      ctx.lineTo(x + 0.5, y + 0.28);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'drawer': {
      box(ctx, x + 0.08, y + 0.15, 0.84, 0.78, 0.5, '#6b4a2e', '#4f3520');
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#3d2918';
        ctx.fillRect(x + 0.14, y - 0.28 + i * 0.26, 0.72, 0.2);
        ctx.fillStyle = done && i === 1 ? '#8bd17c' : '#c9a36b';
        ctx.fillRect(x + 0.44, y - 0.2 + i * 0.26, 0.12, 0.04);
      }
      break;
    }
    case 'codebook': {
      box(ctx, x + 0.05, y + 0.1, 0.9, 0.8, 0.22, '#5a3e2b', '#3f2b1e');
      ctx.save();
      ctx.translate(x + 0.5, y + 0.35);
      ctx.rotate(-0.2);
      ctx.fillStyle = '#7a1f3d';
      ctx.fillRect(-0.24, -0.18, 0.48, 0.34);
      ctx.fillStyle = '#f3e9d2';
      ctx.fillRect(-0.21, -0.16, 0.42, 0.3);
      ctx.fillStyle = '#7a1f3d';
      ctx.fillRect(-0.01, -0.16, 0.02, 0.3);
      ctx.fillStyle = '#9a93b5';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(-0.18, -0.11 + i * 0.06, 0.14, 0.015);
        ctx.fillRect(0.04, -0.11 + i * 0.06, 0.14, 0.015);
      }
      ctx.restore();
      break;
    }
    case 'phone': {
      box(ctx, x + 0.1, y + 0.2, 0.8, 0.7, 0.22, '#40384f', '#2b2538');
      ctx.fillStyle = '#12101c';
      ctx.fillRect(x + 0.3, y + 0.05, 0.4, 0.5);
      ctx.fillStyle = done ? '#8bd17c' : `rgba(139,209,124,${0.3 + pulse * 0.4})`;
      ctx.fillRect(x + 0.34, y + 0.1, 0.32, 0.12);
      ctx.strokeStyle = 'rgba(255,255,255,.4)';
      ctx.lineWidth = 0.02;
      ctx.beginPath();
      ctx.moveTo(x + 0.4, y + 0.3);
      ctx.lineTo(x + 0.55, y + 0.42);
      ctx.lineTo(x + 0.48, y + 0.5);
      ctx.stroke();
      break;
    }
    case 'monitor': {
      box(ctx, x + 0.08, y + 0.3, 0.84, 0.6, 0.25, '#2c3444', '#1b212d');
      ctx.fillStyle = '#0c0f16';
      ctx.fillRect(x + 0.12, y - 0.1, 0.76, 0.5);
      ctx.fillStyle = done ? '#2f5d3a' : '#1a2a3a';
      ctx.fillRect(x + 0.16, y - 0.06, 0.68, 0.42);
      if (done) {
        // the cat video
        circle(ctx, x + 0.5, y + 0.18, 0.12, '#f2a65a');
        ctx.fillStyle = '#f2a65a';
        ctx.beginPath();
        ctx.moveTo(x + 0.4, y + 0.1);
        ctx.lineTo(x + 0.42, y - 0.02);
        ctx.lineTo(x + 0.48, y + 0.07);
        ctx.moveTo(x + 0.6, y + 0.1);
        ctx.lineTo(x + 0.58, y - 0.02);
        ctx.lineTo(x + 0.52, y + 0.07);
        ctx.fill();
      } else {
        ctx.fillStyle = `rgba(255,255,255,${0.08 + 0.08 * Math.random()})`;
        for (let i = 0; i < 5; i++) ctx.fillRect(x + 0.16, y - 0.06 + Math.random() * 0.4, 0.68, 0.02);
        circle(ctx, x + 0.78, y - 0.02, 0.025, `rgba(255,60,60,${pulse})`);
      }
      break;
    }
    case 'board': {
      ctx.fillStyle = '#3a3350';
      ctx.fillRect(x + 0.04, y - 0.5, 0.92, 1.0);
      ctx.fillStyle = '#e8e2d0';
      ctx.fillRect(x + 0.08, y - 0.46, 0.84, 0.86);
      const pins = [
        [0.24, -0.3],
        [0.72, -0.26],
        [0.3, 0.12],
        [0.7, 0.18],
      ];
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = 0.025;
      ctx.beginPath();
      pins.forEach(([px, py], i) => (i ? ctx.lineTo(x + px, y + py) : ctx.moveTo(x + px, y + py)));
      ctx.stroke();
      for (const [px, py] of pins) {
        ctx.fillStyle = '#b8b2a0';
        ctx.fillRect(x + px - 0.09, y + py - 0.07, 0.18, 0.14);
        circle(ctx, x + px, y + py - 0.06, 0.03, '#ff3f9e');
      }
      break;
    }
    case 'print': {
      // a clue on the floor: shoe print in dust
      ctx.save();
      ctx.translate(x + 0.5, y + 0.5);
      ctx.rotate(-0.4);
      ctx.fillStyle = done ? 'rgba(242,193,78,.8)' : `rgba(220,215,235,${0.25 + pulse * 0.3})`;
      ctx.beginPath();
      ctx.ellipse(0, -0.12, 0.12, 0.2, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 0.22, 0.09, 0.11, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
      break;
    }
    case 'lever': {
      ctx.fillStyle = '#3a3f4f';
      ctx.fillRect(x + 0.3, y + 0.1, 0.4, 0.7);
      ctx.strokeStyle = '#c9ced9';
      ctx.lineWidth = 0.08;
      ctx.beginPath();
      ctx.moveTo(x + 0.5, y + 0.45);
      ctx.lineTo(x + (done ? 0.75 : 0.25), y + 0.1);
      ctx.stroke();
      circle(ctx, x + (done ? 0.75 : 0.25), y + 0.1, 0.1, done ? '#4cc27a' : '#e0566b');
      break;
    }
    case 'van': {
      ctx.fillStyle = 'rgba(0,0,0,.35)';
      ctx.fillRect(x - 0.9, y + 0.05, 2.9, 1.1);
      ctx.fillStyle = '#e9e4f5';
      roundRect(ctx, x - 1, y - 0.1, 2.9, 1.1, 0.18);
      ctx.fill();
      ctx.fillStyle = '#2e2650';
      roundRect(ctx, x + 1.3, y - 0.02, 0.45, 0.94, 0.12);
      ctx.fill();
      ctx.fillStyle = '#ff3f9e';
      ctx.fillRect(x - 0.9, y + 0.36, 2.1, 0.12);
      ctx.fillStyle = '#c9c3dc';
      ctx.fillRect(x - 0.6, y + 0.02, 1.6, 0.06);
      break;
    }
    case 'boat': {
      ctx.fillStyle = '#e9e4f5';
      ctx.beginPath();
      ctx.moveTo(x - 1.4, y - 0.4);
      ctx.lineTo(x + 1.0, y - 0.4);
      ctx.quadraticCurveTo(x + 1.9, y + 0.1, x + 1.0, y + 0.6);
      ctx.lineTo(x - 1.4, y + 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#3d4a66';
      ctx.fillRect(x - 0.8, y - 0.22, 1.2, 0.64);
      ctx.fillStyle = '#9fd3ff';
      ctx.fillRect(x + 0.2, y - 0.16, 0.16, 0.52);
      break;
    }
    case 'suitcase': {
      ctx.fillStyle = 'rgba(0,0,0,.35)';
      ctx.fillRect(x + 0.12, y + 0.35, 0.8, 0.5);
      ctx.fillStyle = '#b8b2c8';
      roundRect(ctx, x + 0.08, y + 0.1, 0.8, 0.55, 0.08);
      ctx.fill();
      ctx.fillStyle = '#6d6880';
      ctx.fillRect(x + 0.08, y + 0.33, 0.8, 0.06);
      ctx.fillRect(x + 0.4, y + 0.02, 0.16, 0.1);
      ctx.fillStyle = `rgba(255,63,158,${0.4 + pulse * 0.5})`;
      ctx.fillRect(x + 0.7, y + 0.18, 0.08, 0.06);
      break;
    }
    case 'bench-hq': {
      box(ctx, x + 0.02, y + 0.1, 0.96, 0.8, 0.22, '#5d4a7a', '#3f3257');
      break;
    }
    default:
      break;
  }
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Collectibles: a glowing gadget part (gear) and simple items.
export function drawGear(ctx, x, y, t, { ghost = false } = {}) {
  const bob = Math.sin(t * 3) * 0.05;
  ctx.save();
  ctx.translate(x, y - 0.1 + bob);
  if (!ghost) {
    const g = ctx.createRadialGradient(0, 0, 0.05, 0, 0, 0.5);
    g.addColorStop(0, 'rgba(255,63,158,.55)');
    g.addColorStop(1, 'rgba(255,63,158,0)');
    ctx.fillStyle = g;
    ctx.fillRect(-0.5, -0.5, 1, 1);
  }
  ctx.rotate(t * 1.2);
  ctx.beginPath();
  const teeth = 8;
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * TAU;
    const r = i % 2 ? 0.14 : 0.2;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fillStyle = ghost ? 'rgba(255,255,255,.12)' : '#ffb3d6';
  ctx.fill();
  circle(ctx, 0, 0, 0.06, ghost ? 'rgba(0,0,0,.3)' : '#8a1f55');
  ctx.restore();
}

export function drawCard(ctx, x, y, t, color) {
  const bob = Math.sin(t * 3) * 0.05;
  ctx.save();
  ctx.translate(x, y - 0.08 + bob);
  ctx.rotate(-0.25);
  const g = ctx.createRadialGradient(0, 0, 0.05, 0, 0, 0.5);
  g.addColorStop(0, hexA(color, 0.5));
  g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(-0.5, -0.5, 1, 1);
  roundRect(ctx, -0.2, -0.13, 0.4, 0.26, 0.04);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.8)';
  ctx.fillRect(-0.15, -0.06, 0.12, 0.09);
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ctx.fillRect(-0.2, 0.05, 0.4, 0.04);
  ctx.restore();
}

export function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}
