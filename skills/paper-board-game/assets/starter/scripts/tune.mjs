// Compare several rule tries side by side: one CONFIG JSON per line on stdin.
//   printf '%s\n' '{}' '{"attack":{"failCost":0}}' '{"attack":{"maxPerTurn":2}}' | node scripts/tune.mjs 500
// Every try runs the same seeds on the mix and the pushy table; the row shows the numbers that matter most.
import { TEAMS } from '../src/data.js';
import { simulateGame } from '../src/sim.js';
import { summarize, warningsFor } from '../src/stats.js';

const games = Number(process.argv[2]) || 500;
const input = await new Promise((res) => { let d = ''; process.stdin.on('data', (c) => (d += c)); process.stdin.on('end', () => res(d)); });
const tries = input.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => JSON.parse(l));
const TABLES = {
  mix: (seed) => Object.fromEntries(TEAMS.map((t, i) => [t.id, { aggression: ((seed * 7 + i * 3) % 10) / 10, reckless: 0.1 }])),
  pushy: () => Object.fromEntries(TEAMS.map((t) => [t.id, { aggression: 1, reckless: 0.4 }]))
};
const f = (v, d = 0) => (Number.isFinite(v) ? v.toFixed(d) : '–');

console.log('| CONFIG | Start % (mix) | Leader wins | Attacks of actions (mix / pushy) | Failed / round (mix / pushy) | Warnings |');
console.log('|---|---|---|---|---|---|');
for (const config of tries) {
  const sums = {};
  for (const [name, styles] of Object.entries(TABLES)) {
    const recs = [];
    for (let seed = 1; seed <= games; seed++) recs.push(simulateGame({ seed, config, styles: styles(seed) }));
    sums[name] = summarize(recs);
  }
  const warnings = Object.entries(sums).flatMap(([n, s]) => warningsFor(s, n));
  const starts = Object.values(sums.mix.byStart).map((v) => f(v.pct)).join('/');
  console.log(`| \`${JSON.stringify(config)}\` | ${starts} | ${f(sums.mix.leaderBeforePct)} % | ${f(sums.mix.attack.shareOfActions)} / ${f(sums.pushy.attack.shareOfActions)} % | ${f(sums.mix.attack.failedPerRound, 1)} / ${f(sums.pushy.attack.failedPerRound, 1)} | ${warnings.length} ${warnings.map((w) => w.id).join(' ')} |`);
}
