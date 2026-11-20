// Vice Grid Cover Studio v2 — the entry program for gta6-cover-art-01
// (Node 22, standard library only). The app itself is plain static files
// under app/ (index.html plus its ES modules, the bundled Anton font and
// sample photos), so this program only hands it in: it copies app/ and
// screenshots/ from beside this file into the output directory and writes
// dossier.json there with the vendored make.fun library, which is what
// the judge reads. v2 turns the cover into a full movie poster: 8 layouts
// (Poster Seven with a hero pop-out, Cinema Strip), 8 grades, a giant
// striped retro-chrome title, cast role tags, press quote, billing block,
// starburst seal, barcode and face-aware focus-point crops. The demo
// screenshots in screenshots/ come from the ?shot= scenes in
// app/src/shots.js (see shots.json); this program only copies app/ and
// screenshots/ — nothing else in the worktree is part of the entry.
//
// Serve the app locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail fast on a screenshots/ folder the scorer would refuse, instead of
// writing a dossier for an entry that cannot pass the gate: at most 4
// screenshots, each at most 256 KiB (the caps in the kit's reference/gate.json).
const shotsDir = join(here, 'screenshots');
if (existsSync(shotsDir)) {
  const shots = readdirSync(shotsDir).filter((f) => statSync(join(shotsDir, f)).isFile());
  if (shots.length > 4) throw new Error(`screenshots/: ${shots.length} files, gate allows at most 4`);
  for (const f of shots) {
    const bytes = statSync(join(shotsDir, f)).size;
    if (bytes > 262144) throw new Error(`screenshots/${f}: ${bytes} bytes, gate allows at most 262144`);
  }
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (from the kit's reference/gate.json): text_max_bytes
// shapes the dossier text, and the rest refuse an entry the scorer would
// refuse — more than 4 screenshots or one over 256 KiB, more than 993 files
// in app/ or 48 MiB of app files in all, or a path under app/ over 1000
// bytes. app/ counts beside /output's own 1000-entry cap, together with
// screenshots/ and dossier.json.
// The program is deterministic: it copies the same files and the vendored
// library writes the same dossier bytes on every run, so two runs in a row
// produce byte-identical output.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
