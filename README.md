# Cludoku — A Murder in Nine Rooms

A murder-mystery spin on sudoku. Under the hood it is a **true, uniquely-solvable
9×9 sudoku** (a real Latin square — each symbol appears exactly once per row,
column, and 3×3 box). The nine symbols are nine **murder suspects** (lettered
tokens A–I) and the nine 3×3 boxes are nine themed **rooms**. Solve the grid to
unmask the killer.

## How to run

It's a single self-contained web app — no build step, no dependencies.

**Option 1 — just open it:**
Double-click `index.html` (or drag it into your browser).

**Option 2 — local static server** (recommended; some browsers are strict about
loading local image files):

```bash
# from this folder
npx --yes http-server . -p 5777 -c-1
# then open http://localhost:5777
```

```powershell
# or with Python (already on this machine)
python -m http.server 5777
# then open http://localhost:5777
```

## How to play

- **Pick a suspect** from the tray (or press **A–I** / **1–9**), then **click a cell**.
  You can also click a cell first, then a suspect.
- **Arrow keys** move the selection; **Backspace/Delete** erases.
- **Undo / Redo / Erase** edit your placements; **Hint** fills the selected
  empty cell (or a random one) with the correct suspect.
- **Check** flags any suspect standing in the wrong room.
- Duplicates in a row, column, or room are outlined in red live.
- Complete the grid to trigger the reveal: **"Mystery solved! The killer was ___"**
  The killer is whoever ends up alone in the heart of the central room.
- **New Case** picks a fresh puzzle at Rookie / Detective / Inspector difficulty.

## Placeholder art

All visuals are placeholder (CSS shapes, colored letter tokens, simple SVG icons,
generated stand-in images). Real art drops straight into `/assets` with **no code
changes** — the app already references the final filenames:

```
assets/
  suspect-01.png … suspect-09.png   512×512  suspect portraits (tray cards)
  logo.svg                          wordmark
  bg-desktop.jpg                    1920×1080 background
  bg-mobile.jpg                     1080×1920 background
  icons/
    plant table chair bush tv bookshelf rug lamp bed painting   .svg  (objects/rooms)
    undo redo erase hint check settings back close              .svg  (UI)
```

Regenerate the placeholder art any time with:

```bash
python make_assets.py
```

## What's real vs. placeholder

| Real (working logic)                              | Placeholder (swap later)        |
|---------------------------------------------------|---------------------------------|
| Sudoku generator + backtracking solver            | Suspect portraits               |
| Uniqueness guarantee (single solution)            | Room themes / colors / icons    |
| Conflict checking, hint, check, undo/redo         | Background images, logo          |
| Win detection + killer/victim/weapon reveal       | Suspect names & flavor text      |
