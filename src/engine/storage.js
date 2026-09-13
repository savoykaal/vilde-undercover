// Versioned localStorage wrapper. Falls back to in-memory storage when
// localStorage is unavailable (private mode, blocked site data, Node tests).

export const STORAGE_KEY = 'agent-vilde';
export const SCHEMA_VERSION = 1;

const memory = new Map();
const memoryBackend = {
  getItem: (k) => (memory.has(k) ? memory.get(k) : null),
  setItem: (k, v) => memory.set(k, String(v)),
  removeItem: (k) => memory.delete(k),
};

function backend() {
  try {
    const probe = '__agent_vilde_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return memoryBackend;
  }
}

export function emptyState() {
  return { version: SCHEMA_VERSION, activeProfileId: null, profiles: {} };
}

export function newProfile(name, now = Date.now()) {
  return {
    id: 'p' + now.toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    createdAt: now,
    settings: { difficulty: 'let', timer: { mellem: false, svaer: true } },
    facts: {},     // "3x7" -> mastery record, see mastery.js
    missions: {},  // per-mission save data
    log: {},       // "YYYY-MM-DD" -> { questions, firstTry, ms }
    meta: { shortcutTips: 0, totalAnswered: 0 },
  };
}

function fillProfile(p) {
  const base = newProfile(p.name ?? 'Agent', p.createdAt ?? Date.now());
  return {
    ...base,
    ...p,
    settings: { ...base.settings, ...p.settings, timer: { ...base.settings.timer, ...p.settings?.timer } },
    meta: { ...base.meta, ...p.meta },
    facts: p.facts ?? {},
    missions: p.missions ?? {},
    log: p.log ?? {},
  };
}

// Brings any stored shape up to the current schema. Unknown or broken data
// starts clean rather than crashing.
export function migrate(raw) {
  if (!raw || typeof raw !== 'object' || typeof raw.version !== 'number') return emptyState();
  if (raw.version > SCHEMA_VERSION) return emptyState();
  // Future migrations go here, e.g. if (raw.version < 2) { ... }
  const state = { ...emptyState(), ...raw, version: SCHEMA_VERSION };
  const profiles = {};
  for (const [id, p] of Object.entries(raw.profiles ?? {})) {
    if (p && typeof p === 'object') profiles[id] = fillProfile({ ...p, id });
  }
  state.profiles = profiles;
  if (!profiles[state.activeProfileId]) state.activeProfileId = Object.keys(profiles)[0] ?? null;
  return state;
}

export function createStore(key = STORAGE_KEY) {
  const store = backend();
  let state = load();

  function load() {
    try {
      return migrate(JSON.parse(store.getItem(key)));
    } catch {
      return emptyState();
    }
  }

  function save() {
    try {
      store.setItem(key, JSON.stringify(state));
    } catch {
      // Storage full or blocked: keep playing from memory.
    }
  }

  return {
    get state() {
      return state;
    },
    save,
    listProfiles: () => Object.values(state.profiles).sort((x, y) => x.createdAt - y.createdAt),
    activeProfile: () => state.profiles[state.activeProfileId] ?? null,
    createProfile(name) {
      const p = newProfile(name);
      state.profiles[p.id] = p;
      state.activeProfileId = p.id;
      save();
      return p;
    },
    setActiveProfile(id) {
      if (state.profiles[id]) {
        state.activeProfileId = id;
        save();
      }
    },
    deleteProfile(id) {
      delete state.profiles[id];
      if (state.activeProfileId === id) state.activeProfileId = Object.keys(state.profiles)[0] ?? null;
      save();
    },
    resetProfileProgress(id) {
      const p = state.profiles[id];
      if (!p) return;
      state.profiles[id] = { ...newProfile(p.name, p.createdAt), id, settings: p.settings };
      save();
    },
    replaceState(next) {
      state = migrate(next);
      save();
    },
  };
}
