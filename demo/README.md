# Casedoku — Demo build (`/demo`)

A self-contained, **desktop-only** demo derived from the main game. It ships **exactly four
fixed cases** — one per difficulty — fronted by a Case Select screen, with Steam / socials /
Kickstarter call-to-action moments on every solve and a finale once all four are cracked.

It is a single file, `demo/index.html`. It **shares the main game's art** — no assets are
duplicated. Serve it from the repo root and open `/demo/` (on GitHub Pages: `/casedoku/demo/`).

## The four fixed cases

The demo locks to these hand-picked seeds (chosen for solvability, a good clue mix, and a
planted-weapon "wow" on the two hardest). They are defined in `DEMO_CASES` inside the
`#cludoku-ui` script.

| Difficulty (label)      | Tier      | Seed | Case code | Grid | Notes                                   |
|-------------------------|-----------|------|-----------|------|-----------------------------------------|
| Routine Case (Easy)     | `easy`    | 135  | `E3r`     | 6×6  | Gentle warm-up, 3 clue types            |
| Troubling Case (Medium) | `medium`  | 156  | `M4c`     | 9×9  | All five clue types, the classic whodunit |
| Grim Case (Hard)        | `hard`    | 99   | `H2r`     | 9×9  | **Planted weapon**, ~35 arrangements    |
| Cold Case (Extreme)     | `extreme` | 119  | `X3b`     | 9×9  | **Planted weapon**, ~68 arrangements    |

Each launches via `startCase({difficulty, seed})`, so the case (suspects, clues, killer,
weapon) is fully deterministic. Per-case completion is tracked in `localStorage`
(`casedoku.demo.done`) and shown as a "✓ Solved" stamp on the Case Select cards.

## Where to set the real links (CTA config)

One obvious config object at the **top of `demo/index.html`** (a `<script>` in `<head>`):

```js
window.DEMO_LINKS = {
  STEAM_URL:       "#",   // Steam wishlist page
  KICKSTARTER_URL: "#",   // Kickstarter campaign
  SOCIALS:         "#"    // single socials hub link
};
```

While a value is `"#"`, that button is a friendly "Link coming soon" no-op. Drop in real URLs
and the buttons open them in a new tab. The three CTAs appear on every solved-case payoff and
on the **Demo Complete** screen (shown after all four are solved).

## Shared assets

All art/audio is loaded from `../assets/...` (the repo-root `assets/` folder) — the demo
references the existing files and duplicates nothing. Missing files fall back gracefully
(placeholder tints / silhouettes), exactly as in the main game.

## What's intentionally cut from the demo

- **No infinite generation** — the New Case modal (random case, Daily Case, load-by-code) is
  removed. The four fixed cases are the only cases; the header **Cases** button returns to the
  Case Select screen.
- **Desktop-only** — the mobile phone-mode (`body.phone` / force-phone, `--ps` scaling, the
  tabbed mobile case-file overlay) is disabled. On a small or touch screen the demo shows a
  polite "best on desktop" notice (dismissible) and keeps the two-column desktop layout.

Everything else from the full game is kept: the deduction systems (weapon / motive / evidence),
the 4-question accusation flow, hints ("Ask the Clerk"), notes/pencil-marks, the juice (motion +
SFX), background music (default **on**, with its own toggle), and the Evidence Archive + trophies.

## Engine parity

The `#cludoku-engine` block is byte-identical to the main game's, so the root engine test
(`node tests/engine.test.mjs 20` → 80/80) covers the demo's logic too.
