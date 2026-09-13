// Mission 4 — Gadget-laboratoriet. Workshop (blueprint + shelf) → collect parts →
// gadget built → five-step micro-mission with that gadget.

import { strings } from '../i18n.js';
import { gadgetArt, icons, missionArt } from '../components/art.js';
import { brandBar } from '../components/chrome.js';
import { h, pickRandom } from '../components/dom.js';
import { createQuestionCard } from '../components/question-card.js';
import { createSession, nextQuestion, recordResult } from '../engine/mastery.js';
import {
  GADGETS,
  MISSION_STEPS,
  addPart,
  advanceMission,
  currentGadget,
  gadgetById,
  labState,
  missionStep,
  partsFor,
  selectBlueprint,
  unfinishedMission,
} from '../engine/lab.js';

const t = strings.lab;

const progressBar = (ratio) =>
  h('span', { class: 'progress-bar', 'aria-hidden': 'true' }, h('i', { style: `width:${Math.round(Math.min(1, ratio) * 100)}%` }));

export function renderLab({ store }) {
  const profile = store.activeProfile();
  const state = labState(profile);
  const el = h('div', { class: 'lab' });
  let cleanup = null;

  function show(view, teardown = null) {
    cleanup?.();
    cleanup = teardown;
    el.replaceChildren(view);
    window.scrollTo(0, 0);
  }

  // Shared full-screen play layout: HUD, scene (art + slots), ticker, question card.
  function playScreen({ title, statLabel, artId, slotCount, onPause, card }) {
    const counter = h('b');
    const art = h('div', { class: 'gadget-art', html: gadgetArt[artId] });
    const slots = h('div', { class: 'part-slots', style: `--n:${slotCount}` }, Array.from({ length: slotCount }, () => h('i')));
    const ticker = h('p', { class: 'play-ticker', 'aria-live': 'polite' });

    const view = h(
      'div',
      { class: 'play-screen lab-play' },
      h(
        'div',
        { class: 'play-hud' },
        h('button', { type: 'button', class: 'hud-pause', onclick: onPause }, h('span', { class: 'back-icon', html: icons.back }), t.hud.pause),
        h('div', { class: 'hud-stat mono' }, h('span', {}, statLabel), counter),
        h('span', { class: 'hud-label' }, title),
      ),
      h('div', { class: 'lab-scene' }, art, slots),
      ticker,
      card.el,
    );

    return {
      view,
      setProgress(done) {
        counter.textContent = `${done}/${slotCount}`;
        art.style.setProperty('--fill', done / slotCount);
        [...slots.children].forEach((slot, i) => slot.classList.toggle('got', i < done));
      },
      say(speaker, text, label = strings.speakers[speaker]) {
        ticker.dataset.speaker = speaker;
        ticker.replaceChildren(h('span', { class: 'speaker' }, label), ' ', text);
      },
    };
  }

  // ---------- Workshop ----------

  function showWorkshop() {
    const bench = currentGadget(state);
    store.save();
    const unfinished = unfinishedMission(state);

    let benchSection;
    if (bench) {
      const copy = t.gadgets[bench.id];
      const got = partsFor(state, bench.id);
      benchSection = h(
        'section',
        { class: 'blueprint' },
        h('div', { class: 'blueprint-art', style: `--fill:${got / bench.parts}`, html: gadgetArt[bench.id] }),
        h(
          'div',
          { class: 'blueprint-body' },
          h('p', { class: 'eyebrow mono' }, t.onBench),
          h('h3', { class: 'blueprint-title' }, copy.name),
          h('p', { class: 'blueprint-desc' }, copy.desc),
          h('ul', { class: 'part-list' }, copy.parts.map((part, i) => h('li', { class: i < got ? 'got' : '' }, part))),
          h('div', { class: 'case-progress' }, progressBar(got / bench.parts), h('span', {}, t.partsCount(got, bench.parts))),
          h('button', { type: 'button', class: 'btn primary', onclick: startCollect }, t.collect),
        ),
      );
    } else {
      benchSection = h('p', { class: 'briefing', dataset: { speaker: 'mynthe' } }, h('span', { class: 'speaker' }, t.speaker), t.allBuilt);
    }

    const shelf = h(
      'div',
      { class: 'shelf' },
      GADGETS.map((g) => {
        const built = state.built.includes(g.id);
        const onBench = bench?.id === g.id;
        const status = built
          ? state.solved.includes(g.id)
            ? t.solvedStamp
            : t.built
          : onBench
          ? t.onBench
          : t.partsCount(partsFor(state, g.id), g.parts);
        return h(
          'button',
          {
            type: 'button',
            class: `shelf-slot${built ? ' is-built' : ''}${onBench ? ' is-bench' : ''}${state.solved.includes(g.id) ? ' is-solved' : ''}`,
            onclick: () => {
              if (built) return showGadget(g.id, false);
              selectBlueprint(state, g.id);
              store.save();
              showWorkshop();
            },
          },
          h('span', { class: 'shelf-art', html: gadgetArt[g.id] }),
          h('span', { class: 'shelf-name' }, t.gadgets[g.id].name),
          h('span', { class: 'shelf-status mono' }, status),
        );
      }),
    );

    show(
      h(
        'div',
        { class: 'page lab-intro' },
        brandBar({ back: true }),
        h(
          'div',
          { class: 'mission-hero' },
          h('div', { class: 'soon-art', html: missionArt.lab }),
          h(
            'div',
            {},
            h('p', { class: 'eyebrow mono' }, `${strings.home.caseLabel} 04`),
            h('h1', { class: 'page-title' }, strings.missions.lab.title),
            h('p', { class: 'page-sub' }, strings.missions.lab.teaser),
          ),
        ),
        h('p', { class: 'briefing', dataset: { speaker: 'mynthe' } }, h('span', { class: 'speaker' }, t.speaker), pickRandom(t.briefings)),
        unfinished
          ? h(
              'button',
              { type: 'button', class: 'resume-banner', onclick: () => startMission(unfinished.id) },
              h('span', { class: 'resume-art', html: gadgetArt[unfinished.id] }),
              t.resumeMission(t.gadgets[unfinished.id].mission.title, missionStep(state, unfinished.id)),
            )
          : null,
        benchSection,
        h('h2', { class: 'section-title' }, `${t.shelf} · ${t.shelfCount(state.built.length)}`),
        shelf,
        bench ? h('p', { class: 'mission-note' }, t.chooseHint) : null,
      ),
    );
  }

  // ---------- Collect parts ----------

  function startCollect() {
    const bench = currentGadget(state);
    if (!bench) return showWorkshop();

    const session = createSession();
    let ending = false;
    let finishTimeout = 0;

    const card = createQuestionCard({
      timerSeconds: null,
      onAttempt: ({ correct }) => {
        if (ending) return;
        if (!correct) return screen.say('vilde', pickRandom(t.partSetbacks), t.workshop);
        const earned = addPart(state);
        store.save();
        if (!earned) return;
        screen.setProgress(partsFor(state, bench.id));
        screen.say('mynthe', pickRandom(t.partLines)(t.gadgets[earned.gadgetId].parts[earned.partIndex]));
        if (earned.completed) {
          ending = true;
          card.freeze();
          finishTimeout = setTimeout(() => showGadget(earned.gadgetId, true), 900);
        }
      },
      onComplete: ({ question, firstTry, ms }) => {
        const result = recordResult(profile, session, question, { firstTry, ms });
        store.save();
        return result;
      },
      onNext: () => {
        if (!ending) card.ask(nextQuestion(profile, session));
      },
    });

    const screen = playScreen({
      title: t.gadgets[bench.id].name,
      statLabel: t.hud.parts,
      artId: bench.id,
      slotCount: bench.parts,
      onPause: () => showWorkshop(),
      card,
    });

    show(screen.view, () => {
      clearTimeout(finishTimeout);
      document.body.classList.remove('is-locked');
      card.destroy();
    });
    document.body.classList.add('is-locked');
    screen.setProgress(partsFor(state, bench.id));
    screen.say('mynthe', t.collectStart);
    card.ask(nextQuestion(profile, session));
  }

  // ---------- Gadget on the shelf ----------

  function showGadget(id, justBuilt) {
    const copy = t.gadgets[id];
    const solved = state.solved.includes(id);
    const step = missionStep(state, id);

    show(
      h(
        'div',
        { class: 'page lab-gadget' },
        brandBar({ onBack: () => showWorkshop() }),
        h('div', { class: 'result-ring gadget-ring', html: gadgetArt[id] }),
        h('p', { class: 'eyebrow mono' }, justBuilt ? t.builtEyebrow : t.gadgetEyebrow),
        h('h1', { class: 'page-title' }, copy.name),
        h('p', { class: 'page-sub' }, copy.desc),
        justBuilt ? h('p', { class: 'briefing', dataset: { speaker: 'mynthe' } }, h('span', { class: 'speaker' }, t.speaker), t.builtLine(copy.name)) : null,
        h(
          'section',
          { class: 'mission-card' },
          solved ? h('span', { class: 'case-stamp' }, t.solvedStamp) : null,
          h('p', { class: 'eyebrow mono' }, t.missionEyebrow),
          h('h3', {}, copy.mission.title),
          h('p', {}, copy.mission.intro.text),
        ),
        h(
          'div',
          { class: 'form-actions center' },
          h(
            'button',
            { type: 'button', class: 'btn primary', onclick: () => startMission(id) },
            step > 0 ? t.resumeMissionButton : solved ? t.replayMission : t.startMission,
          ),
          h('button', { type: 'button', class: 'btn', onclick: () => showWorkshop() }, t.backToLab),
        ),
      ),
    );
  }

  // ---------- Micro-mission ----------

  function startMission(id) {
    if (!gadgetById(id) || !state.built.includes(id)) return showWorkshop();
    const story = t.gadgets[id].mission;
    const session = createSession();
    let ending = false;
    let finishTimeout = 0;

    const card = createQuestionCard({
      timerSeconds: null,
      onAttempt: ({ correct }) => {
        if (ending) return;
        if (!correct) return screen.say('vilde', pickRandom(story.setbacks), t.narrator);
        const { step, solved } = advanceMission(state, id);
        store.save();
        screen.setProgress(step);
        screen.say('vilde', story.beats[step - 1], t.narrator);
        if (solved) {
          ending = true;
          card.freeze();
          finishTimeout = setTimeout(() => showMissionSolved(id), 1100);
        }
      },
      onComplete: ({ question, firstTry, ms }) => {
        const result = recordResult(profile, session, question, { firstTry, ms });
        store.save();
        return result;
      },
      onNext: () => {
        if (!ending) card.ask(nextQuestion(profile, session));
      },
    });

    const screen = playScreen({
      title: story.title,
      statLabel: t.hud.step,
      artId: id,
      slotCount: MISSION_STEPS,
      onPause: () => showGadget(id, false),
      card,
    });

    show(screen.view, () => {
      clearTimeout(finishTimeout);
      document.body.classList.remove('is-locked');
      card.destroy();
    });
    document.body.classList.add('is-locked');

    const step = missionStep(state, id);
    screen.setProgress(step);
    if (step === 0) screen.say(story.intro.speaker, story.intro.text);
    else screen.say('vilde', story.beats[step - 1], t.narrator);
    card.ask(nextQuestion(profile, session));
  }

  function showMissionSolved(id) {
    const copy = t.gadgets[id];
    const outro = copy.mission.outro;
    show(
      h(
        'div',
        { class: 'page lab-gadget' },
        brandBar({ onBack: () => showWorkshop() }),
        h('div', { class: 'result-ring gadget-ring', html: gadgetArt[id] }),
        h('p', { class: 'eyebrow mono' }, `${t.missionEyebrow} · ${copy.name}`),
        h('h1', { class: 'page-title' }, t.missionSolved),
        h('p', { class: 'page-sub' }, copy.mission.title),
        h('p', { class: 'briefing', dataset: { speaker: outro.speaker } }, h('span', { class: 'speaker' }, strings.speakers[outro.speaker]), outro.text),
        h(
          'div',
          { class: 'form-actions center' },
          h('button', { type: 'button', class: 'btn primary', onclick: () => showWorkshop() }, t.backToLab),
          h('button', { type: 'button', class: 'btn', onclick: () => startMission(id) }, t.replayMission),
        ),
      ),
    );
  }

  showWorkshop();
  return {
    el,
    destroy() {
      cleanup?.();
    },
  };
}
