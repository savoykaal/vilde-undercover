// Mission 3 — Muldvarpen. No timer anywhere.
// Chapter list + suspect profiles → intro beats → clue wall (carousel on phones) →
// deduction board (own screen) → reveal → resolution beats → chapter solved.

import { strings } from '../i18n.js';
import { SHIRT_COLORS, icons, missionArt, suspectArt } from '../components/art.js';
import { brandBar } from '../components/chrome.js';
import { h } from '../components/dom.js';
import { createQuestionCard } from '../components/question-card.js';
import { createStoryScreen } from '../components/story.js';
import { createSession, nextQuestion, recordResult } from '../engine/mastery.js';
import {
  CHAPTERS,
  CLUES,
  CLUE_STEPS,
  CULPRITS,
  SUSPECTS,
  SUSPECT_IDS,
  TOTAL_STEPS,
  accuse,
  advanceBeat,
  allCluesClear,
  chapterProgress,
  clueValue,
  developClue,
  isUnlocked,
  moleState,
  nextOpenChapter,
  skipClue,
  stepsDeveloped,
} from '../engine/mole.js';

const t = strings.mole;

// Values as used inside sentences ("rød", 44, "17").
const plain = (clue, value) => (clue === 'photo' ? t.colors[value] : value);

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// ---------- Clue visuals ----------

function photoSvg(shirt) {
  return `<svg class="art" viewBox="0 0 120 90" aria-hidden="true" focusable="false">
    <rect class="panel" x="0" y="0" width="120" height="90"/>
    <path d="M32 90c0-21 12-33 28-33s28 12 28 33z" fill="${SHIRT_COLORS[shirt]}"/>
    <circle cx="60" cy="40" r="15" fill="#3a2f55"/>
    <path class="d" d="M8 16h12M8 16v10M112 16h-12M112 16v10M8 78h12M8 78v-10M112 78h-12M112 78v-10"/>
    <circle class="af" cx="104" cy="8" r="2.5"/>
  </svg>`;
}

function shoeSvg(level) {
  const lit = level * 3;
  const tread = Array.from({ length: 9 }, (_, i) => {
    const y = 16 + i * 7;
    const inset = i < 6 ? 0 : 3;
    return `<path class="${i < lit ? 'a' : 's dim'}" d="M${46 + inset} ${y}h${28 - inset * 2}"/>`;
  }).join('');
  return `<svg class="art" viewBox="0 0 120 90" aria-hidden="true" focusable="false">
    <path class="${level >= CLUE_STEPS ? 'a' : 'd'}" d="M60 6c13 0 19 11 19 27 0 11-4 19-5 26 2 7 2 25-14 25S44 66 46 59c-1-7-5-15-5-26C41 17 47 6 60 6z"/>
    ${tread}
  </svg>`;
}

function phoneSvg(digits, level) {
  const masked = ['•• •• •• ••', '•• •• •• ••', `•• •• •• ${digits[0]}•`, `•• •• •• ${digits}`][level];
  const bars = [0, 1, 2]
    .map((i) => `<rect class="${i < level ? 'af' : 's dim'}" x="${26 + i * 5}" y="${40 - i * 3}" width="3" height="${4 + i * 3}"/>`)
    .join('');
  const cracks = ['M70 30l8 10-6 8 10 8', 'M40 58l10-6 4 6', 'M88 32l-6 6'].slice(0, CLUE_STEPS - level);
  return `<svg class="art" viewBox="0 0 120 90" aria-hidden="true" focusable="false">
    <rect class="panel" x="12" y="20" width="96" height="50" rx="9"/>
    <rect class="s" x="12" y="20" width="96" height="50" rx="9"/>
    <rect x="20" y="27" width="80" height="36" rx="4" fill="#0b0917"/>
    ${bars}
    <text class="code" x="64" y="54">${masked}</text>
    ${cracks.map((d) => `<path class="s dim" d="${d}"/>`).join('')}
  </svg>`;
}

function clueVisual(chapter, clue, level) {
  const value = clueValue(chapter, clue);
  if (clue === 'photo') return photoSvg(value);
  if (clue === 'shoe') return shoeSvg(level);
  return phoneSvg(value, level);
}

export function renderMole({ store }) {
  const profile = store.activeProfile();
  const state = moleState(profile);
  const el = h('div', { class: 'mole' });
  let cleanup = null;
  let closeOverlay = null;

  function show(view, teardown = null) {
    closeOverlay?.();
    cleanup?.();
    cleanup = teardown;
    el.replaceChildren(view);
    window.scrollTo(0, 0);
  }

  function lockedTeardown(extra) {
    document.body.classList.add('is-locked');
    return () => {
      extra?.();
      document.body.classList.remove('is-locked');
    };
  }

  function suspectCard(id, { onclick = null, out = false, about = false } = {}) {
    const s = t.suspects[id];
    return h(
      onclick ? 'button' : 'div',
      {
        type: onclick ? 'button' : null,
        class: `suspect${out ? ' is-out' : ''}`,
        disabled: onclick && out,
        onclick,
      },
      h('span', { class: 'suspect-art', html: suspectArt[id] }),
      h('span', { class: 'suspect-name' }, s.name),
      h('span', { class: 'suspect-role mono' }, s.role),
      about ? h('span', { class: 'suspect-about' }, s.about) : null,
      h(
        'span',
        { class: 'suspect-attrs' },
        CLUES.map((clue) => h('span', { class: 'attr' }, h('i', {}, t.attributes[clue]), h('b', {}, t.attrValue[clue](SUSPECTS[id][clue])))),
      ),
      out ? h('span', { class: 'stamp suspect-stamp' }, t.ruledOut) : null,
    );
  }

  // ---------- Hub ----------

  function showHub() {
    const next = nextOpenChapter(state);

    const chapters = Array.from({ length: CHAPTERS }, (_, ch) => {
      const copy = t.chapters[ch];
      const solved = state.solved.includes(ch);
      const unlocked = isUnlocked(state, ch);
      const p = state.chapters[ch];
      const status = p
        ? p.phase === 'clues'
          ? t.status.clues(stepsDeveloped(p), TOTAL_STEPS)
          : t.status[p.phase]
        : solved
        ? t.status.replay
        : unlocked
        ? t.status.open
        : t.status.locked(ch);

      return h(
        'button',
        {
          type: 'button',
          class: `chapter${solved ? ' is-solved' : ''}${unlocked ? '' : ' is-locked'}${p || (ch === next && unlocked) ? ' is-active' : ''}`,
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
        { class: 'page mole-intro' },
        brandBar({ back: true }),
        h(
          'div',
          { class: 'mission-hero' },
          h('div', { class: 'soon-art', html: missionArt.mole }),
          h(
            'div',
            {},
            h('p', { class: 'eyebrow mono' }, `${strings.home.caseLabel} 03`),
            h('h1', { class: 'page-title' }, strings.missions.mole.title),
            h('p', { class: 'page-sub' }, strings.missions.mole.teaser),
          ),
        ),
        h('p', { class: 'briefing', dataset: { speaker: 'janni' } }, h('span', { class: 'speaker' }, t.hubSpeaker), next === null ? t.hubDone : t.hubLines[next]),
        h('p', { class: 'mission-note' }, t.noTimer),
        h('h2', { class: 'section-title' }, `${t.chapterList} · ${t.solvedCount(state.solved.length)}`),
        h('div', { class: 'chapter-list' }, chapters),
        h('h2', { class: 'section-title suspects-title' }, t.suspectsTitle),
        h('div', { class: 'suspect-grid' }, SUSPECT_IDS.map((id) => suspectCard(id, { about: true }))),
      ),
    );
  }

  function runChapter(ch) {
    if (!isUnlocked(state, ch)) return showHub();
    const p = chapterProgress(state, ch);
    store.save();
    if (p.phase === 'intro' || p.phase === 'resolution') return showStory(ch, p.phase);
    if (p.phase === 'clues') return showClues(ch);
    return showDeduction(ch);
  }

  // ---------- Intro and resolution ----------

  function showStory(ch, phase) {
    const p = chapterProgress(state, ch);
    const copy = t.chapters[ch];
    const beats = copy[phase];

    const story = createStoryScreen({
      hudLabel: t.chapterLabel(ch + 1),
      hudValue: t.phaseLabel[phase],
      title: copy.title,
      onPause: () => showHub(),
      onNext: () => {
        const res = advanceBeat(state, ch, beats.length);
        store.save();
        if (res.done) return showSolved(ch);
        if (res.phaseChanged) return runChapter(ch);
        story.render(beats[p.beat], p.beat, beats.length, profile.name);
      },
    });

    show(story.el, lockedTeardown(() => story.destroy()));
    story.render(beats[p.beat], p.beat, beats.length, profile.name);
  }

  // ---------- Clue wall ----------

  function showClues(ch) {
    const p = chapterProgress(state, ch);
    if (allCluesClear(p)) {
      p.phase = 'deduce';
      store.save();
      return showDeduction(ch);
    }

    const session = createSession();
    let ending = false;
    let finishTimeout = 0;

    const slides = CLUES.map((clue) => {
      const visual = h('div', { class: 'clue-visual' });
      const caption = h('p', { class: 'clue-caption' });
      const slide = h('article', { class: 'clue', dataset: { clue } }, h('span', { class: 'clue-name mono' }, t.clues[clue].name), visual, caption);
      return { clue, slide, visual, caption };
    });
    const wall = h('div', { class: 'clue-wall' }, slides.map((s) => s.slide));
    const dots = h('div', { class: 'clue-dots', 'aria-hidden': 'true' }, slides.map(() => h('i')));
    const counter = h('b');

    function renderWall(highlight) {
      counter.textContent = `${stepsDeveloped(p)}/${TOTAL_STEPS}`;
      for (const s of slides) {
        const level = p.clues[s.clue];
        s.slide.dataset.level = level;
        s.slide.classList.toggle('is-focus', s.clue === highlight);
        s.visual.innerHTML = clueVisual(ch, s.clue, level);
        s.caption.textContent =
          level >= CLUE_STEPS ? t.clues[s.clue].clear(plain(s.clue, clueValue(ch, s.clue))) : t.developing(level, CLUE_STEPS);
      }
    }

    function syncDots() {
      const i = Math.round(wall.scrollLeft / Math.max(1, wall.clientWidth));
      [...dots.children].forEach((dot, j) => dot.classList.toggle('on', j === i));
    }

    function scrollToClue(clue) {
      if (wall.scrollWidth <= wall.clientWidth + 2) return;
      wall.scrollTo({ left: CLUES.indexOf(clue) * wall.clientWidth, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }

    wall.addEventListener('scroll', syncDots, { passive: true });

    const card = createQuestionCard({
      timerSeconds: null,
      onAttempt: ({ correct }) => {
        if (ending || !correct) return;
        const res = developClue(p);
        store.save();
        renderWall(res.clue);
        const slide = slides.find((s) => s.clue === res.clue).slide;
        slide.classList.remove('is-develop');
        void slide.offsetWidth;
        slide.classList.add('is-develop');
        if (res.allClear) {
          ending = true;
          card.freeze();
          finishTimeout = setTimeout(() => showDeduction(ch), 1300);
        }
      },
      onComplete: ({ question, firstTry, ms, revealed }) => {
        const result = recordResult(profile, session, question, { firstTry, ms });
        if (revealed && !ending) skipClue(p); // stays blurry, comes back later
        store.save();
        return result;
      },
      onNext: () => {
        if (ending) return;
        renderWall(p.focus);
        scrollToClue(p.focus);
        card.ask(nextQuestion(profile, session));
      },
    });

    const view = h(
      'div',
      { class: 'play-screen lab-play mole-play' },
      h(
        'div',
        { class: 'play-hud' },
        h('button', { type: 'button', class: 'hud-pause', onclick: () => showHub() }, h('span', { class: 'back-icon', html: icons.back }), t.pause),
        h('div', { class: 'hud-stat mono' }, h('span', {}, t.evidence), counter),
        h('span', { class: 'hud-label' }, t.chapters[ch].title),
      ),
      h('div', { class: 'clue-board' }, wall, dots),
      card.el,
    );

    show(
      view,
      lockedTeardown(() => {
        clearTimeout(finishTimeout);
        card.destroy();
      }),
    );
    renderWall(p.focus);
    requestAnimationFrame(() => {
      wall.scrollLeft = CLUES.indexOf(p.focus) * wall.clientWidth;
      syncDots();
    });
    card.ask(nextQuestion(profile, session));
  }

  // ---------- Deduction board ----------

  function showDeduction(ch) {
    const p = chapterProgress(state, ch);

    show(
      h(
        'div',
        { class: 'page mole-board' },
        brandBar({ onBack: () => showHub() }),
        h('p', { class: 'eyebrow mono' }, t.deduceEyebrow(ch + 1)),
        h('h1', { class: 'page-title' }, ch === CHAPTERS - 1 ? t.deduceTitleFinal : t.deduceTitle),
        h('p', { class: 'page-sub' }, t.deduceSub),
        h('h2', { class: 'section-title' }, t.evidence),
        h(
          'div',
          { class: 'evidence' },
          CLUES.map((clue) =>
            h('div', { class: 'evidence-chip' }, h('span', { class: 'mono' }, t.clues[clue].name), h('b', {}, t.attrValue[clue](clueValue(ch, clue)))),
          ),
        ),
        h('h2', { class: 'section-title' }, t.suspectsHeading),
        h(
          'div',
          { class: 'suspect-grid' },
          SUSPECT_IDS.map((id) => suspectCard(id, { out: p.ruledOut.includes(id), onclick: () => confirmAccuse(ch, id) })),
        ),
      ),
    );
  }

  function confirmAccuse(ch, id) {
    const s = t.suspects[id];
    let changed = false;
    const dialog = h('div', { class: 'gate accuse', role: 'dialog', 'aria-modal': 'true' });
    const overlay = h('div', { class: 'overlay' }, dialog);

    function close() {
      document.removeEventListener('keydown', onKey);
      overlay.remove();
      closeOverlay = null;
      if (changed) showDeduction(ch);
    }

    function onKey(e) {
      if (e.key === 'Escape') close();
    }

    function doAccuse() {
      const res = accuse(state, ch, id);
      store.save();
      if (!res) return close();
      if (res.correct) {
        close();
        return showReveal(ch);
      }
      changed = true;
      const m = res.mismatch;
      dialog.replaceChildren(
        h('p', { class: 'eyebrow mono' }, t.digEyebrow),
        h('h2', {}, t.digDeeper),
        h(
          'p',
          { class: 'briefing', dataset: { speaker: 'janni' } },
          h('span', { class: 'speaker' }, strings.speakers.janni),
          t.mismatch[m.clue](s.short, plain(m.clue, m.evidence), plain(m.clue, m.suspectValue)),
        ),
        h('button', { type: 'button', class: 'btn primary', onclick: () => close() }, t.backToBoard),
      );
    }

    dialog.append(
      h('span', { class: 'suspect-art', html: suspectArt[id] }),
      h('h2', {}, t.accuseQuestion(s.name)),
      h('p', { class: 'gate-msg' }, t.accuseSub),
      h(
        'div',
        { class: 'form-actions center' },
        h('button', { type: 'button', class: 'btn primary', onclick: doAccuse }, t.accuse),
        h('button', { type: 'button', class: 'btn', onclick: () => close() }, strings.common.cancel),
      ),
    );

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', onKey);
    document.body.append(overlay);
    closeOverlay = () => {
      changed = false;
      close();
    };
  }

  // ---------- Reveal and solved ----------

  function showReveal(ch) {
    const culprit = CULPRITS[ch];
    show(
      h(
        'div',
        { class: 'page mole-solved' },
        brandBar({ onBack: () => showHub() }),
        h('div', { class: 'result-ring suspect-ring' }, h('span', { class: 'suspect-art', html: suspectArt[culprit] }), h('span', { class: 'stamp stamp-big' }, t.stamp)),
        h('p', { class: 'eyebrow mono' }, t.revealEyebrow),
        h('h1', { class: 'page-title' }, t.revealTitle(t.suspects[culprit].name)),
        h('div', { class: 'form-actions center' }, h('button', { type: 'button', class: 'btn primary', onclick: () => runChapter(ch) }, t.hearStory)),
      ),
    );
  }

  function showSolved(ch) {
    const culprit = CULPRITS[ch];
    const next = nextOpenChapter(state);
    const finale = next === null;

    show(
      h(
        'div',
        { class: 'page mole-solved' },
        brandBar({ onBack: () => showHub() }),
        h('div', { class: 'result-ring suspect-ring' }, h('span', { class: 'suspect-art', html: suspectArt[culprit] }), h('span', { class: 'stamp stamp-big' }, t.stamp)),
        h('p', { class: 'eyebrow mono' }, t.chapterOf(ch + 1)),
        h('h1', { class: 'page-title' }, finale ? t.finaleTitle : t.solvedTitle),
        h(
          'p',
          { class: 'briefing', dataset: { speaker: 'janni' } },
          h('span', { class: 'speaker' }, t.hubSpeaker),
          finale ? t.finaleLine(profile.name) : t.solvedLine,
        ),
        h(
          'div',
          { class: 'form-actions center' },
          finale ? null : h('button', { type: 'button', class: 'btn primary', onclick: () => runChapter(next) }, t.nextChapter(next + 1)),
          h('button', { type: 'button', class: finale ? 'btn primary' : 'btn', onclick: () => showHub() }, t.backToCase),
        ),
      ),
    );
  }

  showHub();
  return {
    el,
    destroy() {
      closeOverlay?.();
      cleanup?.();
    },
  };
}
