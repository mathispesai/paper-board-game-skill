// Aggregates simulated games into the numbers the spec checks, and turns them into warnings with the spec ID first.
// Kept apart from scripts/balance.mjs so the tests can check the warning rules on hand-made summaries.

import { SIM } from './data.js';
import { leaderAfter } from './sim.js';

// #region ***  Small helpers                            ***********
export const quantile = (list, q) => {
  if (!list.length) return NaN;
  const a = list.slice().sort((x, y) => x - y);
  return a[Math.min(a.length - 1, Math.max(0, Math.round(q * (a.length - 1))))];
};
export const median = (list) => quantile(list, 0.5);
export const mean = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : NaN);
const pct = (part, whole) => (whole ? (100 * part) / whole : NaN);
const sum = (list) => list.reduce((a, b) => a + b, 0);
// #endregion

// #region ***  Summary                                  ***********
export const summarize = (recs) => {
  const done = recs.filter((r) => !r.capped);
  const teams = done.flatMap((r) => r.teams);
  const byStart = {};
  for (const t of teams) {
    const k = t.startPos + 1;
    byStart[k] = byStart[k] || { wins: 0, n: 0 };
    byStart[k].wins += t.win;
    byStart[k].n += 1;
  }
  // SIM-2: does the leader of 2 rounds before the end win too often?
  const led = done.filter((r) => r.history.length >= 3).map((r) => [leaderAfter(r.history[r.history.length - 3]), r.winners]).filter(([l]) => l);
  const I = (k) => sum(done.map((r) => r.interaction[k]));
  const rounds = sum(done.map((r) => r.rounds));
  const maxSpots = Math.max(0, ...teams.map((t) => t.maxSpots));
  const moneyP99 = quantile(done.map((r) => r.maxMoneyTotal), 0.99);
  return {
    games: recs.length,
    capped: recs.length - done.length,
    byStart: Object.fromEntries(Object.entries(byStart).map(([k, v]) => [k, { pct: pct(v.wins, v.n), n: v.n }])),
    leaderBeforePct: pct(led.filter(([l, w]) => w.includes(l)).length, led.length),
    stuckPct: pct(done.filter((r) => r.stuckTeam).length, done.length),
    // SIM-6: how the interactive action is used. Who wins is not enough: also how often, how often in vain,
    // and how often the same target again.
    attack: {
      perRound: I('attacks') / rounds,
      failedPerRound: I('attacksFailed') / rounds,
      wonPct: pct(I('attacksWon'), I('attacks')),
      shareOfActions: pct(I('attacks'), I('actions')),
      turnsWithAttackPct: pct(I('attackTurns'), I('turns')),
      repeatPct: pct(I('repeats'), I('attacks')),
      maxInTurn: Math.max(0, ...done.map((r) => r.interaction.maxAttacksInTurn))
    },
    // MAT: how much material you need (pieces per colour, money in circulation).
    material: {
      maxSpotsPerTeam: maxSpots,
      piecesPerColour: maxSpots + SIM.limits.material.spareSpots,
      moneyP99: moneyP99,
      moneyToPrint: Math.ceil(moneyP99 * SIM.limits.material.moneyMargin)
    }
  };
};
// #endregion

// #region ***  Warnings                                 ***********
export const warningsFor = (s, label = '', { limits: L = SIM.limits } = {}) => {
  const w = [];
  const add = (id, text) => w.push({ id, text: `${label ? `[${label}] ` : ''}${text}` });
  const f = (v, d = 0) => (Number.isFinite(v) ? v.toFixed(d) : '–');
  if (s.capped) add('SIM-5', `${s.capped} of ${s.games} games did not end within ${SIM.roundCap} rounds`);
  for (const [k, v] of Object.entries(s.byStart)) {
    if (!(v.pct >= L.fairPct[0] && v.pct <= L.fairPct[1])) add('SIM-1', `start position ${k} wins ${f(v.pct)} %, outside ${L.fairPct[0]}–${L.fairPct[1]} %`);
  }
  if (s.leaderBeforePct > L.leaderBeforePct) add('SIM-2', `the leader 2 rounds before the end wins ${f(s.leaderBeforePct)} % (max ${L.leaderBeforePct} %)`);
  if (s.stuckPct > L.stuckPct) add('SIM-3', `in ${f(s.stuckPct)} % of the games a team can do nothing 2 turns in a row (max ${L.stuckPct} %)`);
  const A = L.attack;
  if (s.attack.shareOfActions > A.shareOfActionsMax) add('SIM-6', `${f(s.attack.shareOfActions)} % of all actions are attacks (max ${A.shareOfActionsMax} %): rounds fill up with dice`);
  if (s.attack.failedPerRound > A.failedPerRoundMax) add('SIM-6', `${f(s.attack.failedPerRound, 1)} failed attacks per round (max ${A.failedPerRoundMax}): aimless attacks, add a cost or a limit`);
  if (s.attack.repeatPct > A.repeatPct) add('SIM-6', `${f(s.attack.repeatPct)} % of attacks hit a town the same team attacked last turn (max ${A.repeatPct} %): repetitive`);
  return w;
};
// #endregion
