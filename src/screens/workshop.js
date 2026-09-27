// #/workshop: Mynthe's gadget workshop. Parts found hidden in the missions are
// assembled into gadgets, and every gadget gives a small perk in the field.

import { strings } from '../i18n.js';
import { h, pickRandom } from '../components/dom.js';
import { brandBar } from '../components/chrome.js';
import { gadgetArt } from '../components/art.js';
import { GADGETS, benchGadget, build, canBuild, freeParts, labState } from '../engine/lab.js';
import { openMinigame } from '../game/minigames/index.js';
import { sfx, unlock } from '../game/audio.js';
import { portrait } from '../game/portraits.js';

export function renderWorkshop({ store }) {
  const profile = store.activeProfile();
  const state = labState(profile);
  const t = strings.lab;
  const el = h('div', { class: 'workshop' });
  let overlay = null;

  function render(justBuilt = null) {
    const bench = benchGadget(state);
    const free = freeParts(state);
    const line = justBuilt ? t.gadgets[justBuilt].mission.outro : { speaker: 'mynthe', text: bench ? pickRandom(t.briefings) : t.allBuilt };

    const cards = GADGETS.map((gd) => {
      const copy = t.gadgets[gd.id];
      const built = state.built.includes(gd.id);
      const onBench = bench?.id === gd.id;
      const ready = canBuild(state, gd.id);
      return h(
        'div',
        { class: `gadget-card${built ? ' is-built' : ''}${onBench ? ' is-bench' : ''}${justBuilt === gd.id ? ' is-new' : ''}` },
        h('div', { class: 'gadget-card-art', html: gadgetArt[gd.id] }),
        h('div', { class: 'gadget-card-name' }, copy.name),
        built
          ? h('div', { class: 'gadget-card-perk' }, h('b', {}, t.perkLabel), t.perks[gd.id])
          : onBench
          ? h(
              'div',
              { class: 'gadget-card-bench' },
              h('span', { class: 'progress-bar', 'aria-hidden': 'true' }, h('i', { style: `width:${Math.min(100, Math.round((free / gd.parts) * 100))}%` })),
              h('span', { class: 'mono' }, t.partsCount(Math.min(free, gd.parts), gd.parts)),
              ready ? h('button', { type: 'button', class: 'btn primary', onclick: () => assemble(gd) }, t.buildButton) : null,
            )
          : h('div', { class: 'gadget-card-locked mono' }, t.partsNeeded(gd.parts)),
        built ? h('span', { class: 'stamp gadget-stamp' }, t.built) : null,
      );
    });

    el.replaceChildren(
      h(
        'div',
        { class: 'page workshop-page' },
        brandBar({ back: true }),
        h('p', { class: 'eyebrow mono' }, t.eyebrow),
        h('h1', { class: 'page-title' }, strings.missions.lab.title),
        h(
          'p',
          { class: 'sheet-brief' },
          h('span', { class: 'radio-face', html: portrait(line.speaker) }),
          h('span', {}, h('b', { class: 'radio-name' }, strings.speakers[line.speaker]), h('br'), line.text),
        ),
        h(
          'div',
          { class: 'parts-summary' },
          h('i', { class: 'gear-icon big' }),
          h('div', {}, h('b', {}, t.freeParts(free)), h('span', {}, t.foundTotal(state.parts.length))),
        ),
        h('p', { class: 'mission-note' }, t.whereParts),
        h('div', { class: 'gadget-grid' }, cards),
      ),
    );
  }

  function assemble(gd) {
    unlock();
    sfx('tap');
    const host = h('div', { class: 'game mg-host' });
    document.body.append(host);
    overlay = openMinigame(host, 'assemble', { gadget: gd.id, parts: gd.parts, title: t.gadgets[gd.id].name }, {
      profile,
      onSuccess: () => {
        host.remove();
        overlay = null;
        build(state, gd.id);
        store.save();
        sfx('part');
        render(gd.id);
      },
      onClose: () => {
        host.remove();
        overlay = null;
      },
    });
  }

  render();
  return {
    el,
    destroy() {
      overlay?.destroy();
      document.querySelector('.mg-host')?.remove();
    },
  };
}
