// Riddles with four answers. A wrong pick just greys out; think again.
// params: { ids: [...] } picks riddles from strings.riddles, or { count } picks at random.

import { strings } from '../../i18n.js';
import { h } from '../../components/dom.js';
import { shuffle } from '../../engine/facts.js';

export function riddleGame(body, params, ctl) {
  const t = strings.game.mg.riddle;
  const pool = strings.riddles;
  const list = params.ids ? params.ids.map((id) => pool.find((r) => r.id === id)).filter(Boolean) : shuffle(pool).slice(0, params.count ?? 1);
  let i = 0;
  const progress = h('p', { class: 'code-progress mono' });
  const asker = params.speaker ? h('span', { class: 'riddle-asker mono' }, strings.speakers[params.speaker] ?? '') : null;
  const question = h('p', { class: 'riddle-q' });
  const answers = h('div', { class: 'riddle-answers' });
  body.append(progress, h('div', { class: 'riddle-card' }, asker, question), answers);

  function show() {
    const r = list[i];
    progress.textContent = list.length > 1 ? t.progress(i + 1, list.length) : '';
    question.textContent = r.q;
    answers.replaceChildren(
      ...shuffle([r.a, ...r.wrong]).map((text) =>
        h('button', { type: 'button', class: 'riddle-a', onclick: (e) => pick(e.currentTarget, text === r.a) }, text),
      ),
    );
  }

  function pick(btn, right) {
    if (ctl.done || btn.disabled) return;
    if (!right) {
      btn.disabled = true;
      btn.classList.add('is-wrong');
      ctl.sfx('soft');
      ctl.message(t.wrong, 'soft');
      return;
    }
    btn.classList.add('is-right');
    answers.querySelectorAll('button').forEach((b) => (b.disabled = true));
    ctl.sfx('good');
    i++;
    if (i >= list.length) ctl.success(params.successText ?? t.solved);
    else {
      ctl.message(t.right, 'good');
      setTimeout(() => {
        ctl.message('');
        show();
      }, 900);
    }
  }

  show();
  return {};
}
