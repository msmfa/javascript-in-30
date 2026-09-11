import { mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import CleanCSS from 'clean-css';
import { minify } from 'terser';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import { definitions } from '../src/data.js';
import { securityHeaders } from './security.mjs';
import { analyticsConfig } from '../src/analytics-config.js';
import { indexNowKey } from '../src/search-config.js';

hljs.registerLanguage('javascript', javascript);

const output = new URL('../build/', import.meta.url);
// Crawlers only trust lastmod when it tracks real content changes, so it comes
// from the last commit touching the copy rather than from the build clock.
const lastModified = (() => {
  try {
    const committed = execFileSync('git', ['log', '-1', '--format=%cI', '--', 'src/data.js'], {cwd:new URL('../', import.meta.url), encoding:'utf8', stdio:['ignore','pipe','ignore']}).trim();
    if (committed) return committed.slice(0,10);
  } catch { /* Not a git checkout; fall back to today. */ }
  return new Date().toISOString().slice(0,10);
})();
const requestedOrigin = new URL(process.env.SITE_URL || 'https://www.javascriptin30words.com');
if (!['http:', 'https:'].includes(requestedOrigin.protocol)) throw new Error('SITE_URL must be an HTTP(S) URL.');
const origin = requestedOrigin.origin;
const brand = 'JavaScript in 30 Words';
const groups = ['Fundamentals', 'Advanced'];
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[character]));
const url = (path = '/') => origin + path;
const pathFor = (concept) => `/${concept.slug}/`;
const labelFor = (concept) => concept.id === 'this' ? 'this keyword' : concept.label;
const summaryFor = (concept) => [concept.text, ...(concept.definitionItems || [])].filter(Boolean).join(' ');
const searchDescription = (concept) => {
  const text = `${concept.label} in JavaScript: ${concept.text || concept.explanation}`.replace(/\s+/g, ' ').trim();
  return text.length <= 160 ? text : text.slice(0,157).replace(/\s+\S*$/, '') + '…';
};
const interfaceFont = await readFile(new URL('../src/fonts/manrope-latin-variable.woff2', import.meta.url));
const interfaceFontPath = `/assets/manrope.${createHash('sha256').update(interfaceFont).digest('hex').slice(0,12)}.woff2`;
const stylesheetSource = (await readFile(new URL('../src/main.css', import.meta.url), 'utf8')).replace('__UI_FONT_URL__', interfaceFontPath);
const stylesheet = new CleanCSS({level:2, rebase:false}).minify(stylesheetSource);
if (stylesheet.errors.length) throw new Error(stylesheet.errors.join('\n'));
const logo = await readFile(new URL('../src/logo.webp', import.meta.url));
const logoPath = `/assets/logo.${createHash('sha256').update(logo).digest('hex').slice(0,12)}.webp`;
const aiClient = (await minify(await readFile(new URL('../src/ai-client.js', import.meta.url), 'utf8'), {module:true})).code;
const aiClientPath = `/assets/ai-client.${createHash('sha256').update(aiClient).digest('hex').slice(0,12)}.js`;
const aiPanelSource = (await readFile(new URL('../src/ai-panel.js', import.meta.url), 'utf8')).replace("'./ai-client.js'", JSON.stringify(aiClientPath));
const aiPanel = (await minify(aiPanelSource, {module:true})).code;
const aiPanelPath = `/assets/ai-panel.${createHash('sha256').update(aiPanel).digest('hex').slice(0,12)}.js`;
if (analyticsConfig.googleMeasurementId && !/^G-[A-Z0-9]+$/.test(analyticsConfig.googleMeasurementId)) throw new Error('Invalid public Google measurement ID.');
if (analyticsConfig.posthogProjectToken && !/^phc_[A-Za-z0-9]+$/.test(analyticsConfig.posthogProjectToken)) throw new Error('Use a public PostHog project token, never a personal API key.');
if (!['https://eu.i.posthog.com','https://us.i.posthog.com'].includes(analyticsConfig.posthogHost)) throw new Error('Invalid PostHog ingestion host.');
const analyticsSource = (await readFile(new URL('../src/analytics.js', import.meta.url), 'utf8')).replace("import {analyticsConfig as config} from './analytics-config.js';", `const config = ${JSON.stringify(analyticsConfig)};`);
const analytics = (await minify(analyticsSource, {module:true})).code;
const analyticsPath = `/assets/analytics.${createHash('sha256').update(analytics).digest('hex').slice(0,12)}.js`;

function renderAIPanel(concept) {
  const context = {title:concept.label, definition:summaryFor(concept), code:concept.code, output:concept.output, reference:concept.reference};
  return `<details class="ai-panel" data-ai-panel data-ai-context="${escapeHTML(JSON.stringify(context))}">
    <summary class="ai-panel-toggle"><h2 id="ai-panel-title"><span aria-hidden="true">✦</span> AI panel</h2><svg aria-hidden="true" viewBox="0 0 20 20"><path d="m6 8 4 4 4-4"></path></svg></summary>
    <div class="ai-panel-content">
    <div class="ai-panel-heading"><p>Ask AI to clarify the parts you don’t fully understand, or go more in depth with <a href="${escapeHTML(concept.reference)}">MDN documentation</a>.</p><button class="ai-button" id="ai-connect" type="button" disabled>Connect your API key</button></div>
    <div class="ai-prompts" aria-label="Suggested questions">
      <button type="button" disabled data-ai-prompt="Explain this concept in simple terms, with an everyday analogy.">Explain simply</button>
      <button type="button" disabled data-ai-prompt="Walk me through the code example above, step by step, and explain its output.">Walk through the code</button>
      <button type="button" disabled data-ai-prompt="Ask me one interview question about this concept. Wait for my answer before explaining the solution.">Quiz me</button>
    </div>
    <div id="ai-messages" class="ai-messages" role="log" aria-label="AI conversation" aria-live="polite" hidden></div>
    <form id="ai-question-form"><fieldset disabled>
      <label for="ai-question">What would you like to understand?</label>
      <textarea id="ai-question" name="question" rows="3" maxlength="2000" required placeholder="Ask about this concept or the example above…"></textarea>
      <div class="ai-composer-footer"><span id="ai-connection-status" hidden></span><div><button id="ai-stop" class="ai-button" type="button" hidden>Stop</button><button id="ai-send" class="ai-button ai-primary" type="submit">Submit</button></div></div>
    </fieldset></form>
    <p class="ai-status" id="ai-status" role="status"></p><p class="ai-error" id="ai-error" role="alert"></p>
    <div class="ai-panel-footer"><button class="ai-text-button" id="ai-clear" type="button" hidden>Clear conversation</button></div>
    <noscript><p class="ai-error">Enable JavaScript to connect your AI. The definitions and examples above work without it.</p></noscript>
    </div>
  </details>`;
}

function renderConnectionDialog() {
  return `<dialog id="ai-connect-dialog" class="ai-connect-dialog" aria-labelledby="ai-dialog-title" aria-describedby="ai-dialog-intro">
    <div class="ai-dialog-heading"><h2 id="ai-dialog-title">Connect your API key</h2><button id="ai-dialog-close" class="ai-close" type="button" aria-label="Close connection settings"><svg aria-hidden="true" viewBox="0 0 20 20"><path d="m5 5 10 10M15 5 5 15"></path></svg></button></div>
    <p id="ai-dialog-intro">Use your own API key for explanations and follow-up questions.</p>
    <form id="ai-settings-form" method="dialog"><fieldset>
      <div class="ai-provider-row"><label for="ai-provider">Provider</label><select id="ai-provider"><option value="openai">OpenAI</option><option value="anthropic">Anthropic (Claude)</option></select></div>
      <label for="ai-key">API key</label><div class="ai-key-input"><input id="ai-key" type="password" required minlength="16" maxlength="2048" autocomplete="off" autocapitalize="none" spellcheck="false" aria-describedby="ai-key-help" data-1p-ignore data-lpignore="true"><button id="ai-key-show" type="button" aria-label="Show or hide API key" aria-pressed="false">Show</button></div>
      <a id="ai-key-link" class="reference-link" href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">Get an API key ↗</a>
      <div class="ai-model-heading"><label for="ai-model">Model</label><button id="ai-load-models" class="ai-button" type="button">Load models</button></div>
      <select id="ai-model" required aria-describedby="ai-model-help ai-model-status"></select>
      <div id="ai-custom-model-row" hidden><label for="ai-custom-model">Custom model ID</label><input id="ai-custom-model" maxlength="100" autocomplete="off" spellcheck="false" aria-describedby="ai-model-help" disabled></div>
      <p id="ai-model-status" class="ai-status" role="status"></p>
      <p id="ai-model-help" class="ai-model-help">Enter your API key and load your account’s models, or choose “Other model…” to enter a text model ID. You can change it later in Connection settings.</p>
      <label class="ai-remember-label" for="ai-remember"><input id="ai-remember" type="checkbox">Remember this connection in this tab</label>
      <p id="ai-key-help" class="ai-key-help"></p>
      <p class="ai-billing-note">API usage is billed by your provider, separately from ChatGPT or Claude subscriptions. Loading models and connecting do not generate a paid answer.</p>
      <p id="ai-settings-error" class="ai-error" role="alert"></p>
      <div class="ai-dialog-actions"><button id="ai-disconnect" class="ai-text-button" type="button" hidden>Disconnect</button><button id="ai-dialog-cancel" class="ai-button" type="button">Cancel</button><button id="ai-settings-submit" class="ai-button ai-primary" type="submit">Connect</button></div>
    </fieldset></form>
  </dialog>`;
}

function renderDefinition(concept, className = 'definition') {
  const paragraph = concept.text ? `<p class="${className}">${escapeHTML(concept.text)}</p>` : '';
  const list = concept.definitionItems?.length ? `<ul class="${className} definition-list">${concept.definitionItems.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>` : '';
  return paragraph + list;
}

function navigation(current) {
  return groups.map((group, index) => {
    const items = definitions.filter((item) => item.group === group);
    const expanded = current ? current.group === group : index === 0;
    return `<details class="nav-group"${expanded ? ' open' : ''}><summary><span>${group}</span><span class="nav-count">${items.length}</span></summary><ul>${items.map((item) => `<li><a href="${pathFor(item)}"${current?.id === item.id ? ' aria-current="page"' : ''}>${escapeHTML(labelFor(item))}</a></li>`).join('')}</ul></details>`;
  }).join('');
}

function shareMenu(title, path) {
  const pageURL = url(path);
  const encodedURL = encodeURIComponent(pageURL);
  const encodedTitle = encodeURIComponent(title);
  const links = [
    ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${encodedURL}`],
    ['X', `https://x.com/intent/post?text=${encodedTitle}&url=${encodedURL}`],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodedURL}`],
    ['Email', `mailto:?subject=${encodedTitle}&body=${encodedURL}`]
  ];
  return `<details class="share-menu"><summary aria-label="Share this page"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="18" cy="5" r="2.5"></circle><circle cx="6" cy="12" r="2.5"></circle><circle cx="18" cy="19" r="2.5"></circle><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"></path></svg><span>Share</span></summary><div class="share-popover"><p>Share this page</p>${links.map(([label, href]) => `<a href="${escapeHTML(href)}"${label === 'Email' ? '' : ' target="_blank" rel="noopener noreferrer"'}>${label}<span aria-hidden="true">↗</span></a>`).join('')}</div></details>`;
}

function document({ title, description, path, content, current, noindex = false }) {
  const pageTitle = `${title} | ${brand}`;
  const structuredData = {
    '@context':'https://schema.org',
    '@graph':[
      {'@type':'WebSite','@id':url('/#website'),url:url('/'),name:brand,inLanguage:'en'},
      {'@type':'WebPage','@id':url(path),url:url(path),name:title,description,inLanguage:'en',isPartOf:{'@id':url('/#website')},...(current ? {breadcrumb:{'@id':url(path+'#breadcrumb')}} : {})},
      ...(current ? [{'@type':'BreadcrumbList','@id':url(path+'#breadcrumb'),itemListElement:[
        {'@type':'ListItem',position:1,name:'All concepts',item:url('/')},
        {'@type':'ListItem',position:2,name:labelFor(current),item:url(path)},
      ]}] : []),
    ],
  };
  const practiceURL = new URL('https://www.practice-pad.app/');
  practiceURL.search = new URLSearchParams({utm_source:'javascriptin30words', utm_medium:'referral', utm_campaign:'concept_to_practice', utm_content:`footer_${current?.slug || (noindex ? '404' : 'home')}`}).toString();
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
  <meta property="og:image" content="${url(logoPath)}">
  <meta property="og:image:alt" content="JavaScript in 30 Words logo">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:image" content="${url(logoPath)}">
  ${noindex ? '' : `<script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, '\\u003c')}</script>`}
  <link rel="icon" href="${logoPath}" type="image/webp" sizes="64x64">
  <link rel="preload" href="${interfaceFontPath}" as="font" type="font/woff2" crossorigin>
  <style>${stylesheet.styles}</style>
  <script type="module" src="${analyticsPath}"></script>
  ${current ? `<script type="module" src="${aiPanelPath}"></script>` : ''}
</head>
<body data-analytics-page="${escapeHTML(path)}" data-analytics-concept="${escapeHTML(current?.slug || (noindex ? '404' : 'home'))}">
  <a class="skip-link" href="#main-content">Skip to content</a>
  <aside class="sidebar">
    <a class="brand" href="/"><img class="brand-mark" src="${logoPath}" width="32" height="32" alt=""><span>JavaScript <strong>in 30 words</strong></span></a>
    <p class="brand-tagline">A refresher on JavaScript concepts in less than 30 words</p>
    <div class="sidebar-heading"><span>Concepts</span><span>${definitions.length}</span></div>
    <nav class="concept-nav" aria-label="Concepts">${navigation(current)}</nav>
  </aside>
  <div class="page">
    <header class="mobile-header"><a class="brand" href="/"><img class="brand-mark" src="${logoPath}" width="32" height="32" alt=""><span>JavaScript <strong>in 30 words</strong></span></a><details class="mobile-navigation"><summary>Browse all ${definitions.length} concepts</summary><nav aria-label="Concepts">${navigation(current)}</nav></details></header>
    <div class="content-layout">
      ${current ? `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">All concepts</a><span aria-hidden="true"> / </span><span>${escapeHTML(labelFor(current))}</span></nav>` : ''}
      <div class="scroll-region"><main id="main-content" tabindex="-1">${content}</main></div>
    </div>
    <footer class="site-footer">
      <div class="footer-inner">
        <section class="footer-practice" aria-labelledby="practice-heading">
          <div><h2 id="practice-heading">Understand the concept. Write the code.</h2><p>Once you’ve mastered these concepts, take the next step: implement them in Practice Pad, a JavaScript interview practice app for Mac.</p></div>
          <a class="practice-link" data-analytics-event="practice_pad_click" href="${escapeHTML(practiceURL.href)}">Try Practice Pad <span aria-hidden="true">↗</span></a>
        </section>
        <nav class="footer-links" aria-label="Footer"><a href="https://www.linkedin.com/in/michaelsydneymoore/">LinkedIn <span aria-hidden="true">↗</span></a><a href="https://github.com/msmfa/javascript-in-30">Contribute on GitHub <span aria-hidden="true">↗</span></a><a href="mailto:michael@codemoore.com" data-analytics-event="contact_click">Contact <span aria-hidden="true">↗</span></a>${shareMenu(pageTitle, path)}</nav>
      </div>
    </footer>
  </div>
  ${current ? renderConnectionDialog() : ''}
  <aside id="analytics-consent" class="analytics-consent" aria-labelledby="analytics-consent-title" hidden>
    <h2 id="analytics-consent-title">Help improve this refresher</h2>
    <p>Allow Google Analytics and PostHog to measure visits and feature use with analytics cookies and browser storage. API keys and AI conversations are excluded. Change your choice anytime under Privacy.</p>
    <div><button id="analytics-decline" type="button">Decline</button><button id="analytics-allow" type="button">Allow analytics</button></div>
  </aside>
</body>
</html>
`;
}

function home() {
  return document({title:'JavaScript Concepts Explained Simply', description:`Refresh ${definitions.length} JavaScript concepts with definitions in 30 words or fewer, useful code examples, and clear explanations for interview preparation.`, path:'/', content:`
    <header class="page-heading"><h1 class="eyebrow">Pre interview prep</h1><p class="lead">JavaScript concepts in 30 words or fewer, with code to make them stick. Pick a topic to get started.</p></header>
    ${groups.map((group) => `<section class="topic-section"><h2>${group}</h2><div class="topic-grid">${definitions.filter((item) => item.group === group).map((item) => `<article class="topic-card"><h3><a href="${pathFor(item)}">${escapeHTML(labelFor(item))} <span aria-hidden="true">↗</span></a></h3>${renderDefinition(item, 'topic-definition')}</article>`).join('')}</div></section>`).join('')}
  `});
}

function conceptPage(concept, index) {
  const previous = definitions[index - 1];
  const next = definitions[index + 1];
  const previousArrow = '<svg class="concept-direction" aria-hidden="true" viewBox="0 0 20 20"><path d="M16 10H4m5-5-5 5 5 5"></path></svg>';
  const nextArrow = '<svg class="concept-direction" aria-hidden="true" viewBox="0 0 20 20"><path d="M4 10h12m-5-5 5 5-5 5"></path></svg>';
  return document({title:concept.heading, description:searchDescription(concept), path:pathFor(concept), current:concept, content:`
    <article class="concept">
      <header class="page-heading"><h1>${escapeHTML(concept.heading)}</h1>${renderDefinition(concept)}</header>
      <section class="example" aria-label="JavaScript code example"><pre tabindex="0" aria-label="JavaScript code example"><code class="hljs language-javascript">${hljs.highlight(concept.code, {language:'javascript'}).value}</code></pre>${concept.output.length ? `<div class="example-output"><input class="output-toggle" type="checkbox" id="output-${escapeHTML(concept.id)}"><label for="output-${escapeHTML(concept.id)}"><span class="output-heading"><span>Output</span><span class="output-action" aria-hidden="true"></span></span><span class="output-content"><samp>${escapeHTML(concept.output.join('\n'))}</samp></span></label></div>` : ''}</section>
      ${renderAIPanel(concept)}
      <nav class="next-concepts" aria-label="More concepts">${previous ? `<a href="${pathFor(previous)}" aria-label="Previous concept: ${escapeHTML(labelFor(previous))}">${previousArrow}<span class="concept-name">${escapeHTML(labelFor(previous))}</span></a>` : '<span></span>'}${next ? `<a href="${pathFor(next)}" aria-label="Next concept: ${escapeHTML(labelFor(next))}"><span class="concept-name">${escapeHTML(labelFor(next))}</span>${nextArrow}</a>` : `<a href="/"><span class="concept-name">All concepts</span>${nextArrow}</a>`}</nav>
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
await mkdir(new URL('assets/', output), {recursive:true});
await writeFile(new URL(logoPath.slice(1), output), logo);
await writeFile(new URL(interfaceFontPath.slice(1), output), interfaceFont);
await writeFile(new URL('assets/Manrope-OFL.txt', output), await readFile(new URL('../src/fonts/OFL.txt', import.meta.url)));
await writeFile(new URL(aiClientPath.slice(1), output), aiClient);
await writeFile(new URL(aiPanelPath.slice(1), output), aiPanel);
await writeFile(new URL(analyticsPath.slice(1), output), analytics);
await writeFile(new URL('index.html', output), home());
for (const [index, concept] of definitions.entries()) {
  const directory = new URL(`${concept.slug}/`, output);
  await mkdir(directory, {recursive:true});
  await writeFile(new URL('index.html', directory), conceptPage(concept,index));
}
await writeFile(new URL('404.html', output), document({title:'Page Not Found', description:'Find a JavaScript concept in our quick reference.', path:'/404.html', noindex:true, content:'<div class="page-heading"><p class="eyebrow">404</p><h1>That page isn’t here.</h1><p class="lead">Find the explanation you need in the concept library.</p><a class="back-link" href="/">Browse all concepts →</a></div>'}));
await writeFile(new URL('sitemap.xml', output), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', ...definitions.map(pathFor)].map((path) => `<url><loc>${url(path)}</loc><lastmod>${lastModified}</lastmod></url>`).join('')}</urlset>\n`);
await writeFile(new URL('robots.txt', output), `User-agent: *\nAllow: /\n\nSitemap: ${url('/sitemap.xml')}\n`);
if (!/^[a-f0-9]{32}$/.test(indexNowKey)) throw new Error('Invalid IndexNow verification key.');
await writeFile(new URL(`${indexNowKey}.txt`, output), indexNowKey);
await writeFile(new URL('_redirects', output), `https://javascript-in-30-words.netlify.app/* ${origin}/:splat 301!\n`);
await writeFile(new URL('_headers', output), `/*\n${Object.entries(securityHeaders).map(([key,value]) => `  ${key}: ${value}`).join('\n')}\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n`);
console.log(`Built ${definitions.length} concept pages, the index, sitemap and 404 page for ${origin}.`);
