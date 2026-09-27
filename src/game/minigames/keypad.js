// The math lock: every correct answer lights one digit of the door code.
// Uses the adaptive question engine, hints and praise from the question card.
// params: { count, fixed: [[a, b], …] } — fixed facts are asked in order (story codes).

import { strings } from '../../i18n.js';
import { h } from '../../components/dom.js';
import { createQuestionCard } from '../../components/question-card.js';
import { choices, DIFFICULTIES } from '../../engine/facts.js';
import { createSession, nextQuestion, recordResult } from '../../engine/mastery.js';

function fixedQuestion(profile, [a, b]) {
  const input = (DIFFICULTIES[profile.settings.difficulty] ?? DIFFICULTIES.let).input;
  return {
    key: `${a}x${b}`,
    a,
    b,
    product: a * b,
    type: 'product',
    hidden: null,
    answer: a * b,
    choices: input === 'choice' ? choices(a, b) : null,
    warmup: false,
    input,
  };
}

export function keypadGame(body, params, ctl) {
  const t = strings.game.mg.keypad;
  const profile = ctl.profile;
  const world = ctl.world;
  const session = world ? (world.mathSession ??= createSession()) : createSession();
  const fixed = params.fixed ?? null;
  const count = fixed ? fixed.length : params.count ?? 2;
  let solved = 0;

  const leds = h(
    'div',
    { class: 'code-leds' },
    Array.from({ length: count }, () => h('span', { class: 'led' }, '––')),
  );
  const progress = h('p', { class: 'code-progress mono' }, t.progress(0, count));

  function ask() {
    const q = fixed ? fixedQuestion(profile, fixed[solved]) : nextQuestion(profile, session);
    card.ask(q);
  }

  const card = createQuestionCard({
    timerSeconds: null,
    advanceDelay: 650,
    onAttempt: ({ question, correct }) => {
      params.onAttempt?.(correct);
      if (!correct) {
        ctl.sfx('soft');
        return;
      }
      const led = leds.children[solved];
      led.textContent = String(question.answer).padStart(2, '0');
      led.classList.add('is-on');
      solved++;
      progress.textContent = t.progress(solved, count);
      ctl.sfx(solved >= count ? 'unlock' : 'good');
    },
    onComplete: ({ question, firstTry, ms }) => recordResult(profile, session, question, { firstTry, ms }),
    onNext: () => {
      if (solved >= count) {
        card.freeze();
        ctl.success(params.successText ?? t.open);
        return;
      }
      ask();
    },
  });

  body.append(h('div', { class: 'code-screen' }, leds, progress), card.el);
  ask();

  return {
    destroy() {
      card.destroy();
    },
  };
}
