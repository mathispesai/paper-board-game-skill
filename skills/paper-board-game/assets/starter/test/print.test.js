// Print checks without Playwright or Ghostscript: the PDF inspector and the Ghostscript arguments.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspectPdf } from '../src/pdfcheck.js';
import { ghostscriptArgs, ghostscriptCandidates } from '../print/cmyk.mjs';

const pdf = (content) => Buffer.from(`%PDF-1.6\n1 0 obj << /Type /Page /MediaBox [0 0 595.28 841.89] >> endobj\n2 0 obj << /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n%%EOF`, 'latin1');

test('the inspector finds RGB colour operators and reads the page size', () => {
  const info = inspectPdf(pdf('0.2 0.4 0.6 rg 0 0 10 10 re f'));
  assert.ok(info.rgb.length > 0);
  assert.equal(info.pages, 1);
  assert.ok(Math.abs(info.sizes[0].w - 210) < 0.5 && Math.abs(info.sizes[0].h - 297) < 0.5);
});

test('the inspector accepts pure CMYK', () => {
  const info = inspectPdf(pdf('0 0.5 1 0 k 0 0 10 10 re f'));
  assert.deepEqual(info.rgb, []);
  assert.equal(info.cmyk, true);
});

test('Ghostscript gets CMYK settings and a trim box inside the bleed', () => {
  const args = ghostscriptArgs({ input: 'in.pdf', output: 'out.pdf', bleed: 3, w: 63.5, h: 88.9 }).join(' ');
  assert.match(args, /ColorConversionStrategy=CMYK/);
  assert.match(args, /TrimBox \[8\.50 8\.50/);
});

test('on Windows the GS variable comes first', () => {
  assert.equal(ghostscriptCandidates({ GS: 'C:\\gs\\gswin64c.exe' }, 'linux')[0], 'C:\\gs\\gswin64c.exe');
});
