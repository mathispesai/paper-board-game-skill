// Shared PDF rendering for the print files: writes the HTML to print/out/ and, with Playwright,
// a PDF of the given page size (and optionally a PNG preview of the first page).
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const OUT = join(ROOT, 'print', 'out');

export const loadChromium = () => {
  try {
    return createRequire(import.meta.url)('playwright').chromium;
  } catch {
    return null;
  }
};

export const NO_PLAYWRIGHT = 'Playwright not found. Once: npm install, then npm run browser.\nOr open the HTML in Chrome and print to PDF (margins: none, background graphics on).';

// html: the document; name: file name without extension; w, h: page size in mm; preview: selector for a PNG.
export const renderPdf = async ({ html, name, w, h, preview = null, browser = null }) => {
  mkdirSync(OUT, { recursive: true });
  const htmlPath = join(OUT, `${name}.html`);
  writeFileSync(htmlPath, html);
  const chromium = browser ? null : loadChromium();
  if (!browser && !chromium) return { html: htmlPath, pdf: null };
  const b = browser || (await chromium.launch());
  const page = await b.newPage();
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.__ready || true); // a page that lays itself out after the fonts sets window.__ready
  const pdf = join(OUT, `${name}.pdf`);
  await page.pdf({ path: pdf, width: `${w}mm`, height: `${h}mm`, printBackground: true, preferCSSPageSize: true });
  let png = null;
  if (preview) {
    const px = 96 / 25.4;
    await page.setViewportSize({ width: Math.ceil(w * px), height: Math.ceil(h * px) });
    png = join(OUT, `${name}-preview.png`);
    await page.locator(preview).first().screenshot({ path: png });
  }
  await page.close();
  if (!browser) await b.close();
  return { html: htmlPath, pdf, png };
};
