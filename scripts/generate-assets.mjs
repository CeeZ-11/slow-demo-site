// Generates the deliberately heavy assets: noisy PNGs that barely compress
// (ISSUE 6 and 7) and a large CSS file the page hardly uses (ISSUE 2).
// Run with `npm run assets`. No dependencies: PNGs are written by hand.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = path.resolve(import.meta.dirname, '..', 'public');

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(body));
  return Buffer.concat([len, body, crc]);
}

// Seeded random so regenerating gives identical files (no noisy git diffs).
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

function noisyPng(width, height, [r1, g1, b1], [r2, g2, b2], seed) {
  const rand = rng(seed);
  const raw = Buffer.alloc((width * 3 + 1) * height);
  let i = 0;
  for (let y = 0; y < height; y++) {
    raw[i++] = 0;
    const t = y / height;
    for (let x = 0; x < width; x++) {
      const n = (rand() - 0.5) * 60;
      raw[i++] = Math.max(0, Math.min(255, r1 + (r2 - r1) * t + n));
      raw[i++] = Math.max(0, Math.min(255, g1 + (g2 - g1) * t + n));
      raw[i++] = Math.max(0, Math.min(255, b1 + (b2 - b1) * t + n));
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const images = [
  ['hero.png', 2000, 1200, [250, 170, 90], [70, 40, 90], 1],
  ['listing-1.png', 1400, 1050, [200, 210, 220], [90, 110, 130], 2],
  ['listing-2.png', 1400, 1050, [210, 190, 160], [120, 90, 60], 3],
  ['listing-3.png', 1400, 1050, [190, 220, 190], [60, 100, 70], 4],
  ['map.png', 1600, 1000, [220, 230, 210], [150, 170, 140], 5],
];

fs.mkdirSync(path.join(root, 'img'), { recursive: true });
for (const [name, w, h, from, to, seed] of images) {
  const file = path.join(root, 'img', name);
  fs.writeFileSync(file, noisyPng(w, h, from, to, seed));
  console.log(`${name}: ${(fs.statSync(file).size / 1024 / 1024).toFixed(1)} MB`);
}

const colors = ['red', 'blue', 'green', 'gray', 'teal', 'amber', 'pink', 'indigo'];
const lines = ['/* A pretend CSS framework. index.html uses almost none of it (ISSUE 2). */'];
for (const c of colors) {
  for (let shade = 50; shade <= 950; shade += 50) {
    const v = Math.round(255 - shade / 4);
    for (const [prefix, prop] of [['bg', 'background-color'], ['text', 'color'], ['border', 'border-color']]) {
      lines.push(`.${prefix}-${c}-${shade} { ${prop}: rgb(${v}, ${(v * 7) % 256}, ${(v * 13) % 256}); }`);
    }
  }
}
for (let n = 0; n <= 96; n++) {
  for (const [prefix, prop] of [['m', 'margin'], ['p', 'padding'], ['mt', 'margin-top'], ['mb', 'margin-bottom'], ['pt', 'padding-top'], ['pb', 'padding-bottom'], ['w', 'width'], ['h', 'height']]) {
    lines.push(`.${prefix}-${n} { ${prop}: ${n * 4}px; }`);
  }
}
for (let n = 1; n <= 12; n++) {
  lines.push(`.col-${n} { flex: 0 0 ${((n / 12) * 100).toFixed(4)}%; max-width: ${((n / 12) * 100).toFixed(4)}%; }`);
  for (const bp of ['sm', 'md', 'lg', 'xl']) {
    lines.push(`@media (min-width: ${{ sm: 576, md: 768, lg: 992, xl: 1200 }[bp]}px) { .col-${bp}-${n} { flex: 0 0 ${((n / 12) * 100).toFixed(4)}%; } }`);
  }
}
fs.mkdirSync(path.join(root, 'css'), { recursive: true });
fs.writeFileSync(path.join(root, 'css', 'framework.css'), lines.join('\n') + '\n');
console.log(`framework.css: ${(fs.statSync(path.join(root, 'css', 'framework.css')).size / 1024).toFixed(0)} KB`);
