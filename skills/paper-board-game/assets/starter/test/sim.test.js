// Simulations and warnings: invariants on many games, and the warning rules on hand-made summaries.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simulateGame } from '../src/sim.js';
import { summarize, warningsFor } from '../src/stats.js';
import { SIM } from '../src/data.js';

test('a seed replays the same game', () => {
  assert.deepEqual(simulateGame({ seed: 7 }), simulateGame({ seed: 7 }));
});

test('money never goes negative and every game ends', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const rec = simulateGame({ seed, check: (s) => Object.values(s.teams).forEach((t) => assert.ok(t.money >= 0)) });
    assert.equal(rec.capped, false);
    assert.ok(rec.winners.length >= 1);
  }
});

test('free unlimited attacks light up the SIM-6 warnings (the lesson from the first game)', () => {
  const config = { attack: { failCost: 0, maxPerTurn: 99 } };
  const recs = Array.from({ length: 300 }, (_, i) => simulateGame({ seed: i + 1, config }));
  const ids = warningsFor(summarize(recs)).map((w) => w.id);
  assert.ok(ids.includes('SIM-6'), `expected SIM-6, got ${ids.join(', ') || 'nothing'}`);
});

test('the warning rules fire on their limits', () => {
  const L = SIM.limits;
  const base = { games: 10, capped: 0, byStart: { 1: { pct: 33 } }, leaderBeforePct: 50, stuckPct: 0, attack: { shareOfActions: 10, failedPerRound: 0, repeatPct: 0 } };
  assert.deepEqual(warningsFor(base), []);
  assert.equal(warningsFor({ ...base, byStart: { 1: { pct: L.fairPct[1] + 1 } } })[0].id, 'SIM-1');
  assert.equal(warningsFor({ ...base, leaderBeforePct: L.leaderBeforePct + 1 })[0].id, 'SIM-2');
  assert.equal(warningsFor({ ...base, attack: { ...base.attack, failedPerRound: L.attack.failedPerRoundMax + 1 } })[0].id, 'SIM-6');
});
