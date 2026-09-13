// Screen routing. For now only a placeholder until the home screen (step 3).

import { strings } from './i18n.js';

const app = document.getElementById('app');

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.assign(node, attrs);
  node.append(...children);
  return node;
}

app.style.cssText = 'display:grid;place-items:center;min-height:100dvh;padding:24px;text-align:center';
app.append(
  el(
    'div',
    {},
    el('p', { className: 'mono', style: 'color:var(--accent);letter-spacing:.2em;margin:0' }, strings.appTagline.toUpperCase()),
    el('h1', { style: 'margin:.25em 0' }, strings.appName),
    el('h2', { style: 'font-weight:500;margin:0' }, strings.placeholder.heading),
    el('p', { style: 'color:var(--muted)' }, strings.placeholder.body),
  ),
);
