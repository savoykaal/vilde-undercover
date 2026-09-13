// Kodelåsen run rules, kept free of DOM so they can be tested.
//
// Ten floors. A correct code climbs one floor. A code that doesn't fit moves
// the patrol one square closer. A run ends on the roof, when the patrol reaches
// her, or when the round clock (Mellem/Svær, if on) runs out.

export const FLOORS = 10;
export const TRACK_LENGTH = { let: 6, mellem: 5, svaer: 5 };
export const ROUND_SECONDS = { let: null, mellem: 90, svaer: 60 };

export function vaultState(profile) {
  profile.missions.vault ??= {};
  const state = profile.missions.vault;
  state.bestFloor ??= 0;
  state.bestRoofMs ??= {};
  state.runs ??= 0;
  state.run ??= null;
  return state;
}

export function createRun(level, clockOn) {
  const seconds = clockOn ? ROUND_SECONDS[level] : null;
  return {
    level,
    floor: 0,
    patrol: 0,
    track: TRACK_LENGTH[level] ?? TRACK_LENGTH.let,
    remainingMs: seconds ? seconds * 1000 : null,
    elapsedMs: 0,
    misses: 0,
  };
}

// Returns 'roof' when the top is reached.
export function climb(run) {
  run.floor = Math.min(FLOORS, run.floor + 1);
  return run.floor >= FLOORS ? 'roof' : null;
}

// Returns 'caught' when the patrol reaches her.
export function patrolStep(run) {
  run.patrol = Math.min(run.track, run.patrol + 1);
  run.misses++;
  return run.patrol >= run.track ? 'caught' : null;
}

// Returns 'time' when the round clock runs out.
export function tick(run, ms) {
  run.elapsedMs += ms;
  if (run.remainingMs == null) return null;
  run.remainingMs = Math.max(0, run.remainingMs - ms);
  return run.remainingMs === 0 ? 'time' : null;
}

// Records the run. Personal bests only ever improve.
export function finishRun(state, run, outcome) {
  const floorRecord = run.floor > state.bestFloor;
  state.bestFloor = Math.max(state.bestFloor, run.floor);

  let timeRecord = false;
  if (outcome === 'roof') {
    const previous = state.bestRoofMs[run.level];
    if (previous == null || run.elapsedMs < previous) {
      state.bestRoofMs[run.level] = Math.round(run.elapsedMs);
      timeRecord = true;
    }
  }

  state.runs++;
  state.run = null;
  return { floorRecord, timeRecord, bestFloor: state.bestFloor };
}

export function formatTime(ms) {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
