# Claude Code build prompt — "Agent Vilde: Familiebureauet"

> Paste everything below the line into Claude Code in an empty project folder.

---

Build me a multiplication practice game for my 10-year-old daughter Vilde. She is not confident with her tables yet, so the game must make her feel competent, not tested. Read this whole brief before writing any code, then follow the build order at the bottom.

## 1. Concept

Vilde's family secretly runs an intelligence bureau from the basement. She has just been cleared as its youngest field agent. Every lock, code, frequency and clue in the game is a multiplication fact.

Characters (use these names exactly, they are her real family):

- **Vilde** — the player. Newest agent, sharp, quick on her feet.
- **Søren** (Dad) — runs extraction and logistics. Calm, dry humour.
- **Janni** (Mom) — bureau chief. Gives the mission briefings. Warm but precise.
- **Frej** (older brother) — backup in the van. Cocky, always eating, secretly proud of her.
- **Mynthe** (older sister) — tech and gadgets. Talks fast, invents things, feeds hints over the earpiece.

This is inspired by family-spy-comedy shows in general. Do **not** reference, name or reuse characters, logos, plot points or dialogue from any existing TV series. All names, story and text must be original.

## 2. Language

All player-facing text in **Danish**. Natural, modern Danish that a 10-year-old reads easily — short sentences, no stiff translationese.

Keep every user-facing string in a single `src/i18n.js` file as one exported object so the language can be swapped later. No hardcoded strings in components.

## 3. Tech constraints

- Plain **HTML + CSS + vanilla JavaScript (ES modules)**. No React, no build step, no bundler, no npm dependencies.
- Must run by opening `index.html` directly in a browser (`file://`), fully offline.
- All state persisted in `localStorage`.
- No external fonts, CDNs, images from the web, or network calls of any kind. Any graphics must be inline SVG or CSS that you generate yourself.
- Works on both a laptop and an iPad (touch targets ≥ 44px, responsive down to 768px wide).

Suggested structure:

```
index.html
styles/
  main.css
src/
  main.js          // routing between screens
  i18n.js          // all Danish strings
  engine/
    facts.js       // fact generation + difficulty rules
    mastery.js     // adaptive selection + spaced repetition
    storage.js     // localStorage wrapper, versioned schema
  screens/
    home.js
    mission-hq.js
    mission-vault.js
    mission-mole.js
    mission-lab.js
    parent.js
  components/
    question-card.js
    hint.js
    progress.js
```

## 4. Difficulty levels

Chosen on the home screen, changeable any time, stored per-profile.

| | **Let** (easy) | **Mellem** (medium) | **Svær** (hard) |
|---|---|---|---|
| Tables | 1–5 | 1–5 | 1–10 |
| Answer input | 4 multiple-choice buttons | typed number | typed number |
| Timer | none | optional, generous | on by default, tighter |
| Problem types | `a × b = ?` | `a × b = ?` | `a × b = ?` plus missing-factor `3 × ? = 12` |

**Easy distractors matter.** Never generate random wrong options. For `4 × 3 = 12`, offer things like 11, 15, 16 — adjacent multiples, the sum (7), or an off-by-one-row answer. Plausible distractors force real recall; silly ones let her guess by elimination.

**Hard weighting:** roughly 70% of facts drawn from 6–10, 30% from 1–5, so the easier tables stay warm.

## 5. Adaptive engine (the most important part)

Do not serve random questions. Model each fact individually.

- Track every fact `a × b` for a ∈ 1..10, b ∈ 1..10 as its own record: `{ correct, wrong, streak, lastSeen, avgMs, box }`.
- **Leitner-style boxes 0–4.** Correct answer promotes a fact one box; wrong answer drops it to box 0. Lower box = shown far more often.
- Weight selection by: low box, high error rate, slow average response time, long time since last seen. Add a little randomness so it doesn't feel robotic.
- A fact counts as **mastered** at box 4 with 3 consecutive correct answers *and* median response under 4 seconds. Being slow is not mastery.
- **Commutativity:** treat `3 × 7` and `7 × 3` as linked. A correct answer on one gives partial credit to the other. Surface this to Vilde explicitly the first few times: "Agent-genvej: ved du 3 × 7, ved du også 7 × 3."
- Never repeat the same fact twice in a row.
- Open a new session with two facts she reliably knows before introducing anything shaky. Start every session with a win.

## 6. Answering rules (applies everywhere)

- Wrong answer → **never** a red buzzer, never "Forkert!". Show a hint and let her try again.
- Hint escalation on the first wrong try: skip-counting ("3, 6, 9, 12 …"), or a known anchor ("4 × 5 = 20, så 4 × 6 er 4 mere").
- Second wrong try → show the answer plainly with the skip-count laid out, mark the fact for early repetition, move on with no fuss.
- In-story wrong answers are setbacks, never failures: the guard patrol moves a step closer, the clue stays blurry, the gadget part needs one more try. She can always continue.
- Correct answers get short, varied, specific praise in character — rotate lines from a pool so nothing repeats within a session. Frej teases, Mynthe geeks out, Søren stays dry, Janni is proud.

## 7. The four missions

Selectable from the home screen as case files on a board. All four available immediately — no gating. Each shows its own progress. Each saves and resumes mid-mission.

### Mission 1 — "Kælder-HQ" (story campaign)

Structured, sequential, story-driven. Five chapters, each 8–12 questions, each with a short brief from Janni, a mid-chapter twist, and a resolution. Chapter arc: intercept a coded message → tail a suspect through town → get into a restricted floor → recover the stolen file → confront the courier. Progress shown as case files stamped **LØST**.

### Mission 2 — "Kodelåsen" (timed vault run)

One building, ten floors, one night. Every door needs a keypad code and the code is the answer. 60–90 second rounds. Correct = door opens, climb a floor. Wrong = door stays shut, patrol advances one square on a small visual track. Patrol reaching her ends the run — but ending a run just shows floors climbed and a personal best, and offers an instant retry. Fast, replayable, competitive. On Easy, no timer; the patrol advances only on wrong answers.

### Mission 3 — "Muldvarpen" (mystery, no timer)

Someone swapped the bureau's real files with fakes. Four possible suspects, each with a profile. Every correct answer develops one piece of evidence on a clue wall: a partial photo sharpens, a shoe print fills in, a phone fragment gains digits. Wrong answers just mean that clue stays blurry and returns later. At the end of each chapter Vilde makes an accusation on a deduction board; a wrong accusation costs nothing but "grav videre". Zero time pressure — this is the mission for a bad day.

### Mission 4 — "Gadget-laboratoriet" (collect & build)

Mynthe's workshop. Each correct answer earns a component. Components assemble into gadgets: gribekrog, stemmeforvrænger, lydløse sko, røgpen, magnetske handsker, mini-drone. Each completed gadget unlocks a 4–6 question micro-mission where that gadget is the solution. Open-ended, dip-in-and-out, five minutes at a time. Progress shown as a shelf filling with built gadgets.

## 8. Parent view

Reachable from a small, unlabelled corner button on the home screen, behind a simple gate (e.g. type the answer to `12 × 11`). Not hidden from her, just not in her way.

Shows:

- A 10×10 grid of all facts, colour-coded by mastery box. Instantly readable: where is she strong, where is she stuck.
- The five weakest facts right now, with accuracy and average response time.
- Practice minutes and questions answered, last 14 days.
- Accuracy trend over time.
- Buttons: reset progress, export JSON.

## 9. Visual design

She is 10, not 6. Aim for a proper spy aesthetic — dark interface, one strong accent colour, monospace for codes and keypads, clean sans for prose, subtle scanline/grid texture, short snappy transitions. No cartoon mascots, no comic-sans energy, no glitter. It should look like something her older siblings would think is cool.

Animations under 300ms. Nothing that delays her next answer. Respect `prefers-reduced-motion`.

## 10. Non-negotiables

- Never shame a wrong answer, anywhere, in any string.
- Never show a global score that can go down.
- She can always leave a mission mid-way without losing progress.
- No dark patterns: no streak guilt, no "you'll lose your progress!", no daily-login pressure.
- Typed input accepts Enter, auto-focuses, and rejects nothing silently — trim whitespace, ignore non-digits gracefully.

## 11. Build order

Do these in order and tell me when each is done. Do not build everything at once.

1. Scaffold + `storage.js` + `facts.js` + `mastery.js`, with a bare test page that serves adaptive questions and proves the box logic works. Show me the mastery grid updating.
2. `question-card.js` with all three difficulty input modes, hints, and the praise pool.
3. Home screen, profile, difficulty selection, case-file board.
4. Mission 2 (Kodelåsen) — simplest loop, validates the whole stack end to end.
5. Mission 4 (Gadget-laboratoriet).
6. Mission 1 (Kælder-HQ) with full story text.
7. Mission 3 (Muldvarpen) with the clue wall.
8. Parent view.
9. Polish pass: responsive, touch, reduced-motion, final Danish copy proofread.

Write the Danish story and dialogue yourself — make it genuinely funny and a bit tense, with real character voices. Don't write placeholder text and ask me to fill it in.

Before you start, ask me anything that's ambiguous. Then begin with step 1.
