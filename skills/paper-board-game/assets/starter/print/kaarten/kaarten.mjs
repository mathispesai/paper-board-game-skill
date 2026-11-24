// Cards: one card per page with bleed (what print shops expect), backs in the same order.
// The recto-verso file alternates front 1, back 1, front 2, back 2, … so the shop can print it duplex from one PDF.
import { CARDS, TEAMS, GAME } from '../../src/data.js';
import { cardEffect } from '../../src/rules.js';
import { page, esc, md, SANS, teamMark } from '../style.mjs';

export const CARD_PAGE = { w: CARDS.size.w + 2 * CARDS.bleed, h: CARDS.size.h + 2 * CARDS.bleed };
const B = CARDS.bleed;

// Every card of the game: the events plus one card per team.
export const cardList = () => [
  ...CARDS.events.map((c) => ({ kind: 'event', ...c })),
  ...TEAMS.map((t) => ({ kind: 'team', id: `team-${t.id}`, team: t }))
];

const css = `
  .bg { position: absolute; inset: 0; }
  .safe { position: absolute; left: ${B + 4}mm; right: ${B + 4}mm; top: ${B + 4}mm; bottom: ${B + 4}mm; display: flex; flex-direction: column; }
  .title { font-size: 15pt; font-weight: 700; text-align: center; margin-top: 2mm; }
  .text { font-size: 10.5pt; line-height: 1.3; margin-top: 8mm; text-align: center; font-style: italic; }
  .effect { margin-top: auto; font-family: ${SANS}; font-size: 11pt; text-align: center; padding: 3mm; border: 0.4mm solid currentColor; border-radius: 2mm; }
  .back { color: #fff; display: flex; align-items: center; justify-content: center; font-size: 18pt; font-weight: 700; letter-spacing: 0.05em; }
  .team { font-size: 22pt; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 3mm; height: 100%; }
`;

const front = (c) => {
  if (c.kind === 'team') {
    return `<div class="page" style="background:${c.team.color};color:${c.team.text}"><div class="safe"><div class="team">${teamMark(c.team, '1.1em')} ${esc(c.team.name)}</div></div></div>`;
  }
  return `<div class="page"><div class="safe"><div class="title">${esc(c.title)}</div><div class="text">${md(c.text)}</div><div class="effect">${md(cardEffect(c))}</div></div></div>`;
};
const back = (c) => (c.kind === 'team'
  ? `<div class="page back" style="background:${c.team.color};color:${c.team.text}">${esc(GAME.name)}</div>`
  : `<div class="page back" style="background:${CARDS.back.color}">${esc(CARDS.back.title)}</div>`);

export const renderCardsFronts = () => page({ ...CARD_PAGE, title: 'Kaarten', css, body: cardList().map(front).join('') });
export const renderCardsRectoVerso = () => page({ ...CARD_PAGE, title: 'Kaarten recto verso', css, body: cardList().map((c) => front(c) + back(c)).join('') });
