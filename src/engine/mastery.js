// Adaptive fact selection with Leitner boxes 0–4.
//
// Each fact has its own record. Correct on first try promotes one box,
// a miss drops it to box 0. Selection is weighted towards low boxes, high
// error rates, slow answers and facts not seen for a while.

import { DIFFICULTIES, choices, factKey, factPool, isHardFact, parseKey, twinKey } from './facts.js';

export const MAX_BOX = 4;
export const MASTERY_STREAK = 3;
export const MASTERY_MEDIAN_MS = 4000;

const BOX_WEIGHT = [16, 8, 4, 2, 1];
const UNSEEN_WEIGHT = 6;
const RECENT_SAMPLES = 5;
const MAX_SAMPLE_MS = 30000;
const SHORTCUT_TIPS = 3;
const WARMUP_QUESTIONS = 2;
const RETRY_GAP = 3;
const RECENT_WINDOW = 4;
const ANCHOR_FACTORS = [1, 2, 10];
const DAY_MS = 86400000;

export function emptyRecord() {
  return { correct: 0, wrong: 0, streak: 0, lastSeen: 0, avgMs: 0, box: 0, recentMs: [], credit: 0 };
}

export const getRecord = (profile, key) => profile.facts[key] ?? emptyRecord();

function ensureRecord(profile, key) {
  profile.facts[key] ??= emptyRecord();
  return profile.facts[key];
}

export function median(values) {
  if (!values.length) return Infinity;
  const s = [...values].sort((x, y) => x - y);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function isMastered(rec) {
  return (
    rec.box === MAX_BOX &&
    rec.streak >= MASTERY_STREAK &&
    rec.recentMs.length >= MASTERY_STREAK &&
    median(rec.recentMs) < MASTERY_MEDIAN_MS
  );
}

export function factWeight(rec, now) {
  const seen = rec.correct + rec.wrong;
  if (seen === 0 && rec.box === 0) return UNSEEN_WEIGHT;
  let w = BOX_WEIGHT[rec.box];
  if (seen > 0) w *= 1 + 2 * (rec.wrong / seen);
  if (rec.avgMs > MASTERY_MEDIAN_MS) w *= 1 + Math.min(1, (rec.avgMs - MASTERY_MEDIAN_MS) / MASTERY_MEDIAN_MS);
  if (rec.lastSeen) w *= 1 + Math.min(2, (now - rec.lastSeen) / DAY_MS);
  return w;
}

function difficultyOf(profile) {
  return DIFFICULTIES[profile.settings?.difficulty] ?? DIFFICULTIES.let;
}

export function createSession(now = Date.now()) {
  return { startedAt: now, count: 0, history: [], retry: [] };
}

function weightedPick(keys, weightOf, rng) {
  const weights = keys.map(weightOf);
  const total = weights.reduce((s, w) => s + w, 0);
  let r = rng() * total;
  for (let i = 0; i < keys.length; i++) {
    r -= weights[i];
    if (r <= 0) return keys[i];
  }
  return keys[keys.length - 1];
}

// Facts she reliably knows, or easy anchors (×1, ×2, ×10) for a new agent.
function pickWarmup(profile, candidates, rng) {
  const reliable = candidates.filter((k) => {
    const r = getRecord(profile, k);
    const seen = r.correct + r.wrong;
    return r.box >= 2 && r.streak >= 2 && seen > 0 && r.correct / seen >= 0.8;
  });
  if (reliable.length) {
    const best = Math.max(...reliable.map((k) => getRecord(profile, k).box));
    const top = reliable.filter((k) => getRecord(profile, k).box === best);
    return top[Math.floor(rng() * top.length)];
  }
  const anchors = candidates.filter((k) => {
    const [a, b] = parseKey(k);
    return (ANCHOR_FACTORS.includes(a) || ANCHOR_FACTORS.includes(b)) && getRecord(profile, k).wrong === 0;
  });
  const list = anchors.length ? anchors : candidates;
  return list[Math.floor(rng() * list.length)];
}

export function nextQuestion(profile, session, { rng = Math.random, now = Date.now() } = {}) {
  const diff = difficultyOf(profile);
  const pool = factPool(diff.id);
  const last = session.history.at(-1);
  const candidates = pool.filter((k) => k !== last);
  const warmup = session.count < WARMUP_QUESTIONS;
  let key;

  if (warmup) key = pickWarmup(profile, candidates, rng);

  if (!key) {
    const i = session.retry.findIndex((r) => r.due <= session.count && candidates.includes(r.key));
    if (i >= 0) key = session.retry.splice(i, 1)[0].key;
  }

  if (!key) {
    let group = candidates;
    if (diff.hardShare != null) {
      const hard = candidates.filter(isHardFact);
      const easy = candidates.filter((k) => !isHardFact(k));
      group = (rng() < diff.hardShare ? hard : easy);
      if (!group.length) group = candidates;
    }
    const recent = session.history.slice(-RECENT_WINDOW);
    key = weightedPick(
      group,
      (k) => factWeight(getRecord(profile, k), now) * (recent.includes(k) ? 0.2 : 1) * (0.75 + rng() * 0.5),
      rng,
    );
  }

  session.count++;
  session.history.push(key);

  const [a, b] = parseKey(key);
  const question = { key, a, b, product: a * b, type: 'product', hidden: null, answer: a * b, choices: null, warmup, input: diff.input };
  if (!warmup && rng() < diff.missingFactorShare) {
    question.type = 'missing';
    question.hidden = rng() < 0.5 ? 'a' : 'b';
    question.answer = question.hidden === 'a' ? a : b;
  }
  if (diff.input === 'choice') question.choices = choices(a, b, rng);
  return question;
}

export function localDay(now) {
  const d = new Date(now);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// firstTry: answered correctly without any hint. ms: time to that answer.
export function recordResult(profile, session, question, { firstTry, ms, now = Date.now() }) {
  const key = question.key;
  const rec = ensureRecord(profile, key);
  const wasMastered = isMastered(rec);
  const sample = Math.min(Math.max(0, ms), MAX_SAMPLE_MS);
  rec.lastSeen = now;

  let shortcut = false;
  if (firstTry) {
    rec.correct++;
    rec.streak++;
    rec.box = Math.min(MAX_BOX, rec.box + 1);
    rec.recentMs = [...rec.recentMs, sample].slice(-RECENT_SAMPLES);
    rec.avgMs = rec.avgMs ? Math.round(rec.avgMs * 0.7 + sample * 0.3) : sample;

    const twin = twinKey(key);
    if (twin !== key) {
      const t = ensureRecord(profile, twin);
      if (t.box < rec.box) {
        t.credit += 0.5;
        if (t.credit >= 1) {
          t.credit -= 1;
          t.box = Math.min(t.box + 1, rec.box);
        }
        if (profile.meta.shortcutTips < SHORTCUT_TIPS) {
          profile.meta.shortcutTips++;
          shortcut = true;
        }
      }
    }
  } else {
    rec.wrong++;
    rec.streak = 0;
    rec.box = 0;
    rec.credit = 0;
    session.retry.push({ key, due: session.count + RETRY_GAP });
  }

  const day = (profile.log[localDay(now)] ??= { questions: 0, firstTry: 0, ms: 0 });
  day.questions++;
  if (firstTry) day.firstTry++;
  day.ms += sample;
  profile.meta.totalAnswered++;

  const mastered = isMastered(rec);
  return { box: rec.box, mastered, newlyMastered: mastered && !wasMastered, shortcut, totalAnswered: profile.meta.totalAnswered };
}

export function masteryGrid(profile) {
  const rows = [];
  for (let a = 1; a <= 10; a++) {
    const row = [];
    for (let b = 1; b <= 10; b++) {
      const key = factKey(a, b);
      const r = getRecord(profile, key);
      row.push({ key, a, b, box: r.box, seen: r.correct + r.wrong, mastered: isMastered(r) });
    }
    rows.push(row);
  }
  return rows;
}

export function weakestFacts(profile, n = 5) {
  return Object.entries(profile.facts)
    .map(([key, r]) => ({ key, ...r, seen: r.correct + r.wrong }))
    .filter((r) => r.seen > 0)
    .map((r) => ({ ...r, accuracy: r.correct / r.seen }))
    .sort((x, y) => x.accuracy - y.accuracy || x.box - y.box || y.avgMs - x.avgMs)
    .slice(0, n);
}
