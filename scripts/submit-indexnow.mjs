import {readFile} from 'node:fs/promises';
import {indexNowKey} from '../src/search-config.js';

// Run only after the matching production release is live. Preview builds never
// submit URLs, and the deployed ownership file must match before any submission.
const origin = 'https://www.javascriptin30words.com';
const sitemap = await readFile(new URL('../build/sitemap.xml',import.meta.url),'utf8');
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
if (!urlList.length || urlList.some(value=>new URL(value).origin !== origin)) throw new Error('Build the production sitemap before submitting.');
const keyLocation = `${origin}/${indexNowKey}.txt`;
const verification = await fetch(keyLocation,{signal:AbortSignal.timeout(30000)});
if (!verification.ok || (await verification.text()).trim() !== indexNowKey) throw new Error('Publish the IndexNow verification file before submitting.');
const response = await fetch('https://api.indexnow.org/indexnow',{
  method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},
  body:JSON.stringify({host:new URL(origin).host,key:indexNowKey,keyLocation,urlList}),
  signal:AbortSignal.timeout(30000),
});
if (![200,202].includes(response.status)) throw new Error(`IndexNow rejected the submission (HTTP ${response.status}). ${await response.text()}`);
console.log(`IndexNow received ${urlList.length} URLs (HTTP ${response.status}). This is a crawl notification, not confirmation that pages are indexed.`);
