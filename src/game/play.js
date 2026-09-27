// Runs one level: canvas + HUD + controls + minigames + the level script.
// The caller gets onDone(result) when the level is solved and onQuit() when she leaves.

import { strings } from '../i18n.js';
import { h, pickRandom } from '../components/dom.js';
import { World } from './world.js';
import { createRenderer } from './render.js';
import { createInput } from './input.js';
import { createFx } from './fx.js';
import { duckMusic, isMuted, playMusic, setMuted, sfx, stopMusic, unlock } from './audio.js';
import { openMinigame } from './minigames/index.js';
import { portrait } from './portraits.js';

const t = strings.game;

export function playLevel({ root, level, profile, resumeStep = 0, extra = {}, foundParts = new Set(), onPart, onStep, onDone, onQuit, onCaught, onEvent, intro = true }) {
  const copy = level.copy ?? {};
  const world = new World(level, {
    difficulty: profile.settings.difficulty,
    agentName: profile.name,
    foundParts,
    extra,
  });

  // ---------- DOM ----------
  const canvas = h('canvas', { class: 'game-canvas' });
  const goalText = h('span', { class: 'goal-text' });
  const goal = h('div', { class: 'goal hud-block', 'aria-live': 'polite' }, h('span', { class: 'goal-dot' }), goalText);
  const itemsEl = h('div', { class: 'hud-items hud-block' });
  const pauseBtn = h('button', { type: 'button', class: 'hud-btn', 'aria-label': t.hud.pause, onclick: () => pause() }, h('span', { class: 'pause-icon' }));
  const radio = h('div', { class: 'radio hud-block', hidden: true, onclick: () => nextLine(true) });
  const meterFill = h('i');
  const meterLabel = h('span');
  const meter = h('div', { class: 'hud-meter hud-block', hidden: true }, meterLabel, h('b', {}, meterFill));
  const timerEl = h('div', { class: 'hud-timer hud-block mono', hidden: true });
  const actionLabel = h('span', { class: 'action-label' });
  const actionBtn = h('button', { type: 'button', class: 'action-btn', hidden: true, onclick: () => doAction() }, h('span', { class: 'action-icon' }), actionLabel);
  const fade = h('div', { class: 'fade' });
  const flash = h('div', { class: 'flash' });
  const banner = h('div', { class: 'banner', hidden: true });
  const hint = h('div', { class: 'move-hint', hidden: true }, h('span', { class: 'move-hand' }), h('b', {}, t.hud.moveHint));
  const top = h('div', { class: 'hud-top' }, h('div', { class: 'hud-row' }, pauseBtn, goal, itemsEl), radio, h('div', { class: 'hud-row2' }, meter, timerEl));
  const zone = h('div', { class: 'game-zone' });
  const el = h('div', { class: 'game', dataset: { theme: level.theme } }, canvas, zone, top, hint, actionBtn, banner, flash, fade);
  root.append(el);
  document.body.classList.add('is-playing');

  const renderer = createRenderer(canvas);
  const fx = createFx();
  let paused = true;
  let overlay = null; // sheet or minigame
  let raf = 0;
  let last = performance.now();
  let startedAt = 0;
  let destroyed = false;
  let lastAction = null;
  const partsFound = new Set();

  const input = createInput(zone, { onAction: () => doAction(), onPause: () => (overlay ? null : pause()) });

  function layout() {
    renderer.resize();
    const topH = top.getBoundingClientRect().bottom - el.getBoundingClientRect().top;
    renderer.setInsets(Math.max(0, topH - 10), 20);
  }
  const onResize = () => {
    layout();
    renderer.snap(world);
  };
  window.addEventListener('resize', onResize);

  // ---------- Radio ----------
  const queue = [];
  let lineTimer = 0;
  let typeTimer = 0;

  function showLine(line) {
    radio.hidden = false;
    radio.dataset.speaker = line.speaker;
    const body = h('span', { class: 'radio-text' });
    radio.replaceChildren(
      h('span', { class: 'radio-face', html: portrait(line.speaker) }),
      h('span', { class: 'radio-body' }, h('b', { class: 'radio-name' }, strings.speakers[line.speaker] ?? line.speaker), body),
    );
    radio.classList.remove('is-in');
    void radio.offsetWidth;
    radio.classList.add('is-in');
    sfx('radio');
    let i = 0;
    clearInterval(typeTimer);
    typeTimer = setInterval(() => {
      i += 2;
      body.textContent = line.text.slice(0, i);
      if (i >= line.text.length) clearInterval(typeTimer);
    }, 22);
    clearTimeout(lineTimer);
    lineTimer = setTimeout(() => nextLine(false), Math.max(2600, 1300 + line.text.length * 55));
  }

  function nextLine(skip) {
    clearTimeout(lineTimer);
    if (skip && typeTimer) clearInterval(typeTimer);
    const line = queue.shift();
    if (line) showLine(line);
    else radio.hidden = true;
  }

  function say(speaker, text) {
    if (!text) return;
    queue.push({ speaker, text });
    if (radio.hidden) nextLine(false);
  }

  // ---------- Banner (big centre text) ----------
  let bannerTimer = 0;
  function showBanner(text, tone = '') {
    banner.textContent = text;
    banner.className = `banner ${tone}`;
    banner.hidden = false;
    void banner.offsetWidth;
    banner.classList.add('is-in');
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => (banner.hidden = true), 1400);
  }

  // ---------- Events from the world ----------
  function handleEvents() {
    for (const ev of world.out.splice(0)) {
      switch (ev.type) {
        case 'say':
          say(ev.speaker, ev.text);
          break;
        case 'goal':
          goalText.textContent = ev.text;
          goal.classList.remove('is-new');
          void goal.offsetWidth;
          goal.classList.add('is-new');
          break;
        case 'sfx':
          sfx(ev.name);
          break;
        case 'shake':
          renderer.shake(ev.amount);
          break;
        case 'floater':
          fx.floater(ev.x, ev.y, ev.text, ev.color);
          break;
        case 'confetti':
          fx.confetti(ev.x, ev.y, ev.n);
          sfx('confetti');
          break;
        case 'locked':
          fx.floater(ev.x, ev.y - 0.6, typeof ev.need === 'string' ? t.hud.needCard : t.hud.locked, '#ff9aa8');
          sfx('soft');
          break;
        case 'part':
          partsFound.add(ev.id);
          fx.burst(ev.x, ev.y, { n: 22, colors: ['#ff3f9e', '#ffb3d6', '#fff'], speed: 3 });
          fx.floater(ev.x, ev.y - 0.5, ev.ghost ? t.hud.partAgain : t.hud.part, '#ffb3d6');
          if (!ev.ghost) onPart?.(ev.id);
          updateItems();
          break;
        case 'smoke':
          sfx('whoosh');
          fx.burst(ev.x, ev.y, { n: 40, colors: ['#d8d4e8', '#a9a4b8', '#ffffff'], speed: 2.2, life: 1.2, size: 0.28, drag: 3 });
          fx.floater(ev.x, ev.y - 0.6, t.hud.smoke, '#e9e4f5');
          say('mynthe', t.hud.smokeLine);
          break;
        case 'caught': {
          onCaught?.(ev);
          sfx('caught');
          renderer.shake(0.6);
          flash.classList.remove('is-on');
          void flash.offsetWidth;
          flash.classList.add('is-on');
          showBanner(t.hud.spotted, 'is-bad');
          setTimeout(() => fade.classList.add('is-on'), 550);
          const line = ev.text ? [ev.speaker ?? 'soeren', ev.text] : pickRandom(t.caughtLines);
          pendingCaughtLine = line;
          break;
        }
        case 'respawn':
          renderer.snap(world);
          fx.clear();
          setTimeout(() => fade.classList.remove('is-on'), 60);
          if (pendingCaughtLine) {
            queue.length = 0;
            say(pendingCaughtLine[0], typeof pendingCaughtLine[1] === 'function' ? pendingCaughtLine[1](profile.name) : pendingCaughtLine[1]);
            pendingCaughtLine = null;
          }
          break;
        case 'step':
          onStep?.(ev.index);
          break;
        case 'music':
          playMusic(ev.name);
          break;
        case 'banner':
          showBanner(ev.text, ev.tone);
          break;
        case 'complete':
          finish();
          break;
        default:
          onEvent?.(ev);
          break;
      }
    }
  }
  let pendingCaughtLine = null;

  function updateItems() {
    const list = [];
    for (const item of world.items) {
      const def = level.items?.[item];
      if (def) list.push(h('span', { class: 'item-chip', style: `--c:${def.color}`, title: def.label }, h('i'), def.short ?? ''));
    }
    const total = world.partsHere.length;
    if (total) {
      const got = world.entities.filter((e) => e.type === 'part' && (e.ghost || !e.active)).length;
      list.push(h('span', { class: 'part-chip', 'aria-label': t.hud.partsLabel }, h('i', { class: 'gear-icon' }), `${got}/${total}`));
    }
    itemsEl.replaceChildren(...list);
  }

  // ---------- Action ----------
  function doAction() {
    if (paused || overlay || world.freeze > 0) return;
    const a = world.action();
    if (!a) return;
    unlock();
    if (a.kind === 'hide' || a.kind === 'unhide') {
      world.act();
      return;
    }
    const task = a.entity;
    openTask(task);
  }

  function openTask(task) {
    input.reset();
    paused = true;
    duckMusic(true);
    overlay = openMinigame(el, task.game, {
      ...task.params,
      title: task.title ?? t.actions[task.label] ?? task.label,
    }, {
      profile,
      world,
      say,
      onSuccess: () => {
        overlay = null;
        world.completeTask(task.id);
        fx.burst(task.x, task.y, { n: 26, colors: ['#8bd17c', '#fff', '#ff3f9e'], speed: 3.2 });
        resume();
      },
      onClose: () => {
        overlay = null;
        resume();
      },
    });
  }

  function refreshAction() {
    const a = paused || overlay ? null : world.action();
    const key = a ? `${a.kind}:${a.entity.id ?? a.entity.x}` : null;
    if (key === lastAction) return;
    lastAction = key;
    if (!a) {
      actionBtn.hidden = true;
      return;
    }
    actionBtn.hidden = false;
    actionBtn.dataset.kind = a.kind;
    actionLabel.textContent =
      a.kind === 'hide' ? t.actions.hide : a.kind === 'unhide' ? t.actions.unhide : t.actions[a.entity.label] ?? a.entity.label ?? t.actions.use;
    actionBtn.classList.remove('is-pop');
    void actionBtn.offsetWidth;
    actionBtn.classList.add('is-pop');
    sfx('tap');
  }

  // ---------- HUD values ----------
  function refreshHud() {
    const m = world.hud.meter;
    meter.hidden = !m;
    if (m) {
      meterLabel.textContent = m.label;
      meterFill.style.width = `${Math.round(Math.max(0, Math.min(1, m.value)) * 100)}%`;
      meter.dataset.tone = m.tone ?? 'ok';
    }
    const tm = world.hud.timer;
    timerEl.hidden = tm == null;
    if (tm != null) {
      const s = Math.max(0, Math.ceil(tm));
      timerEl.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      timerEl.classList.toggle('is-low', s <= 15);
    }
    if (world.hud.itemsDirty) {
      world.hud.itemsDirty = false;
      updateItems();
    }
  }

  // ---------- Loop ----------
  function frame(now) {
    if (destroyed) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(1 / 30, (now - last) / 1000);
    last = now;
    if (!paused && !overlay) {
      const before = world.items.size;
      world.update(dt, input.vector);
      if (world.items.size !== before) updateItems();
      handleEvents();
      if (!hint.hidden && (Math.abs(input.vector.x) + Math.abs(input.vector.y) > 0.3)) hint.hidden = true;
    }
    fx.update(dt);
    renderer.follow(world, dt);
    const target = world.goalTarget && !world.completed ? targetPos(world.goalTarget) : null;
    renderer.draw(world, fx, { t: world.t, target });
    refreshAction();
    refreshHud();
  }

  function targetPos(id) {
    if (typeof id === 'object') return id;
    const e = world.byId.get(id);
    return e && (e.active || e.type === 'door') ? e : null;
  }

  // ---------- Sheets ----------
  function sheet(content, cls = '') {
    const s = h('div', { class: `sheet-wrap ${cls}` }, h('div', { class: 'sheet' }, content));
    el.append(s);
    requestAnimationFrame(() => s.classList.add('is-in'));
    return {
      el: s,
      close() {
        s.remove();
      },
    };
  }

  function showIntro() {
    const canResume = resumeStep > 0;
    let s = null;
    const begin = (step) => {
      unlock();
      sfx('tap');
      s.close();
      overlay = null;
      startWorld(step);
    };
    const buttons = canResume
      ? [
          h('button', { type: 'button', class: 'btn primary big', onclick: () => begin(resumeStep) }, t.intro.resume),
          h('button', { type: 'button', class: 'btn', onclick: () => begin(0) }, t.intro.restart),
        ]
      : [h('button', { type: 'button', class: 'btn primary big', onclick: () => begin(0) }, t.intro.start)];
    s = sheet(
      [
        h('p', { class: 'eyebrow mono' }, copy.eyebrow ?? ''),
        h('h1', { class: 'sheet-title' }, copy.title ?? ''),
        copy.brief ? h('p', { class: 'sheet-brief', dataset: { speaker: copy.briefSpeaker ?? 'janni' } }, h('span', { class: 'radio-face', html: portrait(copy.briefSpeaker ?? 'janni') }), h('span', {}, typeof copy.brief === 'function' ? copy.brief(profile.name) : copy.brief)) : null,
        copy.tips ? h('ul', { class: 'sheet-tips' }, copy.tips.map((tip) => h('li', {}, tip))) : null,
        h('div', { class: 'sheet-actions' }, buttons),
        h('button', { type: 'button', class: 'link-btn', onclick: () => quit() }, t.intro.back),
      ],
      'is-intro',
    );
    overlay = s;
  }

  function startWorld(step) {
    world.start(step);
    handleEvents();
    updateItems();
    renderer.snap(world);
    startedAt = performance.now();
    paused = false;
    playMusic(level.music ?? 'sneak');
    duckMusic(false);
    if (level.moveHint && step === 0) hint.hidden = false;
  }

  function pause() {
    if (paused || overlay) return;
    paused = true;
    input.reset();
    duckMusic(true);
    let s = null;
    const soundBtn = h('button', { type: 'button', class: 'btn', onclick: () => {
      setMuted(!isMuted());
      soundBtn.textContent = isMuted() ? t.pause.soundOff : t.pause.soundOn;
    } }, isMuted() ? t.pause.soundOff : t.pause.soundOn);
    s = sheet(
      [
        h('p', { class: 'eyebrow mono' }, copy.eyebrow ?? ''),
        h('h1', { class: 'sheet-title' }, t.pause.title),
        h('p', { class: 'sheet-goal' }, h('span', { class: 'goal-dot' }), world.goalText),
        h(
          'div',
          { class: 'sheet-actions' },
          h('button', { type: 'button', class: 'btn primary big', onclick: () => { s.close(); overlay = null; resume(); } }, t.pause.resume),
          soundBtn,
          h('button', { type: 'button', class: 'btn', onclick: () => { s.close(); overlay = null; restart(); } }, t.pause.restart),
          h('button', { type: 'button', class: 'btn', onclick: () => quit() }, t.pause.quit),
        ),
      ],
      'is-pause',
    );
    overlay = s;
  }

  function resume() {
    paused = false;
    last = performance.now();
    duckMusic(false);
  }

  function restart() {
    destroy();
    playLevel({ root, level, profile, resumeStep: 0, extra, foundParts: new Set([...foundParts, ...partsFound]), onPart, onStep, onDone, onQuit, onCaught, onEvent, intro: false });
  }

  function quit() {
    destroy();
    stopMusic();
    onQuit?.();
  }

  function finish() {
    paused = true;
    input.reset();
    if (!level.tower) stopMusic();
    setTimeout(() => {
      if (destroyed) return;
      sfx(level.tower ? 'good' : 'complete');
      const result = {
        caught: world.caughtCount,
        partsFound: [...partsFound],
        partsTotal: world.partsHere,
        ms: performance.now() - startedAt,
        world,
      };
      onDone?.(result, { el, sheet, destroy, restart, quit });
    }, level.tower ? 350 : 700);
  }

  function onVisibility() {
    if (document.hidden && !paused && !overlay) pause();
  }
  document.addEventListener('visibilitychange', onVisibility);

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cancelAnimationFrame(raf);
    clearTimeout(lineTimer);
    clearInterval(typeTimer);
    clearTimeout(bannerTimer);
    overlay?.destroy?.();
    input.destroy();
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    document.body.classList.remove('is-playing');
    el.remove();
  }

  if (/[?&]debug\b/.test(location.search)) window.__avWorld = world; // test hook

  layout();
  world.goalText = '';
  renderer.snap(world);
  raf = requestAnimationFrame(frame);
  if (intro) showIntro();
  else startWorld(0);

  return { world, destroy, el };
}
