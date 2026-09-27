// Hash routing between screens: #/home (the city map), #/play/<level>, #/tower,
// #/workshop, #/agents, #/new-agent, #/parent.
// Hash routes work on GitHub Pages, from a subfolder and from the single-file build.

import { strings } from './i18n.js';
import { createStore } from './engine/storage.js';
import { renderHome } from './screens/map.js';
import { renderAgentPicker, renderNewAgent } from './screens/profiles.js';
import { renderLevel } from './screens/level.js';
import { renderTower } from './screens/tower.js';
import { renderWorkshop } from './screens/workshop.js';
import { renderParent } from './screens/parent.js';
import { levelById } from './game/levels/index.js';

const store = createStore();
const app = document.getElementById('app');
const session = { parentUnlocked: false };

const routes = {
  home: renderHome,
  agents: renderAgentPicker,
  'new-agent': renderNewAgent,
  play: renderLevel,
  tower: renderTower,
  workshop: renderWorkshop,
  parent: renderParent,
};

let current = null;

function go(path) {
  location.hash = `#/${path}`;
}

function resolve(name, params) {
  if (!store.activeProfile()) return 'new-agent';
  if (!routes[name]) return 'home';
  if (name === 'parent' && !session.parentUnlocked) return 'home';
  if (name === 'play' && !levelById(params[0])) return 'home';
  return name;
}

function titleFor(target, params) {
  if (target === 'play') return `${levelById(params[0]).copy.title} · ${strings.appName}`;
  if (target === 'tower') return `${strings.missions.vault.title} · ${strings.appName}`;
  if (target === 'workshop') return `${strings.missions.lab.title} · ${strings.appName}`;
  return strings.appName;
}

function route() {
  const [name = 'home', ...params] = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const target = resolve(name, params);
  if (target !== name) history.replaceState(null, '', `#/${target}`);

  current?.destroy?.();
  const screen = routes[target]({ store, go, params: target === name ? params : [], session });
  screen.el.classList.add('screen');
  app.replaceChildren(screen.el);
  current = screen;
  window.scrollTo(0, 0);
  document.title = titleFor(target, params);
}

window.addEventListener('hashchange', route);
route();
