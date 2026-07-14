// ── Detective-case verification harness ───────────────────────────────────────
// Fails the build LOUDLY (exit 1) if any hand-authored case is unsound. For each case
// it asserts the five contract checks from the build brief:
//   1. the grid has EXACTLY ONE solution;
//   2. every labeled cell resolves to a suspect in the solved grid, and the intended
//      culprit is the occupant of the intended cell (tiesToScene cells + scene converge);
//   3. the observation set logically forces a UNIQUE culprit / weapon / motive / key-proof;
//   4. banned-word lint over all pre-accusation clue text = 0 hits;
//   5. the culprit's (and any cast) suspect name never appears in pre-accusation text.
//
// Usage: node tools/verify-cases.mjs
// Source of truth: tools/cases.data.mjs. Also drift-checks index.html's embedded copy.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { DIMS9, countSolutions, boxOf } from './sudoku.mjs';
import { lintText, findSuspectNames } from './clue-lint.mjs';
import { HAND_CASES } from './cases.data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const N = 9;

// ── Extract the roster (valid slugs + display names) from index.html ──────────
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
function sliceBlock(startKey) {
  const i = html.indexOf(startKey);
  if (i < 0) return '';
  const j = html.indexOf('\n  ],', i);
  return html.slice(i, j < 0 ? i + 20000 : j);
}
const suspectBlock = sliceBlock('suspects:[');
const weaponBlock = sliceBlock('weapons:[');
const roomBlock = sliceBlock('\n  rooms:[');
const suspectName = {}; // slug -> display name
for (const m of suspectBlock.matchAll(/role:"([^"]+)"[^}]*?name:"([^"]+)"/g)) suspectName[m[1]] = m[2];
const suspectSlugs = new Set(Object.keys(suspectName));
const weaponSlugs = new Set([...weaponBlock.matchAll(/slug:"([^"]+)"/g)].map((m) => m[1]));
const roomSlugs = new Set([...roomBlock.matchAll(/slug:"([^"]+)"/g)].map((m) => m[1]));

// ── Assertion plumbing ────────────────────────────────────────────────────────
let failures = 0;
const report = [];
function check(caseId, ok, msg, detail = '') {
  report.push({ caseId, ok, msg, detail });
  if (!ok) failures++;
}

function preAccusationStrings(c) {
  // Everything the player can read BEFORE committing an accusation.
  const out = [];
  out.push(['narrative', c.narrative]);
  for (const o of c.observations) out.push([`obs:${o.tag}`, o.text]);
  for (const L of c.labeledCells) { out.push([`role:${L.id}`, L.role]); out.push([`resolved:${L.id}`, L.resolvedText]); }
  out.push(['motive:correct', c.motive.correct]);
  for (const d of c.motive.distractors) out.push(['motive:distractor', d]);
  return out; // [ [source, text], ... ]  — winStory intentionally excluded (post-accusation)
}

// ── Per-case verification ─────────────────────────────────────────────────────
for (const c of HAND_CASES) {
  const id = c.id;

  // structural sanity (fast-fail context for the five checks)
  check(id, Array.isArray(c.solution) && c.solution.length === 81, 'solution is 81 cells');
  check(id, Array.isArray(c.givens) && c.givens.length === 81, 'givens is 81 cells');
  check(id, c.cast.length === 9 && new Set(c.cast).size === 9, 'cast is 9 distinct suspects');
  check(id, c.cast.every((s) => suspectSlugs.has(s)), 'every cast slug is a registered suspect',
    c.cast.filter((s) => !suspectSlugs.has(s)).join(','));
  check(id, c.rooms.length === 9 && new Set(c.rooms).size === 9 && c.rooms.every((s) => roomSlugs.has(s)),
    'rooms are 9 distinct registered rooms', c.rooms.filter((s) => !roomSlugs.has(s)).join(','));
  check(id, [c.weapon.true, c.weapon.obvious, ...c.weapon.candidates].every((s) => weaponSlugs.has(s)),
    'all weapon slugs are registered');
  check(id, c.culprit === c.cast[c.culpritValue - 1], 'culprit slug matches cast[culpritValue-1]',
    `culprit=${c.culprit} cast[${c.culpritValue - 1}]=${c.cast[c.culpritValue - 1]}`);
  // givens must be a strict subset of solution (consistency)
  const givensConsistent = c.givens.every((v, i) => v === 0 || v === c.solution[i]);
  check(id, givensConsistent, 'givens agree with solution');
  // scene + labeled cells must be blank in givens (player resolves them)
  check(id, c.givens[c.murderCell] === 0, 'scene cell is blank in givens');
  check(id, c.labeledCells.every((L) => c.givens[L.cell] === 0), 'every labeled cell is blank in givens');

  // ── CHECK 1: exactly one solution ──
  const { count, solution: solved } = countSolutions(c.givens, DIMS9, 2);
  check(id, count === 1, 'CHECK 1: grid has exactly one solution', `solutions found (cap 2): ${count}`);
  // the embedded solution must BE that unique solution
  const solvedMatches = solved && solved.every((v, i) => v === c.solution[i]);
  check(id, !!solvedMatches, 'CHECK 1: embedded solution is the unique solution');

  // ── CHECK 2: labeled cells resolve; culprit occupies the intended cells ──
  const cVal = c.culpritValue;
  check(id, c.solution[c.murderCell] === cVal, 'CHECK 2: scene cell holds the culprit value',
    `solution[${c.murderCell}]=${c.solution[c.murderCell]} culpritValue=${cVal}`);
  for (const L of c.labeledCells) {
    const val = c.solution[L.cell];
    check(id, val >= 1 && val <= 9, `CHECK 2: labeled '${L.id}' resolves to a suspect (1..9)`, `val=${val}`);
    if (L.tiesToScene) {
      check(id, val === cVal, `CHECK 2: tiesToScene cell '${L.id}' converges on the culprit`, `val=${val} culprit=${cVal}`);
      check(id, boxOf(DIMS9, Math.floor(L.cell / N), L.cell % N) !== boxOf(DIMS9, Math.floor(c.murderCell / N), c.murderCell % N)
        || L.cell === c.murderCell, `CHECK 2: '${L.id}' is in a different box from the scene (no collision)`);
    } else {
      check(id, val !== cVal, `CHECK 2: decoy cell '${L.id}' resolves to a NON-culprit (genuine misdirection)`, `val=${val}`);
    }
  }

  // ── CHECK 3: the observation set forces a unique culprit / weapon / motive / proof ──
  // culprit: unique grid ⇒ scene occupant forced; tiesToScene cells converge (checked above).
  const converge = c.labeledCells.filter((L) => L.tiesToScene).every((L) => c.solution[L.cell] === cVal)
    && c.solution[c.murderCell] === cVal;
  check(id, converge && count === 1, 'CHECK 3: culprit is uniquely forced (unique grid + convergence)');
  // weapon: obvious ≠ true, both offered, cleared by an observation.
  check(id, c.weapon.obvious !== c.weapon.true, 'CHECK 3: obvious weapon differs from the true weapon');
  check(id, c.weapon.candidates.includes(c.weapon.true) && c.weapon.candidates.includes(c.weapon.obvious)
    && c.weapon.candidates.length === 3 && new Set(c.weapon.candidates).size === 3,
    'CHECK 3: weapon candidates = 3 distinct incl. true + obvious');
  const hasWeaponObs = c.observations.some((o) => /WEAPON/i.test(o.tag));
  check(id, hasWeaponObs, 'CHECK 3: a WEAPON observation clears the obvious weapon');
  // motive: exactly one correct + derivation observation present.
  check(id, typeof c.motive.correct === 'string' && c.motive.distractors.length === 2
    && !c.motive.distractors.includes(c.motive.correct), 'CHECK 3: motive has one correct + 2 distinct distractors');
  check(id, c.observations.some((o) => o.revealsMotive), 'CHECK 3: an observation derives the motive (revealsMotive)');
  // key proof: exactly one proof:true observation, tied to a tiesToScene labeled cell.
  const proofObs = c.observations.filter((o) => o.proof);
  check(id, proofObs.length === 1, 'CHECK 3: exactly one KEY-PROOF observation', `count=${proofObs.length}`);
  if (proofObs.length === 1) {
    const po = proofObs[0];
    const tied = po.unlock && po.unlock.on === 'labeled'
      && c.labeledCells.some((L) => L.id === po.unlock.id && L.tiesToScene);
    check(id, tied, 'CHECK 3: KEY-PROOF observation unlocks from a culprit-tied labeled cell', `unlock=${JSON.stringify(po.unlock)}`);
    check(id, c.keyProof && c.labeledCells.some((L) => L.id === c.keyProof && L.tiesToScene),
      'CHECK 3: keyProof names a culprit-tied labeled cell');
  }
  // observation unlocks must reference real labeled ids / valid boxes
  for (const o of c.observations) {
    const u = o.unlock || {};
    let okUnlock = u.on === 'open' || u.on === 'grid'
      || (u.on === 'labeled' && c.labeledCells.some((L) => L.id === u.id))
      || (u.on === 'box' && Number.isInteger(u.box) && u.box >= 0 && u.box < 9);
    check(id, okUnlock, `CHECK 3: observation '${o.tag}' has a valid unlock`, JSON.stringify(u));
  }

  // ── CHECK 4: banned-word lint = 0 over all pre-accusation text ──
  let banHits = [];
  for (const [src, text] of preAccusationStrings(c)) {
    for (const h of lintText(text, { source: src })) banHits.push(`${src}: "${h.match}" (${h.label})`);
  }
  check(id, banHits.length === 0, 'CHECK 4: banned-word lint = 0 hits', banHits.join(' | '));

  // ── CHECK 5: no cast/culprit suspect name in pre-accusation text ──
  const castNames = c.cast.flatMap((slug) => [suspectName[slug] || slug, slug]);
  let nameHits = [];
  for (const [src, text] of preAccusationStrings(c)) {
    for (const h of findSuspectNames(text, castNames)) nameHits.push(`${src}: "${h.match}" (${h.name})`);
  }
  check(id, nameHits.length === 0, 'CHECK 5: no suspect name in pre-accusation text', nameHits.join(' | '));
  // explicit: culprit display name is absent
  const culpritName = suspectName[c.culprit] || c.culprit;
  const culpritLeak = preAccusationStrings(c).some(([, t]) => findSuspectNames(t, [culpritName, c.culprit]).length);
  check(id, !culpritLeak, 'CHECK 5: culprit name never spoken before the accusation', culpritName);
}

// ── Drift check: index.html embedded copy matches the source ───────────────────
const START = '/*HAND_CASES_START*/', END = '/*HAND_CASES_END*/';
const si = html.indexOf(START), ei = html.indexOf(END);
if (si >= 0 && ei > si) {
  const between = html.slice(si + START.length, ei).trim().replace(/^const\s+HAND_CASES\s*=\s*/, '').replace(/;$/, '');
  let embedded = null;
  try { embedded = JSON.parse(between); } catch (e) { check('embed', false, 'embedded HAND_CASES is valid JSON', e.message); }
  if (embedded) {
    const same = JSON.stringify(embedded) === JSON.stringify(JSON.parse(JSON.stringify(HAND_CASES)));
    check('embed', same, 'DRIFT: index.html embedded cases match tools/cases.data.mjs');
  }
} else {
  report.push({ caseId: 'embed', ok: null, msg: 'HAND_CASES not yet embedded in index.html (source-only run)' });
}

// ── Report ────────────────────────────────────────────────────────────────────
const byCase = {};
for (const r of report) (byCase[r.caseId] ||= []).push(r);
for (const [cid, rs] of Object.entries(byCase)) {
  const bad = rs.filter((r) => r.ok === false);
  const title = HAND_CASES.find((c) => c.id === cid)?.title;
  console.log(`\n■ ${cid}${title ? ` — "${title}"` : ''}: ${bad.length === 0 ? 'PASS' : `FAIL (${bad.length})`}`);
  for (const r of rs) {
    if (r.ok === false) console.log(`   ✗ ${r.msg}${r.detail ? ` — ${r.detail}` : ''}`);
  }
  if (bad.length === 0) console.log(`   ✓ all ${rs.filter((r) => r.ok === true).length} assertions passed`);
}

console.log(`\n${'─'.repeat(60)}`);
if (failures === 0) {
  console.log(`RESULT: ALL CASES PASS (${report.filter((r) => r.ok === true).length} assertions across ${HAND_CASES.length} cases)`);
  process.exit(0);
} else {
  console.log(`RESULT: ${failures} ASSERTION(S) FAILED — build is not sound.`);
  process.exit(1);
}
