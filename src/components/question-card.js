// One question at a time: prompt, answer input (choices or keypad),
// hint on the first miss, plain reveal on the second, praise on success.
//
// Flow for the host screen:
//   onAttempt({ question, value, correct, attempt })   every answer, for in-story reactions
//   onComplete({ question, firstTry, revealed, timedOut, attempts, ms })  once per question;
//       return the engine result to show the commutative shortcut tip
//   onNext()   the card is ready for the next question: call card.ask(question)

import { strings } from '../i18n.js';
import { hintFor, revealFor } from './hint.js';
import { createKeypad } from './keypad.js';
import { praise } from './praise.js';

function h(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

export function createQuestionCard({ timerSeconds = null, advanceDelay = 250, onAttempt, onComplete, onNext } = {}) {
  const el = h('section', 'qcard');
  const timer = h('div', 'qcard-timer');
  const timerFill = h('i');
  timer.append(timerFill);
  const stage = h('div', 'qcard-stage');
  const prompt = h('div', 'qcard-prompt');
  stage.append(prompt);
  const message = h('div', 'qcard-message');
  message.setAttribute('aria-live', 'polite');
  const input = h('div', 'qcard-input');
  const next = h('button', 'qcard-next primary', strings.card.next);
  next.type = 'button';
  next.hidden = true;
  input.append(next);
  el.append(timer, stage, message, input);

  let q = null;
  let state = 'idle'; // idle | asking | praised | revealed
  let attempts = 0;
  let startedAt = 0;
  let timedOut = false;
  let seconds = timerSeconds;
  let entry = '';
  let raf = 0;
  let advanceTimeout = 0;
  let keypad = null;
  let choiceRow = null;
  let slot = null;
  let lastResult = null;

  function say(msg, extra) {
    message.replaceChildren();
    if (!msg) {
      delete message.dataset.speaker;
      return;
    }
    message.dataset.speaker = msg.speaker;
    message.append(h('span', 'speaker', strings.speakers[msg.speaker]), h('span', 'text', msg.text));
    if (extra) message.append(h('span', 'tip', extra));
    message.classList.remove('is-fresh');
    void message.offsetWidth; // restart the entry animation
    message.classList.add('is-fresh');
  }

  function updateSlot() {
    slot.textContent = entry || '?';
    slot.classList.toggle('is-empty', !entry);
  }

  function renderPrompt() {
    prompt.replaceChildren();
    slot = h('span', 'slot');
    const parts =
      q.type === 'missing'
        ? [q.hidden === 'a' ? slot : q.a, '×', q.hidden === 'b' ? slot : q.b, '=', q.product]
        : [q.a, '×', q.b, '=', slot];
    for (const p of parts) {
      prompt.append(p === slot ? slot : h('span', p === '×' || p === '=' ? 'op' : 'num', String(p)));
    }
    prompt.setAttribute('aria-label', strings.card.promptLabel(q));
    updateSlot();
  }

  function renderInput() {
    choiceRow?.remove();
    choiceRow = null;
    if (q.input === 'choice') {
      keypad?.destroy();
      keypad = null;
      choiceRow = h('div', 'choices');
      for (const n of q.choices) {
        const b = h('button', 'choice', String(n));
        b.type = 'button';
        b.addEventListener('click', () => {
          b.blur();
          submit(n, b);
        });
        choiceRow.append(b);
      }
      input.prepend(choiceRow);
      return;
    }
    if (!keypad) {
      keypad = createKeypad({
        maxDigits: 3,
        onChange: (v) => {
          if (state !== 'asking') return;
          entry = v;
          updateSlot();
        },
        onConfirm: (v) => {
          if (state !== 'asking') return;
          if (!v) return say({ speaker: 'mynthe', text: strings.card.emptyNudge });
          submit(Number(v));
        },
      });
      input.prepend(keypad.el);
    }
    keypad.setEnabled(true);
    keypad.clear();
  }

  function startTimer() {
    timer.classList.toggle('is-off', !seconds);
    timer.classList.remove('is-done');
    timerFill.style.transform = 'scaleX(1)';
    if (!seconds) return;
    const total = seconds * 1000;
    const tick = () => {
      const left = Math.max(0, 1 - (performance.now() - startedAt) / total);
      timerFill.style.transform = `scaleX(${left})`;
      if (left > 0) {
        raf = requestAnimationFrame(tick);
      } else if (state === 'asking') {
        timedOut = true;
        timer.classList.add('is-done');
        if (attempts === 0) say({ speaker: 'soeren', text: strings.card.timeUp });
      }
    };
    raf = requestAnimationFrame(tick);
  }

  function stopTimer() {
    cancelAnimationFrame(raf);
  }

  function complete(firstTry, revealed) {
    stopTimer();
    lastResult =
      onComplete?.({ question: q, firstTry, revealed, timedOut, attempts, ms: performance.now() - startedAt }) ?? null;
  }

  function lockInputs() {
    keypad?.setEnabled(false);
    choiceRow?.querySelectorAll('.choice').forEach((b) => {
      b.disabled = true;
      if (Number(b.textContent) === q.answer) b.classList.add('is-answer');
    });
  }

  function submit(value, button) {
    if (state !== 'asking') return;
    attempts++;
    const correct = value === q.answer;
    onAttempt?.({ question: q, value, correct, attempt: attempts });

    if (correct) {
      entry = String(q.answer);
      updateSlot();
      slot.classList.add('is-solved');
      state = 'praised';
      lockInputs();
      complete(attempts === 1, false);
      say(praise.next(q), lastResult?.shortcut ? strings.shortcut(q.a, q.b) : null);
      advanceTimeout = setTimeout(() => onNext?.(), advanceDelay);
      return;
    }

    if (button) button.disabled = true;
    entry = '';
    if (attempts === 1) {
      keypad?.clear();
      updateSlot();
      say(hintFor(q));
      return;
    }

    state = 'revealed';
    entry = String(q.answer);
    updateSlot();
    slot.classList.add('is-revealed');
    lockInputs();
    complete(false, true);
    say(revealFor(q));
    next.hidden = false;
  }

  function proceed() {
    if (state !== 'revealed') return;
    state = 'idle';
    next.hidden = true;
    onNext?.();
  }
  next.addEventListener('click', proceed);

  function onKey(e) {
    if (state === 'revealed' && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      proceed();
    }
  }
  document.addEventListener('keydown', onKey);

  function ask(question, options = {}) {
    stopTimer();
    clearTimeout(advanceTimeout);
    const keepMessage = state === 'praised';
    q = question;
    attempts = 0;
    timedOut = false;
    entry = '';
    lastResult = null;
    seconds = options.timerSeconds !== undefined ? options.timerSeconds : timerSeconds;
    state = 'asking';
    next.hidden = true;
    if (!keepMessage) say(null);
    renderPrompt();
    renderInput();
    startedAt = performance.now();
    startTimer();
  }

  return {
    el,
    ask,
    say,
    get question() {
      return q;
    },
    destroy() {
      stopTimer();
      clearTimeout(advanceTimeout);
      document.removeEventListener('keydown', onKey);
      keypad?.destroy();
      el.remove();
    },
  };
}
