// Full-screen story beats: one line per screen with the speaker's portrait.
// Tap anywhere, press Videre, Enter, Space or → to advance.

import { strings } from '../i18n.js';
import { icons } from './art.js';
import { h } from './dom.js';

function refresh(node) {
  node.classList.remove('is-fresh');
  void node.offsetWidth; // restart the entry animation
  node.classList.add('is-fresh');
}

export function createStoryScreen({ hudLabel, hudValue, title, onPause, onNext }) {
  const t = strings.story;
  const letter = h('span');
  const portrait = h('div', { class: 'portrait', 'aria-hidden': 'true' }, letter);
  const name = h('p', { class: 'portrait-name' });
  const bubble = h('p', { class: 'story-bubble', 'aria-live': 'polite' });
  const counter = h('span', { class: 'story-count mono' });

  const el = h(
    'div',
    { class: 'story-screen' },
    h(
      'div',
      { class: 'play-hud' },
      h('button', { type: 'button', class: 'hud-pause', onclick: onPause }, h('span', { class: 'back-icon', html: icons.back }), t.pause),
      h('div', { class: 'hud-stat mono' }, h('span', {}, hudLabel), h('b', {}, hudValue)),
      h('span', { class: 'hud-label' }, title),
    ),
    h('div', { class: 'story-stage', onclick: () => onNext() }, h('div', { class: 'story-speaker' }, portrait, name), bubble),
    h(
      'div',
      { class: 'story-foot' },
      counter,
      h('button', { type: 'button', class: 'btn primary story-next', onclick: () => onNext() }, t.next),
      h('p', { class: 'story-hint' }, t.tapHint),
    ),
  );

  function onKey(e) {
    if (e.repeat || e.defaultPrevented) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
      e.preventDefault();
      onNext();
    }
  }
  document.addEventListener('keydown', onKey);

  return {
    el,
    // beat is [speaker, text]; text may be a function of the agent's name.
    render([speaker, text], index, total, agentName) {
      el.dataset.speaker = speaker;
      letter.textContent = strings.speakers[speaker].charAt(0);
      name.replaceChildren(h('b', {}, strings.speakers[speaker]), h('span', {}, strings.roles[speaker]));
      bubble.textContent = typeof text === 'function' ? text(agentName) : text;
      counter.textContent = `${index + 1} / ${total}`;
      refresh(bubble);
      refresh(portrait);
    },
    destroy() {
      document.removeEventListener('keydown', onKey);
    },
  };
}
