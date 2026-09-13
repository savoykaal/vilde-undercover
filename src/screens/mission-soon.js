// Temporary screen for missions that aren't built yet. Replaced mission by mission.

import { strings } from '../i18n.js';
import { missionArt } from '../components/art.js';
import { brandBar } from '../components/chrome.js';
import { h } from '../components/dom.js';
import { missionById } from '../missions.js';

export function renderMissionSoon({ params }) {
  const mission = missionById(params[0]);
  const t = strings.missions[mission.id];
  const el = h(
    'div',
    { class: 'page mission-soon' },
    brandBar({ back: true }),
    h('div', { class: 'soon-art', html: missionArt[mission.id] }),
    h('p', { class: 'eyebrow mono' }, `${strings.home.caseLabel} ${mission.code}`),
    h('h1', { class: 'page-title' }, t.title),
    h('p', { class: 'page-sub' }, t.teaser),
    h('p', { class: 'briefing', dataset: { speaker: 'mynthe' } }, h('span', { class: 'speaker' }, strings.speakers.mynthe), strings.missionSoon.body),
    h('a', { class: 'btn primary', href: '#/home' }, strings.common.back),
  );
  return { el };
}
