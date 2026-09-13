// Mission 1 — Kælder-HQ. Case-file list → chapter script:
// story beats (one per screen, tap to advance) and question parts (each correct answer = a clue).

import { strings } from '../i18n.js';
import { icons, missionArt } from '../components/art.js';
import { brandBar } from '../components/chrome.js';
import { h, pickRandom } from '../components/dom.js';
import { createQuestionCard } from '../components/question-card.js';
import { createSession, nextQuestion, recordResult } from '../engine/mastery.js';
import {
  CHAPTERS,
  SEGMENTS,
  TOTAL_CLUES,
  advanceChapter,
  cluesFound,
  hqState,
  isQuestionSegment,
  isUnlocked,
  nextOpenChapter,
  positionFor,
} from '../engine/hq.js';

const t = strings.hq;

const lengthsFor = (ch) => {
  const c = t.chapters[ch];
  return { brief: c.brief.length, twist: c.twist.length, resolution: c.resolution.length };
};

const pauseButton = (onclick) =>
  h('button', { type: 'button', class: 'hud-pause', onclick }, h('span', { class: 'back-icon', html: icons.back }), t.pause);

function refresh(node) {
  node.classList.remove('is-fresh');
  void node.offsetWidth; // restart the entry animation
  node.classList.add('is-fresh');
}

export function renderHq({ store }) {
  const profile = store.activeProfile();
  const state = hqState(profile);
  const el = h('div', { class: 'hq' });
  let cleanup = null;

  function show(view, teardown = null) {
    cleanup?.();
    cleanup = teardown;
    el.replaceChildren(view);
    window.scrollTo(0, 0);
  }

  function lockScroll() {
    document.body.classList.add('is-locked');
    return () => document.body.classList.remove('is-locked');
  }

  // ---------- Case-file list ----------

  function showHub() {
    const next = nextOpenChapter(state);

    const chapters = Array.from({ length: CHAPTERS }, (_, ch) => {
      const copy = t.chapters[ch];
      const solved = state.solved.includes(ch);
      const unlocked = isUnlocked(state, ch);
      const inProgress = Boolean(state.progress[ch]);
      const status = inProgress
        ? t.inProgress(cluesFound(positionFor(state, ch)), TOTAL_CLUES)
        : solved
        ? t.replay
        : unlocked
        ? t.open
        : t.locked(ch);

      return h(
        'button',
        {
          type: 'button',
          class: `chapter${solved ? ' is-solved' : ''}${unlocked ? '' : ' is-locked'}${inProgress || (ch === next && unlocked) ? ' is-active' : ''}`,
          disabled: !unlocked,
          onclick: () => runChapter(ch),
        },
        h('span', { class: 'chapter-num mono' }, String(ch + 1).padStart(2, '0')),
        h(
          'span',
          { class: 'chapter-body' },
          h('span', { class: 'chapter-title' }, copy.title),
          h('span', { class: 'chapter-teaser' }, copy.teaser),
          h('span', { class: 'chapter-status mono' }, unlocked ? null : h('span', { class: 'lock', html: icons.lock }), status),
        ),
        solved ? h('span', { class: 'stamp' }, t.stamp) : null,
      );
    });

    show(
      h(
        'div',
        { class: 'page hq-intro' },
        brandBar({ back: true }),
        h(
          'div',
          { class: 'mission-hero' },
          h('div', { class: 'soon-art', html: missionArt.hq }),
          h(
            'div',
            {},
            h('p', { class: 'eyebrow mono' }, `${strings.home.caseLabel} 01`),
            h('h1', { class: 'page-title' }, strings.missions.hq.title),
            h('p', { class: 'page-sub' }, strings.missions.hq.teaser),
          ),
        ),
        h(
          'p',
          { class: 'briefing', dataset: { speaker: 'janni' } },
          h('span', { class: 'speaker' }, t.hubSpeaker),
          next === null ? t.hubDone(profile.name) : t.hubLines[next],
        ),
        h('h2', { class: 'section-title' }, `${t.listTitle} · ${t.solvedCount(state.solved.length)}`),
        h('div', { class: 'chapter-list' }, chapters),
      ),
    );
  }

  function runChapter(ch) {
    if (!isUnlocked(state, ch)) return showHub();
    const pos = positionFor(state, ch);
    const segment = SEGMENTS[pos.segment];
    if (isQuestionSegment(segment)) showQuestions(ch, segment, pos.index);
    else showStory(ch, segment, pos.index);
  }

  // ---------- Story beats ----------

  function showStory(ch, segment, index) {
    const copy = t.chapters[ch];
    const beats = copy[segment];
    let current = index;

    const letter = h('span');
    const portrait = h('div', { class: 'portrait', 'aria-hidden': 'true' }, letter);
    const name = h('p', { class: 'portrait-name' });
    const bubble = h('p', { class: 'story-bubble', 'aria-live': 'polite' });
    const counter = h('span', { class: 'story-count mono' });

    function next() {
      const res = advanceChapter(state, ch, lengthsFor(ch));
      store.save();
      if (res.done) return showSolved(ch);
      if (res.segmentChanged) return runChapter(ch);
      current = res.pos.index;
      render();
    }

    const screen = h(
      'div',
      { class: 'story-screen' },
      h(
        'div',
        { class: 'play-hud' },
        pauseButton(() => showHub()),
        h('div', { class: 'hud-stat mono' }, h('span', {}, t.chapterLabel(ch + 1)), h('b', {}, t.segmentLabel[segment])),
        h('span', { class: 'hud-label' }, copy.title),
      ),
      h('div', { class: 'story-stage', onclick: next }, h('div', { class: 'story-speaker' }, portrait, name), bubble),
      h(
        'div',
        { class: 'story-foot' },
        counter,
        h('button', { type: 'button', class: 'btn primary story-next', onclick: next }, t.next),
        h('p', { class: 'story-hint' }, t.tapHint),
      ),
    );

    function render() {
      const [speaker, text] = beats[current];
      screen.dataset.speaker = speaker;
      letter.textContent = strings.speakers[speaker].charAt(0);
      name.replaceChildren(h('b', {}, strings.speakers[speaker]), h('span', {}, t.roles[speaker]));
      bubble.textContent = typeof text === 'function' ? text(profile.name) : text;
      counter.textContent = `${current + 1} / ${beats.length}`;
      refresh(bubble);
      refresh(portrait);
    }

    function onKey(e) {
      if (e.repeat || e.defaultPrevented) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      }
    }

    const unlock = lockScroll();
    show(screen, () => {
      document.removeEventListener('keydown', onKey);
      unlock();
    });
    document.body.classList.add('is-locked');
    document.addEventListener('keydown', onKey);
    render();
  }

  // ---------- Questions ----------

  function showQuestions(ch, segment, answered) {
    const copy = t.chapters[ch];
    const steps = segment === 'partA' ? copy.stepsA : copy.stepsB;
    const session = createSession();
    let ending = false;
    let finishTimeout = 0;

    const counter = h('b');
    const slots = h('div', { class: 'part-slots', style: `--n:${TOTAL_CLUES}` }, Array.from({ length: TOTAL_CLUES }, () => h('i')));
    const ticker = h('p', { class: 'play-ticker', 'aria-live': 'polite' });

    function setClues() {
      const n = cluesFound(positionFor(state, ch));
      counter.textContent = `${n}/${TOTAL_CLUES}`;
      [...slots.children].forEach((slot, i) => slot.classList.toggle('got', i < n));
    }

    function say(speaker, text, label = strings.speakers[speaker]) {
      ticker.dataset.speaker = speaker;
      ticker.replaceChildren(h('span', { class: 'speaker' }, label), ' ', text);
    }

    const card = createQuestionCard({
      timerSeconds: null,
      onAttempt: ({ correct }) => {
        if (ending) return;
        if (!correct) return say('vilde', pickRandom(copy.setbacks), t.narrator);
        const stepIndex = positionFor(state, ch).index;
        const res = advanceChapter(state, ch, lengthsFor(ch));
        store.save();
        setClues();
        say('vilde', steps[Math.min(stepIndex, steps.length - 1)], t.narrator);
        if (res.segmentChanged) {
          ending = true;
          card.freeze();
          finishTimeout = setTimeout(() => (res.done ? showSolved(ch) : runChapter(ch)), 1300);
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

    const view = h(
      'div',
      { class: 'play-screen lab-play hq-play' },
      h(
        'div',
        { class: 'play-hud' },
        pauseButton(() => showHub()),
        h('div', { class: 'hud-stat mono' }, h('span', {}, t.clues), counter),
        h('span', { class: 'hud-label' }, copy.title),
      ),
      h('div', { class: 'lab-scene' }, h('div', { class: 'gadget-art hq-file', style: '--fill:1', html: missionArt.hq }), slots),
      ticker,
      card.el,
    );

    const unlock = lockScroll();
    show(view, () => {
      clearTimeout(finishTimeout);
      card.destroy();
      unlock();
    });
    document.body.classList.add('is-locked');
    setClues();
    if (answered > 0) say('vilde', steps[answered - 1], t.narrator);
    else say('janni', segment === 'partA' ? t.partStartA : t.partStartB);
    card.ask(nextQuestion(profile, session));
  }

  // ---------- Chapter solved ----------

  function showSolved(ch) {
    const copy = t.chapters[ch];
    const next = nextOpenChapter(state);
    const allDone = next === null;

    show(
      h(
        'div',
        { class: 'page hq-solved' },
        brandBar({ onBack: () => showHub() }),
        h(
          'div',
          { class: 'case-sheet' },
          h('span', { class: 'case-sheet-tab mono' }, `${strings.home.caseLabel} 01 · ${t.chapterLabel(ch + 1)}`),
          h('span', { class: 'case-sheet-title' }, copy.title),
          h('span', { class: 'case-sheet-lines', 'aria-hidden': 'true' }),
          h('span', { class: 'stamp stamp-big' }, t.stamp),
        ),
        h('p', { class: 'eyebrow mono' }, t.chapterOf(ch + 1)),
        h('h1', { class: 'page-title' }, allDone ? t.finaleTitle : t.solvedTitle),
        h(
          'p',
          { class: 'briefing', dataset: { speaker: 'janni' } },
          h('span', { class: 'speaker' }, t.hubSpeaker),
          allDone ? t.finaleLine(profile.name) : t.solvedLine,
        ),
        h(
          'div',
          { class: 'form-actions center' },
          allDone ? null : h('button', { type: 'button', class: 'btn primary', onclick: () => runChapter(next) }, t.nextChapter(next + 1)),
          h('button', { type: 'button', class: allDone ? 'btn primary' : 'btn', onclick: () => showHub() }, t.backToHq),
        ),
      ),
    );
  }

  showHub();
  return {
    el,
    destroy() {
      cleanup?.();
    },
  };
}
