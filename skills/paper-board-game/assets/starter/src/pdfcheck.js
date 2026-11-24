// DAT-2: a small PDF inspector without dependencies. It unpacks every Flate stream (also object
// streams) and looks for anything RGB: RGB colour spaces (DeviceRGB, CalRGB, ICC profiles with 3 components,
// DefaultRGB) and RGB colour operators in page content (r g b rg / RG). It also reads the page sizes.
// Good enough to prove that Ghostscript's CMYK conversion left no RGB behind; not a full PDF parser.
import { inflateSync } from 'node:zlib';

const PT_PER_MM = 72 / 25.4;

// All streams of the file: { dict, data (Buffer, unpacked when Flate) }.
export const streams = (buf) => {
  const out = [];
  const s = buf.toString('latin1');
  const re = /stream\r?\n/g;
  let m;
  while ((m = re.exec(s))) {
    const start = m.index + m[0].length;
    const end = s.indexOf('endstream', start);
    if (end < 0) break;
    const dictStart = s.lastIndexOf('<<', m.index);
    const dict = dictStart >= 0 ? s.slice(dictStart, m.index) : '';
    let data = buf.subarray(start, end);
    if (/\/FlateDecode/.test(dict)) {
      try {
        data = inflateSync(data);
      } catch {
        try {
          data = inflateSync(buf.subarray(start, end - 1));
        } catch {
          data = Buffer.alloc(0);
        }
      }
    }
    out.push({ dict, data, image: /\/Subtype\s*\/Image/.test(dict) });
    re.lastIndex = end + 9;
  }
  return out;
};

const RGB_OPERATOR = /(?:^|[\s\]>)])-?(?:\d+\.?\d*|\.\d+)\s+-?(?:\d+\.?\d*|\.\d+)\s+-?(?:\d+\.?\d*|\.\d+)\s+(rg|RG)(?=[\s\[(<\/]|$)/m;

export const inspectPdf = (buf) => {
  const text = buf.toString('latin1');
  const parts = streams(buf);
  // Text to search for colour spaces: everything outside streams plus every unpacked non-image stream.
  const searchable = [text.replace(/stream\r?\n[\s\S]*?endstream/g, ' '), ...parts.filter((p) => !p.image).map((p) => p.data.toString('latin1'))].join('\n');
  const found = [];
  if (/\/DeviceRGB\b/.test(searchable) || parts.some((p) => /\/DeviceRGB\b/.test(p.dict))) found.push('DeviceRGB');
  if (/\/CalRGB\b/.test(searchable)) found.push('CalRGB');
  if (/\/DefaultRGB\b/.test(searchable)) found.push('DefaultRGB');
  if (parts.some((p) => /\/N\s+3\b/.test(p.dict) && !/\/Subtype\s*\/Image/.test(p.dict))) found.push('ICC profile with 3 channels (RGB)');
  const content = parts.filter((p) => !p.image && p.data.length).map((p) => p.data.toString('latin1'));
  if (content.some((c) => RGB_OPERATOR.test(c))) found.push('RGB colour operator (rg/RG)');
  const cmyk = /\/DeviceCMYK\b/.test(searchable) || content.some((c) => /\s[kK](?=[\s\[(<\/]|$)/m.test(c)) || parts.some((p) => /\/N\s+4\b/.test(p.dict));
  const boxes = [...text.matchAll(/\/MediaBox\s*\[\s*(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s*\]/g)]
    .map((m) => ({ w: (Number(m[3]) - Number(m[1])) / PT_PER_MM, h: (Number(m[4]) - Number(m[2])) / PT_PER_MM }));
  const pages = (text.match(/\/Type\s*\/Page(?!s)/g) || []).length;
  const trim = /\/TrimBox\s*\[/.test(searchable);
  const bleed = /\/BleedBox\s*\[/.test(searchable);
  return { rgb: found, cmyk, pages, sizes: boxes, trim, bleed };
};
