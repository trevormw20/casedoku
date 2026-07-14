// Sudoku solver + generator for hand-authored detective cases.
// Pure, deterministic (seeded), no external deps. Shared by tools/verify-cases.mjs
// and the case-authoring scripts. Grids are 9x9 (bh=bw=3) but the code is generic.
//
// Cell indexing is row-major: cell = r*N + c  (matches the engine's murderCell math).
// Values are 1..N; 0 = blank. This mirrors the game's board[] representation.

export const DIMS9 = { N: 9, bh: 3, bw: 3 };

export function makeRNG(seed) {
  // mulberry32 — deterministic PRNG so generated grids are reproducible.
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function boxOf(dims, r, c) {
  const { bh, bw, N } = dims;
  return Math.floor(r / bh) * (N / bw) + Math.floor(c / bw);
}

// Peers of a cell: same row, same col, same box (excluding itself). Precomputed per dims.
function buildPeers(dims) {
  const { N } = dims;
  const peers = Array.from({ length: N * N }, () => new Set());
  for (let i = 0; i < N * N; i++) {
    const r = Math.floor(i / N), c = i % N, b = boxOf(dims, r, c);
    for (let j = 0; j < N * N; j++) {
      if (j === i) continue;
      const rr = Math.floor(j / N), cc = j % N;
      if (rr === r || cc === c || boxOf(dims, rr, cc) === b) peers[i].add(j);
    }
  }
  return peers;
}

const _peerCache = new Map();
export function peersFor(dims) {
  const key = `${dims.N}-${dims.bh}-${dims.bw}`;
  if (!_peerCache.has(key)) _peerCache.set(key, buildPeers(dims));
  return _peerCache.get(key);
}

function candidates(grid, dims, peers, i) {
  const { N } = dims;
  const used = new Set();
  for (const p of peers[i]) if (grid[p]) used.add(grid[p]);
  const out = [];
  for (let v = 1; v <= N; v++) if (!used.has(v)) out.push(v);
  return out;
}

// Count solutions up to `limit` (default 2 — enough to decide uniqueness).
// Returns { count, solution } where solution is the FIRST solution found (or null).
export function countSolutions(grid, dims = DIMS9, limit = 2) {
  const { N } = dims;
  const peers = peersFor(dims);
  const work = grid.slice();
  let count = 0;
  let firstSolution = null;

  function pickCell() {
    // Minimum-remaining-values heuristic: fewest candidates first (fast + correct).
    let best = -1, bestC = null, bestLen = Infinity;
    for (let i = 0; i < N * N; i++) {
      if (work[i]) continue;
      const cands = candidates(work, dims, peers, i);
      if (cands.length < bestLen) { bestLen = cands.length; best = i; bestC = cands; if (bestLen === 0) break; }
    }
    return { i: best, cands: bestC };
  }

  function recurse() {
    if (count >= limit) return;
    const { i, cands } = pickCell();
    if (i === -1) { // no empty cell -> a complete solution
      count++;
      if (!firstSolution) firstSolution = work.slice();
      return;
    }
    if (cands.length === 0) return; // dead end
    for (const v of cands) {
      work[i] = v;
      recurse();
      work[i] = 0;
      if (count >= limit) return;
    }
  }
  recurse();
  return { count, solution: firstSolution };
}

export function hasUniqueSolution(givens, dims = DIMS9) {
  return countSolutions(givens, dims, 2).count === 1;
}

// Generate a random COMPLETE valid grid via randomized backtracking.
export function generateFull(rng, dims = DIMS9) {
  const { N } = dims;
  const peers = peersFor(dims);
  const grid = new Array(N * N).fill(0);
  function fill(idx) {
    if (idx === N * N) return true;
    if (grid[idx]) return fill(idx + 1);
    const cands = candidates(grid, dims, peers, idx);
    // shuffle candidates
    for (let k = cands.length - 1; k > 0; k--) { const j = Math.floor(rng() * (k + 1)); [cands[k], cands[j]] = [cands[j], cands[k]]; }
    for (const v of cands) {
      grid[idx] = v;
      if (fill(idx + 1)) return true;
      grid[idx] = 0;
    }
    return false;
  }
  fill(0);
  return grid;
}

// Dig holes out of a complete solution to produce a puzzle with a UNIQUE solution.
// - keepBlank: a Set of cell indices that MUST end up blank (the labeled cells the
//   player is meant to resolve by solving).
// - order: optional pre-shuffled cell order (else derived from rng).
// Returns { givens, removed } — givens has 0 in blanks, solution value elsewhere.
export function digToUnique(solution, dims, rng, { keepBlank = new Set(), maxRemove = Infinity } = {}) {
  const { N } = dims;
  const givens = solution.slice();
  // First force the required-blank cells to be empty, verifying uniqueness is retained.
  const order = [...Array(N * N).keys()];
  for (let k = order.length - 1; k > 0; k--) { const j = Math.floor(rng() * (k + 1)); [order[k], order[j]] = [order[j], order[k]]; }
  // Prioritise the required blanks first.
  order.sort((a, b) => (keepBlank.has(b) ? 1 : 0) - (keepBlank.has(a) ? 1 : 0));

  let removed = 0;
  for (const i of order) {
    if (givens[i] === 0) continue;
    if (removed >= maxRemove && !keepBlank.has(i)) continue;
    const backup = givens[i];
    givens[i] = 0;
    if (hasUniqueSolution(givens, dims)) {
      removed++;
    } else {
      // Removing this breaks uniqueness. If it's a required blank, this grid can't
      // host that blank set — signal failure so the caller reseeds.
      if (keepBlank.has(i)) { givens[i] = backup; return { givens, removed, failedBlank: i }; }
      givens[i] = backup; // keep it as a given
    }
  }
  return { givens, removed, failedBlank: null };
}

// ── Human-technique difficulty rating ────────────────────────────────────────
// Solves the puzzle with an escalating ladder of HUMAN techniques and reports the
// hardest one required. Used to author genuinely hard (not singles-only) grids that
// are STILL fully logic-solvable (never require a guess).
export const TECH_ORDER = ['naked-single', 'hidden-single', 'locked-candidates', 'naked-pair', 'STUCK'];
const techRank = (t) => TECH_ORDER.indexOf(t);

function unitsFor(dims) {
  const { N, bh, bw } = dims;
  const units = [];
  for (let r = 0; r < N; r++) units.push([...Array(N)].map((_, c) => r * N + c));       // rows
  for (let c = 0; c < N; c++) units.push([...Array(N)].map((_, r) => r * N + c));       // cols
  for (let b = 0; b < N; b++) {                                                          // boxes
    const { r0, c0 } = rcOfBox(dims, b), u = [];
    for (let a = 0; a < bh; a++) for (let d = 0; d < bw; d++) u.push((r0 + a) * N + (c0 + d));
    units.push(u);
  }
  return units;
}

// helper for rcOfBox parity with the engine's boxing (used by unitsFor)
function rcOfBox(dims, box) {
  const { bh, bw, N } = dims;
  const perRow = N / bw;                 // boxes per band-row
  const boxRow = Math.floor(box / perRow), boxCol = box % perRow;
  return { r0: boxRow * bh, c0: boxCol * bw };
}

// Returns { solved:boolean, hardest:string }. hardest is the hardest technique the
// ladder needed; 'STUCK' means it could not finish with techniques up to naked pairs
// (would need X-wing+ or a guess) — such grids are rejected so we never ship a guess.
export function rateDifficulty(givens, dims = DIMS9) {
  const { N } = dims;
  const peers = peersFor(dims);
  const units = unitsFor(dims);
  const board = givens.slice();
  const cand = board.map((v) => (v ? new Set([v]) : new Set([...Array(N)].map((_, k) => k + 1))));
  for (let i = 0; i < N * N; i++) if (board[i]) for (const p of peers[i]) cand[p].delete(board[i]);
  const place = (i, v) => { board[i] = v; cand[i] = new Set([v]); for (const p of peers[i]) cand[p].delete(v); };
  let hardest = 'naked-single';
  const bump = (t) => { if (techRank(t) > techRank(hardest)) hardest = t; };
  const solved = () => board.every((v) => v);

  let guard = 0;
  while (!solved() && guard++ < 2000) {
    let progress = false;
    // naked singles
    for (let i = 0; i < N * N; i++) if (!board[i] && cand[i].size === 1) { place(i, [...cand[i]][0]); bump('naked-single'); progress = true; }
    if (progress) continue;
    // hidden singles
    for (const u of units) for (let v = 1; v <= N; v++) {
      const spots = u.filter((i) => !board[i] && cand[i].has(v));
      if (spots.length === 1) { place(spots[0], v); bump('hidden-single'); progress = true; }
    }
    if (progress) continue;
    // locked candidates (pointing / claiming) — elimination
    for (const u of units) for (let v = 1; v <= N; v++) {
      const spots = u.filter((i) => !board[i] && cand[i].has(v));
      if (spots.length < 2 || spots.length > 3) continue;
      const common = [...peers[spots[0]]].filter((p) => spots.every((s) => peers[s].has(p)));
      for (const p of common) if (!board[p] && cand[p].delete(v)) { bump('locked-candidates'); progress = true; }
    }
    if (progress) continue;
    // naked pairs — elimination
    for (const u of units) {
      const twos = u.filter((i) => !board[i] && cand[i].size === 2);
      for (let a = 0; a < twos.length; a++) for (let b = a + 1; b < twos.length; b++) {
        const A = cand[twos[a]], B = cand[twos[b]];
        if ([...A].every((x) => B.has(x))) { const pair = [...A];
          for (const i of u) if (i !== twos[a] && i !== twos[b] && !board[i]) for (const x of pair) if (cand[i].delete(x)) { bump('naked-pair'); progress = true; } }
      }
    }
    if (progress) continue;
    return { solved: false, hardest: 'STUCK' };
  }
  return { solved: solved(), hardest };
}

// High-level: build a case grid where value `culprit` (1..N) sits at each cell in
// `labeledBoxes` (distinct boxes) and at `sceneBox`, all left BLANK in the givens so
// the player resolves them. Returns { solution, givens, labeledCells:{box->cell}, sceneCell }.
// Retries with fresh seeds until a unique-solution puzzle with all required blanks is found.
// `decoys` (optional): [{ id, box, value }] — extra labeled cells that resolve to a
// DIFFERENT value than the culprit (e.g. the "obvious heir" in the overlooked-culprit
// case). They are kept blank too, and returned as decoyCells{ id -> cell }.
// `minTech` (optional): require the dug grid's hardest human technique to be at least
// this (e.g. 'locked-candidates') AND fully logic-solvable by the ladder (no guessing).
// `maxTech` caps the top so we never ship a grid that needs harder than the ladder can
// verify. Grids outside the band are rejected and generation retries with a fresh seed.
export function buildCaseGrid({ seed, culprit, labeledBoxes, sceneBox, decoys = [], dims = DIMS9,
    targetBlanks = 50, maxTries = 600, minTech = null, maxTech = 'naked-pair' }) {
  const { N } = dims;
  for (let t = 0; t < maxTries; t++) {
    const rng = makeRNG((seed + t * 7919) >>> 0);
    const solution = generateFull(rng, dims);
    // Find the cell holding a given value in a given box.
    const cellInBox = (box, val) => {
      for (let i = 0; i < N * N; i++) {
        const r = Math.floor(i / N), c = i % N;
        if (boxOf(dims, r, c) === box && solution[i] === val) return i;
      }
      return -1;
    };
    const labeledCells = {};
    let ok = true;
    for (const b of labeledBoxes) { const cell = cellInBox(b, culprit); if (cell < 0) { ok = false; break; } labeledCells[b] = cell; }
    const sceneCell = cellInBox(sceneBox, culprit);
    if (!ok || sceneCell < 0) continue;

    const decoyCells = {};
    for (const d of decoys) {
      if (d.value === culprit) { ok = false; break; }        // a decoy must differ from the culprit
      const cell = cellInBox(d.box, d.value);
      if (cell < 0) { ok = false; break; }
      decoyCells[d.id] = cell;
    }
    if (!ok) continue;

    const keepBlank = new Set([...Object.values(labeledCells), sceneCell, ...Object.values(decoyCells)]);
    if (keepBlank.size !== labeledBoxes.length + 1 + decoys.length) continue;   // a collision (same cell twice)
    const dig = digToUnique(solution, dims, rng, { keepBlank, maxRemove: targetBlanks });
    if (dig.failedBlank !== null) continue;
    if (!hasUniqueSolution(dig.givens, dims)) continue;
    let allBlank = true;
    for (const cell of keepBlank) if (dig.givens[cell] !== 0) { allBlank = false; break; }
    if (!allBlank) continue;
    // difficulty band: require genuine technique but keep it fully logic-solvable.
    let rating = null;
    if (minTech) {
      rating = rateDifficulty(dig.givens, dims);
      if (!rating.solved) continue;                                          // needs a guess / harder than the ladder → reject
      if (techRank(rating.hardest) < techRank(minTech)) continue;            // too easy (e.g. singles-only) → reject
      if (maxTech && techRank(rating.hardest) > techRank(maxTech)) continue; // above the verified band → reject
    }
    return { solution, givens: dig.givens, labeledCells, sceneCell, decoyCells, removed: dig.removed, tries: t + 1, rating };
  }
  throw new Error(`buildCaseGrid: no valid grid found in ${maxTries} tries (seed=${seed}, culprit=${culprit}, minTech=${minTech})`);
}
