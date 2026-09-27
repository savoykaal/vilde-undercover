// Level maps are drawn as rows of characters. Each character is a tile, or a
// marker that entities refer to by name: lowercase letters, digits, @ (start),
// * (hidden gadget part) and & (hiding spot). Markers stand on `markerFloor`.

export const TILES = {
  '#': { kind: 'wall', solid: true, opaque: true },
  ' ': { kind: 'void', solid: true, opaque: true },
  '.': { kind: 'floor' },
  ',': { kind: 'floor2' },
  ':': { kind: 'floor3' },
  _: { kind: 'road' },
  '-': { kind: 'stripe' },
  '~': { kind: 'water', solid: true },
  T: { kind: 'table', solid: true },
  S: { kind: 'shelf', solid: true, opaque: true },
  C: { kind: 'crate', solid: true, opaque: true },
  P: { kind: 'plant', solid: true, opaque: true },
  B: { kind: 'bench', solid: true },
  W: { kind: 'glass', solid: true },
  '=': { kind: 'rail', solid: true },
  K: { kind: 'car', solid: true, opaque: true },
  R: { kind: 'rug' },
  Z: { kind: 'zebra' },
};

export const isMarker = (ch) => /^[a-z0-9@*&]$/.test(ch);

export function parseMap(rows, { markerFloor = '.' } = {}) {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const kinds = new Array(w * h);
  const solid = new Uint8Array(w * h);
  const opaque = new Uint8Array(w * h);
  const markers = {};

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let ch = rows[y][x] ?? ' ';
      if (isMarker(ch)) {
        (markers[ch] ??= []).push([x, y]);
        ch = markerFloor;
      }
      const def = TILES[ch];
      if (!def) throw new Error(`Unknown map character "${ch}" at ${x},${y}`);
      const i = y * w + x;
      kinds[i] = def.kind;
      solid[i] = def.solid ? 1 : 0;
      opaque[i] = def.opaque ? 1 : 0;
    }
  }

  // Connected groups of the same prop kind (crates, tables …) get one shared id,
  // so the renderer can draw a 3×1 container as one container.
  const group = new Int32Array(w * h).fill(-1);
  let groups = 0;
  for (let i = 0; i < w * h; i++) {
    if (group[i] >= 0 || !solid[i]) continue;
    const kind = kinds[i];
    const stack = [i];
    group[i] = groups;
    while (stack.length) {
      const j = stack.pop();
      const x = j % w;
      const y = (j / w) | 0;
      for (const [nx, ny] of [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ]) {
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const k = ny * w + nx;
        if (group[k] < 0 && kinds[k] === kind) {
          group[k] = groups;
          stack.push(k);
        }
      }
    }
    groups++;
  }

  return { w, h, kinds, solid, opaque, group, markers };
}

export function markerPos(map, name, index = 0) {
  const list = map.markers[name];
  if (!list || !list[index]) throw new Error(`Missing marker "${name}"`);
  const [x, y] = list[index];
  return { x: x + 0.5, y: y + 0.5 };
}

export const kindAt = (map, x, y) => (x < 0 || y < 0 || x >= map.w || y >= map.h ? 'void' : map.kinds[y * map.w + x]);
