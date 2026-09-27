// Particles, confetti and floating text, in world units.

const TAU = Math.PI * 2;
const CONFETTI = ['#ff3f9e', '#f2c14e', '#8bd17c', '#6fb3d2', '#f08a5d', '#b98bff', '#ffffff'];

export function createFx(rng = Math.random) {
  let parts = [];
  let floaters = [];

  return {
    burst(x, y, { n = 16, colors = ['#ff3f9e', '#ffffff'], speed = 2.5, life = 0.6, size = 0.08, gravity = 0, drag = 2.5 } = {}) {
      for (let i = 0; i < n; i++) {
        const a = rng() * TAU;
        const s = speed * (0.4 + rng() * 0.8);
        parts.push({
          x,
          y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          life: life * (0.6 + rng() * 0.6),
          age: 0,
          size: size * (0.6 + rng() * 0.8),
          color: colors[Math.floor(rng() * colors.length)],
          gravity,
          drag,
          spin: 0,
          rot: 0,
          kind: 'dot',
        });
      }
    },
    confetti(x, y, n = 80) {
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (rng() - 0.5) * 2.4;
        const s = 3 + rng() * 5;
        parts.push({
          x,
          y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          life: 1.6 + rng() * 1.2,
          age: 0,
          size: 0.1 + rng() * 0.08,
          color: CONFETTI[Math.floor(rng() * CONFETTI.length)],
          gravity: 6,
          drag: 1.6,
          spin: (rng() - 0.5) * 20,
          rot: rng() * TAU,
          kind: 'paper',
        });
      }
    },
    floater(x, y, text, color = '#ffffff') {
      floaters.push({ x, y, text, color, age: 0, life: 1.4 });
    },
    update(dt) {
      for (const p of parts) {
        p.age += dt;
        p.vx -= p.vx * p.drag * dt;
        p.vy -= p.vy * p.drag * dt;
        p.vy += p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.spin * dt;
      }
      parts = parts.filter((p) => p.age < p.life);
      for (const f of floaters) f.age += dt;
      floaters = floaters.filter((f) => f.age < f.life);
    },
    draw(ctx) {
      for (const p of parts) {
        const a = 1 - p.age / p.life;
        ctx.globalAlpha = Math.min(1, a * 1.5);
        ctx.fillStyle = p.color;
        if (p.kind === 'paper') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2 * (0.4 + Math.abs(Math.sin(p.rot * 2))));
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (0.5 + a * 0.5), 0, TAU);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    },
    // Text is drawn in screen space by the renderer.
    get floaters() {
      return floaters;
    },
    clear() {
      parts = [];
      floaters = [];
    },
  };
}
