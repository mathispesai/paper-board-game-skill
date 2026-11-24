// The board as SVG in HTML, drawn from MAP in data.js: towns, roads with their price, the legend.
// Size and bleed come from PRINT.board. Keep text big: a board is read from 1 m or more (test a full-size proof).
import { MAP, PRINT, GAME } from '../../src/data.js';
import { ATTACK, PRICES } from '../../src/rules.js';
import { page, esc, SANS } from '../style.mjs';

const { w, h, bleed, cell } = PRINT.board;
export const BOARD_PAGE = { w: w + 2 * bleed, h: h + 2 * bleed };

const pos = (spot) => ({ x: bleed + 45 + spot.x * cell, y: bleed + 45 + spot.y * cell });

export const renderBoard = () => {
  const byId = Object.fromEntries(MAP.spots.map((s) => [s.id, s]));
  const roads = MAP.roads.map(([a, b, price]) => {
    const p = pos(byId[a]);
    const q = pos(byId[b]);
    const mx = (p.x + q.x) / 2;
    const my = (p.y + q.y) / 2;
    return `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" stroke="#8a6d4b" stroke-width="2.2"/>
      <circle cx="${mx}" cy="${my}" r="6" fill="#fff" stroke="#8a6d4b" stroke-width="0.8"/>
      <text x="${mx}" y="${my + 2.6}" text-anchor="middle" font-size="8" font-family="${SANS}" font-weight="700">${price}</text>`;
  }).join('');
  const towns = MAP.spots.map((s) => {
    const p = pos(s);
    return `<circle cx="${p.x}" cy="${p.y}" r="13" fill="#fffaf0" stroke="#3a2f25" stroke-width="1.2"/>
      <text x="${p.x}" y="${p.y + 22}" text-anchor="middle" font-size="9" font-weight="700">${esc(s.name)}</text>`;
  }).join('');
  // The legend is HTML on top of the SVG, so long lines wrap instead of running off the board.
  const legendX = bleed + 45 + 3 * cell + 40;
  const legend = `<div class="legend" style="left:${legendX}mm;top:${bleed + 25}mm;width:${BOARD_PAGE.w - legendX - bleed - 15}mm">
    <h1>${esc(GAME.name)}</h1><p>${PRICES.map(([k, v]) => `${esc(k)}: <b>${esc(v)}</b>`).join('<br>')}</p><p>${esc(ATTACK)}</p></div>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${BOARD_PAGE.w}mm" height="${BOARD_PAGE.h}mm" viewBox="0 0 ${BOARD_PAGE.w} ${BOARD_PAGE.h}">
    <rect width="100%" height="100%" fill="#efe3c2"/>${roads}${towns}</svg>`;
  const css = '.legend { position: absolute; font-size: 6mm; line-height: 1.35; } .legend h1 { font-size: 12mm; margin: 0 0 6mm; } .legend p { margin: 0 0 6mm; } svg { position: absolute; inset: 0; }';
  return page({ ...BOARD_PAGE, title: `${GAME.name}: bord`, css, body: `<div class="page bord">${svg}${legend}</div>` });
};
