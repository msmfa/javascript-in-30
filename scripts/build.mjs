import { mkdir, rm, writeFile, copyFile } from 'node:fs/promises';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import { definitions } from '../src/data.js';

hljs.registerLanguage('javascript', javascript);

const output = new URL('../build/', import.meta.url);
const requestedOrigin = new URL(process.env.SITE_URL || 'https://www.javascriptin30words.com');
if (!['http:', 'https:'].includes(requestedOrigin.protocol)) throw new Error('SITE_URL must be an HTTP(S) URL.');
const origin = requestedOrigin.origin;
const brand = 'JavaScript in 30 Words';
const groups = ['Fundamentals', 'Advanced'];
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[character]));
const url = (path = '/') => origin + path;
const pathFor = (concept) => `/${concept.slug}/`;

function navigation(current) {
  return groups.map((group) => `<section class="nav-group"><h2>${group}</h2><ul>${definitions.filter((item) => item.group === group).map((item) => `<li><a href="${pathFor(item)}"${current?.id === item.id ? ' aria-current="page"' : ''}>${escapeHTML(item.label)}</a></li>`).join('')}</ul></section>`).join('');
}

function document({ title, description, path, content, current, noindex = false }) {
  const pageTitle = `${title} | ${brand}`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHTML(pageTitle)}</title>
  <meta name="description" content="${escapeHTML(description)}">
  ${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url(path)}">`}
  <meta property="og:type" content="${current ? 'article' : 'website'}">
  <meta property="og:site_name" content="${brand}">
  <meta property="og:title" content="${escapeHTML(pageTitle)}">
  <meta property="og:description" content="${escapeHTML(description)}">
  <meta property="og:url" content="${url(path)}">
  <meta name="twitter:card" content="summary">
  <link rel="stylesheet" href="/main.css">
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>
  <aside class="sidebar">
    <a class="brand" href="/">JavaScript<br>in <strong>30 words.</strong></a>
    <nav aria-label="Concepts">${navigation(current)}</nav>
    <a class="source-link" href="https://github.com/msmfa/javascript-in-30">Contribute on GitHub ↗</a>
  </aside>
  <div class="page">
    <header class="mobile-header"><a class="brand" href="/">JavaScript in <strong>30 words.</strong></a><details><summary>Browse all ${definitions.length} concepts</summary><nav aria-label="Concepts">${navigation(current)}</nav></details></header>
    <main id="main-content" tabindex="-1">${content}</main>
    <footer class="site-footer">
      <section class="footer-practice" aria-labelledby="practice-heading">
        <div><h2 id="practice-heading">Understand the concept. Write the code.</h2><p>Once you’ve mastered these concepts, take the next step: implement them in Practice Pad, a JavaScript interview practice app for Mac.</p></div>
        <a class="practice-link" href="https://www.practice-pad.app/">Try Practice Pad <span aria-hidden="true">↗</span></a>
      </section>
      <div class="footer-meta"><p><a href="/">${brand}</a> · Made by Michael Moore</p><nav class="footer-links" aria-label="Footer"><a href="https://www.linkedin.com/in/michaelsydneymoore/">LinkedIn <span aria-hidden="true">↗</span></a><a href="https://github.com/msmfa/javascript-in-30">GitHub <span aria-hidden="true">↗</span></a></nav></div>
    </footer>
  </div>
</body>
</html>
`;
}

function home() {
  return document({title:'JavaScript Concepts Explained Simply', description:`Refresh ${definitions.length} JavaScript concepts with definitions in 30 words or fewer, useful code examples, and clear explanations for interview preparation.`, path:'/', content:`
    <header class="page-heading"><p class="eyebrow">A quick JavaScript refresher</p><h1>Small explanations.<br>Useful examples.</h1><p class="lead">JavaScript concepts in 30 words or fewer, with code to make them stick. Pick a topic to get started.</p></header>
    ${groups.map((group) => `<section class="topic-section"><h2>${group}</h2><div class="topic-grid">${definitions.filter((item) => item.group === group).map((item) => `<article class="topic-card"><h3><a href="${pathFor(item)}">${escapeHTML(item.label)} <span aria-hidden="true">↗</span></a></h3><p>${escapeHTML(item.text)}</p></article>`).join('')}</div></section>`).join('')}
  `});
}

function conceptPage(concept, index) {
  const previous = definitions[index - 1];
  const next = definitions[index + 1];
  return document({title:concept.heading, description:concept.text, path:pathFor(concept), current:concept, content:`
    <article class="concept">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">All concepts</a><span aria-hidden="true"> / </span><span>${escapeHTML(concept.label)}</span></nav>
      <header class="page-heading"><p class="eyebrow">${concept.group}</p><h1>${escapeHTML(concept.heading)}</h1><p class="definition">${escapeHTML(concept.text)}</p></header>
      <section class="example" aria-labelledby="example-heading"><div class="section-heading"><h2 id="example-heading">A useful example</h2><span>JavaScript</span></div><pre tabindex="0" aria-label="JavaScript code example"><code class="hljs language-javascript">${hljs.highlight(concept.code, {language:'javascript'}).value}</code></pre>${concept.output.length ? `<div class="example-output"><h3>Output</h3><pre><samp>${escapeHTML(concept.output.join('\n'))}</samp></pre></div>` : ''}</section>
      <section class="explanation"><h2>What to notice</h2><p>${escapeHTML(concept.explanation)}</p><a class="reference-link" href="${escapeHTML(concept.reference)}">Read more on MDN ↗</a></section>
      <nav class="next-concepts" aria-label="More concepts">${previous ? `<a href="${pathFor(previous)}"><span>← Previous</span>${escapeHTML(previous.label)}</a>` : '<span></span>'}${next ? `<a href="${pathFor(next)}"><span>Next →</span>${escapeHTML(next.label)}</a>` : '<a href="/"><span>Keep exploring →</span>All concepts</a>'}</nav>
    </article>
  `});
}

const slugs = new Set();
for (const concept of definitions) {
  if (!/^javascript-[a-z0-9-]+$/.test(concept.slug) || slugs.has(concept.slug)) throw new Error(`Invalid or duplicate slug: ${concept.slug}`);
  slugs.add(concept.slug);
  if (!groups.includes(concept.group)) throw new Error(`Unknown group: ${concept.group}`);
}
await rm(output, {recursive:true, force:true});
await mkdir(output, {recursive:true});
await copyFile(new URL('../src/main.css', import.meta.url), new URL('main.css', output));
await writeFile(new URL('index.html', output), home());
for (const [index, concept] of definitions.entries()) {
  const directory = new URL(`${concept.slug}/`, output);
  await mkdir(directory, {recursive:true});
  await writeFile(new URL('index.html', directory), conceptPage(concept,index));
}
await writeFile(new URL('404.html', output), document({title:'Page Not Found', description:'Find a JavaScript concept in our quick reference.', path:'/404.html', noindex:true, content:'<div class="page-heading"><p class="eyebrow">404</p><h1>That page isn’t here.</h1><p class="lead">Find the explanation you need in the concept library.</p><a class="back-link" href="/">Browse all concepts →</a></div>'}));
await writeFile(new URL('sitemap.xml', output), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', ...definitions.map(pathFor)].map((path) => `<url><loc>${url(path)}</loc></url>`).join('')}</urlset>\n`);
await writeFile(new URL('robots.txt', output), `User-agent: *\nAllow: /\n\nSitemap: ${url('/sitemap.xml')}\n`);
await writeFile(new URL('_headers', output), '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n');
console.log(`Built ${definitions.length} concept pages, the index, sitemap and 404 page for ${origin}.`);
