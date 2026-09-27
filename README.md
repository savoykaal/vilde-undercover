# Agent Vilde: Familiebureauet

A Danish top-down spy game for iPhone, built around the family bureau in the basement.
Vilde sneaks past guards, tails suspects, cracks safes and codes – and every now and
then a door wants a multiplication answer as its code.

## Play it on the iPhone

1. Open https://savoykaal.github.io/vilde-undercover/ in Safari.
2. Tap **Del** → **Føj til hjemmeskærm**. The game then opens full-screen like an app,
   and iOS is much less likely to clear the saved progress.

Controls: put a thumb anywhere on the screen and drag to walk. The big pink button
appears when there is something to use (a radio, a keypad, a safe); the blue one hides
you in a box or locker. On a laptop: arrow keys/WASD, Space to act, Esc to pause.

## What's in it

The home screen is a city map at night. Every pin is a mission.

- **Nordlys-sagen (1–5)** – the story: tune the radio and crack the cipher in the
  basement (tutorial), tail the man in the grey hat through town without being seen,
  sneak onto the seventh floor past a camera, guards and lasers, find the file in the
  dark archive by following a beeping signal and crack the safe by feel, and catch the
  courier in the foggy harbour.
- **Muldvarpen (M1–M4)** – detective rooms at night. Find three pieces of evidence with
  the flashlight (a torn photo, a shoe print to dust, a phone to redial), then point out
  the culprit on the deduction board. No clock.
- **Nordlystårnet (▲)** – the math mission: ten floors, and every door code is a
  multiplication answer. Wrong codes and being spotted raise the alarm. Personal bests.
- **Mynthes værksted (⚙)** – gadget parts are hidden in the missions. Build gadgets from
  them; each one gives a perk in the field (faster shoes, a smoke pen, night vision …).

Each mission has three stars: solved, all gadget parts found, never spotted. Stars only
ever go up. Being spotted just sends Vilde back to the last checkpoint with a friendly
line over the radio – nothing is lost, and she can leave any mission and continue later.

**Sikkerhedsniveau** (tap the agent card on the map) sets the math (Let: tables 1–5 with
four choices, Mellem: typed answers, Svær: tables 1–10) and how sharp the guards are.

## Run it on your computer

The game must be served, not double-clicked. In this folder, run:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

- Game: http://localhost:8000/
- Level bench (jump straight into a level/step): http://localhost:8000/dev.html#c3/2
- Minigame bench: http://localhost:8000/dev.html#mg/safe
- Engine test bench: http://localhost:8000/test.html

Tests run from the command line: `node tests/run.js` (math engine, copy, every level's
reachability and guard routes, tower floors, gadget parts, pipe puzzles).

## Where things live

- `src/game/` – the game: world simulation, renderer, controls, sound, levels, minigames
- `src/game/levels/` – the maps (drawn as text) and level scripts
- `src/engine/` – adaptive multiplication engine, storage, progress
- `src/i18n.js` – every Danish string in one place
