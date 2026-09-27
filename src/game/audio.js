// Every sound is synthesised with WebAudio: no files, works offline.
// iOS only allows audio after a tap, so `unlock()` is called from the first button.

const MUTE_KEY = 'agent-vilde-mute';

let ac = null;
let master = null;
let musicGain = null;
let sfxGain = null;
let noiseBuf = null;
let muted = false;
try {
  muted = localStorage.getItem(MUTE_KEY) === '1';
} catch {
  // storage blocked: default to sound on
}

export function unlock() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain();
    master.gain.value = muted ? 0 : 0.9;
    master.connect(ac.destination);
    sfxGain = ac.createGain();
    sfxGain.gain.value = 0.55;
    sfxGain.connect(master);
    musicGain = ac.createGain();
    musicGain.gain.value = 0.22;
    musicGain.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  if (ac.state === 'suspended') ac.resume();
}

export const isMuted = () => muted;

export function setMuted(on) {
  muted = on;
  try {
    localStorage.setItem(MUTE_KEY, on ? '1' : '0');
  } catch {
    // ignore
  }
  if (master) master.gain.setTargetAtTime(on ? 0 : 0.9, ac.currentTime, 0.05);
}

function tone(freq, { at = 0, dur = 0.12, type = 'square', vol = 0.3, slide = null, dest = sfxGain, attack = 0.005 } = {}) {
  if (!ac) return;
  const t = ac.currentTime + at;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(dest);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise({ at = 0, dur = 0.2, vol = 0.3, freq = 1200, q = 1, type = 'bandpass', slide = null, dest = sfxGain } = {}) {
  if (!ac) return;
  const t = ac.currentTime + at;
  const src = ac.createBufferSource();
  src.buffer = noiseBuf;
  const f = ac.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(freq, t);
  if (slide) f.frequency.exponentialRampToValueAtTime(slide, t + dur);
  f.Q.value = q;
  const g = ac.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f);
  f.connect(g);
  g.connect(dest);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.02);
}

const SOUNDS = {
  tap: () => tone(880, { dur: 0.05, vol: 0.12, type: 'triangle' }),
  key: () => tone(1180 + Math.random() * 200, { dur: 0.06, vol: 0.12, type: 'sine' }),
  pickup: () => [660, 880, 1320].forEach((f, i) => tone(f, { at: i * 0.06, dur: 0.12, vol: 0.18, type: 'triangle' })),
  part: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, { at: i * 0.055, dur: 0.16, vol: 0.18, type: 'triangle' })),
  door: () => noise({ dur: 0.35, vol: 0.18, freq: 500, slide: 1800, q: 0.7 }),
  unlock: () => {
    tone(1400, { dur: 0.05, vol: 0.15 });
    tone(1900, { at: 0.07, dur: 0.08, vol: 0.15 });
  },
  task: () => {
    tone(784, { dur: 0.12, vol: 0.2, type: 'triangle' });
    tone(1175, { at: 0.1, dur: 0.25, vol: 0.2, type: 'triangle' });
  },
  good: () => {
    tone(988, { dur: 0.08, vol: 0.16, type: 'triangle' });
    tone(1319, { at: 0.07, dur: 0.14, vol: 0.16, type: 'triangle' });
  },
  soft: () => tone(220, { dur: 0.16, vol: 0.14, type: 'triangle', slide: 180 }),
  spark: () => noise({ dur: 0.12, vol: 0.2, freq: 3000, q: 2 }),
  hide: () => noise({ dur: 0.18, vol: 0.12, freq: 700, q: 1 }),
  spot: () => tone(660, { dur: 0.1, vol: 0.12, type: 'square', slide: 880 }),
  caught: () => {
    tone(880, { dur: 0.12, vol: 0.2, type: 'square' });
    tone(660, { at: 0.12, dur: 0.12, vol: 0.2, type: 'square' });
    tone(440, { at: 0.24, dur: 0.3, vol: 0.2, type: 'square', slide: 300 });
  },
  radio: () => noise({ dur: 0.12, vol: 0.08, freq: 2400, q: 0.8 }),
  click: () => {
    tone(2400, { dur: 0.02, vol: 0.2, type: 'square' });
    noise({ dur: 0.03, vol: 0.2, freq: 4000, q: 3 });
  },
  tick: () => tone(3000, { dur: 0.012, vol: 0.06, type: 'square' }),
  clunk: () => {
    tone(140, { dur: 0.18, vol: 0.35, type: 'sine', slide: 70 });
    noise({ dur: 0.08, vol: 0.2, freq: 900, q: 1 });
  },
  whoosh: () => noise({ dur: 0.4, vol: 0.2, freq: 300, slide: 2400, q: 0.6 }),
  zap: () => tone(1800, { dur: 0.15, vol: 0.12, type: 'sawtooth', slide: 300 }),
  confetti: () => {
    noise({ dur: 0.15, vol: 0.35, freq: 1500, q: 0.5 });
    [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, { at: 0.05 + i * 0.05, dur: 0.2, vol: 0.12, type: 'triangle' }));
  },
  complete: () => {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((f, i) => tone(f, { at: i * 0.1, dur: i === notes.length - 1 ? 0.6 : 0.14, vol: 0.2, type: 'triangle' }));
  },
  star: () => tone(1568, { dur: 0.25, vol: 0.18, type: 'triangle', slide: 2093 }),
  wire: () => tone(1046, { dur: 0.1, vol: 0.14, type: 'sine' }),
  ping: () => tone(1760, { dur: 0.07, vol: 0.1, type: 'sine' }),
};

export function sfx(name) {
  if (!ac || muted) return;
  SOUNDS[name]?.();
}

// DTMF-ish tone for phones and memory pads.
export function beep(index, dur = 0.25) {
  if (!ac || muted) return;
  const lows = [697, 770, 852, 941];
  const highs = [1209, 1336, 1477, 1633];
  tone(lows[index % 4], { dur, vol: 0.12, type: 'sine' });
  tone(highs[Math.floor(index / 4) % 4], { dur, vol: 0.12, type: 'sine' });
}

// ---------- Radio static for the tuner ----------

export function staticNoise() {
  if (!ac) return { set() {}, stop() {} };
  const src = ac.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const f = ac.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = 1800;
  f.Q.value = 0.6;
  const ng = ac.createGain();
  ng.gain.value = 0.12;
  const o = ac.createOscillator();
  o.type = 'sine';
  const og = ac.createGain();
  og.gain.value = 0;
  src.connect(f);
  f.connect(ng);
  ng.connect(sfxGain);
  o.connect(og);
  og.connect(sfxGain);
  src.start();
  o.start();
  return {
    // clarity 0..1: 1 = clean signal
    set(clarity, pitch = 440) {
      const t = ac.currentTime;
      ng.gain.setTargetAtTime(0.14 * (1 - clarity) + 0.01, t, 0.05);
      og.gain.setTargetAtTime(0.12 * clarity * clarity, t, 0.05);
      o.frequency.setTargetAtTime(pitch, t, 0.05);
    },
    stop() {
      try {
        src.stop();
        o.stop();
      } catch {
        // already stopped
      }
    },
  };
}

// ---------- Music: a small spy groove, sequenced ahead of time ----------

const SONGS = {
  sneak: {
    bpm: 104,
    bass: [40, 0, 40, 43, 0, 40, 46, 45, 40, 0, 40, 43, 0, 40, 38, 39],
    hat: [1, 0, 1, 0, 1, 0, 1, 1],
    stab: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 63, 0],
  },
  calm: {
    bpm: 84,
    bass: [45, 0, 0, 52, 0, 0, 50, 0, 43, 0, 0, 50, 0, 0, 48, 0],
    hat: [1, 0, 0, 0, 1, 0, 0, 1],
    stab: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  chase: {
    bpm: 140,
    bass: [40, 40, 52, 40, 40, 50, 40, 48, 40, 40, 52, 40, 43, 45, 46, 47],
    hat: [1, 1, 1, 1, 1, 1, 1, 1],
    stab: [64, 0, 0, 64, 0, 0, 67, 0, 64, 0, 0, 64, 0, 71, 70, 0],
  },
};

const midi = (n) => 440 * 2 ** ((n - 69) / 12);

let seq = null;

export function playMusic(name) {
  if (!ac) return;
  if (seq?.name === name) return;
  stopMusic();
  const song = SONGS[name];
  if (!song) return;
  const step = 60 / song.bpm / 4;
  let next = ac.currentTime + 0.1;
  let i = 0;
  const timer = setInterval(() => {
    if (!ac) return;
    while (next < ac.currentTime + 0.25) {
      const b = song.bass[i % song.bass.length];
      if (b) tone(midi(b), { at: next - ac.currentTime, dur: step * 1.6, vol: 0.5, type: 'triangle', dest: musicGain, attack: 0.01 });
      if (song.hat[i % song.hat.length] && i % 2 === 0)
        noise({ at: next - ac.currentTime, dur: 0.04, vol: 0.12, freq: 8000, q: 1, type: 'highpass', dest: musicGain });
      const s = song.stab[i % song.stab.length];
      if (s) tone(midi(s), { at: next - ac.currentTime, dur: step * 1.2, vol: 0.12, type: 'square', dest: musicGain });
      next += step;
      i++;
    }
  }, 60);
  seq = { name, timer };
}

export function stopMusic() {
  if (seq) clearInterval(seq.timer);
  seq = null;
}

export function duckMusic(on) {
  if (musicGain) musicGain.gain.setTargetAtTime(on ? 0.07 : 0.22, ac.currentTime, 0.2);
}
