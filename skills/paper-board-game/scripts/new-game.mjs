#!/usr/bin/env node
// Copy the starter project into a new folder and fill in the game name and today's date.
//   node new-game.mjs <target-dir> "<Game name>"
// The target must not exist or must be empty. Afterwards: cd <target-dir>, npm install, npm run browser, npm test.
import { cpSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const [target, name = 'Nieuw spel'] = process.argv.slice(2);
if (!target) {
  console.error('Usage: node new-game.mjs <target-dir> "<Game name>"');
  process.exit(1);
}
const dest = resolve(target);
if (existsSync(dest) && readdirSync(dest).length) {
  console.error(`${dest} is not empty. Pick a new folder.`);
  process.exit(1);
}
const starter = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'starter');
cpSync(starter, dest, { recursive: true, filter: (src) => !/[\\/](node_modules|out)([\\/]|$)/.test(src) });

const today = new Date().toISOString().slice(0, 10);
const slug = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'game';
for (const file of ['CLAUDE.md', 'docs/specs/game.md', 'docs/specs/game.tasks.md', 'package.json']) {
  const p = join(dest, file);
  const text = readFileSync(p, 'utf8')
    .replaceAll('{{GAME_NAME}}', name)
    .replaceAll('{{DATE}}', today)
    .replace('"name": "voorbeeldspel"', `"name": "${slug}"`);
  writeFileSync(p, text);
}

console.log(`Starter copied to ${dest}
Next:
  cd "${dest}"
  npm install && npm run browser     (Playwright + Chromium for the PDFs)
  npm test                            (20 tests on the example game)
  node scripts/balance.mjs 500        (sims and warnings)
  npm run print                       (PDFs, CMYK with Ghostscript, checks)
Then fill in the {{…}} placeholders in CLAUDE.md and docs/specs/, and replace the example game in src/data.js step by step.`);
