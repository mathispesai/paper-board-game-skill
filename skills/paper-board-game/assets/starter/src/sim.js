// One simulated game with bots. Returns a plain record with everything src/stats.js aggregates.
// Seeded: the same seed gives the same game, so a strange result can be replayed and debugged.
//
//   const rec = simulateGame({ seed: 1, config: { attack: { failCost: 0 } }, styles: { rood: { aggression: 1 } } });
//
// If your game has a real-world input (drinks, steps, quiz answers), model it here per person per hour
// (a Poisson draw per player is a good start) and test a heavy and a light pace (see references/balance.md).

import { createGame, apply, current, claimOptions, attackOptions } from './engine.js';
import { TEAMS, CARDS, SIM } from './data.js';
import { nextAction, DEFAULT_STYLE } from './bot.js';

// #region ***  Random                                   ***********
export const makeRng = (seed) => {
  let x = (seed >>> 0) || 1;
  return () => {
    x = (x + 0x6d2b79f5) >>> 0;
    let t = x;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const shuffled = (rnd, list) => {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
// #endregion

// #region ***  One game                                 ***********
// check(state) runs after every action (tests use it for invariants such as "money never negative").
export const simulateGame = ({ seed = 1, config = {}, styles = {}, check = null } = {}) => {
  const rnd = makeRng(seed);
  const start = shuffled(rnd, TEAMS.map((t) => t.id)); // a random team starts round 1
  let s = createGame({ teams: start, deck: shuffled(rnd, CARDS.events.map((c) => c.id)), config });

  const m = { actions: 0, claims: 0, attacks: 0, attacksWon: 0, attacksFailed: 0, repeats: 0, turns: 0, attackTurns: 0, maxAttacksInTurn: 0 };
  const lastTargets = {}; // team → towns it attacked in its previous turn
  const idle = {}; // team → turns in a row in which it could do nothing
  let thisTurn = [];
  let acted = false;
  let stuckTeam = false;
  let maxMoneyTotal = 0;
  let guard = 0;

  while (s.phase !== 'over' && guard++ < SIM.roundCap * 200) {
    const team = current(s);
    const a = nextAction(s, rnd, { ...DEFAULT_STYLE, ...(styles[team] || {}) });
    if (a.type === 'attack' && (lastTargets[team] || []).includes(a.spot)) m.repeats += 1;
    // SIM-3: a turn where the team had nothing it could do at all (not: chose to do nothing).
    const noOptions = a.type === 'endTurn' && !acted && !claimOptions(s).length && !attackOptions(s).length;
    s = apply(s, a);
    if (check) check(s);
    maxMoneyTotal = Math.max(maxMoneyTotal, Object.values(s.teams).reduce((sum, t) => sum + t.money, 0));
    if (a.type === 'endTurn') {
      m.turns += 1;
      if (thisTurn.length) m.attackTurns += 1;
      m.maxAttacksInTurn = Math.max(m.maxAttacksInTurn, thisTurn.length);
      lastTargets[team] = thisTurn;
      idle[team] = noOptions ? (idle[team] || 0) + 1 : 0;
      if (idle[team] >= 2) stuckTeam = true;
      thisTurn = [];
      acted = false;
      continue;
    }
    m.actions += 1;
    acted = true;
    if (a.type === 'claim') m.claims += 1;
    if (a.type === 'attack') {
      m.attacks += 1;
      thisTurn.push(a.spot);
      if (s.owner[a.spot] === team) m.attacksWon += 1;
      else m.attacksFailed += 1;
    }
  }

  const winners = s.winners || [];
  return {
    seed,
    capped: s.phase !== 'over',
    rounds: s.history.length,
    history: s.history,
    winners,
    stuckTeam,
    maxMoneyTotal,
    interaction: m,
    teams: start.map((id, i) => ({
      id,
      startPos: i,
      win: winners.includes(id) ? 1 / winners.length : 0,
      maxSpots: Math.max(0, ...s.history.map((h) => h.spots[id]))
    }))
  };
};
// #endregion

// #region ***  Reading the history                      ***********
// Leader after a finished round: most towns, then most money; null on a tie.
export const leaderAfter = (h) => {
  const rows = Object.keys(h.spots).map((t) => [t, h.spots[t], h.money[t]]).sort((x, y) => y[1] - x[1] || y[2] - x[2]);
  return rows.length > 1 && rows[0][1] === rows[1][1] && rows[0][2] === rows[1][2] ? null : rows[0][0];
};
// #endregion
