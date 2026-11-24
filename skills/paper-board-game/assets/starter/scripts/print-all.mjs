// All print files in one go (DAT-2):   npm run print
// 1. Renders every print file from data.js to print/out/ (HTML + PDF with Playwright, plus a PNG preview).
// 2. Print-shop files (PRINT.shop): converted to CMYK with Ghostscript → print/out/shop/<name>-cmyk.pdf,
//    with TrimBox/BleedBox for the cut.
// 3. Check: page size and page count per file, and no RGB left in the print-shop PDFs. Exit code 1 on a problem.
// Home prints stay RGB: they never go to the print shop.
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PRINT, CARDS } from '../src/data.js';
import { renderBoard, BOARD_PAGE } from '../print/bord/bord.mjs';
import { renderCardsFronts, renderCardsRectoVerso, cardList, CARD_PAGE } from '../print/kaarten/kaarten.mjs';
import { renderAid } from '../print/spelhulp/spelhulp.mjs';
import { renderPdf, loadChromium, OUT, NO_PLAYWRIGHT } from '../print/render.mjs';
import { findGhostscript, toCmyk } from '../print/cmyk.mjs';
import { inspectPdf } from '../src/pdfcheck.js';

// name → how to make it and the page size it must have (mm, incl. bleed where there is bleed).
const FILES = {
  bord: { html: renderBoard, ...BOARD_PAGE, trim: { w: PRINT.board.w, h: PRINT.board.h }, bleed: PRINT.board.bleed, pages: 1, preview: '.page' },
  'kaarten-recto-verso': { html: renderCardsRectoVerso, ...CARD_PAGE, trim: CARDS.size, bleed: CARDS.bleed, pages: 2 * cardList().length },
  'kaarten-voor': { html: renderCardsFronts, ...CARD_PAGE, pages: cardList().length, preview: '.page' },
  spelhulp: { html: renderAid, ...PRINT.aid, pages: 3, preview: '.page' }
};
const TOLERANCE = 0.5; // mm

const chromium = loadChromium();
if (!chromium) {
  console.error(NO_PLAYWRIGHT);
  process.exit(1);
}
const gs = findGhostscript();
const problems = [];
const rows = [];
const browser = await chromium.launch();
mkdirSync(join(OUT, 'shop'), { recursive: true });

for (const name of [...PRINT.shop, ...PRINT.home]) {
  const f = FILES[name];
  if (!f) { problems.push(`${name}: unknown file in PRINT.shop/home`); continue; }
  const r = await renderPdf({ html: f.html(), name, w: f.w, h: f.h, preview: f.preview, browser });
  let pdf = r.pdf;
  const shop = PRINT.shop.includes(name);
  if (shop) {
    if (!gs) problems.push(`${name}: Ghostscript not found, no CMYK version. Install it (https://ghostscript.com/releases/gsdnld.html) or set GS=<path to gswin64c.exe>`);
    else pdf = toCmyk(gs, { input: r.pdf, output: join(OUT, 'shop', `${name}-cmyk.pdf`), bleed: f.bleed, w: f.trim?.w, h: f.trim?.h });
  }
  const info = inspectPdf(readFileSync(pdf));
  const sizeOk = info.sizes.length > 0 && info.sizes.every((s) => Math.abs(s.w - f.w) <= TOLERANCE && Math.abs(s.h - f.h) <= TOLERANCE);
  if (!sizeOk) problems.push(`${name}: size ${info.sizes.map((s) => `${s.w.toFixed(1)} × ${s.h.toFixed(1)}`).join(', ')} mm, expected ${f.w} × ${f.h} mm`);
  if (f.pages && info.pages !== f.pages) problems.push(`${name}: ${info.pages} pages, expected ${f.pages}`);
  if (shop && gs && info.rgb.length) problems.push(`${name}: RGB left in the print-shop PDF (${info.rgb.join(', ')})`);
  if (shop && gs && f.bleed && !(info.trim && info.bleed)) problems.push(`${name}: TrimBox/BleedBox missing`);
  rows.push(`${shop ? 'shop' : 'home'}  ${name.padEnd(22)} ${String(info.pages).padStart(3)} p.  ${f.w} × ${f.h} mm  ${shop ? (info.rgb.length ? 'RGB!' : 'CMYK') : 'RGB (home, ok)'}`);
}
await browser.close();

console.log(`Print files (${gs ? `Ghostscript ${gs.version}` : 'without Ghostscript'}):`);
for (const r of rows) console.log(`  ${r}`);
if (problems.length) {
  console.log(`\nPROBLEMS (${problems.length}):`);
  for (const p of problems) console.log(`  ${p}`);
  process.exitCode = 1;
} else {
  console.log('\nOK: sizes match and the print-shop files are fully CMYK. Now LOOK at the previews in print/out/.');
}
