// The rule texts for the team aid, the booklet and the board legend. Every number comes from data.js (DAT-1),
// so a rule change in data.js changes every print file. Player text: the group's language and house style
// (test/texts.test.js checks it).

import { GAME, RULES, CARDS } from './data.js';
import { attackChance } from './engine.js';

const pct = (p) => `${Math.round(100 * p)} %`;
const dice = (n) => (n === 1 ? '1 dobbelsteen' : `${n} dobbelstenen`);
const who = { all: 'Elk team', most: 'Elk team met de meeste steden', least: 'Elk team met de minste steden' };

export const ROUND_STEPS = [
  { title: 'Jouw beurt', text: `Om de beurt. Neem **${RULES.claimsPerTurn === 1 ? 'één' : RULES.claimsPerTurn} vrije stad** naast een eigen stad en val hoogstens **${RULES.attack.maxPerTurn === 1 ? 'één' : RULES.attack.maxPerTurn} keer** aan.` },
  { title: 'Inkomen', text: `Elk team krijgt **${RULES.incomePerSpot} fr per stad**.` },
  { title: 'Gebeurtenis', text: 'Draai de bovenste gebeurteniskaart om. Ze geldt meteen.' },
  { title: 'Volgorde', text: 'Het team met de meeste steden begint de volgende ronde. Gelijk? Dan het team met het meeste geld.' }
];

export const PRICES = [
  ['Start', `${RULES.startMoney} fr per team`],
  ['Stad nemen', `${RULES.spotPrice} fr + de prijs op de weg`],
  ['Eerste stad', `${RULES.spotPrice} fr, eender waar`],
  ['Aanval gelukt', 'de prijs op de weg'],
  ['Aanval mislukt', `${RULES.attack.failCost} fr aan de bank`]
];

export const ATTACK = `Aanvallen: ${dice(RULES.attack.attackDice)} tegen ${dice(RULES.attack.defendDice)}. De hoogste ogen tellen. Hoger dan de verdediger? Dan is de stad van jou. Gelijk wint de verdediger. Kans: ${pct(attackChance(RULES.attack.attackDice, RULES.attack.defendDice))}.`;

export const END = `${GAME.goal} Spreek bij het begin een uur af. Is dat uur voorbij, dan is de ronde die bezig is de laatste. Gelijk? Dan wint het team met het meeste geld.`;

// One line per event card, as it is printed on the card.
export const cardEffect = (card) => `${who[card.who]} ${card.amount >= 0 ? 'krijgt' : 'betaalt'} **${Math.abs(card.amount)} fr**.`;

// Every player-facing text, for the house-style test.
export const allPlayerTexts = () => [
  GAME.goal, ...ROUND_STEPS.flatMap((s) => [s.title, s.text]), ...PRICES.flat(), ATTACK, END,
  ...CARDS.events.flatMap((c) => [c.title, c.text, cardEffect(c)]), CARDS.back.title
];
