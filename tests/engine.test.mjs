/* Rigorous correctness test for the Cludoku engine.
   Extracts the SHIPPED engine <script> from index.html and evals it, so we test
   exactly the code that runs in the browser (no separate copy to drift).

   Verifies, across all four tiers and many seeds:
     1. solution is a valid Latin square
     2. givens are a subset of the solution
     3. givens ALONE are ambiguous (>=2 completions) — clues are load-bearing
     4. givens + clues == exactly the one solution
     5. every clue is true of the solution
     6. the killer is provably forced (scene ambiguous without clues, unique with)
     7. the reasoning chain holds (each ruled-out rival really violates its clue)
     8. seeded determinism (same seed -> identical case)
     9. case codes round-trip
*/
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, "..", "index.html"), "utf8");

function extract(id){
  const m = new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`).exec(html);
  if(!m) throw new Error("could not find <script id='"+id+"'>");
  return m[1];
}
// eval engine into this global scope
(0, eval)(extract("cludoku-engine"));
const E = globalThis.CludokuEngine;
if(!E) throw new Error("engine did not attach to globalThis");

const TRIALS = Number(process.argv[2] || 25);
console.log(`Running engine self-test: ${TRIALS} trials per tier...\n`);

const t0 = Date.now();
const report = E.selfTest({ trials: TRIALS });
const ms = Date.now() - t0;

console.log("Timings:", report.timings);
console.log("\nExample cases:");
for(const [tier, ex] of Object.entries(report.examples)){
  console.log(`  ${tier.padEnd(8)} code=${ex.code}  givens=${ex.givens}  ` +
    `completions-without-clues=${ex.completionsWithout}  clues=${ex.clues}  scene-suspects=${ex.sceneCandidates}`);
}

if(report.fails.length){
  console.log("\nFAILURES:");
  for(const f of report.fails.slice(0,20)) console.log("  ", JSON.stringify(f));
}

console.log(`\nRESULT: ${report.pass} passed, ${report.fail} failed  (${ms}ms total)`);
process.exit(report.fail === 0 ? 0 : 1);
