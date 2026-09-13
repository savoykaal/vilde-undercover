# Addendum — devices, deployment, and mobile

Paste this into Claude Code together with the main brief. It overrides anything in the brief that conflicts with it.

## Correction to the tech constraints

The brief said "opens by double-clicking index.html" **and** "use ES modules". These are incompatible — browsers block module scripts over `file://`. Resolve it this way:

- Keep ES modules and the multi-file structure.
- The project is **served**, not opened as a file. Add a one-line dev command in the README (`python3 -m http.server 8000`) for local work.
- Everything stays static — no server-side code, no build step, no dependencies. It must deploy to GitHub Pages or Cloudflare Pages by dropping the folder in.
- Use **relative paths everywhere** so it works from a subdirectory like `/agent-vilde/`.

Also produce a `build-single-file.py` script that inlines all CSS and JS into one self-contained `agent-vilde.html`. That file is the offline fallback — it works from `file://`, from a USB stick, and from the iOS Files app. Keep it working; don't let the project drift so the inlining breaks.

## Target devices

Design mobile-first, from **320px** wide upward. Test at these widths: 320, 375 (iPhone 11), 393 (iPhone 15), 768 (iPad portrait), 1024+ (laptop).

The parent view is the one screen allowed to require ≥ 768px — below that, show a short message saying to open it on a larger screen.

## Number entry — build a custom keypad

Do **not** use a text input for typed answers. The iOS system keyboard covers half the screen and fights the timer. Instead:

- Build an in-app 0–9 keypad with a delete key and a confirm key, styled as a vault keypad. It fits the story better than a text field anyway.
- Keys ≥ 56px tall on phones, laid out in the bottom third of the screen so it's thumb-reachable one-handed.
- The question and the entered digits stay visible above the keypad at all times, on every supported width. Nothing scrolls during a question.
- On laptop, the physical number keys, Backspace and Enter must also work, and the on-screen keypad shows the matching key highlighting as she types.
- Cap input at 3 digits.

## iOS Safari specifics

- Use `100dvh`, never `100vh` — `vh` is wrong on iOS while the toolbar animates.
- Respect `env(safe-area-inset-top/bottom/left/right)` for the notch, the Dynamic Island, and the home indicator.
- Minimum font size 16px on any focusable element, otherwise Safari auto-zooms.
- `touch-action: manipulation` on all buttons to kill the 300ms double-tap-zoom delay.
- `-webkit-user-select: none` on buttons and the keypad so fast tapping doesn't select text.
- `overscroll-behavior: none` to stop rubber-band scrolling mid-mission.
- `-webkit-tap-highlight-color: transparent`, replaced with your own visible press state.

## Make it installable

Add a `manifest.webmanifest` and an inline-SVG-derived icon set so it can be added to the iOS and iPadOS Home Screen and run fullscreen without Safari chrome:

- `display: "standalone"`, dark theme colour matching the UI.
- `apple-mobile-web-app-capable` and `apple-mobile-web-app-status-bar-style` meta tags.
- A minimal service worker that caches all assets on install and serves cache-first, so the game works with no signal. Keep it simple — one cache, bumped by a version constant at the top of the file.

## Protect her progress

iOS Safari clears script-writable storage for sites that go unused for about a week, so `localStorage` alone is not safe long-term on an iPhone.

- Adding the game to the Home Screen substantially reduces this risk — say so in the README.
- In the parent view, add **Eksportér** (downloads a JSON file) and **Importér** (file picker, merges by taking the higher mastery box per fact).
- Auto-export a JSON backup to the Downloads folder whenever total questions answered crosses each multiple of 500, silently, with a small toast.
- Never show the child a storage warning. If progress is lost, the game starts clean and cheerful.

## Per-mission mobile notes

- **Kodelåsen** — the best phone mission. Keypad-first, one-handed, short rounds. Prioritise its phone layout.
- **Gadget-laboratoriet** — also strong on phone. Shelf as a 2-column grid below 400px.
- **Kælder-HQ** — story text needs care at 320px: max ~60 characters per line, generous line height, one beat per screen with a tap to advance. Never a wall of text.
- **Muldvarpen** — the clue wall is the hardest thing to fit. On phones, show one clue at a time in a horizontally swipeable carousel with dots, and put the deduction board on its own screen.

## README

Write a short `README.md` covering: how to run locally, how to deploy to GitHub Pages, how to add to the Home Screen on iPhone and iPad, how to build the single-file offline version, and how to export/import progress. Written for a parent, not a developer.
