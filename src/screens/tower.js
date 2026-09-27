// #/tower: Nordlystårnet (Kodelåsen). Briefing with records → ten floors played
// back to back (sneak, then tap in the code) → result with personal bests.

import { strings } from '../i18n.js';
import { h } from '../components/dom.js';
import { brandBar } from '../components/chrome.js';
import { missionArt } from '../components/art.js';
import { playLevel } from '../game/play.js';
import { towerFloor } from '../game/tower.js';
import { sfx, stopMusic, unlock } from '../game/audio.js';
import { timerSecondsFor } from '../engine/facts.js';
import { FLOORS, ROUND_SECONDS, climb, createRun, finishRun, formatTime, patrolStep, tick, vaultState } from '../engine/vault.js';
import { addPart, gameState } from '../engine/progress.js';
import { labState, perks } from '../engine/lab.js';

const t = strings.vault;

const stat = (label, value) => h('div', { class: 'stat' }, h('span', {}, label), h('b', {}, value));

export function renderTower({ store, go }) {
  const profile = store.activeProfile();
  const state = vaultState(profile);
  const el = h('div', { class: 'tower-screen' });
  let game = null;
  let ended = false;

  function page(view) {
    game?.destroy();
    game = null;
    el.replaceChildren(view);
    window.scrollTo(0, 0);
  }

  // ---------- Briefing ----------

  function showIntro() {
    const level = profile.settings.difficulty;
    const clockOn = timerSecondsFor(profile.settings) != null;
    const run = state.run;
    const timerRow =
      level === 'let'
        ? h('p', { class: 'mission-note' }, t.timerNone)
        : h(
            'label',
            { class: 'toggle' },
            h('input', {
              type: 'checkbox',
              checked: clockOn,
              onchange: (e) => {
                profile.settings.timer[level] = e.target.checked;
                store.save();
              },
            }),
            h('span', { class: 'toggle-ui', 'aria-hidden': 'true' }),
            h('span', {}, t.timerLabel(Math.round(ROUND_SECONDS[level] / 60))),
          );

    const actions = run
      ? [
          h('button', { type: 'button', class: 'btn primary big', onclick: () => startRun(run) }, t.resume(run.floor)),
          h('button', { type: 'button', class: 'btn', onclick: () => startRun(null) }, t.restart),
        ]
      : [h('button', { type: 'button', class: 'btn primary big', onclick: () => startRun(null) }, t.start)];

    page(
      h(
        'div',
        { class: 'page vault-intro' },
        brandBar({ back: true }),
        h(
          'div',
          { class: 'mission-hero' },
          h('div', { class: 'soon-art', html: missionArt.vault }),
          h('div', {}, h('p', { class: 'eyebrow mono' }, t.eyebrow), h('h1', { class: 'page-title' }, strings.missions.vault.title), h('p', { class: 'page-sub' }, strings.missions.vault.teaser)),
        ),
        h('p', { class: 'briefing', dataset: { speaker: 'janni' } }, h('span', { class: 'speaker' }, t.briefingSpeaker), t.briefing),
        h('ol', { class: 'vault-rules' }, t.rules.map((rule, i) => h('li', {}, h('b', { class: 'mono' }, `0${i + 1}`), rule))),
        h(
          'div',
          { class: 'vault-stats' },
          stat(t.bestFloor, t.bestFloorValue(state.bestFloor)),
          stat(t.bestTime(strings.difficulty[level]), state.bestRoofMs[level] != null ? formatTime(state.bestRoofMs[level]) : '–'),
        ),
        timerRow,
        h('div', { class: 'form-actions' }, actions),
      ),
    );
  }

  // ---------- The night ----------

  function startRun(saved) {
    unlock();
    sfx('tap');
    const extra = perks(labState(profile));
    const run = saved ?? createRun(profile.settings.difficulty, timerSecondsFor(profile.settings) != null, extra.towerLife ?? 0);
    state.run = run;
    ended = false;
    store.save();
    el.replaceChildren();
    playFloor(run, extra);
  }

  function alarm(run, g) {
    const out = patrolStep(run);
    store.save();
    g?.say?.('frej', run.track - run.patrol <= 1 ? t.patrolNear : t.patrolLines[run.misses % t.patrolLines.length]);
    if (out) end(run, out);
  }

  function hudFor(run, g) {
    g.hud.timer = run.remainingMs != null ? run.remainingMs / 1000 : null;
    const left = run.track - run.patrol;
    g.hud.meter = { label: t.alarm(run.patrol, run.track), value: left / run.track, tone: left <= 1 ? 'bad' : run.patrol > 0 ? 'warn' : 'ok' };
  }

  function playFloor(run, extra) {
    const floor = run.floor + 1;
    let world = null;
    const level = towerFloor(floor, {
      hooks: {
        onAttempt: (correct) => {
          if (!correct) alarm(run, world);
        },
        tick: (g, dt) => {
          world = g;
          if (ended) return;
          const out = tick(run, dt * 1000);
          hudFor(run, g);
          if (out) end(run, out);
        },
      },
    });
    const g = gameState(profile);
    game = playLevel({
      root: el,
      level,
      profile,
      intro: false,
      extra,
      foundParts: new Set(g.parts),
      onPart: (id) => {
        addPart(profile, id);
        store.save();
      },
      onCaught: () => alarm(run, null),
      onQuit: () => {
        state.run = ended ? null : run;
        store.save();
        showIntro();
      },
      onDone: () => {
        const out = climb(run);
        store.save();
        game.destroy();
        if (out) end(run, out);
        else playFloor(run, extra);
      },
    });
    world = game.world;
    world.banner(t.floorLabel(floor), 'is-good');
    hudFor(run, world);
  }

  function end(run, outcome) {
    if (ended) return;
    ended = true;
    const summary = finishRun(state, run, outcome);
    store.save();
    setTimeout(() => {
      stopMusic();
      showResult(outcome, run, summary);
    }, outcome === 'roof' ? 300 : 1100);
  }

  // ---------- Result ----------

  function showResult(outcome, run, summary) {
    const r = t.result[outcome];
    const record = summary.floorRecord || summary.timeRecord;
    sfx(outcome === 'roof' ? 'complete' : 'task');
    page(
      h(
        'div',
        { class: 'page vault-result' },
        brandBar({ back: true }),
        h('div', { class: 'result-ring', dataset: { outcome } }, h('b', {}, run.floor), h('span', {}, `/ ${FLOORS}`)),
        h('p', { class: 'eyebrow mono' }, `${t.eyebrow} · ${strings.missions.vault.title}`),
        h('h1', { class: 'page-title' }, r.title),
        record ? h('p', { class: 'record-flash' }, t.result.newRecord) : null,
        h('p', { class: 'briefing', dataset: { speaker: r.speaker } }, h('span', { class: 'speaker' }, strings.speakers[r.speaker]), r.text(run.floor)),
        h(
          'div',
          { class: 'vault-stats' },
          stat(t.result.floors, `${run.floor}/${FLOORS}`),
          stat(t.result.best, t.bestFloorValue(summary.bestFloor)),
          outcome === 'roof' ? stat(t.result.timeLabel, formatTime(run.elapsedMs)) : null,
        ),
        h(
          'div',
          { class: 'form-actions center' },
          h('button', { type: 'button', class: 'btn primary', onclick: () => startRun(null) }, t.result.again),
          h('a', { class: 'btn', href: '#/home' }, t.result.home),
        ),
      ),
    );
  }

  showIntro();
  return {
    el,
    destroy() {
      if (game && state.run && !ended) store.save();
      game?.destroy();
      stopMusic();
    },
  };
}
