// The page must stay slow: these tests fail if a planted issue gets "fixed"
// by accident, which would quietly break the Speed Engine demo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const pub = path.resolve(import.meta.dirname, '..', 'public');
const html = fs.readFileSync(path.join(pub, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(pub, 'js', 'app.js'), 'utf8');
const mb = (rel) => fs.statSync(path.join(pub, rel)).size / 1024 / 1024;

test('page is kept out of search engines', () => {
  assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
});

test('1: Google Fonts loaded without font-display or preconnect', () => {
  assert.match(html, /fonts\.googleapis\.com\/css2/);
  assert.doesNotMatch(html, /display=swap/);
  assert.doesNotMatch(html, /rel="preconnect"/);
});

test('2: big, mostly unused stylesheet is render-blocking', () => {
  assert.match(html, /<link rel="stylesheet" href="\/css\/framework\.css"/);
  assert.ok(fs.statSync(path.join(pub, 'css', 'framework.css')).size > 30_000);
});

test('3 and 4: old jQuery and analytics load synchronously in the head', () => {
  const head = html.slice(0, html.indexOf('</head>'));
  assert.match(head, /<script src="https:\/\/code\.jquery\.com\/jquery-1\.12\.4\.min\.js"><\/script>/);
  assert.match(head, /<script src="\/js\/analytics\.js"><\/script>/);
});

test('5: carousel.js is included twice', () => {
  assert.equal(html.match(/src="\/js\/carousel\.js"/g)?.length, 2);
});

test('6: hero (LCP) image is large, lazy and unsized', () => {
  const hero = html.match(/<img class="hero-img"[^>]*>/)?.[0] ?? '';
  assert.match(hero, /loading="lazy"/);
  assert.doesNotMatch(hero, /width=|height=/);
  assert.ok(mb('img/hero.png') > 2);
});

test('7: listing images are oversized and one has no alt text', () => {
  for (const n of [1, 2, 3]) assert.ok(mb(`img/listing-${n}.png`) > 1);
  assert.match(html, /<img src="\/img\/listing-2\.png" \/>/);
});

test('8: iframe is not lazy-loaded', () => {
  const iframe = html.match(/<iframe[^>]*>/)?.[0] ?? '';
  assert.doesNotMatch(iframe, /loading=/);
});

test('9 and 10: late banner (CLS) and slow tap handlers (INP)', () => {
  assert.match(app, /insertBefore\(banner, document\.body\.firstChild\)/);
  assert.match(app, /busy\(350\)/);
  assert.match(app, /busy\(300\)/);
});
