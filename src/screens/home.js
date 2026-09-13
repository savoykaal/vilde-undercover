// Home: agent card, clearance level, Janni's briefing and the case-file board.

import { strings } from '../i18n.js';
import { missionArt, icons } from '../components/art.js';
import { agentCard, brandBar, clearancePicker } from '../components/chrome.js';
import { h, pickRandom } from '../components/dom.js';
import { openParentGate } from '../components/parent-gate.js';
import { MISSIONS } from '../missions.js';

function caseFile(profile, mission) {
  const t = strings.missions[mission.id];
  const { ratio, label } = mission.progress(profile);
  return h(
    'a',
    { class: 'case', href: `#/mission/${mission.id}`, dataset: { mission: mission.id } },
    h('span', { class: 'case-tab mono' }, `${strings.home.caseLabel} ${mission.code}`),
    h('span', { class: 'case-stamp' }, strings.home.topSecret),
    h('div', { class: 'case-art', html: missionArt[mission.id] }),
    h(
      'div',
      { class: 'case-body' },
      h('h3', { class: 'case-title' }, t.title),
      h('p', { class: 'case-teaser' }, t.teaser),
      h(
        'div',
        { class: 'case-progress' },
        h('span', { class: 'progress-bar', 'aria-hidden': 'true' }, h('i', { style: `width:${Math.round(Math.min(1, ratio) * 100)}%` })),
        h('span', {}, label),
      ),
    ),
  );
}

export function renderHome({ store, go, session }) {
  const profile = store.activeProfile();

  const parentButton = h('button', {
    type: 'button',
    class: 'corner-btn',
    'aria-label': strings.home.parentButton,
    html: icons.fingerprint,
    onclick: () =>
      openParentGate({
        onSuccess: () => {
          session.parentUnlocked = true;
          go('parent');
        },
      }),
  });

  const el = h(
    'div',
    { class: 'page home' },
    brandBar({ right: parentButton }),
    h(
      'div',
      { class: 'home-grid' },
      h(
        'aside',
        { class: 'agent-col' },
        agentCard(profile, { onSwitch: () => go('agents') }),
        h(
          'section',
          { class: 'clearance' },
          h('h2', { class: 'section-title' }, strings.home.clearance),
          clearancePicker(profile.settings.difficulty, (level) => {
            profile.settings.difficulty = level;
            store.save();
          }),
        ),
        h(
          'p',
          { class: 'briefing', dataset: { speaker: 'janni' } },
          h('span', { class: 'speaker' }, strings.home.briefingSpeaker),
          pickRandom(strings.home.briefings),
        ),
      ),
      h(
        'section',
        { class: 'board' },
        h('h2', { class: 'section-title' }, strings.home.board),
        h('div', { class: 'cases' }, MISSIONS.map((m) => caseFile(profile, m))),
      ),
    ),
  );

  return { el };
}
