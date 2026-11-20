// AFTERGLOW Cover Studio — entry program.
// Hands the app in: copies app/ and screenshots/ to /output (MAKEFUN_OUTPUT_DIR
// outside the grader) and writes /output/dossier.json with buildDossier from
// vendor/makefun-app.ts, exactly as the kit's starter main.ts does.

import { buildDossier } from './vendor/makefun-app.ts';
import { cpSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const root = import.meta.dirname;

function copyDir(from, to) {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

const appDir = join(root, 'app');
const shotsDir = join(root, 'screenshots');
if (!existsSync(appDir)) throw new Error('app/ not found — run from the repository root');
if (!existsSync(shotsDir)) throw new Error('screenshots/ not found — take 3–4 screenshots first');

mkdirSync(outDir, { recursive: true });
copyDir(appDir, join(outDir, 'app'));
copyDir(shotsDir, join(outDir, 'screenshots'));
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`[afterglow] app/ + screenshots/ copied to ${outDir}, dossier.json written`);
