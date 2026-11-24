// Player text: the group's house style, and every number on paper comes from data.js (DAT-1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HOUSE_STYLE, RULES, MAP, CARDS, TEAMS } from '../src/data.js';
import { allPlayerTexts } from '../src/rules.js';
import { renderAid } from '../print/spelhulp/spelhulp.mjs';
import { renderBoard } from '../print/bord/bord.mjs';
import { renderCardsFronts, renderCardsRectoVerso, cardList } from '../print/kaarten/kaarten.mjs';

// The visible text of a print file (tags out, entities decoded: '&nbsp;' itself contains a semicolon).
const stripTags = (html) => html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

test('house style: no forbidden wording in any player text or print file', () => {
  const texts = [...allPlayerTexts(), stripTags(renderAid()), stripTags(renderBoard()), stripTags(renderCardsFronts())];
  for (const rule of HOUSE_STYLE.forbidden) {
    for (const t of texts) assert.ok(!t.includes(rule.pattern), `${rule.why}: "${t.slice(0, 80)}"`);
  }
});

test('the team aid shows the numbers of data.js', () => {
  const aid = stripTags(renderAid());
  assert.match(aid, new RegExp(`${RULES.startMoney}.fr`));
  assert.match(aid, new RegExp(`${RULES.attack.failCost}.fr aan de bank`));
  for (const t of TEAMS) assert.ok(aid.includes(t.name));
});

test('the board shows every town and every road price', () => {
  const board = renderBoard();
  for (const s of MAP.spots) assert.ok(board.includes(s.name), s.name);
  assert.equal((board.match(/<line /g) || []).length, MAP.roads.length);
});

test('one page per card, and the recto-verso file has a back after every front', () => {
  const pages = (html) => (html.match(/class="page/g) || []).length;
  assert.equal(pages(renderCardsFronts()), cardList().length);
  assert.equal(pages(renderCardsRectoVerso()), 2 * cardList().length);
  assert.equal(cardList().length, CARDS.events.length + TEAMS.length);
});
