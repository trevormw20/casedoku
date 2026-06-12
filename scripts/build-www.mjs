// Build the Capacitor web root (www/) from the game's source of truth.
// The repo root can't be used as Capacitor's webDir directly: it holds node_modules,
// .git, docs, the android/ project, etc., all of which would otherwise be bundled into
// the APK. So we copy ONLY what the WebView needs — index.html + assets/ — into www/.
// index.html and assets/ remain the single source of truth; www/ is generated (gitignored).
import { rmSync, mkdirSync, cpSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const www = join(root, 'www');

rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });

cpSync(join(root, 'index.html'), join(www, 'index.html'));
cpSync(join(root, 'assets'), join(www, 'assets'), { recursive: true });

const sizeMB = (() => {
  // rough: just confirm the entry files exist
  return existsSync(join(www, 'index.html')) && existsSync(join(www, 'assets'));
})();
console.log(`[build-www] www/ rebuilt — index.html: ${statSync(join(www, 'index.html')).size} bytes, assets: ${sizeMB ? 'copied' : 'MISSING'}`);
