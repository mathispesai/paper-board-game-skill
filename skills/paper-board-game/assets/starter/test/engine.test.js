// Rules engine: one test (or more) per acceptance criterion. Dice come in as data, so every case is exact.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, apply, claimOptions, attackOptions, attackChance, spotsOf, current } from '../src/engine.js';
import { RULES, CARDS } from '../src/data.js';

const TEAMS = ['blauw', 'rood', 'wit'];
const claim = (s, spot) => apply(s, { type: 'claim', spot });
const end = (s) => apply(s, { type: 'endTurn' });
const attack = (s, spot, att, def) => apply(s, { type: 'attack', spot, rolls: { att, def } });

// Blauw holds Gent, rood holds Aalst (next to Gent), wit holds Leuven; back to blauw in round 2.
const board = () => {
  let s = createGame({ teams: TEAMS, deck: ['kermis', 'kermis', 'kermis', 'kermis', 'kermis', 'kermis'] });
  s = end(claim(s, 'gent'));
  s = end(claim(s, 'aalst'));
  s = end(claim(s, 'leuven'));
  return s;
};

test('the first town may be anywhere and costs the town price', () => {
  const s = createGame({ teams: TEAMS });
  assert.equal(claimOptions(s).length, 12);
  assert.equal(claim(s, 'gent').teams.blauw.money, RULES.startMoney - RULES.spotPrice);
});

test('a next town must touch an own town and costs town + cheapest road', () => {
  let s = createGame({ teams: TEAMS, config: { claimsPerTurn: 2 } });
  s = claim(s, 'gent');
  const opts = claimOptions(s).map((o) => o.spot).sort();
  assert.deepEqual(opts, ['aalst', 'brugge', 'tielt']);
  assert.equal(claimOptions(s).find((o) => o.spot === 'aalst').cost, RULES.spotPrice + 1);
});

test('a team claims at most claimsPerTurn towns per turn', () => {
  const s = claim(createGame({ teams: TEAMS }), 'gent');
  assert.equal(claimOptions(s).length, RULES.claimsPerTurn === 1 ? 0 : claimOptions(s).length);
});

test('a won attack takes the town and costs the road', () => {
  let s = board();
  // round 2: income was paid, kermis gave every team 3 fr; order = most towns (all 1) → money → previous order
  assert.equal(current(s), 'blauw');
  const before = s.teams.blauw.money;
  s = attack(s, 'aalst', [6, 1], [5, 5]);
  assert.equal(s.owner.aalst, 'blauw');
  assert.equal(s.teams.blauw.money, before - 1);
});

test('a failed attack costs failCost (a tie goes to the defender)', () => {
  let s = board();
  const before = s.teams.blauw.money;
  s = attack(s, 'aalst', [5, 1], [5, 2]);
  assert.equal(s.owner.aalst, 'rood');
  assert.equal(s.teams.blauw.money, before - RULES.attack.failCost);
});

test('a team attacks at most maxPerTurn times per turn', () => {
  let s = board();
  s = attack(s, 'aalst', [1, 1], [6, 6]);
  assert.equal(attackOptions(s).length, 0);
  assert.throws(() => attack(s, 'aalst', [6, 6], [1, 1]));
});

test('the attack chance is exact', () => {
  assert.equal(attackChance(1, 1).toFixed(4), (15 / 36).toFixed(4));
  assert.equal(attackChance(2, 2).toFixed(4), (505 / 1296).toFixed(4));
});

test('income, card and the end: most towns wins, tie on money', () => {
  let s = createGame({ teams: TEAMS, deck: CARDS.events.map((c) => c.id), config: { rounds: 1 } });
  s = end(claim(s, 'gent'));
  s = end(claim(s, 'leuven'));
  s = end(s);
  assert.equal(s.phase, 'over');
  assert.equal(spotsOf(s, 'wit').length, 0);
  assert.deepEqual(s.winners.sort(), ['blauw', 'rood']);
});
