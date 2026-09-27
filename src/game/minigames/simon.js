// Memory: watch and listen to a sequence, then repeat it.
// A slip just replays the same sequence. params: { rounds: [3, 4], style: 'pads' | 'phone', digits }

import { strings } from '../../i18n.js';
import { h } from '../../components/dom.js';

const PAD_COLORS = ['#e0566b', '#f2c14e', '#4c86e8', '#8bd17c'];

export function simonGame(body, params, ctl) {
  const t = strings.game.mg.simon;
  const phone = params.style === 'phone';
  const keys = phone ? ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'] : PAD_COLORS;
  const rounds = params.rounds ?? [3, 4];
  const fixed = params.digits ? [...params.digits].map((d) => keys.indexOf(d)) : null;
  let round = 0;
  let seq = [];
  let pos = 0;
  let listening = false;
  let timers = [];

  const status = h('p', { class: 'code-progress mono' });
  const display = phone ? h('div', { class: 'phone-display mono' }) : null;
  const pads = keys.map((k, i) =>
    h(
      'button',
      {
        type: 'button',
        class: phone ? 'pad phone-key' : 'pad',
        style: phone ? '' : `--c:${k}`,
        onpointerdown: (e) => {
          e.preventDefault();
          press(i);
        },
      },
      phone ? k : '',
    ),
  );
  body.append(status, display, h('div', { class: phone ? 'pads phone' : 'pads' }, pads));

  function makeSeq(len) {
    if (fixed && round === rounds.length - 1) return fixed.slice(0, len);
    const out = [];
    for (let i = 0; i < len; i++) {
      let k;
      do k = Math.floor(Math.random() * (phone ? 10 : keys.length));
      while (out.length && k === out[out.length - 1] && Math.random() < 0.6);
      out.push(phone && k === 9 ? 10 : k);
    }
    return out;
  }

  function lightUp(i, ms = 320) {
    const pad = pads[i];
    pad.classList.add('is-lit');
    ctl.beep(i % 16, ms / 1000);
    timers.push(setTimeout(() => pad.classList.remove('is-lit'), ms));
  }

  function play() {
    listening = false;
    pos = 0;
    if (display) display.textContent = '';
    status.textContent = `${t.round(round + 1, rounds.length)} · ${t.watch}`;
    pads.forEach((p) => p.classList.add('is-off'));
    const gap = 560;
    seq.forEach((k, i) => timers.push(setTimeout(() => lightUp(k), 500 + i * gap)));
    timers.push(
      setTimeout(() => {
        listening = true;
        pads.forEach((p) => p.classList.remove('is-off'));
        status.textContent = `${t.round(round + 1, rounds.length)} · ${t.go}`;
      }, 500 + seq.length * gap),
    );
  }

  function startRound() {
    seq = makeSeq(rounds[round]);
    play();
  }

  function press(i) {
    if (!listening || ctl.done) return;
    lightUp(i, 180);
    if (display) display.textContent += keys[i];
    if (seq[pos] !== i) {
      listening = false;
      ctl.sfx('soft');
      ctl.message(t.again, 'soft');
      timers.push(setTimeout(play, 900));
      return;
    }
    pos++;
    if (pos >= seq.length) {
      listening = false;
      round++;
      if (round >= rounds.length) {
        ctl.success(params.successText ?? t.done);
      } else {
        ctl.sfx('good');
        ctl.message(t.nice, 'good');
        timers.push(setTimeout(startRound, 900));
      }
    }
  }

  timers.push(setTimeout(startRound, 300));
  return {
    destroy() {
      timers.forEach(clearTimeout);
    },
  };
}
