// Shared look of every print file. Change the fonts and colours here once.
// Fonts: for prints that must look the same on every PC, put OFL font files (woff2) in print/fonts/ and load them
// with @font-face (the HTML is written to print/out/, so the URL is '../fonts/<file>.woff2'). The starter uses
// system fonts so it runs without downloads.

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// **bold** → <b>, and a number never breaks away from its unit (20 fr, 3 steden).
export const md = (s) => esc(s).replace(/(\d) (fr|steden|stad|dobbelstenen)(?=[\s.,:)!?<*]|$)/g, '$1&nbsp;$2').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

export const PAPER = '#f6efdc';
export const INK = '#3a2f25';
export const SERIF = "Georgia, 'Times New Roman', serif";
export const SANS = "'Segoe UI', Arial, sans-serif";

// A page of the given size in mm, with no margins. Every print file starts from this.
export const page = ({ w, h, title, css = '', body }) => `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  @page { size: ${w}mm ${h}mm; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: ${PAPER}; color: ${INK}; font-family: ${SERIF}; }
  .page { width: ${w}mm; height: ${h}mm; position: relative; overflow: hidden; page-break-after: always; break-after: page; }
  .page:last-child { page-break-after: auto; break-after: auto; }
  ${css}
</style></head><body>${body}</body></html>`;

// The team's shape next to its name, so a team never depends on colour alone (colour blindness).
const MARKS = {
  rond: '<circle cx="12" cy="12" r="9"/>',
  driehoek: '<path d="M12 2.5 22 20.5H2z"/>',
  vierkant: '<rect x="3.5" y="3.5" width="17" height="17"/>'
};
export const teamMark = (team, size = '1em', fill = team.text) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${fill}" aria-hidden="true" style="vertical-align:-0.1em">${MARKS[team.mark] || ''}</svg>`;
