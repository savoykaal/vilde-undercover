// Hash routing between screens: #/home, #/agents, #/new-agent, #/mission/<id>, #/parent.
// Hash routes work on GitHub Pages, from a subfolder and from the single-file build.

import { strings } from './i18n.js';
import { createStore } from './engine/storage.js';
import { missionById } from './missions.js';
import { renderHome } from './screens/home.js';
import { renderAgentPicker, renderNewAgent } from './screens/profiles.js';
import { renderMissionSoon } from './screens/mission-soon.js';
import { renderParent } from './screens/parent.js';

const store = createStore();
const app = document.getElementById('app');
const session = { parentUnlocked: false };

const routes = {
  home: renderHome,
  agents: renderAgentPicker,
  'new-agent': renderNewAgent,
  mission: renderMissionSoon,
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
  if (name === 'mission' && !missionById(params[0])) return 'home';
  return name;
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
  document.title = target === 'mission' ? `${strings.missions[params[0]].title} · ${strings.appName}` : strings.appName;
}

window.addEventListener('hashchange', route);
route();
