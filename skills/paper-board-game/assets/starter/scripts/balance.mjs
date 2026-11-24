// Balance report: many simulated games, the summary and the warnings (SIM-*).
//   node scripts/balance.mjs [games]
//   CONFIG='{"attack":{"failCost":0,"maxPerTurn":99}}' node scripts/balance.mjs     (try a rule change first)
//   REPORT=1 node scripts/balance.mjs    → also writes docs/balance.md (replace it, do not pile up reports)
// Runs three tables: the normal mix of styles, a pushy table and a careful table, so a rule that only works for
// polite players shows up.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SIM, TEAMS, RULES } from '../src/data.js';
import { simulateGame } from '../src/sim.js';
import { summarize, warningsFor } from '../src/stats.js';
import { attackChance, configFor } from '../src/engine.js';

const games = Number(process.argv[2]) || SIM.games;
const config = process.env.CONFIG ? JSON.parse(process.env.CONFIG) : {};
const cfg = configFor(config);

const TABLES = {
  mix: (seed) => Object.fromEntries(TEAMS.map((t, i) => [t.id, { aggression: ((seed * 7 + i * 3) % 10) / 10, reckless: 0.1 }])),
  pushy: () => Object.fromEntries(TEAMS.map((t) => [t.id, { aggression: 1, reckless: 0.4 }])),
  careful: () => Object.fromEntries(TEAMS.map((t) => [t.id, { aggression: 0.3, reckless: 0 }]))
};

const f = (v, d = 0) => (Number.isFinite(v) ? v.toFixed(d) : '–');
const lines = [];
const out = (s = '') => { lines.push(s); console.log(s); };
const allWarnings = [];

out(`# Balance report`);
out('');
out(`${games} games per table · ${cfg.rounds} rounds · attack ${cfg.attack.attackDice} vs ${cfg.attack.defendDice} dice (${f(100 * attackChance(cfg.attack.attackDice, cfg.attack.defendDice))} % for the attacker), failed attack costs ${cfg.attack.failCost} fr, max ${cfg.attack.maxPerTurn} per turn`);
if (Object.keys(config).length) out(`CONFIG: \`${JSON.stringify(config)}\` (data.js: \`${JSON.stringify({ attack: RULES.attack })}\`)`);
out('');
out('| Table | Win % per start position | Leader 2 rounds before wins | Stuck | Attacks / round | Failed / round | Attacks of all actions | Repeat target | Pieces per colour | Money to print |');
out('|---|---|---|---|---|---|---|---|---|---|');
for (const [name, styles] of Object.entries(TABLES)) {
  const recs = [];
  for (let seed = 1; seed <= games; seed++) recs.push(simulateGame({ seed, config, styles: styles(seed) }));
  const s = summarize(recs);
  const starts = Object.entries(s.byStart).map(([k, v]) => `${k}: ${f(v.pct)}`).join(' · ');
  out(`| ${name} | ${starts} | ${f(s.leaderBeforePct)} % | ${f(s.stuckPct, 1)} % | ${f(s.attack.perRound, 1)} | ${f(s.attack.failedPerRound, 1)} | ${f(s.attack.shareOfActions)} % | ${f(s.attack.repeatPct)} % | ${s.material.piecesPerColour} | ${s.material.moneyToPrint} fr |`);
  allWarnings.push(...warningsFor(s, name));
}
out('');
out(allWarnings.length ? `## Warnings (${allWarnings.length})` : '## No warnings');
for (const w of allWarnings) out(`- ${w.id}: ${w.text}`);

if (process.env.REPORT) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  mkdirSync(join(root, 'docs'), { recursive: true });
  writeFileSync(join(root, 'docs', 'balance.md'), `${lines.join('\n')}\n`);
  console.log('\n→ docs/balance.md');
}
process.exitCode = allWarnings.length && process.env.STRICT ? 1 : 0;
