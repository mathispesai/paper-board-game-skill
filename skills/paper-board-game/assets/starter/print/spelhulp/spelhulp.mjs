// Team aid: one A4 per team in the team colour, with the round, the prices, attacking and the end.
// Everything a player needs during play must be findable here or on the board (no game master).
import { TEAMS, PRINT, GAME } from '../../src/data.js';
import { ROUND_STEPS, PRICES, ATTACK, END } from '../../src/rules.js';
import { page, esc, md, SANS, teamMark } from '../style.mjs';

const css = `
  .head { padding: 12mm 15mm 8mm; display: flex; align-items: center; gap: 4mm; font-size: 26pt; font-weight: 700; }
  .body { padding: 0 15mm; font-size: 13pt; line-height: 1.35; }
  h2 { font-family: ${SANS}; font-size: 13pt; text-transform: uppercase; letter-spacing: 0.06em; margin: 7mm 0 2mm; }
  ol { margin: 0; padding-left: 7mm; } li { margin: 1.5mm 0; }
  table { border-collapse: collapse; width: 100%; } td { padding: 1.5mm 0; border-bottom: 0.3mm solid #c9b98f; }
  td:last-child { text-align: right; font-weight: 700; }
`;

const sheet = (team) => `<div class="page">
  <div class="head" style="background:${team.color};color:${team.text}">${teamMark(team, '0.9em')} ${esc(team.name)} <span style="margin-left:auto;font-size:14pt">${esc(GAME.name)}</span></div>
  <div class="body">
    <h2>Een ronde</h2><ol>${ROUND_STEPS.map((s) => `<li><b>${esc(s.title)}.</b> ${md(s.text)}</li>`).join('')}</ol>
    <h2>Prijzen</h2><table>${PRICES.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${md(v)}</td></tr>`).join('')}</table>
    <h2>Aanvallen</h2><p>${md(ATTACK)}</p>
    <h2>Einde</h2><p>${md(END)}</p>
  </div></div>`;

export const renderAid = () => page({ ...PRINT.aid, title: `${GAME.name}: spelhulp`, css, body: TEAMS.map(sheet).join('') });
