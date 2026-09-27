// Controls: a floating thumb joystick (touch anywhere that isn't a button),
// plus arrow keys / WASD, Space or E to act and Escape to pause on a laptop.

const RADIUS = 52;

export function createInput(zone, { onAction, onPause } = {}) {
  const base = document.createElement('div');
  base.className = 'joy';
  base.hidden = true;
  const knob = document.createElement('div');
  knob.className = 'joy-knob';
  base.append(knob);
  zone.append(base);

  const vec = { x: 0, y: 0 };
  let pointer = null;
  let ox = 0;
  let oy = 0;
  let enabled = true;
  const keys = new Set();

  function setVec(dx, dy) {
    const len = Math.hypot(dx, dy);
    if (len > RADIUS) {
      // drag the base along so the stick keeps responding
      ox += (dx / len) * (len - RADIUS);
      oy += (dy / len) * (len - RADIUS);
      dx = (dx / len) * RADIUS;
      dy = (dy / len) * RADIUS;
      base.style.transform = `translate(${ox}px, ${oy}px)`;
    }
    const mag = Math.min(1, Math.hypot(dx, dy) / RADIUS);
    const dead = 0.12;
    const k = mag < dead ? 0 : (mag - dead) / (1 - dead) / mag;
    vec.x = (dx / RADIUS) * k;
    vec.y = (dy / RADIUS) * k;
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  function down(e) {
    if (!enabled || pointer != null) return;
    if (e.target.closest('button, .hud-block, .sheet, .mg')) return;
    pointer = e.pointerId;
    const r = zone.getBoundingClientRect();
    ox = e.clientX - r.left;
    oy = e.clientY - r.top;
    base.style.transform = `translate(${ox}px, ${oy}px)`;
    knob.style.transform = 'translate(0, 0)';
    base.hidden = false;
    zone.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  }

  function move(e) {
    if (e.pointerId !== pointer) return;
    const r = zone.getBoundingClientRect();
    setVec(e.clientX - r.left - ox, e.clientY - r.top - oy);
    e.preventDefault();
  }

  function up(e) {
    if (e.pointerId !== pointer) return;
    pointer = null;
    base.hidden = true;
    vec.x = vec.y = 0;
  }

  const KEYMAP = {
    ArrowLeft: 'l',
    a: 'l',
    A: 'l',
    ArrowRight: 'r',
    d: 'r',
    D: 'r',
    ArrowUp: 'u',
    w: 'u',
    W: 'u',
    ArrowDown: 'd',
    s: 's',
    S: 's',
  };

  function keydown(e) {
    if (!enabled || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest?.('.mg, .sheet')) return;
    const k = KEYMAP[e.key];
    if (k) {
      keys.add(k === 's' ? 'd' : k);
      e.preventDefault();
      return;
    }
    if (e.repeat) return;
    if (e.key === ' ' || e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
      e.preventDefault();
      onAction?.();
    } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      onPause?.();
    }
  }

  function keyup(e) {
    const k = KEYMAP[e.key];
    if (k) keys.delete(k === 's' ? 'd' : k);
  }

  function blur() {
    keys.clear();
    pointer = null;
    base.hidden = true;
    vec.x = vec.y = 0;
  }

  zone.addEventListener('pointerdown', down);
  zone.addEventListener('pointermove', move);
  zone.addEventListener('pointerup', up);
  zone.addEventListener('pointercancel', up);
  window.addEventListener('keydown', keydown);
  window.addEventListener('keyup', keyup);
  window.addEventListener('blur', blur);

  return {
    get vector() {
      if (keys.size) {
        let x = (keys.has('r') ? 1 : 0) - (keys.has('l') ? 1 : 0);
        let y = (keys.has('d') ? 1 : 0) - (keys.has('u') ? 1 : 0);
        const len = Math.hypot(x, y) || 1;
        return { x: x / len, y: y / len };
      }
      return { x: vec.x, y: vec.y };
    },
    get touching() {
      return pointer != null;
    },
    setEnabled(on) {
      enabled = on;
      if (!on) blur();
    },
    reset: blur,
    destroy() {
      zone.removeEventListener('pointerdown', down);
      zone.removeEventListener('pointermove', move);
      zone.removeEventListener('pointerup', up);
      zone.removeEventListener('pointercancel', up);
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
      window.removeEventListener('blur', blur);
      base.remove();
    },
  };
}
