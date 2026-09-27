// The "mission complete" sheet: LØST stamp, three stars popping in one by one,
// a couple of lines from the family, and what to do next.

import { strings } from '../i18n.js';
import { h } from '../components/dom.js';
import { sfx } from './audio.js';
import { portrait } from './portraits.js';

const STAR = `<svg viewBox="0 0 24 24" aria-hidden="true"><path class="star-shape" d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.4l-5.8 3 1.1-6.4-4.7-4.6 6.5-.9z"/></svg>`;

export function showResult(ui, { level, profile, outcome, result, onNext, onAgain, onMap }) {
  const t = strings.game.done;
  const copy = level.copy ?? {};
  const keys = ['done', 'parts', 'ghost'];
  const stars = keys.map((k) =>
    h('div', { class: 'star', dataset: { key: k } }, h('span', { html: STAR }), h('span', {}, t.stars[k]), h('span', { class: 'new', hidden: true }, t.newStar)),
  );
  const lines = (copy.done ?? []).slice(0, 3).map(([speaker, text]) =>
    h(
      'p',
      { dataset: { speaker } },
      h('span', { class: 'radio-face', html: portrait(speaker) }),
      h('span', {}, h('b', { class: 'radio-name', style: 'color:var(--speaker)' }, strings.speakers[speaker] ?? speaker), h('br'), typeof text === 'function' ? text(profile.name) : text),
    ),
  );
  const got = (result.partsTotal ?? []).length;
  const buttons = [];
  if (onNext) buttons.push(h('button', { type: 'button', class: 'btn primary big', onclick: onNext }, t.next));
  buttons.push(h('button', { type: 'button', class: onNext ? 'btn' : 'btn primary big', onclick: onMap }, t.map));
  if (onAgain) buttons.push(h('button', { type: 'button', class: 'btn', onclick: onAgain }, t.again));

  const sheet = ui.sheet(
    [
      h('div', { class: 'center' }, h('p', { class: 'eyebrow mono' }, copy.eyebrow ?? ''), h('span', { class: 'result-stamp' }, t.stamp)),
      h('h1', { class: 'sheet-title center' }, copy.title ?? t.title),
      h('div', { class: 'stars' }, stars),
      h(
        'p',
        { class: 'result-meta' },
        got ? `${t.parts(result.partsTotal.filter((p) => profile.game?.parts?.includes(p)).length, got)} · ` : '',
        t.caught(result.caught),
      ),
      h('div', { class: 'result-lines' }, lines),
      h('div', { class: 'sheet-actions' }, buttons),
    ],
    'is-result',
  );

  keys.forEach((k, i) => {
    if (!outcome.stars[k]) return;
    setTimeout(() => {
      stars[i].classList.add('is-on', 'is-pop');
      if (outcome.fresh.includes(k)) stars[i].querySelector('.new').hidden = false;
      sfx('star');
    }, 650 + i * 380);
  });
  return sheet;
}
