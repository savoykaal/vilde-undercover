// Shared page furniture: the top bar, the agent ID card, the clearance picker.

import { strings } from '../i18n.js';
import { emblems, icons, logo } from './art.js';
import { h } from './dom.js';

const LEVELS = ['let', 'mellem', 'svaer'];

// back: true links to home; onBack: a function for in-screen back navigation.
export function brandBar({ back = false, onBack = null, right = null } = {}) {
  const backContent = [h('span', { class: 'back-icon', html: icons.back }), strings.common.back];
  const left = onBack
    ? h('button', { type: 'button', class: 'back-link', onclick: onBack }, backContent)
    : back
    ? h('a', { class: 'back-link', href: '#/home' }, backContent)
    : h(
        'div',
        { class: 'brand' },
        h('span', { class: 'brand-mark', html: logo }),
        h('span', { class: 'brand-text' }, h('b', {}, strings.brand.name), h('small', { class: 'mono' }, strings.brand.tagline)),
      );
  return h('header', { class: 'brandbar' }, left, right);
}

export function agentNumber(id = '') {
  let n = 7;
  for (const ch of id) n = (n * 31 + ch.charCodeAt(0)) % 999983;
  const digits = String(n).padStart(6, '0');
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
}

export function agentCard(profile, { onSwitch } = {}) {
  return h(
    'section',
    { class: 'agent-card', 'aria-label': strings.home.agentCard },
    h('div', { class: 'agent-card-head' }, h('span', {}, strings.home.agentCard), h('span', {}, `ID ${agentNumber(profile.id)}`)),
    h(
      'div',
      { class: 'agent-card-body' },
      h('div', { class: 'emblem-badge', html: emblems[profile.emblem] ?? emblems.bolt }),
      h(
        'div',
        { class: 'agent-card-id' },
        h('div', { class: 'agent-label' }, strings.home.codename),
        h('p', { class: 'agent-name' }, profile.name || '…'),
        h('div', { class: 'agent-status' }, strings.home.status),
      ),
    ),
    h(
      'div',
      { class: 'agent-card-foot' },
      h('span', { class: 'barcode', 'aria-hidden': 'true' }),
      onSwitch ? h('button', { type: 'button', class: 'switch', onclick: onSwitch }, strings.home.switchAgent) : null,
    ),
  );
}

export function clearancePicker(current, onPick) {
  const desc = h('p', { class: 'segmented-desc' });
  const buttons = LEVELS.map((id) =>
    h(
      'button',
      { type: 'button', role: 'radio', class: 'seg', dataset: { level: id }, onclick: () => select(id, true) },
      h('span', { class: 'seg-bars', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
      strings.difficulty[id],
    ),
  );

  function select(id, notify) {
    for (const b of buttons) {
      const on = b.dataset.level === id;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', String(on));
    }
    desc.textContent = strings.difficultyInfo[id];
    if (notify) onPick?.(id);
  }
  select(current, false);

  return h(
    'div',
    { class: 'clearance-picker' },
    h('div', { class: 'segmented', role: 'radiogroup', 'aria-label': strings.home.clearance }, buttons),
    desc,
  );
}
