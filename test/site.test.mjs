import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { definitions } from '../src/data.js';
import {indexNowKey} from '../src/search-config.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(new URL(`../build/${path}`, import.meta.url), 'utf8');
const decode = (text) => text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
execFileSync(process.execPath, ['scripts/build.mjs'], {cwd:root});
const expectedOrigin = new URL(process.env.SITE_URL || 'https://www.javascriptin30words.com').origin;
const originalCopy = JSON.parse(readFileSync(new URL('./fixtures/original-descriptions.json', import.meta.url), 'utf8'));
const originalById = new Map(originalCopy.definitions.map(item => [item.id,item]));
const newCopy = JSON.parse(readFileSync(new URL('./fixtures/new-descriptions.json', import.meta.url), 'utf8'));
const approvedById = new Map([...originalCopy.definitions, ...newCopy.definitions].map(item => [item.id,item]));
const normalize = text => text.replace(/\s+/g, ' ').trim();

test('original topics and five new beginner topics have unique descriptive URLs', () => {
  const originalIds = ['variables','functions','functional-expressions','operators','comparisons','con-operations','logical-opp','for-loops','while-loops','switch-statements','arrow-functions','array-methods','string-methods','classes','scope','the-call-stack','event-loop','IIFEs','nested-functions','recursion','memoization','closure','hoisting','currying','value-vs-reference','asynchronous-javascript','promises','async-await','global-objects','this','call','apply','bind','prototypal-inheritance','polymorphism'];
  assert.deepEqual(definitions.filter(item => originalById.has(item.id)).map(item => item.id), originalIds);
  const newTopics = definitions.filter(item => !originalById.has(item.id));
  assert.deepEqual(newTopics.map(item => item.id), ['arrays','objects','if-else','dom','events']);
  assert.equal(new Set(definitions.map(item => item.slug)).size, definitions.length);
  for (const concept of newTopics) {
    assert.equal(concept.slug, `javascript-${concept.id}`);
    assert.equal(concept.group, 'Fundamentals');
    const words = normalize([concept.text, ...(concept.definitionItems || [])].join(' ')).split(' ');
    assert.ok(words.length > 0 && words.length < 30, `${concept.label} has ${words.length} words; the limit is 29`);
  }
  assert.equal(definitions.find(item => item.id === 'closure').slug, 'javascript-closures');
  assert.equal(approvedById.size, definitions.length);
});

for (const concept of definitions) {
  test(`${concept.label}: approved description, readable HTML and correct runnable example`, () => {
    const approved = approvedById.get(concept.id);
    assert.ok(approved, `Approved description exists for ${concept.id}`);
    // Preserve original copy and check new definitions against their separate snapshot.
    assert.equal(concept.text, normalize(approved.text));
    const approvedItems = approved.bulletPointItems.split('.').slice(0,-1).map(normalize);
    assert.deepEqual(concept.definitionItems || [], approvedItems);
    const html = read(`${concept.slug}/index.html`);
    const definition = html.match(/<p class="definition">([\s\S]*?)<\/p>/)?.[1] || '';
    const definitionList = html.match(/<ul class="definition definition-list">([\s\S]*?)<\/ul>/)?.[1] || '';
    const example = html.match(/<code\b[^>]*>([\s\S]*?)<\/code>/)?.[1];
    assert.equal(decode(definition), concept.text);
    assert.deepEqual([...definitionList.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(match => decode(match[1])), approvedItems);
    assert.equal(decode(example.replace(/<[^>]+>/g, '')), concept.code);
    const descriptionIndex = html.indexOf('class="definition');
    assert.ok(descriptionIndex >= 0 && descriptionIndex < html.indexOf('<code'));
    assert.equal(decode(html.match(/<h1>([\s\S]*?)<\/h1>/)?.[1]), concept.heading);
    assert.match(html, /<meta name="description" content="[^"]+">/);
    assert.ok(html.includes(`<link rel="canonical" href="${expectedOrigin}/${concept.slug}/">`));
    assert.ok(html.includes('aria-current="page"'));
    assert.match(html, /<script type="module" src="\/assets\/ai-loader\.[a-f0-9]+\.js"><\/script>/);
    assert.ok(!/<script[^>]+src="[^"]*ai-(?:panel|client)\./.test(html), 'AI bundles must not load before the reader opens the panel');
    const referenceIndex = html.indexOf(`href="${concept.reference}"`);
    assert.ok(referenceIndex >= 0 && referenceIndex < html.indexOf('data-ai-panel'), 'Documentation is available outside the optional AI panel');
    assert.ok(html.includes('data-ai-panel'));
    assert.ok(!html.includes('What to notice'));
    assert.ok(html.includes('Enable JavaScript to connect your AI'), 'Only the optional AI feature requires JavaScript');
    assert.ok(concept.environment === undefined || concept.environment === 'browser');
    // Give browser examples a DOM so their actual element and event APIs run.
    const setup = concept.environment === 'browser'
      ? 'import {parseHTML} from "linkedom"; const {document} = parseHTML("<!doctype html><html><body></body></html>");\n'
      : '';
    const actual = execFileSync(process.execPath, ['--input-type=module','-e',setup + concept.code], {cwd:root,encoding:'utf8',timeout:3000});
    assert.deepEqual(actual.trimEnd().split('\n'), concept.output);
    assert.match(concept.reference, /^https:\/\/developer\.mozilla\.org\//);
  });
}

test('all internal links resolve, with no SPA catch-all', () => {
  for (const file of ['index.html','concepts/index.html','404.html',...definitions.map(item => `${item.slug}/index.html`)]) {
    const html = read(file);
    for (const match of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) {
      const pathname = match[1];
      const target = new URL(`../build${pathname}${pathname.endsWith('/') ? 'index.html' : ''}`, import.meta.url);
      assert.ok(existsSync(target), `${file} → ${pathname}`);
    }
  }
  assert.match(read('404.html'), /<meta name="robots" content="noindex">/);
});

test('homepage lands on Variables and the concept library remains available', () => {
  assert.equal(read('index.html'), read('javascript-variables/index.html'));
  assert.match(read('_redirects'), /^\/ \/javascript-variables\/ 301!$/m);
  assert.match(read('javascript-variables/index.html'), /href="\/concepts\/">All concepts<\/a>/);
});

test('sitemap and concept library expose every concept to crawlers', () => {
  const sitemap = read('sitemap.xml');
  const html = read('concepts/index.html');
  assert.ok(sitemap.includes(`<loc>${expectedOrigin}/concepts/</loc>`));
  assert.ok(!sitemap.includes(`<loc>${expectedOrigin}/</loc>`), 'The redirected homepage is not indexed separately');
  assert.equal((sitemap.match(/<loc>/g) || []).length, definitions.length + 1);
  assert.equal((sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) || []).length, definitions.length + 1, 'Every URL carries a crawlable lastmod');
  for (const concept of definitions) {
    assert.ok(sitemap.includes(`<loc>${expectedOrigin}/${concept.slug}/</loc>`));
    assert.ok(html.includes(`href="/${concept.slug}/"`));
    assert.ok(decode(html).includes(concept.text));
    for (const item of concept.definitionItems || []) assert.ok(decode(html).includes(item));
  }
  assert.ok(read('robots.txt').includes(`Sitemap: ${expectedOrigin}/sitemap.xml`));
});

test('indexable pages have one heading, unique metadata, and accurate structured breadcrumbs',()=>{
  const descriptions = new Set();
  const titles = new Set();
  for (const path of ['/concepts/',...definitions.map(item=>`/${item.slug}/`)]) {
    const html = read(path.slice(1)+'index.html');
    titles.add(decode(html.match(/<title>([^<]+)<\/title>/)[1]));
    assert.equal((html.match(/<h1\b/g) || []).length,1);
    const description = decode(html.match(/<meta name="description" content="([^"]+)"/)[1]);
    assert.ok(description.length > 30 && description.length <= 160);
    descriptions.add(description);
    assert.ok(!html.includes('content="noindex"'));
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1])['@graph'];
    assert.equal(graph.find(item=>item['@type'] === 'WebPage').url,expectedOrigin+path);
    assert.equal(graph.find(item=>item['@type'] === 'WebSite').name,'JavaScript in 30 Words');
    if(path !== '/concepts/') {
      const crumbs = graph.find(item=>item['@type'] === 'BreadcrumbList').itemListElement;
      assert.deepEqual(crumbs.map(item=>item.item),[expectedOrigin+'/concepts/',expectedOrigin+path]);
      assert.deepEqual(crumbs.map(item=>item.position),[1,2]);
    }
  }
  assert.equal(descriptions.size,definitions.length + 1);
  assert.equal(titles.size,definitions.length + 1);
  assert.equal(read(indexNowKey+'.txt'),indexNowKey);
  assert.match(read('_redirects'),/^https:\/\/javascript-in-30-words\.netlify\.app\/\*/);
});

test('the LLM topic index covers every canonical page and is discoverable from HTML', () => {
  const index = read('llms.txt');
  assert.match(index, /^# JavaScript in 30 Words\n\n> /);
  const links = [...index.matchAll(/^- \[[^\n]+\]\((https?:\/\/[^)]+)\):/gm)].map(match => match[1]);
  assert.deepEqual(new Set(links), new Set([expectedOrigin+'/concepts/', ...definitions.map(item => `${expectedOrigin}/${item.slug}/`)]));
  assert.equal(links.length, definitions.length + 1, 'No duplicated or missing topic links');
  for (const file of ['index.html', 'concepts/index.html', ...definitions.map(item => `${item.slug}/index.html`)]) {
    assert.match(read(file), /<link rel="describedby" href="\/llms.txt"/);
  }
  assert.ok(!read('404.html').includes('rel="describedby"'));
});

test('initial JavaScript stays small and lazy module imports resolve to built assets', () => {
  const html = read('javascript-arrays/index.html');
  const initialScripts = [...html.matchAll(/<script type="module" src="([^"]+)"><\/script>/g)].map(match => match[1]);
  assert.ok(initialScripts.reduce((bytes, path) => bytes + Buffer.byteLength(read(path.slice(1))), 0) < 8192, 'Initial first-party JavaScript must stay below 8 KiB');
  const loader = initialScripts.find(path => path.includes('/ai-loader.'));
  const panelPath = read(loader.slice(1)).match(/import\("(\/assets\/ai-panel\.[a-f0-9]+\.js)"\)/)[1];
  const clientPath = read(panelPath.slice(1)).match(/from"(\/assets\/ai-client\.[a-f0-9]+\.js)"/)[1];
  assert.ok(read(clientPath.slice(1)).length > 0);
});

test('every concept declares itself a defined term inside the glossary the concept library sets out',()=>{
  const graphOf = (file)=>JSON.parse(read(file).match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1])['@graph'];
  const node = (graph,type)=>graph.find(item=>item['@type'] === type);

  const glossary = node(graphOf('concepts/index.html'),'DefinedTermSet');
  assert.equal(glossary['@id'],expectedOrigin+'/concepts/#glossary');
  assert.equal(node(graphOf('concepts/index.html'),'WebPage').mainEntity['@id'],glossary['@id']);
  assert.equal(glossary.hasDefinedTerm.length,definitions.length);

  const declared = new Set(glossary.hasDefinedTerm.map(item=>item['@id']));
  for (const concept of definitions) {
    const path = `/${concept.slug}/`;
    const graph = graphOf(concept.slug+'/index.html');
    const term = node(graph,'DefinedTerm');
    const article = node(graph,'TechArticle');

    // The set on the concept library and the term on the page must agree, or the
    // glossary points at terms that never claim membership.
    assert.ok(declared.has(term['@id']),`${concept.slug} is missing from the glossary`);
    assert.equal(term['@id'],expectedOrigin+path+'#term');
    assert.equal(term.inDefinedTermSet['@id'],glossary['@id']);
    assert.equal(term.url,expectedOrigin+path);
    assert.ok(term.description.length > 0);
    if (concept.reference) assert.equal(term.sameAs,concept.reference);

    assert.equal(article['@id'],expectedOrigin+path+'#article');
    assert.equal(article.about['@id'],term['@id']);
    assert.equal(article.headline,concept.heading);
    assert.equal(node(graph,'WebPage').mainEntity['@id'],article['@id']);
    assert.ok(['Beginner','Expert'].includes(article.proficiencyLevel));
    assert.match(article.dateModified,/^\d{4}-\d{2}-\d{2}$/);
  }
});

test('every page has one Practice Pad header link with unique campaign attribution and footer contact',()=>{
  const contents = new Set();
  for (const file of ['concepts/index.html','404.html',...definitions.map(item=>`${item.slug}/index.html`)]) {
    const html = read(file);
    assert.equal((html.match(/class="practice-link"/g) || []).length,1);
    assert.ok(html.indexOf('class="practice-link"') < html.indexOf('<main'));
    assert.ok(!html.includes('footer-practice'));
    assert.ok(!html.includes('Understand the concept. Write the code.'));
    const href = decode(html.match(/class="practice-link"[^>]*href="([^"]+)"/)[1]);
    const link = new URL(href);
    assert.equal(link.origin,'https://www.practice-pad.app');
    assert.equal(link.searchParams.get('utm_source'),'javascriptin30words');
    assert.equal(link.searchParams.get('utm_medium'),'referral');
    assert.equal(link.searchParams.get('utm_campaign'),'concept_to_practice');
    assert.match(link.searchParams.get('utm_content'),/^header_/);
    contents.add(link.searchParams.get('utm_content'));
    assert.ok(html.includes('href="mailto:michael@codemoore.com"'));
    assert.match(html,/<script type="module" src="\/assets\/analytics\.[a-f0-9]+\.js"><\/script>/);
  }
  assert.equal(contents.size,definitions.length + 2);
});
