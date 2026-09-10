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
const originalCopy = JSON.parse(readFileSync(new URL('./fixtures/original-descriptions.json', import.meta.url), 'utf8'));
const originalById = new Map(originalCopy.definitions.map(item => [item.id,item]));
const normalize = text => text.replace(/\s+/g, ' ').trim();

test('all original topics have unique descriptive URLs', () => {
  const originalIds = ['variables','functions','functional-expressions','operators','comparisons','con-operations','logical-opp','for-loops','while-loops','switch-statements','arrow-functions','array-methods','string-methods','classes','scope','the-call-stack','event-loop','IIFEs','nested-functions','recursion','memoization','closure','hoisting','currying','value-vs-reference','asynchronous-javascript','promises','async-await','global-objects','this','call','apply','bind','prototypal-inheritance','polymorphism'];
  assert.deepEqual(definitions.map(item => item.id), originalIds);
  assert.equal(new Set(definitions.map(item => item.slug)).size, 35);
  assert.equal(definitions.find(item => item.id === 'closure').slug, 'javascript-closures');
  assert.equal(originalById.size, definitions.length);
});

for (const concept of definitions) {
  test(`${concept.label}: exact original description, readable HTML and correct runnable example`, () => {
    const original = originalById.get(concept.id);
    assert.ok(original, `Original description exists for ${concept.id}`);
    // Exact source copy takes precedence over the original 30-word target.
    assert.equal(concept.text, normalize(original.text));
    const originalItems = original.bulletPointItems.split('.').slice(0,-1).map(normalize);
    assert.deepEqual(concept.definitionItems || [], originalItems);
    const html = read(`${concept.slug}/index.html`);
    const definition = html.match(/<p class="definition">([\s\S]*?)<\/p>/)?.[1] || '';
    const definitionList = html.match(/<ul class="definition definition-list">([\s\S]*?)<\/ul>/)?.[1] || '';
    const example = html.match(/<code\b[^>]*>([\s\S]*?)<\/code>/)?.[1];
    assert.equal(decode(definition), concept.text);
    assert.deepEqual([...definitionList.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(match => decode(match[1])), originalItems);
    assert.equal(decode(example.replace(/<[^>]+>/g, '')), concept.code);
    const descriptionIndex = html.indexOf('class="definition');
    assert.ok(descriptionIndex >= 0 && descriptionIndex < html.indexOf('<code'));
    assert.equal(decode(html.match(/<h1>([\s\S]*?)<\/h1>/)?.[1]), concept.heading);
    assert.match(html, /<meta name="description" content="[^"]+">/);
    assert.ok(html.includes(`<link rel="canonical" href="${expectedOrigin}/${concept.slug}/">`));
    assert.ok(html.includes('aria-current="page"'));
    assert.match(html, /<script type="module" src="\/assets\/ai-panel\.[a-f0-9]+\.js"><\/script>/);
    assert.ok(html.includes('data-ai-panel'));
    assert.ok(!html.includes('What to notice'));
    assert.ok(html.includes('Enable JavaScript to connect your AI'), 'Only the optional AI feature requires JavaScript');
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
    for (const item of concept.definitionItems || []) assert.ok(decode(html).includes(item));
  }
  assert.ok(read('robots.txt').includes(`Sitemap: ${expectedOrigin}/sitemap.xml`));
});

test('every footer has unique Practice Pad campaign attribution and the contact address',()=>{
  const contents = new Set();
  for (const file of ['index.html',...definitions.map(item=>`${item.slug}/index.html`)]) {
    const html = read(file);
    const href = decode(html.match(/class="practice-link"[^>]*href="([^"]+)"/)[1]);
    const link = new URL(href);
    assert.equal(link.origin,'https://www.practice-pad.app');
    assert.equal(link.searchParams.get('utm_source'),'javascriptin30words');
    assert.equal(link.searchParams.get('utm_medium'),'referral');
    assert.equal(link.searchParams.get('utm_campaign'),'concept_to_practice');
    contents.add(link.searchParams.get('utm_content'));
    assert.ok(html.includes('href="mailto:michael@codemoore.com"'));
    assert.match(html,/<script type="module" src="\/assets\/analytics\.[a-f0-9]+\.js"><\/script>/);
  }
  assert.equal(contents.size,36);
});
