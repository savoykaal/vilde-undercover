// Parent view. Placeholder until step 8.

import { strings } from '../i18n.js';
import { brandBar } from '../components/chrome.js';
import { h } from '../components/dom.js';

export function renderParent() {
  const el = h(
    'div',
    { class: 'page parent' },
    brandBar({ back: true }),
    h('p', { class: 'eyebrow mono' }, strings.parentGate.eyebrow),
    h('h1', { class: 'page-title' }, strings.parent.title),
    h('p', { class: 'page-sub' }, strings.parent.soon),
  );
  return { el };
}
