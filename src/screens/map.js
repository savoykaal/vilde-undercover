// Home: the city at night as a mission map. Every pin is a level; tap one for
// its mission card. Agent card and clearance level sit in a sheet behind the chip.

import { strings } from '../i18n.js';
import { h, pickRandom } from '../components/dom.js';
import { emblems, icons } from '../components/art.js';
import { agentCard, clearancePicker } from '../components/chrome.js';
import { openParentGate } from '../components/parent-gate.js';
import { levelById } from '../game/levels/index.js';
import { CAMPAIGN, MOLE, gameState, isSolved, isUnlocked, resumeStep, starCount } from '../engine/progress.js';
import { vaultState } from '../engine/vault.js';
import { benchGadget, freeParts, labState } from '../engine/lab.js';
import { sfx, unlock } from '../game/audio.js';
import { portrait } from '../game/portraits.js';

const NS = 'http://www.w3.org/2000/svg';

// Pin positions on the 390 × 740 map.
const PINS = {
  c1: [96, 668],
  c2: [206, 548],
  c3: [262, 368],
  c4: [318, 300],
  c5: [196, 132],
  m1: [44, 452],
  m2: [104, 430],
  m3: [44, 520],
  m4: [104, 540],
  tower: [338, 468],
  workshop: [168, 700],
};

function cityArt() {
  const win = (x, y, w, h, seed) => {
    let out = '';
    for (let yy = y + 6; yy < y + h - 6; yy += 11) {
      for (let xx = x + 6; xx < x + w - 6; xx += 10) {
        const lit = ((xx * 7 + yy * 13 + seed) % 9) < 3;
        out += `<rect x="${xx}" y="${yy}" width="4" height="5" fill="${lit ? '#f2c14e' : '#2a2548'}" opacity="${lit ? 0.85 : 1}"/>`;
      }
    }
    return out;
  };
  const block = (x, y, w, h, fill, seed = 1) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fill}"/>${win(x, y, w, h, seed)}`;
  const trees = [
    [250, 400],
    [276, 420],
    [300, 398],
    [326, 426],
    [352, 404],
    [262, 442],
    [340, 446],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="#2f6e45"/><circle cx="${x - 3}" cy="${y - 3}" r="6" fill="#3f8a58"/>`)
    .join('');
  const containers = [
    [40, 150, '#b24a4a'],
    [80, 150, '#3f6fb0'],
    [40, 172, '#3f9a62'],
    [300, 150, '#d08a3a'],
    [300, 172, '#7a4ab0'],
    [340, 160, '#b0a03a'],
  ]
    .map(([x, y, c]) => `<rect x="${x}" y="${y}" width="34" height="16" rx="2" fill="${c}"/>`)
    .join('');
  return `
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ff3f9e" stop-opacity=".55"/><stop offset="1" stop-color="#ff3f9e" stop-opacity="0"/></radialGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1b33"/><stop offset="1" stop-color="#12304d"/></linearGradient>
    <pattern id="waves" width="40" height="14" patternUnits="userSpaceOnUse"><path d="M0 7q10-6 20 0t20 0" stroke="#2b5a86" stroke-width="1.5" fill="none" opacity=".6"/></pattern>
  </defs>
  <rect width="390" height="740" fill="#0f0c1d"/>
  <rect width="390" height="120" fill="url(#sea)"/>
  <rect width="390" height="120" fill="url(#waves)"/>
  <path d="M150 58h90l24 14h-114z" fill="#e9e4f5" opacity=".85"/><rect x="170" y="48" width="40" height="12" rx="2" fill="#3d4a66"/>
  <rect x="0" y="118" width="390" height="80" fill="#2a2e3a"/>
  <path d="M0 118h390" stroke="#6b7080" stroke-width="3" stroke-dasharray="6 5"/>
  ${containers}
  <rect x="0" y="232" width="390" height="30" fill="#1b3350"/>
  <rect x="0" y="232" width="390" height="30" fill="url(#waves)"/>
  <rect x="178" y="226" width="34" height="42" fill="#3a3550"/><path d="M178 226v42M212 226v42" stroke="#6b7080" stroke-width="3"/>
  <path d="M195 198V740M0 330h390M0 610h390M150 330v280" stroke="#262240" stroke-width="18"/>
  <path d="M195 198V740M0 330h390M0 610h390M150 330v280" stroke="#3a3560" stroke-width="1.5" stroke-dasharray="8 8"/>
  ${block(14, 270, 150, 46, '#3a2f5a', 3)}
  ${block(222, 270, 150, 46, '#4a3858', 5)}
  ${block(232, 342, 70, 36, '#5a4a7a', 2)}
  <rect x="236" y="386" width="140" height="70" rx="10" fill="#173a2a"/>
  ${trees}
  ${block(14, 350, 120, 60, '#2d3b58', 7)}
  <rect x="12" y="420" width="128" height="148" rx="6" fill="#2f2a4a"/>
  ${win(12, 420, 128, 148, 9)}
  <text x="76" y="590" fill="#9a93b5" font-family="ui-monospace,Menlo,monospace" font-size="9" text-anchor="middle" letter-spacing="1">BUREAUET</text>
  ${block(172, 350, 16, 250, '#262240', 1)}
  ${block(210, 470, 80, 120, '#3b2a4a', 4)}
  <rect x="312" y="470" width="56" height="130" rx="4" fill="#352a60"/>${win(312, 470, 56, 130, 6)}
  <rect x="322" y="440" width="36" height="34" rx="3" fill="#403070"/><rect x="336" y="420" width="8" height="22" fill="#5a4a90"/>
  <circle cx="340" cy="416" r="16" fill="url(#glow)"/><circle cx="340" cy="416" r="3" fill="#ff3f9e"/>
  ${block(214, 624, 150, 70, '#3a2f5a', 8)}
  <path d="M46 650 96 616l50 34v62H46z" fill="#4a3f6e"/><rect x="84" y="672" width="24" height="40" rx="2" fill="#2b2446"/>
  <rect x="58" y="664" width="18" height="14" fill="#f2c14e" opacity=".8"/><rect x="116" y="664" width="18" height="14" fill="#f2c14e" opacity=".5"/>
  <rect x="150" y="690" width="44" height="30" rx="3" fill="#2f5d3a"/>
  <path id="route" d="M96 668C130 640 190 600 206 548S250 420 262 368 300 320 318 300 260 200 196 132" fill="none" stroke="#ff3f9e" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round" opacity=".75"/>
  `;
}

export function renderHome({ store, go, session }) {
  const profile = store.activeProfile();
  const g = gameState(profile);
  const el = h('div', { class: 'map-screen' });
  let sheetEl = null;

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 390 740');
  svg.setAttribute('class', 'city');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.innerHTML = cityArt();

  const pinLayer = h('div', { class: 'pins' });
  const mapWrap = h('div', { class: 'map-wrap' }, svg, pinLayer);

  function pinState(id) {
    if (id === 'tower' || id === 'workshop') return 'open';
    if (!isUnlocked(profile, id)) return 'locked';
    if (isSolved(profile, id)) return 'solved';
    return 'open';
  }

  const labelFor = (id) => {
    if (CAMPAIGN.includes(id)) return String(CAMPAIGN.indexOf(id) + 1);
    if (MOLE.includes(id)) return `M${MOLE.indexOf(id) + 1}`;
    return '';
  };

  for (const [id, [x, y]] of Object.entries(PINS)) {
    const state = pinState(id);
    const stars = starCount(profile, id);
    const kind = id === 'tower' ? 'tower' : id === 'workshop' ? 'workshop' : MOLE.includes(id) ? 'mole' : 'story';
    const pin = h(
      'button',
      {
        type: 'button',
        class: `pin is-${state} pin-${kind}`,
        style: `left:${(x / 390) * 100}%;top:${(y / 740) * 100}%`,
        'aria-label': pinTitle(id),
        onclick: () => openCard(id),
      },
      h('span', { class: 'pin-dot' }, state === 'locked' ? h('span', { class: 'pin-lock', html: icons.lock }) : kind === 'tower' ? '▲' : kind === 'workshop' ? '⚙' : labelFor(id)),
      stars ? h('span', { class: 'pin-stars' }, '★'.repeat(stars)) : null,
    );
    pinLayer.append(pin);
  }

  function pinTitle(id) {
    if (id === 'tower') return strings.missions.vault.title;
    if (id === 'workshop') return strings.missions.lab.title;
    return levelById(id)?.copy?.title ?? id;
  }

  // ---------- Mission card ----------

  function closeSheet() {
    sheetEl?.remove();
    sheetEl = null;
  }

  function sheet(content) {
    closeSheet();
    const wrap = h('div', { class: 'sheet-wrap map-sheet', onclick: (e) => e.target === wrap && closeSheet() }, h('div', { class: 'sheet' }, content));
    el.append(wrap);
    requestAnimationFrame(() => wrap.classList.add('is-in'));
    sheetEl = wrap;
  }

  function starsRow(id) {
    const s = g.levels[id]?.stars ?? {};
    return h(
      'div',
      { class: 'card-stars' },
      ['done', 'parts', 'ghost'].map((k) => h('span', { class: s[k] ? 'is-on' : '' }, h('b', {}, '★'), strings.game.done.stars[k])),
    );
  }

  function openCard(id) {
    unlock();
    sfx('tap');
    const t = strings.map;
    if (id === 'tower') {
      const v = vaultState(profile);
      return sheet([
        h('p', { class: 'eyebrow mono' }, strings.vault.eyebrow),
        h('h2', { class: 'sheet-title' }, strings.missions.vault.title),
        h('p', { class: 'card-teaser' }, strings.missions.vault.teaser),
        h('p', { class: 'card-note' }, strings.missions.vault.progress(v.bestFloor)),
        h('p', { class: 'card-math mono' }, t.mathNote),
        h('div', { class: 'sheet-actions' }, h('button', { type: 'button', class: 'btn primary big', onclick: () => go('tower') }, t.open)),
      ]);
    }
    if (id === 'workshop') {
      const lab = labState(profile);
      const bench = benchGadget(lab);
      return sheet([
        h('p', { class: 'eyebrow mono' }, strings.lab.eyebrow),
        h('h2', { class: 'sheet-title' }, strings.missions.lab.title),
        h('p', { class: 'card-teaser' }, strings.missions.lab.teaser),
        h('p', { class: 'card-note' }, `${strings.missions.lab.progress(lab.built.length)} · ${strings.lab.freeParts(freeParts(lab))}`),
        bench && freeParts(lab) >= bench.parts ? h('p', { class: 'card-ready' }, t.readyToBuild(strings.lab.gadgets[bench.id].name)) : null,
        h('div', { class: 'sheet-actions' }, h('button', { type: 'button', class: 'btn primary big', onclick: () => go('workshop') }, t.open)),
      ]);
    }
    const level = levelById(id);
    const locked = !isUnlocked(profile, id);
    const resume = resumeStep(profile, id);
    sheet([
      h('p', { class: 'eyebrow mono' }, level.copy.eyebrow),
      h('h2', { class: 'sheet-title' }, level.copy.title),
      h('p', { class: 'card-teaser' }, level.copy.teaser),
      starsRow(id),
      locked
        ? h('p', { class: 'card-locked' }, h('span', { class: 'pin-lock', html: icons.lock }), t.locked)
        : h(
            'div',
            { class: 'sheet-actions' },
            h('button', { type: 'button', class: 'btn primary big', onclick: () => go(`play/${id}`) }, resume ? t.resume : isSolved(profile, id) ? t.replay : t.play),
          ),
    ]);
  }

  // ---------- Agent sheet ----------

  function openAgent() {
    sfx('tap');
    sheet([
      agentCard(profile, { onSwitch: () => go('agents') }),
      h('h2', { class: 'section-title' }, strings.home.clearance),
      clearancePicker(profile.settings.difficulty, (level) => {
        profile.settings.difficulty = level;
        store.save();
        chipLevel.textContent = strings.difficulty[level];
      }),
      h('p', { class: 'mission-note' }, strings.map.clearanceNote),
      h('div', { class: 'sheet-actions' }, h('button', { type: 'button', class: 'btn primary', onclick: closeSheet }, strings.map.close)),
    ]);
  }

  const chipLevel = h('small', {}, strings.difficulty[profile.settings.difficulty]);
  const topbar = h(
    'header',
    { class: 'map-top' },
    h('button', { type: 'button', class: 'agent-chip', onclick: openAgent }, h('span', { class: 'emblem-badge', html: emblems[profile.emblem] ?? emblems.bolt }), h('span', {}, h('b', {}, profile.name), chipLevel)),
    h('button', {
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
    }),
  );

  const next = CAMPAIGN.find((id) => !isSolved(profile, id));
  const brief = h(
    'button',
    { type: 'button', class: 'map-brief', onclick: () => openCard(next ?? 'tower') },
    h('span', { class: 'radio-face', html: portrait('janni') }),
    h('span', {}, next ? strings.map.nextLine(levelById(next).copy.title) : pickRandom(strings.home.briefings)),
  );

  el.append(topbar, h('div', { class: 'map-area' }, mapWrap), brief);
  return {
    el,
    destroy() {
      closeSheet();
    },
  };
}
