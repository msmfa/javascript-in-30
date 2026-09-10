import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { definitions } from '../src/data.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(new URL(`../build/${path}`, import.meta.url), 'utf8');
const decode = (text) => text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
execFileSync(process.execPath, ['scripts/build.mjs'], {cwd:root});
const expectedOrigin = new URL(process.env.SITE_URL || 'https://www.javascriptin30words.com').origin;

test('all original topics have unique descriptive URLs', () => {
  const originalIds = ['variables','functions','functional-expressions','operators','comparisons','con-operations','logical-opp','for-loops','while-loops','switch-statements','arrow-functions','array-methods','string-methods','classes','scope','the-call-stack','event-loop','IIFEs','nested-functions','recursion','memoization','closure','hoisting','currying','value-vs-reference','asynchronous-javascript','promises','async-await','global-objects','this','call','apply','bind','prototypal-inheritance','polymorphism'];
  assert.deepEqual(definitions.map(item => item.id), originalIds);
  assert.equal(new Set(definitions.map(item => item.slug)).size, 35);
  assert.equal(definitions.find(item => item.id === 'closure').slug, 'javascript-closures');
});

for (const concept of definitions) {
  test(`${concept.label}: short definition, readable HTML and correct runnable example`, () => {
    const count = concept.text.trim().split(/\s+/).length;
    assert.ok(count > 0 && count <= 30, `${count} words`);
    const html = read(`${concept.slug}/index.html`);
    const definition = html.match(/<p class="definition">([\s\S]*?)<\/p>/)?.[1];
    const example = html.match(/<code\b[^>]*>([\s\S]*?)<\/code>/)?.[1];
    assert.equal(decode(definition), concept.text);
    assert.equal(decode(example.replace(/<[^>]+>/g, '')), concept.code);
    assert.ok(html.indexOf('class="definition"') < html.indexOf('<code'));
    assert.equal(decode(html.match(/<h1>([\s\S]*?)<\/h1>/)?.[1]), concept.heading);
    assert.match(html, /<meta name="description" content="[^"]+">/);
    assert.ok(html.includes(`<link rel="canonical" href="${expectedOrigin}/${concept.slug}/">`));
    assert.ok(html.includes('aria-current="page"'));
    assert.ok(!html.includes('<script'), 'reading must not require client JavaScript');
    const actual = execFileSync(process.execPath, ['--input-type=module','-e',concept.code], {encoding:'utf8',timeout:3000});
    assert.deepEqual(actual.trimEnd().split('\n'), concept.output);
    assert.match(concept.reference, /^https:\/\/developer\.mozilla\.org\//);
  });
}

test('all internal links resolve, with no SPA catch-all', () => {
  for (const file of ['index.html','404.html',...definitions.map(item => `${item.slug}/index.html`)]) {
    const html = read(file);
    for (const match of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) {
      const pathname = match[1];
      const target = new URL(`../build${pathname}${pathname.endsWith('/') ? 'index.html' : ''}`, import.meta.url);
      assert.ok(existsSync(target), `${file} → ${pathname}`);
    }
  }
  assert.match(read('404.html'), /<meta name="robots" content="noindex">/);
});

test('sitemap and homepage expose every concept to crawlers', () => {
  const sitemap = read('sitemap.xml');
  const html = read('index.html');
  assert.equal((sitemap.match(/<loc>/g) || []).length, 36);
  for (const concept of definitions) {
    assert.ok(sitemap.includes(`<loc>${expectedOrigin}/${concept.slug}/</loc>`));
    assert.ok(html.includes(`href="/${concept.slug}/"`));
    assert.ok(decode(html).includes(concept.text));
  }
  assert.ok(read('robots.txt').includes(`Sitemap: ${expectedOrigin}/sitemap.xml`));
});
