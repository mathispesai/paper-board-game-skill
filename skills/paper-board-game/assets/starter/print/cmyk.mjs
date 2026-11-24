// DAT-2: CMYK conversion with Ghostscript for the print shop. Chromium writes RGB PDFs; Ghostscript turns every
// colour (vector, text, images, transparency groups) into DeviceCMYK and adds TrimBox/BleedBox for the cut.
// Ghostscript: `gs` on Linux/macOS, `gswin64c` on Windows (https://ghostscript.com/releases/gsdnld.html).
import { spawnSync } from 'node:child_process';
import { readdirSync, existsSync } from 'node:fs';
import { win32 } from 'node:path';

const CANDIDATES = ['gs', 'gswin64c', 'gswin32c'];
const MM = 72 / 25.4;

// The Windows installer puts Ghostscript in C:\Program Files\gs\gs10.xx.x\bin but does not add it to PATH.
// Look there too (newest version first). GS=<full path to gswin64c.exe> overrides everything.
export const windowsGhostscripts = (env = process.env, list = (d) => readdirSync(d), exists = existsSync) => {
  const roots = [env.ProgramFiles, env.ProgramW6432, env['ProgramFiles(x86)'], 'C:\\Program Files', 'C:\\Program Files (x86)']
    .filter(Boolean).map((r) => win32.join(r, 'gs'));
  const found = [];
  for (const root of [...new Set(roots)]) {
    let versions = [];
    try { versions = list(root).filter((v) => /^gs\d/.test(v)); } catch { continue; }
    versions.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
    for (const v of versions) {
      for (const exe of ['gswin64c.exe', 'gswin32c.exe']) {
        const full = win32.join(root, v, 'bin', exe);
        if (exists(full) && !found.includes(full)) found.push(full);
      }
    }
  }
  return found;
};

export const ghostscriptCandidates = (env = process.env, platform = process.platform) => [
  ...(env.GS ? [env.GS] : []),
  ...CANDIDATES,
  ...(platform === 'win32' ? windowsGhostscripts(env) : [])
];

export const findGhostscript = () => {
  for (const cmd of ghostscriptCandidates()) {
    const r = spawnSync(cmd, ['--version'], { encoding: 'utf8' });
    if (r.status === 0) return { cmd, version: r.stdout.trim() };
  }
  return null;
};

// bleed in mm: the trim box sits that far inside the page on every side.
export const ghostscriptArgs = ({ input, output, bleed = 0, w, h }) => {
  const args = ['-dSAFER', '-dBATCH', '-dNOPAUSE', '-dQUIET', '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.6',
    '-sColorConversionStrategy=CMYK', '-sProcessColorModel=DeviceCMYK', '-dAutoRotatePages=/None', '-dPDFSETTINGS=/prepress',
    `-sOutputFile=${output}`];
  if (bleed && w && h) {
    const b = (bleed * MM).toFixed(2);
    const W = ((w + 2 * bleed) * MM).toFixed(2);
    const H = ((h + 2 * bleed) * MM).toFixed(2);
    const tw = (Number(W) - Number(b)).toFixed(2);
    const th = (Number(H) - Number(b)).toFixed(2);
    args.push('-c', `[/TrimBox [${b} ${b} ${tw} ${th}] /BleedBox [0 0 ${W} ${H}] /PAGES pdfmark`, '-f');
  }
  args.push(input);
  return args;
};

export const toCmyk = (gs, opts) => {
  const r = spawnSync(gs.cmd, ghostscriptArgs(opts), { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`Ghostscript failed: ${r.stderr || r.stdout}`);
  return opts.output;
};
