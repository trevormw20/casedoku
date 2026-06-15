# Casedoku Manor — Playtest Script

**Purpose — the one question this test answers:**
> **Does the mystery feel load-bearing, or does the game feel like "Sudoku with pictures"?**

This is a *structural* test, **not** a UI-nitpick test. Ignore button sizes and typos here. We only want to know whether five things land on their own:

1. Did they understand the board is a **Sudoku-style deduction grid**?
2. Did the **repeated suspect markers** bother or confuse them?
3. Did the **case story** make the puzzle feel more meaningful?
4. Did the **final accusation** connect the grid to the mystery?
5. Did **manor restoration** make them want to play another case?

**Who:** 5–10 people who have **never seen the game**. Clear patterns usually appear by player 5; run more if signals are mixed.
**How much:** **One case per player.** Budget ~20 min each (a few min setup + ~10–12 min play + ~5 min questions).

---

## 1. Setup & pre-test (do this before each player)

**Build / device:** Use the current web build (`index.html`) in a browser on a normal laptop/desktop. Note the device. (Don't use `?dev=1` — that's a team tool.)

**Settings to use (set these before the player sits down):**
- **Mode: Relaxed.** No timer, no guess limit. We're testing comprehension, not stress. (Do **not** use Detective or On-the-Clock for first-timers.)
- **Difficulty: Routine (Easy, 6×6).** Short enough to finish in one sitting and still teaches the full loop. **Use the same difficulty for every player** so results compare.
- **Motion ON / Sound ON** for most players.
- **Reserve 1–2 sessions with Motion OFF + Sound OFF.** These players never see the animated onboarding demo (they get a static text fallback), so they test whether the *text* alone teaches the game. Track them separately.

**Reset to a true first run between every player** (the onboarding and the one-time teaching lines only fire once per browser):
- **Easiest:** open a fresh **private / incognito window** for each player. *(Note: localStorage doesn't persist across most incognito sessions, so each one is clean — but confirm on your browser.)*
- **Or:** clear the site's storage. In DevTools console: `Object.keys(localStorage).filter(k=>k.startsWith('casedoku.')).forEach(k=>localStorage.removeItem(k))`, then reload. (Key flags this resets: `seenHowTo`, `manorIntroSeen`, `modeChosen`, `seenRepeat`, `introSeen`.)

**Recording:** Screen + mic if possible. Otherwise a note-taker with the Section 3 + Section 5 sheets. **Timestamp three moments:** the first repeated marker, the first real clue read, and the accusation.

**Think-aloud:** Ask them to **narrate what they're thinking** as they go. This is the single most valuable signal — confusion shows up in their words before it shows up in the score.

---

## 2. What the facilitator must NOT explain (let the game self-teach)

The whole point is testing whether the game teaches itself. **Read the player only this:**

> *"This is a cozy mystery puzzle game. Play it however feels natural and please think out loud as you go. There's no wrong way to do it. I won't explain anything — I want to see what the game tells you. If you get truly stuck I'll step in, but try things first."*

**Do NOT, before or during play, explain any of the following** (each is something the game is supposed to teach):
- That it's Sudoku, or how the grid's rows/columns/rooms work.
- **That the same suspect appears multiple times and that's normal** — this is the #1 thing to never pre-explain. It's the exact confusion we're measuring.
- How clues point to cells.
- What the accusation is for, or that filling the grid leads to it.
- What Case Seals or manor restoration are for.

**If they ask a question, deflect first** ("What do you think it means?") and only rescue them if they're completely blocked — and **write down that you had to rescue them**, because that's a self-teaching failure, not a freebie.

---

## 3. What to watch during play (behavioral signals)

Note *where they hesitate*, not just whether they finish. Key moments, in order:

| Moment | Watch for |
|---|---|
| **Onboarding** ("Graves' Deduction Grid" How-to + animated demo) | Do they **read** it or skip/dismiss it? Do they watch the demo? *(Motion-off players: do they read the static text instead?)* |
| **First placement** | Do they figure out the input (tap a cell, then a suspect)? Long fumbling here = input unclear. |
| **★ THE FIRST REPEATED MARKER ★** (the moment a second copy of one suspect appears) | **The headline signal.** Watch for a pause, "wait, didn't I already place him?", **erasing a correct placement**, frowning, or asking you. Note whether the one-time Wembly line appears (*"That's a second [Suspect] marker… recurs like a number in Sudoku, not the same person in two places"*), whether they **read it**, and whether it **resolves** the confusion. |
| **Clue reading** | Do they use a clue to place a marker in a **specific** cell/region, or do they ignore clues and just fill by Sudoku logic and treat clues as flavor? (Clue-to-cell comprehension.) |
| **Grid complete → accusation** | Do they notice the "name the killer" prompt? Or do they think they've **already won** by filling the grid (and look for a "done" button)? |
| **Accusation modal** | Do they engage with killer/weapon/motive/proof and connect them to what they deduced, or guess at random? |
| **Case closed → manor** | Reaction to the reveal + Case Seal + the **"Restore the [Room]"** button. Do they actually go restore? Do they reach for "another case"? |
| **Throughout** | Do they talk about suspects as **people** ("he was in the kitchen") or as **tokens/markers**? Delight vs. boredom. |

---

## 4. Post-test questions (ask verbatim, in these groups)

Ask **after** they finish (or after ~15 min if stuck). Start with the open question, then the grouped ones. **Don't lead** — let silences sit.

**Opener:** *"In your own words, what was that game?"*

**Group A — the grid & the markers**
- *"What did you think the grid represented?"*
- *"Did it bother you that the same suspect appeared more than once?"* → follow-up: *"What did you think that meant the first time you saw it?"*

**Group B — the mystery wrapper**
- *"Did the story make the puzzle feel different from normal Sudoku?"*
- *"Did the final accusation feel connected to the puzzle?"*

**Group C — the loop**
- *"Did you want to restore more of the manor?"*
- *"Would you play another case?"*

**Group D — the verdict (the headline)**
- *"Would you describe this as a detective game, Sudoku with a theme, or both?"*

---

## 5. Scoring sheet

### Per-player record (copy one block per player)

```
Player #: ____   Date: ____   Device: ____   Mode: Relaxed   Motion/Sound: ON / OFF
Case code: ____   Finished unaided? Y / N    Rescued by facilitator? Y / N (what for: ____)

GOAL SCORES (0 = no / 1 = partial / 2 = yes)
1. Understood grid = a Sudoku-style logic grid (not a map of where people stood) ...... 0  1  2
2. Repeated markers did NOT confuse/bother them ........................................ 0  1  2
3. Story made the puzzle feel meaningful (not just Sudoku) ............................. 0  1  2
4. Accusation felt connected to the grid work ......................................... 0  1  2
5. Restoration / wanting another case (retention) ..................................... 0  1  2
                                                                       GOAL TOTAL: __ / 10

BEHAVIOR FLAGS (circle)
Read the onboarding?            Y / N / skimmed
Confused at first repeat?       Y / N    →  resolved by the Wembly line?  Y / N / didn't see it
Used clues to place (vs flavor)? Y / N
Noticed the "name the killer" prompt? Y / N
Went to restore a room?         Y / N

VERDICT: detective game  /  Sudoku with a theme  /  both
PLAY ANOTHER CASE?  yes / maybe / no

Best quote (esp. their reaction to the first repeat): ___________________________________
```

**Scoring guide for the 5 goals:**
- **Goal 1:** 0 = thought the board showed where people physically were / a floor plan · 1 = unsure · 2 = "it's a logic grid / like Sudoku."
- **Goal 2:** 0 = confused or bothered and it never resolved · 1 = briefly thrown, then got it · 2 = never an issue.
- **Goal 3:** 0 = "the story didn't matter, it's just Sudoku" · 1 = neutral · 2 = "the story made it feel like more."
- **Goal 4:** 0 = accusation felt random/disconnected · 1 = somewhat · 2 = "my grid work led me to the answer."
- **Goal 5:** 0 = indifferent to restoring / wouldn't replay · 1 = mild interest · 2 = wanted to restore and/or play again.

### Aggregate sheet (fill after all sessions)

```
Players: ___       Motion-OFF subset: ___

Average goal scores (0–2):
  G1 grid ____  G2 markers ____  G3 story ____  G4 accusation ____  G5 retention ____

Counts:
  Confused at first repeat: ___ / ___ players
  Rescued by facilitator:   ___ / ___
  Finished unaided:         ___ / ___
  "Would play another case": yes ___  maybe ___  no ___

Verdict tally:  detective ___   Sudoku-with-theme ___   both ___
```

---

## 6. How to read the results — the decision rule

**Look first at Goal 2 (repeated markers) and the verdict question — they answer the headline.**

> **DECISION RULE**
> - **Most players don't mind the recurrence (G2 mostly 1–2, little hesitation at the first repeat) AND enjoy the mystery wrapper (G3–G5 positive, most want another case)** → **Keep the current Sudoku-with-markers system.** It's working; ship it.
> - **Players are confused by the repeated suspects (several G2 = 0; pausing, erasing correct placements, "is that the same person twice?")** → **Fix the framing first** — strengthen the onboarding, the once-ever first-repeat line, and/or in-play reinforcement — then **re-test**. Do **not** jump to a redesign.
> - **Only if framing fixes still don't solve the confusion after a re-test** → consider a deeper redesign (e.g. single-occupancy placement). This is the last resort, not the first move.

**Reading the verdict question:** "Sudoku with a theme" is **not** a failure *if they enjoyed it and would play another case* — that just means the theme is a pleasant wrapper, which is fine. The real failure pattern is: **"Sudoku with pictures" + "the story didn't matter" + "wouldn't play again."** Distinguish enjoyed-wrapper from didn't-care.

**Watch the Motion-OFF / Sound-OFF subset separately.** They skip the animated demo, so if *they* are the confused ones while Motion-ON players are fine, the fix is **more/better in-play text** (e.g. the first-repeat line), not the animation.

**Sanity check on self-teaching:** count how many players you had to rescue and what for. Lots of rescues on the same point = that point isn't self-teaching yet, regardless of the scores.

---

### Quick facilitator checklist
- [ ] Fresh first-run (incognito or cleared storage)
- [ ] Relaxed mode · Routine (Easy 6×6) · Motion/Sound noted
- [ ] Read only the Section 2 intro; explained nothing else
- [ ] Recording on; ready to timestamp the first repeat / first clue / accusation
- [ ] Per-player sheet ready; capture the first-repeat quote
- [ ] Ask the Section 4 questions verbatim, no leading
