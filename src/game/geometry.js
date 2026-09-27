// Grid geometry, free of DOM so it can be tested: rays, line of sight,
// sliding circle collision and grid path finding.
// `blocked(tx, ty)` answers for whole tiles.

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);

export function wrapAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

export const angleDiff = (a, b) => wrapAngle(b - a);

// Turn `from` towards `to` by at most `step` radians.
export function turnTowards(from, to, step) {
  const d = angleDiff(from, to);
  if (Math.abs(d) <= step) return to;
  return wrapAngle(from + Math.sign(d) * step);
}

// Distance along the ray (dx, dy normalised) to the first blocked tile, capped at maxDist.
// `circles` ({ x, y, r }) also stop the ray, e.g. a smoke cloud.
export function castRay(blocked, x0, y0, dx, dy, maxDist, circles = null) {
  let limit = maxDist;
  if (circles) {
    for (const c of circles) {
      const t = rayCircle(x0, y0, dx, dy, c);
      if (t != null && t < limit) limit = t;
    }
  }
  let mapX = Math.floor(x0);
  let mapY = Math.floor(y0);
  const deltaX = dx === 0 ? Infinity : Math.abs(1 / dx);
  const deltaY = dy === 0 ? Infinity : Math.abs(1 / dy);
  const stepX = dx < 0 ? -1 : 1;
  const stepY = dy < 0 ? -1 : 1;
  let sideX = dx < 0 ? (x0 - mapX) * deltaX : (mapX + 1 - x0) * deltaX;
  let sideY = dy < 0 ? (y0 - mapY) * deltaY : (mapY + 1 - y0) * deltaY;
  for (let guard = 0; guard < 512; guard++) {
    let d;
    if (sideX < sideY) {
      d = sideX;
      sideX += deltaX;
      mapX += stepX;
    } else {
      d = sideY;
      sideY += deltaY;
      mapY += stepY;
    }
    if (d >= limit) return limit;
    if (blocked(mapX, mapY)) return d;
  }
  return limit;
}

function rayCircle(x0, y0, dx, dy, c) {
  const ox = x0 - c.x;
  const oy = y0 - c.y;
  const b = ox * dx + oy * dy;
  const cc = ox * ox + oy * oy - c.r * c.r;
  if (cc <= 0) return 0; // starts inside
  const disc = b * b - cc;
  if (disc < 0) return null;
  const t = -b - Math.sqrt(disc);
  return t >= 0 ? t : null;
}

export function lineOfSight(blocked, ax, ay, bx, by, circles = null) {
  const d = dist(ax, ay, bx, by);
  if (d < 1e-6) return true;
  return castRay(blocked, ax, ay, (bx - ax) / d, (by - ay) / d, d, circles) >= d - 1e-6;
}

// Pushes a circle out of solid tiles. Handles corners, so movement slides along walls.
function pushOut(solidAt, x, y, r) {
  for (let iter = 0; iter < 4; iter++) {
    let moved = false;
    const x0 = Math.floor(x - r);
    const x1 = Math.floor(x + r);
    const y0 = Math.floor(y - r);
    const y1 = Math.floor(y + r);
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (!solidAt(tx, ty)) continue;
        const cx = clamp(x, tx, tx + 1);
        const cy = clamp(y, ty, ty + 1);
        const ddx = x - cx;
        const ddy = y - cy;
        const d2 = ddx * ddx + ddy * ddy;
        if (d2 >= r * r) continue;
        if (d2 > 1e-10) {
          const d = Math.sqrt(d2);
          x += (ddx / d) * (r - d);
          y += (ddy / d) * (r - d);
        } else {
          // Centre is inside the tile: leave by the nearest free side.
          const options = [
            [x - tx, tx - r - 1e-4, null, !solidAt(tx - 1, ty)],
            [tx + 1 - x, tx + 1 + r + 1e-4, null, !solidAt(tx + 1, ty)],
            [y - ty, null, ty - r - 1e-4, !solidAt(tx, ty - 1)],
            [ty + 1 - y, null, ty + 1 + r + 1e-4, !solidAt(tx, ty + 1)],
          ].sort((p, q) => (q[3] - p[3]) || p[0] - q[0]);
          const [, nx, ny] = options[0];
          if (nx != null) x = nx;
          if (ny != null) y = ny;
        }
        moved = true;
      }
    }
    if (!moved) break;
  }
  return { x, y };
}

export function moveCircle(solidAt, x, y, r, dx, dy) {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / (r * 0.5)));
  let p = { x, y };
  for (let s = 0; s < steps; s++) p = pushOut(solidAt, p.x + dx / steps, p.y + dy / steps, r);
  return p;
}

// Breadth-first path between tile centres. Diagonal steps only when both
// side tiles are free, so paths never clip a corner. Returns [[x, y], …] or null.
export function findPath(solidAt, w, h, from, to) {
  const sx = Math.floor(from[0]);
  const sy = Math.floor(from[1]);
  const tx = Math.floor(to[0]);
  const ty = Math.floor(to[1]);
  if (solidAt(tx, ty)) return null;
  const prev = new Int32Array(w * h).fill(-1);
  const start = sy * w + sx;
  const goal = ty * w + tx;
  prev[start] = start;
  const queue = [start];
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  for (let qi = 0; qi < queue.length; qi++) {
    const cur = queue[qi];
    if (cur === goal) break;
    const cx = cur % w;
    const cy = (cur / w) | 0;
    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const n = ny * w + nx;
      if (prev[n] >= 0 || solidAt(nx, ny)) continue;
      if (dx && dy && (solidAt(cx + dx, cy) || solidAt(cx, cy + dy))) continue;
      prev[n] = cur;
      queue.push(n);
    }
  }
  if (prev[goal] < 0) return null;
  const path = [];
  for (let c = goal; c !== start; c = prev[c]) path.push([(c % w) + 0.5, ((c / w) | 0) + 0.5]);
  path.push([sx + 0.5, sy + 0.5]);
  return path.reverse();
}

// Can a straight walk from a to b stay clear of solid tiles (with a body radius)?
export function clearWalk(solidAt, ax, ay, bx, by, r = 0.3) {
  const d = dist(ax, ay, bx, by);
  const steps = Math.max(1, Math.ceil(d / 0.1));
  for (let i = 0; i <= steps; i++) {
    const x = lerp(ax, bx, i / steps);
    const y = lerp(ay, by, i / steps);
    for (const [ox, oy] of [
      [-r, -r],
      [r, -r],
      [-r, r],
      [r, r],
    ]) {
      if (solidAt(Math.floor(x + ox), Math.floor(y + oy))) return false;
    }
  }
  return true;
}
