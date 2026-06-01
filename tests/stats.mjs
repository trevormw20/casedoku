import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, "..", "index.html"), "utf8");
const code = /<script id="cludoku-engine">([^]*?)<\/script>/.exec(html)[1];
(0,eval)(code); const E=globalThis.CludokuEngine;
for(const tier of ["easy","medium","hard","extreme"]){
  let g=0,comp=0,cl=0,scene=0,n=30; const types={};
  for(let t=0;t<n;t++){ const C=E.generateCase({difficulty:tier,seed:E.hashStr("s"+tier+t)});
    g+=C.givens.filter(x=>x).length; comp+=C.completionsWithout; cl+=C.clues.length; scene+=C.sceneCandidates.length;
    for(const c of C.clues) types[c.type]=(types[c.type]||0)+1; }
  const tp=Object.entries(types).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}:${(v/n).toFixed(1)}`).join(" ");
  console.log(`${tier.padEnd(8)} givens=${(g/n).toFixed(0)} comps=${(comp/n).toFixed(0)} clues=${(cl/n).toFixed(1)} scene-suspects=${(scene/n).toFixed(1)}  types/case: ${tp}`);
}
