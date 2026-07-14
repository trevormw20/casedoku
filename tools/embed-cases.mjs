// Serialise tools/cases.data.mjs (source of truth) into index.html between the
// HAND_CASES markers. Run after editing cases.data.mjs, then run verify-cases.mjs.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { HAND_CASES } from './cases.data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IDX = join(ROOT, 'index.html');
const START = '/*HAND_CASES_START*/';
const END = '/*HAND_CASES_END*/';

let html = readFileSync(IDX, 'utf8');
const si = html.indexOf(START);
const ei = html.indexOf(END);
if (si < 0 || ei < 0 || ei < si) { console.error('HAND_CASES markers not found in index.html'); process.exit(1); }

const json = JSON.stringify(HAND_CASES);
const block = `${START}\nconst HAND_CASES=${json};\n${END}`;
html = html.slice(0, si) + block + html.slice(ei + END.length);
writeFileSync(IDX, html);
console.log(`Embedded ${HAND_CASES.length} hand cases (${json.length} bytes) into index.html.`);
