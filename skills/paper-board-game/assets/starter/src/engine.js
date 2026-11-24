// Pure rules engine for the paper rules. No randomness inside: dice rolls and the deck order come in from the
// caller (the sim, a test, or a worked example from the rule booklet), so every game can be replayed exactly.
//
//   let s = createGame({ teams: ['blauw', 'rood', 'wit'], deck: ['kermis', ...] });
//   s = apply(s, { type: 'claim', spot: 'gent' });
//   s = apply(s, { type: 'attack', spot: 'aalst', rolls: { att: [6, 2], def: [5, 1] } });
//   s = apply(s, { type: 'endTurn' });
//
// Only the CURRENT rules live here. An old variant goes to git history, not behind a flag.

import { MAP, RULES, CARDS } from './data.js';

// #region ***  Map helpers                              ***********
const ROADS = MAP.roads.map(([a, b, price]) => ({ a, b, price }));
export const roadsOf = (spot) => ROADS.filter((r) => r.a === spot || r.b === spot).map((r) => ({ to: r.a === spot ? r.b : r.a, price: r.price }));
export const spotsOf = (s, team) => Object.keys(s.owner).filter((k) => s.owner[k] === team);
// Cheapest road from one of the team's own towns to `spot`, or null when none touches it.
export const roadPrice = (s, team, spot) => {
  const prices = roadsOf(spot).filter((r) => s.owner[r.to] === team).map((r) => r.price);
  return prices.length ? Math.min(...prices) : null;
};
// #endregion

// #region ***  Setup                                    ***********
// config overrides RULES (CONFIG='{...}' in scripts/balance.mjs); attack is merged one level deep.
export const configFor = (config = {}) => ({ ...RULES, ...config, attack: { ...RULES.attack, ...(config.attack || {}) } });

export const createGame = ({ teams, deck = CARDS.events.map((c) => c.id), config = {} }) => ({
  cfg: configFor(config),
  round: 1,
  phase: 'turns',
  order: teams.slice(), // turn order of this round
  turn: 0, // index in order
  teams: Object.fromEntries(teams.map((id) => [id, { id, money: configFor(config).startMoney }])),
  owner: {}, // spot → team
  deck: deck.slice(),
  discard: [],
  attackedThisTurn: [],
  claimedThisTurn: 0,
  history: [], // one entry per finished round: { round, spots: {team: n}, money: {team: fr}, card }
  winners: null
});

export const current = (s) => (s.phase === 'over' ? null : s.order[s.turn]);
// #endregion

// #region ***  Options (what the current team may do)   ***********
export const claimOptions = (s, team = current(s)) => {
  if (s.claimedThisTurn >= s.cfg.claimsPerTurn) return [];
  const own = spotsOf(s, team).length;
  return MAP.spots
    .filter((sp) => !s.owner[sp.id])
    .map((sp) => ({ spot: sp.id, road: own ? roadPrice(s, team, sp.id) : 0 }))
    .filter((o) => o.road !== null)
    .map((o) => ({ spot: o.spot, cost: s.cfg.spotPrice + o.road }))
    .filter((o) => o.cost <= s.teams[team].money)
    .sort((x, y) => x.cost - y.cost);
};

// A team may attack a town of another team next to one of its own, at most maxPerTurn times per turn and every
// town once per turn, and only when it can pay whatever happens (the road when it wins, failCost when it loses).
export const attackOptions = (s, team = current(s)) => {
  const a = s.cfg.attack;
  if (s.attackedThisTurn.length >= a.maxPerTurn) return [];
  return Object.entries(s.owner)
    .filter(([spot, owner]) => owner !== team && !s.attackedThisTurn.includes(spot))
    .map(([spot, owner]) => ({ spot, owner, road: roadPrice(s, team, spot) }))
    .filter((o) => o.road !== null && s.teams[team].money >= Math.max(o.road, a.failCost));
};

// The attacker wins when its highest die beats the defender's highest die (a tie goes to the defender).
export const attackWins = ({ att, def }) => Math.max(...att) > Math.max(...def);

// Exact chance for the attacker (all 6^(a+d) throws), for bots, the rule booklet and the spec.
const chanceCache = new Map();
export const attackChance = (attackDice, defendDice) => {
  const key = `${attackDice}v${defendDice}`;
  if (chanceCache.has(key)) return chanceCache.get(key);
  const maxDist = (n) => [1, 2, 3, 4, 5, 6].map((k) => (k ** n - (k - 1) ** n) / 6 ** n); // P(highest of n dice = k)
  const A = maxDist(attackDice);
  const D = maxDist(defendDice);
  let p = 0;
  for (let i = 0; i < 6; i++) for (let j = 0; j < i; j++) p += A[i] * D[j];
  chanceCache.set(key, p);
  return p;
};
// #endregion

// #region ***  Ranking and end                          ***********
// Most towns first, then most money; equal teams keep their previous order (stable sort).
export const rankTeams = (s) => s.order.slice().sort((x, y) => spotsOf(s, y).length - spotsOf(s, x).length || s.teams[y].money - s.teams[x].money);
export const winnersOf = (s) => {
  const key = (t) => [spotsOf(s, t).length, s.teams[t].money];
  const best = rankTeams(s)[0];
  return s.order.filter((t) => key(t)[0] === key(best)[0] && key(t)[1] === key(best)[1]);
};
const hitBy = (s, who) => {
  const counts = s.order.map((t) => spotsOf(s, t).length);
  if (who === 'all') return s.order.slice();
  const target = who === 'most' ? Math.max(...counts) : Math.min(...counts);
  return s.order.filter((t, i) => counts[i] === target); // a tie hits every tied team
};
// #endregion

// #region ***  Actions                                  ***********
const fail = (msg) => { throw new Error(msg); };
const pay = (s, team, amount) => { s.teams[team].money = Math.max(0, s.teams[team].money - amount); }; // money never negative

const endRound = (s) => {
  for (const t of s.order) s.teams[t].money += s.cfg.incomePerSpot * spotsOf(s, t).length;
  if (!s.deck.length) { s.deck = s.discard; s.discard = []; } // empty deck: the discard pile becomes the deck
  const cardId = s.deck.shift();
  const card = CARDS.events.find((c) => c.id === cardId);
  if (card) {
    for (const t of hitBy(s, card.who)) (card.amount >= 0 ? (s.teams[t].money += card.amount) : pay(s, t, -card.amount));
    s.discard.push(cardId);
  }
  s.history.push({
    round: s.round,
    spots: Object.fromEntries(s.order.map((t) => [t, spotsOf(s, t).length])),
    money: Object.fromEntries(s.order.map((t) => [t, s.teams[t].money])),
    card: cardId || null
  });
  if (s.round >= s.cfg.rounds) {
    s.phase = 'over';
    s.winners = winnersOf(s);
    return;
  }
  s.round += 1;
  s.order = rankTeams(s); // read the order from the board: most towns starts
  s.turn = 0;
};

export const apply = (state, action) => {
  if (state.phase === 'over') fail('The game is over');
  const s = structuredClone(state);
  const team = current(s);
  switch (action.type) {
    case 'claim': {
      const o = claimOptions(s, team).find((x) => x.spot === action.spot) || fail(`${team} cannot claim ${action.spot}`);
      pay(s, team, o.cost);
      s.owner[o.spot] = team;
      s.claimedThisTurn += 1;
      return s;
    }
    case 'attack': {
      const o = attackOptions(s, team).find((x) => x.spot === action.spot) || fail(`${team} cannot attack ${action.spot}`);
      const { att, def } = action.rolls || fail('An attack needs rolls: { att: [...], def: [...] }');
      if (att.length !== s.cfg.attack.attackDice || def.length !== s.cfg.attack.defendDice) fail('Wrong number of dice');
      s.attackedThisTurn.push(o.spot);
      if (attackWins(action.rolls)) {
        pay(s, team, o.road);
        s.owner[o.spot] = team;
      } else {
        pay(s, team, s.cfg.attack.failCost);
      }
      return s;
    }
    case 'endTurn': {
      s.attackedThisTurn = [];
      s.claimedThisTurn = 0;
      s.turn += 1;
      if (s.turn >= s.order.length) endRound(s);
      return s;
    }
    default:
      return fail(`Unknown action ${action.type}`);
  }
};
// #endregion
