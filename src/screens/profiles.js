// Agent picker and the "new agent" form.

import { strings } from '../i18n.js';
import { emblems, icons } from '../components/art.js';
import { agentCard, brandBar, clearancePicker } from '../components/chrome.js';
import { h } from '../components/dom.js';

export function renderAgentPicker({ store, go }) {
  const active = store.activeProfile();
  const tiles = store.listProfiles().map((p) =>
    h(
      'button',
      {
        type: 'button',
        class: 'agent-tile' + (p.id === active?.id ? ' is-active' : ''),
        onclick: () => {
          store.setActiveProfile(p.id);
          go('home');
        },
      },
      h('span', { class: 'emblem-badge', html: emblems[p.emblem] ?? emblems.bolt }),
      h('span', { class: 'agent-tile-name' }, p.name),
      h('span', { class: 'agent-tile-level' }, strings.difficulty[p.settings.difficulty]),
    ),
  );

  const el = h(
    'div',
    { class: 'page agents' },
    brandBar({ back: Boolean(active) }),
    h('h1', { class: 'page-title' }, strings.agents.title),
    h('p', { class: 'page-sub' }, strings.agents.subtitle),
    h(
      'div',
      { class: 'agent-tiles' },
      tiles,
      h(
        'a',
        { class: 'agent-tile add', href: '#/new-agent' },
        h('span', { class: 'emblem-badge', html: icons.plus }),
        h('span', { class: 'agent-tile-name' }, strings.agents.add),
      ),
    ),
  );
  return { el };
}

export function renderNewAgent({ store, go }) {
  const first = store.listProfiles().length === 0;
  const t = strings.newAgent;
  const draft = { id: 'ny-agent', name: first ? t.defaultName : '', emblem: 'bolt', settings: { difficulty: 'let' } };

  const preview = h('div', { class: 'preview' });
  const refreshPreview = () => preview.replaceChildren(agentCard(draft));

  const nameInput = h('input', {
    id: 'agent-name',
    class: 'text-input',
    type: 'text',
    maxlength: 16,
    autocomplete: 'off',
    autocapitalize: 'words',
    spellcheck: 'false',
    value: draft.name,
    oninput: (e) => {
      draft.name = e.target.value.trim();
      error.textContent = '';
      refreshPreview();
    },
  });
  const error = h('p', { class: 'form-error', 'aria-live': 'polite' });

  const emblemButtons = Object.keys(emblems).map((id) =>
    h('button', {
      type: 'button',
      role: 'radio',
      class: 'emblem-choice',
      dataset: { emblem: id },
      'aria-label': strings.emblems[id],
      html: emblems[id],
      onclick: () => pickEmblem(id),
    }),
  );
  function pickEmblem(id) {
    draft.emblem = id;
    for (const b of emblemButtons) {
      const on = b.dataset.emblem === id;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', String(on));
    }
    refreshPreview();
  }

  const form = h(
    'form',
    {
      class: 'agent-form',
      novalidate: true,
      onsubmit: (e) => {
        e.preventDefault();
        const name = nameInput.value.trim().replace(/\s+/g, ' ');
        if (!name) {
          error.textContent = t.nameMissing;
          nameInput.focus();
          return;
        }
        store.createProfile(name, { emblem: draft.emblem, settings: { difficulty: draft.settings.difficulty } });
        go('home');
      },
    },
    h('label', { class: 'field' }, h('span', { class: 'field-label' }, t.nameLabel), nameInput),
    error,
    h(
      'div',
      { class: 'field' },
      h('span', { class: 'field-label' }, t.emblemLabel),
      h('div', { class: 'emblem-grid', role: 'radiogroup', 'aria-label': t.emblemLabel }, emblemButtons),
    ),
    h(
      'div',
      { class: 'field' },
      h('span', { class: 'field-label' }, t.levelLabel),
      clearancePicker(draft.settings.difficulty, (level) => {
        draft.settings.difficulty = level;
      }),
    ),
    h(
      'div',
      { class: 'form-actions' },
      h('button', { type: 'submit', class: 'btn primary' }, t.submit),
      first ? null : h('a', { class: 'btn', href: '#/agents' }, strings.common.cancel),
    ),
  );

  pickEmblem(draft.emblem);

  const el = h(
    'div',
    { class: 'page new-agent-page' },
    brandBar(),
    h('p', { class: 'eyebrow mono' }, first ? t.eyebrowFirst : strings.agents.add),
    h('h1', { class: 'page-title' }, first ? t.titleFirst : t.title),
    h('p', { class: 'page-sub' }, first ? t.introFirst : t.intro),
    h('div', { class: 'new-agent' }, preview, form),
  );
  return { el };
}
