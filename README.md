# Cludoku — Deduction

A murder-mystery deduction game built on a **real, valid sudoku backbone** — but the
mystery layer is **load-bearing, not cosmetic.** Each puzzle is generated so that the
sudoku rules + the starting givens **alone are NOT enough** to reach the solution. The
remaining ambiguity can only be broken with the **evidence clues** in the case file. A
player who ignores the case file literally cannot deduce the grid.

When you complete the grid, the killer **falls out of the logic** — the game shows the
chain of reasoning that fingers them, because the solved grid forces it.

## How to run

Single self-contained web app — no build step, no dependencies.

**Option 1 — just open it:** double-click `index.html` (or drag it into your browser).

**Option 2 — local static server** (recommended; some browsers are strict about local files):

```powershell
# from this folder (Python is already on this machine)
python -m http.server 5777
# then open http://localhost:5777
```
```bash
# or via Node
npx --yes http-server . -p 5777 -c-1
```

## How it works (the core)

1. **Generate** a fresh, valid solved grid (a true Latin square: each suspect once per
   row, column, and room/box).
2. **Reveal givens** — but deliberately remove enough that the grid is **ambiguous under
   sudoku rules** (2–90+ valid completions depending on tier). This is what makes clues
   required.
3. **Derive evidence** from the *actual* solved grid (so every clue is guaranteed true),
   then compute a **minimal-ish clue set that makes the solution provably unique** via a
   greedy set-cover over the ambiguous completions.
4. **Verify** (the heart): every generated case is checked to have *exactly one* solution
   *with* clues, *more than one* *without* them, all clues true of the solution, and a
   **provably-forced killer**.

Supported clue types (all derived, all guaranteed true): **sighting** (position fact),
**relative** position, **adjacency / non-adjacency**, **exclusion**, **count**, **position
band**. Because every symbol appears once per row/column/room, only *position-anchored*
facts can discriminate — so clues talk about *where* in a room a suspect stood, relations
between them, and tallies across wings of the house, never the trivial "X was in room R".

### The killer is provable
The murder **scene** is the most ambiguous cell — sudoku alone allows several suspects to
have stood there. The evidence rules the others out one by one; whoever survives is the
killer. The reveal shows that chain ("It could not have been Col. Mustard — that would
contradict evidence #1…"), plus their broken alibi.

## Difficulty (four tiers)

| Tier     | Board | Givens | Sudoku-only arrangements | Clue style |
|----------|-------|--------|--------------------------|------------|
| Easy     | 6×6   | more   | few (~3–8)               | direct sightings |
| Medium   | 9×9   | ~33    | ~6–12                    | position / relative |
| Hard     | 9×9   | ~31    | ~15–40                   | indirect (relative) |
| Extreme  | 9×9   | ~29    | ~30–90                   | cryptic (count / exclusion / relative) |

Tuned by: number of givens, clue directness, depth of deduction (how many arrangements the
clues must eliminate), and board size. **Every case at every tier is verified to have
exactly one solution.**

## Infinite + seeded cases

Every **New Case** generates a fresh grid, derives a fresh guaranteed-unique clue set, and
dresses it from swappable libraries (names, motives, victim, weapon, rooms, time of death).

- **Seeded / shareable:** every case has a short **case code** (e.g. `Xwgbeh7`). The same
  code always reproduces the exact same mystery — paste it into "Load code" to share.
- **Daily Case:** seeded from the date, identical for everyone that day.

## Architecture (swappable story/art layer)

Three cleanly separated layers in `index.html`:

- `#cludoku-engine` — **pure logic**, no DOM. Generation, solving, clue derivation,
  verification, killer reasoning, seeded RNG. (`window.CludokuEngine`)
- `#cludoku-theme` — **the swappable skin.** Proper nouns + flavor + clue render templates.
  New theme packs = new entries in `CLUDOKU_THEMES`; the engine never changes. See
  `ROADMAP.md` for planned packs (medieval, kid-friendly, …).
- `#cludoku-ui` — board, tray, case file, interactions, reveal.

## Tests

The engine's correctness is verified by a Node harness that **extracts the shipped engine
straight out of `index.html`** (so there's no separate copy to drift):

```bash
node tests/engine.test.mjs 25     # 25 trials per tier = 100 cases
```
It asserts, per case: valid Latin square; givens ⊂ solution; **givens-alone ambiguous
(clues load-bearing)**; givens+clues uniquely the solution; every clue true of the solution;
killer provably forced; reasoning chain holds; seeded determinism; case-code round-trip.

```bash
node tests/stats.mjs              # difficulty-balance probe (givens / completions / clue types)
```

## Placeholder art

All visuals are placeholder (CSS tokens, simple SVG icons, generated stand-ins). Real art
drops into the **theme-pack folder structure** with **no code changes** — the loader uses
named files and the active theme is a variable (`ACTIVE_THEME = "manor"`). Each folder has a
README listing its exact expected filenames.

```
assets/
  reference/style-reference.png        — locked master style anchor
  themes/manor/
    suspects/  suspect-<role>.png  (+ -victim.png)   — 16 roles
    objects/   object-<name>.png                     — 12
    rooms/     room-<name>.png                        — 9 (top-down floors)
    weapons/   weapon-<name>.png                      — 12
  ui/          logo.svg, logo-subtitle.png, bg-desktop.jpg, bg-mobile.jpg,
               badge-<tier>.png, stamp-caseclosed.png, frame-spotlight.png,
               ui-evidence-card.png, icon-<name>.svg, appicon.png, appicon-192.png
```

**Graceful fallback:** a missing named file never breaks the board — suspects fall back to
the colored lettered token, room floors to a flat color tint, and any missing `<img>` simply
hides. Real files override the placeholders automatically when present, so art can be added
incrementally. A new theme pack is the same slots under `assets/themes/<theme>/`.

Regenerate all placeholders any time with `python make_assets.py`.

## How to play

- **Pick a suspect** (tray or press **A–I / 1–9**), then **click a cell** — or click a cell
  first, then a suspect. **Arrow keys** move, **Backspace/Delete** erases.
- **Undo / Redo / Erase / Hint / Check.** Hint fills a correct (usually ambiguous) cell;
  Check circles any misplaced suspect in red; duplicates highlight live.
- Use the **Evidence** in the case file — you can click clues to cross them off as you use
  them. The dashed cell is the **scene**; it hides the killer.
- Complete the grid → **Case Closed**, with the killer and the chain of reasoning.

See `ROADMAP.md` for the planned progression ("a home you can design") and theme-pack DLC.
