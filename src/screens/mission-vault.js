// Mission 2 — Kodelåsen. Briefing → the night (keypad, tower, patrol track) → result.

import { strings } from '../i18n.js';
import { emblems, icons, missionArt } from '../components/art.js';
import { brandBar } from '../components/chrome.js';
import { h, pickRandom } from '../components/dom.js';
import { createQuestionCard } from '../components/question-card.js';
import { timerSecondsFor } from '../engine/facts.js';
import { createSession, nextQuestion, recordResult } from '../engine/mastery.js';
import { FLOORS, ROUND_SECONDS, climb, createRun, finishRun, formatTime, patrolStep, tick, vaultState } from '../engine/vault.js';

const t = strings.vault;

const guardSvg = `<svg viewBox="0 0 44 40" aria-hidden="true" focusable="false">
  <path class="beam" d="M24 18 44 7v23z"/>
  <circle cx="12" cy="7" r="5" fill="currentColor"/>
  <path d="M3 40V23a9 9 0 0 1 18 0v17z" fill="currentColor"/>
  <rect x="18" y="16" width="8" height="4" rx="1.5" fill="#f2c14e"/>
</svg>`;

const doorSvg = `<svg viewBox="0 0 36 48" aria-hidden="true" focusable="false">
  <rect class="glow" x="4" y="4" width="28" height="44"/>
  <rect class="leaf leaf-l" x="4" y="4" width="14" height="44"/>
  <rect class="leaf leaf-r" x="18" y="4" width="14" height="44"/>
  <circle class="lock" cx="26" cy="24" r="2"/>
  <path class="frame" d="M2 48V2h32v46"/>
</svg>`;

const stat = (label, value) => h('div', { class: 'stat' }, h('span', {}, label), h('b', {}, value));

export function renderVault({ store }) {
  const profile = store.activeProfile();
  const state = vaultState(profile);
  const el = h('div', { class: 'vault' });
  let cleanup = null;

  function show(view) {
    cleanup?.();
    cleanup = null;
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
            h('span', {}, t.timerLabel(ROUND_SECONDS[level])),
          );

    const actions = run
      ? [
          h('button', { type: 'button', class: 'btn primary', onclick: () => startRun(run) }, t.resume(run.floor)),
          h(
            'button',
            {
              type: 'button',
              class: 'btn',
              onclick: () => {
                state.run = null;
                store.save();
                startRun(null);
              },
            },
            t.restart,
          ),
        ]
      : h('button', { type: 'button', class: 'btn primary', onclick: () => startRun(null) }, t.start);

    show(
      h(
        'div',
        { class: 'page vault-intro' },
        brandBar({ back: true }),
        h(
          'div',
          { class: 'mission-hero' },
          h('div', { class: 'soon-art', html: missionArt.vault }),
          h(
            'div',
            {},
            h('p', { class: 'eyebrow mono' }, `${strings.home.caseLabel} 02`),
            h('h1', { class: 'page-title' }, strings.missions.vault.title),
            h('p', { class: 'page-sub' }, strings.missions.vault.teaser),
          ),
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
    const level = profile.settings.difficulty;
    const run = saved ?? createRun(level, timerSecondsFor(profile.settings) != null);
    state.run = run;
    store.save();

    const session = createSession();
    let ending = false;
    let ended = false;
    let paused = false;
    let revealPause = false;
    let lastTick = performance.now();
    let finishTimeout = 0;

    const tower = h('div', { class: 'tower', 'aria-hidden': 'true' }, Array.from({ length: FLOORS }, () => h('i')));
    const track = h(
      'div',
      { class: 'track', style: `--n:${run.track}` },
      Array.from({ length: run.track }, () => h('span', { class: 'cell' })),
      h('span', { class: 'guard', html: guardSvg }),
    );
    const door = h('div', { class: 'door', html: doorSvg });
    const floorValue = h('b');
    const timeValue = h('span', { class: 'hud-time mono' });
    const ticker = h('p', { class: 'play-ticker', 'aria-live': 'polite' });

    function say(speaker, text) {
      ticker.dataset.speaker = speaker;
      ticker.replaceChildren(h('span', { class: 'speaker' }, strings.speakers[speaker]), ' ', text);
    }

    function updateScene() {
      [...tower.children].forEach((bar, i) => {
        bar.className = i < run.floor ? 'done' : i === run.floor ? 'current' : '';
      });
      track.style.setProperty('--p', run.patrol);
      track.querySelectorAll('.cell').forEach((cell, i) => cell.classList.toggle('passed', i < run.patrol));
      track.classList.toggle('is-near', run.track - run.patrol <= 1);
      floorValue.textContent = `${run.floor}/${FLOORS}`;
      timeValue.hidden = run.remainingMs == null;
      if (run.remainingMs != null) {
        timeValue.textContent = formatTime(run.remainingMs);
        timeValue.classList.toggle('is-low', run.remainingMs <= 10000);
      }
    }

    function loop() {
      const now = performance.now();
      const dt = now - lastTick;
      lastTick = now;
      if (paused || ending) return;
      const outcome = tick(run, dt);
      updateScene();
      if (outcome) finishSoon(outcome);
    }

    function pauseClock() {
      loop();
      paused = true;
    }

    function resumeClock() {
      lastTick = performance.now();
      paused = false;
    }

    function onVisibility() {
      if (document.hidden) {
        pauseClock();
        store.save();
      } else if (!revealPause) {
        resumeClock();
      }
    }

    function finish(outcome) {
      if (ended) return null;
      ended = true;
      const summary = finishRun(state, run, outcome);
      store.save();
      return summary;
    }

    function finishSoon(outcome) {
      if (ending) return;
      pauseClock();
      ending = true;
      card.freeze();
      finishTimeout = setTimeout(() => {
        const summary = finish(outcome);
        if (summary) showResult(outcome, run, summary);
      }, outcome === 'time' ? 500 : 900);
    }

    const card = createQuestionCard({
      timerSeconds: null,
      advanceDelay: 300,
      onAttempt: ({ correct }) => {
        if (ending) return;
        if (correct) {
          door.classList.add('is-open');
          const outcome = climb(run);
          say('mynthe', t.floorLine(run.floor));
          updateScene();
          store.save();
          if (outcome) finishSoon(outcome);
        } else {
          const outcome = patrolStep(run);
          say('frej', run.track - run.patrol === 1 ? t.patrolNear : pickRandom(t.patrolLines));
          updateScene();
          store.save();
          if (outcome) finishSoon(outcome);
        }
      },
      onComplete: ({ question, firstTry, ms, revealed }) => {
        const result = recordResult(profile, session, question, { firstTry, ms });
        store.save();
        if (revealed && !ending) {
          revealPause = true;
          pauseClock();
        }
        return result;
      },
      onNext: () => {
        if (ending) return;
        if (revealPause) {
          revealPause = false;
          resumeClock();
        }
        door.classList.remove('is-open');
        card.ask(nextQuestion(profile, session));
      },
    });

    const hud = h(
      'div',
      { class: 'play-hud' },
      h('button', { type: 'button', class: 'hud-pause', onclick: () => showIntro() }, h('span', { class: 'back-icon', html: icons.back }), t.hud.pause),
      h('div', { class: 'hud-stat mono' }, h('span', {}, t.hud.floor), floorValue),
      timeValue,
    );

    const view = h(
      'div',
      { class: 'play-screen' },
      hud,
      h(
        'div',
        { class: 'vault-scene' },
        tower,
        h('div', { class: 'corridor' }, track, h('div', { class: 'door-wrap' }, door, h('span', { class: 'vilde-mark', html: emblems[profile.emblem] ?? emblems.bolt }))),
      ),
      ticker,
      card.el,
    );

    show(view);
    document.body.classList.add('is-locked');
    document.addEventListener('visibilitychange', onVisibility);
    const interval = setInterval(loop, 250);

    cleanup = () => {
      clearInterval(interval);
      clearTimeout(finishTimeout);
      document.removeEventListener('visibilitychange', onVisibility);
      document.body.classList.remove('is-locked');
      card.destroy();
      if (ending) {
        finish(run.floor >= FLOORS ? 'roof' : run.patrol >= run.track ? 'caught' : 'time');
      } else {
        pauseClock();
        state.run = run; // resume later from the same floor, patrol and clock
        store.save();
      }
    };

    say('frej', saved ? t.resumeLine : t.startLine);
    updateScene();
    card.ask(nextQuestion(profile, session));
  }

  // ---------- Result ----------

  function showResult(outcome, run, summary) {
    const r = t.result[outcome];
    const record = summary.floorRecord || summary.timeRecord;

    function onKey(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        startRun(null);
      }
    }

    show(
      h(
        'div',
        { class: 'page vault-result' },
        brandBar({ back: true }),
        h('div', { class: 'result-ring', dataset: { outcome } }, h('b', {}, run.floor), h('span', {}, `/ ${FLOORS}`)),
        h('p', { class: 'eyebrow mono' }, `${strings.home.caseLabel} 02 · ${strings.missions.vault.title}`),
        h('h1', { class: 'page-title' }, r.title),
        record ? h('p', { class: 'record-flash' }, t.result.newRecord) : null,
        h('p', { class: 'briefing', dataset: { speaker: r.speaker } }, h('span', { class: 'speaker' }, strings.speakers[r.speaker]), r.text(run.floor)),
        h(
          'div',
          { class: 'vault-stats' },
          stat(t.result.floors, `${run.floor}/${FLOORS}`),
          stat(t.result.best, t.bestFloorValue(summary.bestFloor)),
          outcome === 'roof' ? stat(t.result.time, formatTime(run.elapsedMs)) : null,
        ),
        h(
          'div',
          { class: 'form-actions center' },
          h('button', { type: 'button', class: 'btn primary', onclick: () => startRun(null) }, t.result.again),
          h('a', { class: 'btn', href: '#/home' }, t.result.home),
        ),
      ),
    );
    document.addEventListener('keydown', onKey);
    cleanup = () => document.removeEventListener('keydown', onKey);
  }

  showIntro();
  return {
    el,
    destroy() {
      cleanup?.();
    },
  };
}
