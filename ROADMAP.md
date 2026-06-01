# Cludoku — Roadmap (backlog, not yet built)

These are recorded for later. None are implemented yet. They are listed here so the
current architecture stays compatible with them.

## 1. Progression → "a home you can design"
Completing cases earns progress (e.g. **Reputation** / **case payouts**) that the player
spends on a persistent meta-reward: **a detective's home / office they decorate and grow.**

- Each solved case grants currency scaled by tier (Easy < Medium < Hard < Extreme) and
  by performance (fewer hints, no wrong "Check"s, speed).
- Spend currency on rooms, furniture, and décor for a home screen — a long-horizon goal
  that pulls players back between cases.
- Tie-ins: the décor catalog can reuse the **object icon set** already in `/assets/icons`
  (plant, table, chair, bush, tv, bookshelf, rug, lamp, bed, painting) as the first
  furniture placeholders. The home layout itself could even be a light grid/room metaphor
  echoing the board.
- Persistence: `localStorage` for v1 (case history, currency, owned décor, daily streak).
- Hooks that already exist: deterministic **case codes** + **Daily Case** make it natural
  to award streak bonuses and "case of the day" rewards.

## 2. DLC / theme packs (medieval, kid-friendly, etc.)
The story/art layer is already **data-driven and swappable** (see `CLUDOKU_THEMES` and
`CludokuSkin` in `index.html`). A theme is pure data + render templates; the logic engine
never changes. Planned packs:

- **Classic Whodunit** (shipping default — "Blackwood Manor").
- **Medieval** — suspects = knights/nobles, rooms = keep/dungeon/chapel, weapons = mace/poison,
  victim = the king. Same sudoku + clue logic, new nouns and palette.
- **Kid-friendly** — friendly animals, "who ate the cookies?" framing, no "murder" language,
  bright palette, larger tokens, Easy-leaning tiers and the 6×6 board.
- **Sci-fi / Noir-city / Holiday** — further reskins.

### What a theme pack must provide (contract)
A theme object supplies only proper nouns + flavor + render strings:
```
{ id, name,
  suspects:[{L,name,color,motive}, ...],   // >= board size (9 for 9x9, 6 for 6x6)
  victims:[...], weapons:[{n,icon}], times:[...],
  rooms:[{name,icon,hue}, ...],            // >= number of boxes
  /* optional: override structural VOCAB (spot/wing names) and clue render templates */ }
```
Art per pack drops into `/assets/<theme>/` mirroring the placeholder filenames. The engine
(`CludokuEngine`) and the clue/killer logic are fully theme-agnostic, so packs are additive:
register a new entry in `CLUDOKU_THEMES` and add a theme picker in the New Case modal.

### Future engine room (already designed for, not blocking)
- Larger boards (12×12 with 3×4 rooms) — the engine takes generic `{N,bh,bw}`; only the
  enumeration cap and tuning need revisiting for performance.
- More clue types (temporal "before/after", motive/weapon deductions layered on the grid).
- Difficulty: an explicit "minimum deduction steps" target via a logical (not brute-force)
  solver, to guarantee a human-style solving path of a chosen length.
