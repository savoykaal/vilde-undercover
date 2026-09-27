// The deduction board: compare the three pieces of evidence with the suspects
// and point at the one who fits. A wrong guess only rules that person out.

import { strings } from '../../i18n.js';
import { h } from '../../components/dom.js';
import { CLUES, CULPRITS, SUSPECTS, SUSPECT_IDS, clueValue, mismatch } from '../../engine/mole.js';
import { SHIRT_COLORS, suspectArt } from '../../components/art.js';

export function deduceGame(body, params, ctl) {
  const t = strings.mole;
  const chapter = params.chapter ?? 0;
  const out = new Set(params.ruledOut ?? []);
  let pending = null;

  const evidence = h(
    'div',
    { class: 'evidence' },
    CLUES.map((clue) => {
      const v = clueValue(chapter, clue);
      return h(
        'span',
        { class: 'ev-chip' },
        clue === 'photo' ? h('i', { class: 'swatch', style: `background:${SHIRT_COLORS[v]}` }) : null,
        h('small', {}, t.attributes[clue]),
        h('b', {}, t.attrValue[clue](v)),
      );
    }),
  );

  const confirm = h('div', { class: 'accuse', hidden: true });
  const grid = h('div', { class: 'suspects' });
  body.append(h('p', { class: 'mg-sub mono' }, t.evidence), evidence, grid, confirm);

  function render() {
    grid.replaceChildren(
      ...SUSPECT_IDS.map((id) => {
        const s = t.suspects[id];
        const isOut = out.has(id);
        return h(
          'button',
          { type: 'button', class: `suspect${isOut ? ' is-out' : ''}${pending === id ? ' is-picked' : ''}`, disabled: isOut, onclick: () => pick(id) },
          h('span', { class: 'suspect-art', html: suspectArt[id] }),
          h('span', { class: 'suspect-name' }, s.name),
          h('span', { class: 'suspect-role mono' }, s.role),
          h(
            'span',
            { class: 'suspect-attrs' },
            CLUES.map((clue) => {
              const v = SUSPECTS[id][clue];
              const match = v === clueValue(chapter, clue);
              return h('span', { class: `attr${match ? ' is-match' : ''}` }, h('i', {}, t.attributes[clue]), h('b', {}, t.attrValue[clue](v)));
            }),
          ),
          isOut ? h('span', { class: 'stamp suspect-stamp' }, t.ruledOut) : null,
        );
      }),
    );
  }

  function pick(id) {
    if (ctl.done) return;
    pending = id;
    ctl.sfx('tap');
    confirm.hidden = false;
    confirm.replaceChildren(
      h('b', {}, t.accuseQuestion(t.suspects[id].name)),
      h('button', { type: 'button', class: 'btn primary', onclick: () => accuseNow(id) }, t.accuse),
    );
    render();
  }

  function accuseNow(id) {
    confirm.hidden = true;
    pending = null;
    if (id === CULPRITS[chapter]) {
      render();
      ctl.success(t.revealTitle(t.suspects[id].name));
      return;
    }
    out.add(id);
    const m = mismatch(chapter, id);
    const plain = (clue, value) => (clue === 'photo' ? t.colors[value] : value);
    ctl.sfx('soft');
    ctl.message(m ? `${t.digDeeper}: ${t.mismatch[m.clue](t.suspects[id].short, plain(m.clue, m.evidence), plain(m.clue, m.suspectValue))}` : t.digDeeper, 'soft');
    render();
  }

  render();
  return {};
}
