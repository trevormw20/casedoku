// One-time authoring helper: generate the 3 detective-case grids (deterministic seeds)
// and print solution/givens + the labeled/scene/decoy cell indices to embed in index.html.
// The shipped cases embed the FROZEN output; verify-cases.mjs re-checks the embedded grids.
import { DIMS9, buildCaseGrid, boxOf, hasUniqueSolution } from './sudoku.mjs';

const N = 9;
const rc = (i) => `r${Math.floor(i / N)}c${i % N} (box ${boxOf(DIMS9, Math.floor(i / N), i % N)})`;

const CONFIGS = [
  { key: 'case1', seed: 101, culprit: 3, labeledBoxes: [1, 7], sceneBox: 4, decoys: [], targetBlanks: 47 },
  { key: 'case2', seed: 202, culprit: 6, labeledBoxes: [4, 6], sceneBox: 2, decoys: [], targetBlanks: 47 },
  { key: 'case3', seed: 303, culprit: 8, labeledBoxes: [3, 5], sceneBox: 8,
    decoys: [{ id: 'quarrel', box: 1, value: 2 }], targetBlanks: 47 },
];

const out = {};
for (const cfg of CONFIGS) {
  const g = buildCaseGrid(cfg);
  const blanks = g.givens.filter((x) => !x).length;
  out[cfg.key] = {
    seed: cfg.seed, culpritValue: cfg.culprit,
    solution: g.solution, givens: g.givens,
    murderCell: g.sceneCell, sceneBox: cfg.sceneBox,
    labeledCells: cfg.labeledBoxes.map((b) => ({ box: b, cell: g.labeledCells[b] })),
    decoyCells: g.decoyCells,
  };
  console.log(`\n=== ${cfg.key} (seed ${cfg.seed}, culprit value ${cfg.culprit}) ===`);
  console.log(`unique solution: ${hasUniqueSolution(g.givens)}  |  givens ${81 - blanks}  blanks ${blanks}  |  tries ${g.tries}`);
  console.log(`scene (murderCell): cell ${g.sceneCell} = ${rc(g.sceneCell)}  val ${g.solution[g.sceneCell]}`);
  for (const b of cfg.labeledBoxes) console.log(`labeled box ${b}: cell ${g.labeledCells[b]} = ${rc(g.labeledCells[b])}  val ${g.solution[g.labeledCells[b]]}`);
  for (const [id, cell] of Object.entries(g.decoyCells)) console.log(`decoy '${id}': cell ${cell} = ${rc(cell)}  val ${g.solution[cell]}`);
}

// Emit compact JSON for embedding.
console.log('\n\n===== EMBED JSON =====');
console.log(JSON.stringify(out));
