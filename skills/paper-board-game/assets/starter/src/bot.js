// Balance bots: sensible play plus a per-team style, so the sims cover careful and pushy tables.
// Bots should play like the real group would: if a rule makes an action free, assume people will spam it.
//   style.aggression (0..1): how eager the team is to attack when the attack is worth it
//   style.reckless (0..1): chance to attack even when the attack is not worth it (people do that)

import { current, claimOptions, attackOptions, attackChance } from './engine.js';

export const DEFAULT_STYLE = { aggression: 0.6, reckless: 0.1 };

const roll = (rnd, n) => Array.from({ length: n }, () => 1 + Math.floor(rnd() * 6));

// One action for the current team. rnd: a seeded random function (src/sim.js makeRng).
export const nextAction = (s, rnd, style = DEFAULT_STYLE) => {
  const team = current(s);
  const a = s.cfg.attack;
  const p = attackChance(a.attackDice, a.defendDice);
  const roundsLeft = Math.max(1, s.cfg.rounds - s.round + 1);
  // A town is worth its income for the rest of the game plus what it would cost to claim one.
  const worth = s.cfg.incomePerSpot * roundsLeft + s.cfg.spotPrice;

  const attacks = attackOptions(s, team)
    .map((o) => ({ ...o, gain: p * (worth - o.road) - (1 - p) * a.failCost }))
    .sort((x, y) => y.gain - x.gain);
  const best = attacks[0];
  const claims = claimOptions(s, team);

  const wantsAttack = best && ((best.gain > 0 && rnd() < style.aggression) || rnd() < style.reckless);
  // Claiming a free town is usually better than an even fight, unless the board is full.
  if (wantsAttack && (!claims.length || best.gain > worth - claims[0].cost)) {
    return { type: 'attack', spot: best.spot, rolls: { att: roll(rnd, a.attackDice), def: roll(rnd, a.defendDice) } };
  }
  if (claims.length) return { type: 'claim', spot: claims[0].spot };
  return { type: 'endTurn' };
};
