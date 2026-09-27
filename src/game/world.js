// The game world: map, player, guards, cameras, lasers, doors, things to use
// and the level script. No DOM here — the level screen feeds input in and reads
// events (sounds, radio lines, "caught") out of `world.out`.

import { markerPos, parseMap } from './map.js';
import { castRay, clamp, dist, lineOfSight, moveCircle, turnTowards, wrapAngle } from './geometry.js';

export const PLAYER_R = 0.28;
export const PLAYER_SPEED = 3.4;
const DEG = Math.PI / 180;

// How forgiving guards are, per clearance level.
export const STEALTH = {
  let: { detect: 0.5, speed: 0.85, range: 0.9 },
  mellem: { detect: 0.7, speed: 1, range: 1 },
  svaer: { detect: 0.9, speed: 1.1, range: 1.05 },
};

const DEFAULT_VISION = { fov: 70, range: 5.5, when: 'always' };

function resolvePoint(map, p) {
  if (Array.isArray(p)) return { x: p[0] + 0.5, y: p[1] + 0.5 };
  if (typeof p === 'object') return { x: p.x, y: p.y };
  const [name, idx] = String(p).split('.');
  return markerPos(map, name, idx ? Number(idx) : 0);
}

export class World {
  constructor(level, { difficulty = 'let', agentName = 'Vilde', foundParts = new Set(), rng = Math.random, extra = {} } = {}) {
    this.level = level;
    this.map = parseMap(level.map, { markerFloor: level.markerFloor ?? '.' });
    const { w, h } = this.map;
    this.dynSolid = new Uint8Array(w * h);
    this.dynOpaque = new Uint8Array(w * h);
    this.agentName = agentName;
    this.difficulty = difficulty;
    this.stealth = STEALTH[difficulty] ?? STEALTH.let;
    this.rng = rng;
    this.extra = { ...extra };
    this.t = 0;
    this.entities = [];
    this.byId = new Map();
    this.flags = {};
    this.items = new Set();
    this.fired = new Set();
    this.timers = [];
    this.out = [];
    this.data = {};
    this.hud = {};
    this.goalText = '';
    this.goalTarget = null;
    this.stepIndex = -1;
    this.steps = level.steps ?? [];
    this.replaying = false;
    this.freeze = 0; // seconds of frozen world (caught, cutscene)
    this.pan = null;
    this.caughtCount = 0;
    this.completed = false;
    this.foundParts = foundParts;
    this.partsHere = [];

    const start = resolvePoint(this.map, level.start ?? '@');
    this.player = { x: start.x, y: start.y, angle: level.startAngle ?? -Math.PI / 2, vx: 0, vy: 0, walk: 0, moving: 0, hidden: null };
    this.spawn = { x: start.x, y: start.y, angle: this.player.angle };

    this.solidAt = (tx, ty) =>
      tx < 0 || ty < 0 || tx >= w || ty >= h || this.map.solid[ty * w + tx] === 1 || this.dynSolid[ty * w + tx] > 0;
    this.opaqueAt = (tx, ty) =>
      tx < 0 || ty < 0 || tx >= w || ty >= h || this.map.opaque[ty * w + tx] === 1 || this.dynOpaque[ty * w + tx] > 0;

    for (const def of level.entities ?? []) this.add(def);
    (this.map.markers['*'] ?? []).forEach(([x, y], i) => this.add({ type: 'part', id: `${level.id}-${i + 1}`, at: [x, y] }));
    (this.map.markers['&'] ?? []).forEach(([x, y]) => this.add({ type: 'hide', at: [x, y], prop: level.hideProp ?? 'box' }));
  }

  // ---------- Entities ----------

  add(def) {
    const e = { active: true, ...def };
    if (e.at != null) {
      const p = resolvePoint(this.map, e.at);
      e.x = p.x;
      e.y = p.y;
      e.tx = Math.floor(p.x);
      e.ty = Math.floor(p.y);
    }
    switch (e.type) {
      case 'person':
        initPerson(this, e);
        break;
      case 'door':
        e.open = e.startOpen ? 1 : 0;
        e.horizontal = this.map.solid[e.ty * this.map.w + e.tx - 1] === 1 || this.map.solid[e.ty * this.map.w + e.tx + 1] === 1;
        e.bumpT = -9;
        break;
      case 'task':
        e.done = false;
        if (e.solid !== false) this.dynSolid[e.ty * this.map.w + e.tx]++;
        break;
      case 'deco':
        if (e.solid) for (const [dx, dy] of e.cells ?? [[0, 0]]) this.dynSolid[(e.ty + dy) * this.map.w + e.tx + dx]++;
        break;
      case 'camera':
        e.angle = (e.sweep?.[0] ?? e.facing ?? 90) * DEG;
        e.meter = 0;
        e.vision = { fov: 50, range: 6, ...e.vision };
        break;
      case 'laser': {
        const a = resolvePoint(this.map, e.from);
        const b = resolvePoint(this.map, e.to);
        Object.assign(e, { ax: a.x, ay: a.y, bx: b.x, by: b.y, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
        break;
      }
      case 'zone':
        e.cells = new Set((this.map.markers[e.marker ?? e.id] ?? []).map(([x, y]) => y * this.map.w + x));
        break;
      case 'part':
        e.ghost = this.foundParts.has(e.id);
        this.partsHere.push(e.id);
        break;
      default:
        break;
    }
    this.entities.push(e);
    if (e.id) this.byId.set(e.id, e);
    return e;
  }

  entity(id) {
    const e = this.byId.get(id);
    if (!e) throw new Error(`No entity "${id}"`);
    return e;
  }

  point(p) {
    return resolvePoint(this.map, p);
  }

  // ---------- Script API ----------

  emit(type, data = {}) {
    if (this.replaying && type !== 'goal') return;
    this.out.push({ type, ...data });
  }

  text(value) {
    return typeof value === 'function' ? value(this.agentName) : value;
  }

  say(speaker, text, opts = {}) {
    this.emit('say', { speaker, text: this.text(text), ...opts });
  }

  sayAll(lines) {
    for (const [speaker, text] of lines ?? []) this.say(speaker, text);
  }

  goal(text, target = null) {
    this.goalText = this.text(text ?? '');
    this.goalTarget = target;
    this.emit('goal', { text: this.goalText });
  }

  sfx(name) {
    this.emit('sfx', { name });
  }

  music(name) {
    this.emit('music', { name });
  }

  banner(text, tone = '') {
    this.emit('banner', { text: this.text(text), tone });
  }

  shake(amount = 0.3) {
    this.emit('shake', { amount });
  }

  floater(x, y, text, color) {
    this.emit('floater', { x, y, text, color });
  }

  confetti(x, y, n = 80) {
    this.emit('confetti', { x, y, n });
  }

  flag(name, value = true) {
    this.flags[name] = value;
    if (value) this.fired.add(`flag:${name}`);
  }

  give(item) {
    this.items.add(item);
    this.fired.add(`item:${item}`);
  }

  has(item) {
    return this.items.has(item);
  }

  fire(event) {
    this.fired.add(event);
  }

  open(id, { pan = false } = {}) {
    const door = this.entity(id);
    door.locked = false;
    door.forced = true;
    if (pan) this.panTo(door, 1.3);
  }

  unlock(id, { pan = false } = {}) {
    const door = this.entity(id);
    door.locked = false;
    if (pan) this.panTo(door, 1.3);
  }

  close(id) {
    const door = this.entity(id);
    door.forced = false;
    door.locked = true;
  }

  enable(id, on = true) {
    this.entity(id).active = on;
  }

  disable(id) {
    this.enable(id, false);
  }

  place(id, at, { wp = null, angle = null } = {}) {
    const e = this.entity(id);
    const p = resolvePoint(this.map, at);
    e.x = p.x;
    e.y = p.y;
    if (e.type === 'person') {
      if (wp != null) e.wp = wp;
      e.state = 'move';
      e.meter = 0;
      e.waitT = 0;
      if (angle != null) e.angle = angle * DEG;
    }
  }

  panTo(target, seconds = 1.2) {
    if (this.replaying) return;
    const p = target.x != null ? target : this.entity(target);
    this.pan = { x: p.x, y: p.y, t: seconds };
    this.freeze = Math.max(this.freeze, seconds);
  }

  after(seconds, fn) {
    this.timers.push({ t: this.t + seconds, fn });
  }

  checkpoint(at, angle = null) {
    const p = resolvePoint(this.map, at);
    this.spawn = { x: p.x, y: p.y, angle: angle != null ? angle * DEG : this.player.angle };
  }

  complete() {
    if (this.completed) return;
    this.completed = true;
    this.goalTarget = null;
    this.emit('complete');
  }

  // A soft setback: back to the checkpoint with a friendly line.
  fail(speaker, text) {
    if (this.freeze > 0 || this.completed) return;
    this.caughtCount++;
    this.freeze = 1.1;
    this.emit('caught', { speaker, text: this.text(text) });
    this.after(0.9, () => this.respawn());
  }

  caught(by) {
    if (this.freeze > 0 || this.completed) return;
    if (this.extra.smoke > 0) {
      // The smoke pen: one puff per level, and the watcher loses track of her.
      this.extra.smoke--;
      by.meter = 0;
      if (by.type === 'person') by.lastSeen = null;
      this.freeze = 0.6;
      this.emit('smoke', { x: this.player.x, y: this.player.y });
      return;
    }
    this.caughtCount++;
    by.alert = true;
    this.freeze = 1.1;
    this.emit('caught', { by: by.id, x: by.x, y: by.y, speaker: by.caughtSpeaker, text: by.caughtLine ? this.text(by.caughtLine) : null });
    this.after(0.9, () => this.respawn());
  }

  respawn() {
    const p = this.player;
    p.x = this.spawn.x;
    p.y = this.spawn.y;
    p.angle = this.spawn.angle;
    p.vx = p.vy = 0;
    p.hidden = null;
    for (const e of this.entities) {
      if (e.type === 'person') resetPerson(e);
      if (e.type === 'camera') e.meter = 0;
    }
    this.steps[this.stepIndex]?.enter?.(this, { respawn: true });
    this.emit('respawn');
  }

  // ---------- Steps ----------

  start(resumeAt = 0) {
    const k = clamp(resumeAt, 0, this.steps.length - 1);
    this.replaying = true;
    for (let i = 0; i < k; i++) {
      const step = this.steps[i];
      if (step.checkpoint) this.checkpoint(step.checkpoint, step.checkpointAngle);
      step.enter?.(this, { replay: true });
      this.markDone(step.until);
      step.done?.(this, { replay: true });
    }
    if (k > 0) {
      const step = this.steps[k];
      if (step.checkpoint) this.checkpoint(step.checkpoint, step.checkpointAngle);
      for (const d of this.entities) if (d.type === 'door' && d.forced) d.open = 1;
      this.respawnQuiet();
    }
    this.replaying = false;
    this.enterStep(k);
  }

  respawnQuiet() {
    this.player.x = this.spawn.x;
    this.player.y = this.spawn.y;
    this.player.angle = this.spawn.angle;
  }

  markDone(until) {
    if (typeof until !== 'string') return;
    this.fired.add(until);
    const [kind, id] = until.split(':');
    if (kind === 'task') this.entity(id).done = true;
    if (kind === 'item') this.items.add(id);
    if (kind === 'pickup') {
      const e = this.entity(id);
      e.active = false;
      if (e.item) this.items.add(e.item);
    }
  }

  enterStep(i) {
    this.stepIndex = i;
    const step = this.steps[i];
    if (!step) return this.complete();
    if (step.checkpoint) this.checkpoint(step.checkpoint, step.checkpointAngle);
    step.enter?.(this, {});
    if (step.goal !== undefined) this.goal(step.goal, step.target ?? null);
    this.sayAll(step.say);
    this.emit('step', { index: i });
  }

  stepSatisfied(step) {
    const u = step.until;
    if (!u) return false;
    if (typeof u === 'function') return u(this);
    const [kind, id] = u.split(':');
    if (kind === 'near') {
      const e = this.entity(id);
      return dist(this.player.x, this.player.y, e.x, e.y) < (step.nearRange ?? 1.6);
    }
    if (kind === 'zone') return this.inZone(id);
    return this.fired.has(u);
  }

  inZone(id) {
    const z = this.entity(id);
    return z.cells.has(Math.floor(this.player.y) * this.map.w + Math.floor(this.player.x));
  }

  // ---------- Interaction ----------

  // The nearest thing she can use right now, for the action button.
  action() {
    const p = this.player;
    if (this.freeze > 0 || this.completed) return null;
    if (p.hidden) return { kind: 'unhide', entity: p.hidden };
    let best = null;
    let bestD = Infinity;
    for (const e of this.entities) {
      if (!e.active) continue;
      let range = 0;
      if (e.type === 'task' && !e.done) range = e.range ?? 1.3;
      else if (e.type === 'hide') range = 0.75;
      else continue;
      const d = dist(p.x, p.y, e.x, e.y);
      if (d < range && d < bestD) {
        best = e;
        bestD = d;
      }
    }
    if (!best) return null;
    return { kind: best.type === 'hide' ? 'hide' : 'task', entity: best };
  }

  act() {
    const a = this.action();
    if (!a) return null;
    if (a.kind === 'hide') {
      this.player.hidden = a.entity;
      this.player.x = a.entity.x;
      this.player.y = a.entity.y;
      this.player.vx = this.player.vy = 0;
      this.sfx('hide');
      return a;
    }
    if (a.kind === 'unhide') {
      this.player.hidden = null;
      return a;
    }
    return a; // tasks: the screen opens the minigame and calls completeTask
  }

  completeTask(id) {
    const e = this.entity(id);
    if (e.done) return;
    e.done = true;
    this.fired.add(`task:${id}`);
    this.sfx('task');
    e.onDone?.(this);
  }

  // ---------- Update ----------

  update(dt, input) {
    this.t += dt;
    const due = this.timers.filter((tm) => tm.t <= this.t);
    if (due.length) {
      this.timers = this.timers.filter((tm) => tm.t > this.t);
      for (const tm of due) tm.fn(this);
    }

    if (this.pan) {
      this.pan.t -= dt;
      if (this.pan.t <= 0) this.pan = null;
    }

    // Doors animate even while the world is frozen, so a pan shows them opening.
    for (const e of this.entities) if (e.type === 'door') updateDoor(this, e, dt);

    if (this.freeze > 0) {
      this.freeze = Math.max(0, this.freeze - dt);
      this.player.moving = Math.max(0, this.player.moving - dt * 4);
      return;
    }
    if (this.completed) return;

    this.updatePlayer(dt, input);

    for (const e of this.entities) {
      if (!e.active) continue;
      switch (e.type) {
        case 'person':
          updatePerson(this, e, dt);
          break;
        case 'camera':
          updateCamera(this, e, dt);
          break;
        case 'laser':
          updateLaser(this, e);
          break;
        case 'item':
          if (dist(this.player.x, this.player.y, e.x, e.y) < (this.extra.magnet ?? 0.65)) {
            e.active = false;
            if (e.item) this.give(e.item);
            this.fired.add(`pickup:${e.id}`);
            this.sfx('pickup');
            this.floater(e.x, e.y - 0.4, e.label ?? '', e.color);
          }
          break;
        case 'part':
          if (dist(this.player.x, this.player.y, e.x, e.y) < (this.extra.magnet ?? 0.65)) {
            e.active = false;
            this.emit('part', { id: e.id, x: e.x, y: e.y, ghost: e.ghost });
            this.sfx(e.ghost ? 'pickup' : 'part');
          }
          break;
        case 'exit':
          if (dist(this.player.x, this.player.y, e.x, e.y) < 0.7) this.fired.add(`exit:${e.id}`);
          break;
        case 'zone':
          if (this.inZone(e.id)) this.fired.add(`zone:${e.id}`);
          break;
        default:
          break;
      }
      if (this.freeze > 0) break;
    }

    const step = this.steps[this.stepIndex];
    if (step && this.freeze === 0) {
      step.tick?.(this, dt);
      if (this.freeze === 0 && !this.completed && this.stepSatisfied(step)) {
        step.done?.(this, {});
        this.sayAll(step.sayDone);
        this.enterStep(this.stepIndex + 1);
      }
    }
  }

  updatePlayer(dt, input) {
    const p = this.player;
    const ix = input?.x ?? 0;
    const iy = input?.y ?? 0;
    const mag = Math.hypot(ix, iy);
    if (p.hidden) {
      if (mag > 0.35) p.hidden = null;
      else {
        p.moving = Math.max(0, p.moving - dt * 6);
        return;
      }
    }
    const speed = PLAYER_SPEED * (this.extra.speedBoost ?? 1);
    const tx = ix * speed;
    const ty = iy * speed;
    const k = Math.min(1, dt * 14);
    p.vx += (tx - p.vx) * k;
    p.vy += (ty - p.vy) * k;
    const moved = moveCircle(this.solidAt, p.x, p.y, PLAYER_R, p.vx * dt, p.vy * dt);
    const realSpeed = Math.hypot(moved.x - p.x, moved.y - p.y) / Math.max(dt, 1e-6);
    p.x = moved.x;
    p.y = moved.y;
    if (mag > 0.1) p.angle = turnTowards(p.angle, Math.atan2(iy, ix), dt * 14);
    p.moving += (clamp(realSpeed / speed, 0, 1) - p.moving) * Math.min(1, dt * 10);
    p.walk += dt * realSpeed * 4.2;
  }

  // Can this watcher see her right now?
  sees(e, vision, angle) {
    const p = this.player;
    if (p.hidden) return null;
    const range = vision.range * this.stealth.range;
    const d = dist(e.x, e.y, p.x, p.y);
    if (d > range) return null;
    const toP = Math.atan2(p.y - e.y, p.x - e.x);
    const close = d < 0.95;
    if (!close && Math.abs(wrapAngle(toP - angle)) > (vision.fov * DEG) / 2) return null;
    if (!lineOfSight(this.opaqueAt, e.x, e.y, p.x, p.y)) return null;
    return { d, range, close };
  }

  // Detection meter shared by guards and cameras. Returns true when full.
  watch(e, vision, angle, dt) {
    const seen = this.sees(e, vision, angle);
    if (seen) {
      const nearness = 1 - seen.d / seen.range;
      const rate = (seen.close ? 3 : this.stealth.detect * (0.55 + 1.7 * nearness) * (vision.sharp ?? 1)) * (this.extra.detectMul ?? 1);
      e.meter = Math.min(1, e.meter + dt * rate);
      e.lastSeen = { x: this.player.x, y: this.player.y };
    } else {
      e.meter = Math.max(0, e.meter - dt * 0.35);
    }
    e.seeing = Boolean(seen);
    return e.meter >= 1;
  }

  // Visibility polygon of a cone, for drawing.
  cone(x, y, angle, fov, range, rays = 28) {
    const pts = [];
    const half = (fov * DEG) / 2;
    for (let i = 0; i <= rays; i++) {
      const a = angle - half + (i / rays) * half * 2;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      const d = castRay(this.opaqueAt, x, y, dx, dy, range);
      pts.push([x + dx * d, y + dy * d]);
    }
    return pts;
  }
}

// ---------- People (guards, walkers, family) ----------

function initPerson(world, e) {
  e.path = (e.path ?? []).map((p) => resolvePoint(world.map, p));
  if (e.x == null && e.path.length) {
    e.x = e.path[0].x;
    e.y = e.path[0].y;
  }
  e.mode ??= e.path.length > 1 ? 'patrol' : 'still';
  e.speed ??= 1.5;
  e.wait ??= 1.0;
  e.vision = e.vision === false ? null : { ...DEFAULT_VISION, ...e.vision };
  e.catches ??= Boolean(e.vision) && e.mode !== 'still' ? true : e.catches ?? false;
  e.angle = (e.facing ?? 90) * DEG;
  e.spawnState = { x: e.x, y: e.y, angle: e.angle, wp: e.path.length > 1 ? 1 : 0 };
  if (e.solid) world.dynSolid[Math.floor(e.y) * world.map.w + Math.floor(e.x)]++;
  resetPerson(e);
}

function resetPerson(e) {
  const s = e.spawnState;
  e.x = s.x;
  e.y = s.y;
  e.angle = s.angle;
  e.wp = s.wp;
  e.dir = 1;
  e.state = e.path.length > 1 ? 'move' : 'still';
  e.waitT = 0;
  e.meter = 0;
  e.alert = false;
  e.walk = 0;
  e.moving = 0;
  e.seeing = false;
  e.lastSeen = null;
  e.scanT = 0;
}

export function visionActive(e) {
  if (!e.vision || !e.active) return false;
  if (e.vision.when === 'never') return false;
  if (e.vision.when === 'still') return e.state === 'wait' || e.state === 'still' || e.state === 'suspect';
  return true;
}

function updatePerson(world, e, dt) {
  const speedMul = e.friendly ? 1 : world.stealth.speed;

  // Friendly people say their lines when she comes close.
  if (e.lines && !e.alert) {
    const d = dist(world.player.x, world.player.y, e.x, e.y);
    e.talkT = (e.talkT ?? 0) - dt;
    if (d < (e.talkRange ?? 1.7) && e.talkT <= 0 && !e.talked) {
      const i = e.lineIndex ?? 0;
      world.say(e.speaker ?? e.look, e.lines[i % e.lines.length]);
      e.lineIndex = i + 1;
      e.talked = true;
      e.talkT = 3;
    }
    if (d > (e.talkRange ?? 1.7) + 1) e.talked = false;
    if (e.state === 'still' && d < 3) e.angle = turnTowards(e.angle, Math.atan2(world.player.y - e.y, world.player.x - e.x), dt * 4);
  }

  let suspicious = false;
  if (visionActive(e) && (e.catches || e.spots)) {
    const full = world.watch(e, e.vision, e.angle, dt);
    if (full) {
      if (e.catches) world.caught(e);
      else world.fire(`spotted:${e.id}`);
      return;
    }
    suspicious = e.meter > 0.04 && !e.noTurn;
  }

  if (suspicious && e.lastSeen) {
    e.angle = turnTowards(e.angle, Math.atan2(e.lastSeen.y - e.y, e.lastSeen.x - e.x), dt * 3.2);
    e.moving = Math.max(0, e.moving - dt * 5);
    if (e.state !== 'still' && e.state !== 'done') e.suspended = true;
    return;
  }
  e.suspended = false;

  if (e.state === 'still' || e.state === 'done') {
    if (e.scan) {
      const [a0, a1] = e.scan;
      const period = e.scanPeriod ?? 5;
      e.scanT = (e.scanT ?? 0) + dt;
      const k = 0.5 - 0.5 * Math.cos((e.scanT / period) * Math.PI * 2);
      const target = (a0 + (a1 - a0) * k) * DEG;
      e.angle = turnTowards(e.angle, target, dt * 2.5);
    }
    e.moving = Math.max(0, e.moving - dt * 5);
    return;
  }

  if (e.state === 'wait') {
    e.waitT -= dt;
    const face = e.faces?.[e.wp];
    if (face != null) e.angle = turnTowards(e.angle, face * DEG, dt * 3.5);
    else if (e.lookAround !== false) e.angle += Math.sin(world.t * 2.2 + e.x) * dt * 0.8;
    e.moving = Math.max(0, e.moving - dt * 5);
    if (e.waitT <= 0) {
      advanceWaypoint(world, e);
    }
    return;
  }

  // move
  const target = e.path[e.wp];
  if (!target) {
    e.state = 'done';
    return;
  }
  const dx = target.x - e.x;
  const dy = target.y - e.y;
  const d = Math.hypot(dx, dy);
  const speed = e.speed * speedMul * (e.boost ?? 1);
  const step = speed * dt;
  if (d <= step) {
    e.x = target.x;
    e.y = target.y;
    world.fire(`arrive:${e.id}:${e.wp}`);
    e.onArrive?.(world, e.wp);
    const wait = e.waits?.[e.wp] ?? (e.mode === 'flee' ? 0 : e.wait);
    if (wait > 0) {
      e.state = 'wait';
      e.waitT = wait;
    } else {
      advanceWaypoint(world, e);
    }
  } else {
    e.x += (dx / d) * step;
    e.y += (dy / d) * step;
    e.angle = turnTowards(e.angle, Math.atan2(dy, dx), dt * 6);
  }
  e.moving = Math.min(1, e.moving + dt * 6);
  e.walk += dt * speed * 4.2;

  if (e.mode === 'flee') maybeTurnBack(world, e);
}

function advanceWaypoint(world, e) {
  const n = e.path.length;
  e.state = 'move';
  if (e.mode === 'patrol') {
    if (e.pingpong) {
      if (e.wp + e.dir >= n || e.wp + e.dir < 0) e.dir *= -1;
      e.wp += e.dir;
    } else e.wp = (e.wp + 1) % n;
  } else if (e.mode === 'route') {
    if (e.wp + 1 >= n) {
      e.state = 'done';
      world.fire(`done:${e.id}`);
    } else e.wp++;
  } else if (e.mode === 'flee') {
    const p = world.player;
    const next = (e.wp + 1) % n;
    const prev = (e.wp - 1 + n) % n;
    const dn = dist(p.x, p.y, e.path[next].x, e.path[next].y);
    const dp = dist(p.x, p.y, e.path[prev].x, e.path[prev].y);
    e.cameFrom = e.wp;
    e.wp = dn >= dp ? next : prev;
  }
}

// A fleeing runner doubles back when she cuts him off.
function maybeTurnBack(world, e) {
  const p = world.player;
  const target = e.path[e.wp];
  const dMe = dist(e.x, e.y, target.x, target.y);
  const dHer = dist(p.x, p.y, target.x, target.y);
  const dUs = dist(p.x, p.y, e.x, e.y);
  e.turnCooldown = (e.turnCooldown ?? 0) - 1 / 60;
  if (dHer < dMe && dUs < 3.5 && e.turnCooldown <= 0 && e.cameFrom != null) {
    const back = e.cameFrom;
    e.cameFrom = e.wp;
    e.wp = back;
    e.turnCooldown = 1.2;
  }
}

// ---------- Cameras, lasers, doors ----------

function updateCamera(world, e, dt) {
  if (e.sweep) {
    const [a0, a1] = e.sweep;
    const period = e.period ?? 6;
    const k = 0.5 - 0.5 * Math.cos((world.t / period) * Math.PI * 2);
    e.angle = (a0 + (a1 - a0) * k) * DEG;
  }
  if (world.watch(e, e.vision, e.angle, dt)) world.caught(e);
}

export function laserOn(world, e) {
  if (!e.active) return false;
  if (e.on == null) return true;
  const cycle = e.on + e.off;
  const t = (world.t + (e.phase ?? 0)) % cycle;
  return t < e.on;
}

// Seconds until an off laser switches on (for the warning flicker).
export function laserWarn(world, e) {
  if (!e.active || e.on == null) return 0;
  const cycle = e.on + e.off;
  const t = (world.t + (e.phase ?? 0)) % cycle;
  return t >= e.on ? cycle - t : 0;
}

function updateLaser(world, e) {
  if (!laserOn(world, e) || world.player.hidden) return;
  const { x, y } = world.player;
  const vx = e.bx - e.ax;
  const vy = e.by - e.ay;
  const len2 = vx * vx + vy * vy;
  const k = clamp(((x - e.ax) * vx + (y - e.ay) * vy) / len2, 0, 1);
  const d = dist(x, y, e.ax + vx * k, e.ay + vy * k);
  if (d < PLAYER_R * 0.85) world.caught(e);
}

function updateDoor(world, e, dt) {
  const p = world.player;
  const near = (x, y, r) => Math.abs(x - e.x) < r && Math.abs(y - e.y) < r;
  const i = e.ty * world.map.w + e.tx;
  if (e.locked === true || typeof e.locked === 'string') {
    if (typeof e.locked === 'string' && world.has(e.locked) && near(p.x, p.y, 1.6)) {
      e.locked = false;
      world.sfx('unlock');
    } else if (near(p.x, p.y, 1.05) && world.t - e.bumpT > 3) {
      e.bumpT = world.t;
      world.emit('locked', { id: e.id, x: e.x, y: e.y, need: e.locked });
    }
  }
  let want = false;
  if (!e.locked) {
    if (e.forced) want = true;
    else if (e.auto !== false) {
      want = near(p.x, p.y, 1.5);
      if (!want) {
        for (const o of world.entities) {
          if (o.type === 'person' && o.active && near(o.x, o.y, 1.3)) {
            want = true;
            break;
          }
        }
      }
    }
  }
  // Never close on her.
  if (!want && e.open > 0 && near(p.x, p.y, 0.5 + PLAYER_R)) want = true;
  const before = e.open;
  e.open = clamp(e.open + (want ? dt * 5 : -dt * 5), 0, 1);
  if (before === 0 && e.open > 0 && !world.replaying) world.sfx('door');
  const blocks = e.open < 0.85;
  world.dynSolid[i] = blocks ? 1 : 0;
  world.dynOpaque[i] = e.open < 0.5 && !e.glass ? 1 : 0;
}
