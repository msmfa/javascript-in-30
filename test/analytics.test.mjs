import test from 'node:test';
import assert from 'node:assert/strict';
import {startAnalytics,safePageURL,sanitizePosthogEvent,consentKey} from '../src/analytics.js';

const settings = {googleMeasurementId:'G-TEST123',posthogProjectToken:'phc_test',posthogHost:'https://eu.i.posthog.com',posthogUiHost:'https://eu.posthog.com',posthogProxyPath:'/e30',productionHosts:['www.javascriptin30words.com']};
function harness({hostname='www.javascriptin30words.com',choice=null,storageBlocked=false,suppressConsentPrompt=false,paint=true,idleCallback=true,timers=[]} = {}) {
  const scripts = [], events = new Map(), elements = new Map(), stored = new Map(choice ? [[consentKey,choice]] : []);
  const idle = [];
  for (const selector of ['#analytics-consent','#analytics-preferences','#analytics-allow','#analytics-decline','.output-toggle','[data-ai-panel]','[data-analytics-page]']) {
    elements.set(selector,{hidden:true,dataset:{analyticsPage:'/javascript-closures/',analyticsConcept:'javascript-closures'},addEventListener:(name,fn)=>events.set(selector+name,fn),focus(){}});
  }
  const win = {
    location:{protocol:hostname === '127.0.0.1' ? 'http:' : 'https:',hostname,origin:`https://${hostname}`,href:`https://${hostname}/javascript-closures/?api_key=private#secret`,reload(){win.reloaded=true;}},
    localStorage:{getItem:key=>{if(storageBlocked) throw Error('blocked');return stored.get(key) ?? null;},setItem:(key,value)=>{if(storageBlocked) throw Error('blocked');stored.set(key,value);},get length(){return stored.size;},key:index=>[...stored.keys()][index],removeItem:key=>stored.delete(key)},
    addEventListener:(name,fn)=>events.set('window'+name,fn),
    setTimeout:fn=>timers.push(fn),
    ...(idleCallback ? {requestIdleCallback:fn=>idle.push(fn)} : {}),
  };
  const doc = {
    readyState:'loading',
    querySelector:selector=>elements.get(selector),title:'Closures | JavaScript in 30 Words',referrer:'https://search.example/results?q=private',cookie:'',
    createElement:()=>({}),head:{append:element=>scripts.push(element)},addEventListener:(name,fn)=>events.set('document'+name,fn),
  };
  startAnalytics(win,doc,{...settings,suppressConsentPrompt});
  // The vendor bundles are held back until the page has painted, so a test that
  // wants to see them has to let the page finish loading and then go idle.
  // Consent given after load starts the vendors on an already-complete
  // document, so readyState flips here the way a real one would.
  const finishPaint = () => { doc.readyState = 'complete'; events.get('windowload')?.(); while (idle.length) idle.shift()(); };
  if (paint) finishPaint();
  return {win,doc,scripts,stored,elements,events,finishPaint,click:selector=>events.get(selector+'click')()};
}

test('analytics strips arbitrary query strings, fragments, and personal data',()=>{
  assert.equal(safePageURL('https://www.javascriptin30words.com/javascript-closures/?utm_source=newsletter&api_key=sk-secret#message'),'https://www.javascriptin30words.com/javascript-closures/?utm_source=newsletter');
  assert.equal(safePageURL('invalid'),'');
  const event = sanitizePosthogEvent({event:'practice_pad_click',properties:{token:'phc_test',distinct_id:'anonymous',concept:'closures',key:'sk-secret',question:'private message',$set:{email:'private@example.com'},$current_url:'https://site.example/?key=secret#private',$referrer:'https://search.example/?q=secret'}});
  assert.equal(event.properties.key,undefined);
  assert.equal(event.properties.question,undefined);
  assert.equal(event.properties.$set,undefined);
  assert.equal(event.properties.$current_url,'https://site.example/');
  assert.equal(event.properties.$referrer,'https://search.example');
  assert.equal(event.properties.$referring_domain,'search.example');
  assert.equal(event.properties.token,'phc_test');
  assert.equal(sanitizePosthogEvent({event:'$snapshot',properties:{}}),null);
  assert.equal(sanitizePosthogEvent({event:'$autocapture',properties:{}}),null);
});

test('referrer attribution survives sanitizing so PostHog can group traffic by channel',()=>{
  const direct = sanitizePosthogEvent({event:'$pageview',properties:{$referrer:'$direct',$referring_domain:'$direct'}});
  assert.equal(direct.properties.$referrer,'$direct','Direct visits stay distinguishable from stripped ones');
  assert.equal(direct.properties.$referring_domain,'$direct');
  const search = sanitizePosthogEvent({event:'$pageview',properties:{$referrer:'https://www.google.com/search?q=private',$referring_domain:'www.google.com'}});
  assert.equal(search.properties.$referrer,'https://www.google.com','Query strings never leave the browser');
  assert.equal(search.properties.$referring_domain,'www.google.com');
  const spoofed = sanitizePosthogEvent({event:'$pageview',properties:{$referrer:'https://github.com/msmfa',$referring_domain:'evil.example'}});
  assert.equal(spoofed.properties.$referring_domain,'github.com','Domain is derived from the referrer, never copied');
  const missing = sanitizePosthogEvent({event:'$pageview',properties:{}});
  assert.equal(missing.properties.$referrer,'');
  assert.equal(missing.properties.$referring_domain,'');
  assert.ok(sanitizePosthogEvent({event:'$pageleave',properties:{}}),'Pageleave is needed for session duration and bounce rate');
});

test('web vitals are measured but their attribution payloads never leave the browser',()=>{
  const h = harness({choice:'granted'});
  const performance = h.win.posthog._i[0][1].capture_performance;
  assert.equal(performance.web_vitals,true,'Core Web Vitals feed the PostHog performance charts');
  assert.equal(performance.network_timing,false,'Resource timing is not needed and is not collected');
  assert.equal(performance.web_vitals_attribution,false,'Attribution would record the DOM element behind each metric');
  const event = sanitizePosthogEvent({event:'$web_vitals',properties:{
    $web_vitals_LCP_value:2350.5,$web_vitals_CLS_value:0.02,$web_vitals_FCP_value:900,$web_vitals_INP_value:120,
    $web_vitals_LCP_event:{name:'LCP',attribution:{element:'#hero > img',url:'https://site.example/?key=secret'}},
    $current_url:'https://site.example/javascript-closures/?api_key=private',
  }});
  assert.equal(event.properties.$web_vitals_LCP_value,2350.5);
  assert.equal(event.properties.$web_vitals_CLS_value,0.02);
  assert.equal(event.properties.$web_vitals_FCP_value,900);
  assert.equal(event.properties.$web_vitals_INP_value,120);
  assert.equal(event.properties.$web_vitals_LCP_event,undefined,'The attribution object carries DOM selectors and URLs');
  assert.equal(event.properties.$current_url,'https://site.example/javascript-closures/');
  assert.deepEqual(performance.web_vitals_allowed_metrics.map(name=>`$web_vitals_${name}_value`).filter(key=>!(key in event.properties)),[],
    'Every metric we request also survives sanitizing');
});

test('PostHog loads and ingests through the same origin so blockers cannot drop it',()=>{
  const h = harness({choice:'granted'});
  const options = h.win.posthog._i[0][1];
  assert.equal(options.api_host,'https://www.javascriptin30words.com/e30');
  assert.equal(options.ui_host,'https://eu.posthog.com','Links into PostHog still point at the real app');
  assert.ok(sanitizePosthogEvent({event:'$pageview',properties:{$lib_custom_api_host:'https://www.javascriptin30words.com/e30'}}).properties.$lib_custom_api_host,
    'PostHog detects the proxy from this property, so it has to survive sanitizing');
  const loader = h.scripts.map(element=>element.src).find(src=>src.includes('/e30/'));
  assert.equal(loader,'https://www.javascriptin30words.com/e30/static/array.js');
  assert.ok(!h.scripts.some(element=>element.src.includes('posthog.com')),'No request reveals the vendor hostname');
});

test('local and deploy preview visits never load analytics, even with remembered consent',()=>{
  for (const hostname of ['127.0.0.1','localhost','deploy-preview-19--javascript-in-30-words.netlify.app','javascriptin30words.com.evil.example']) {
    const h = harness({hostname,choice:'granted'});
    assert.equal(h.scripts.length,0);
    assert.equal(h.elements.get('#analytics-consent').hidden,true);
    assert.equal(h.elements.get('#analytics-preferences').hidden,true);
  }
});

test('no vendor requests or tracking before consent, or after declining',()=>{
  const h = harness();
  assert.equal(h.scripts.length,0);
  assert.equal(h.elements.get('#analytics-consent').hidden,false);
  h.click('#analytics-decline');
  assert.equal(h.stored.get(consentKey),'denied');
  assert.equal(h.scripts.length,0);
  h.events.get('.output-togglechange')({target:{checked:true}});
  assert.equal(h.win.dataLayer,undefined);
  assert.equal(harness({choice:'denied'}).scripts.length,0);
});

test('temporary no-prompt mode initializes analytics while preserving opt-outs and preview exclusions',()=>{
  const h = harness({suppressConsentPrompt:true});
  assert.equal(h.scripts.length,2);
  assert.equal(h.elements.get('#analytics-consent').hidden,true);
  assert.equal(h.stored.get(consentKey),undefined,'Testing mode does not manufacture a saved consent choice');
  assert.equal(harness({suppressConsentPrompt:true,choice:'denied'}).scripts.length,0);
  assert.equal(harness({suppressConsentPrompt:true,hostname:'localhost'}).scripts.length,0);
  h.click('#analytics-preferences');
  assert.equal(h.elements.get('#analytics-consent').hidden,false,'Privacy controls remain available on demand');
  h.click('#analytics-decline');
  assert.equal(h.win['ga-disable-G-TEST123'],true);
});

test('vendor bundles wait for the paint, and events raised while they wait are kept',()=>{
  const h = harness({choice:'granted',paint:false});
  // Nothing has been fetched yet, but both queues already exist.
  assert.equal(h.scripts.length,0);
  assert.equal(typeof h.win.gtag,'function');
  assert.ok(h.win.posthog?.__SV,'The PostHog stub queue is installed up front');
  assert.equal(h.win.dataLayer.filter(args=>args[0] === 'event' && args[1] === 'page_view').length,1);

  h.finishPaint();
  assert.equal(h.scripts.length,2);
  const sources = h.scripts.map(element=>element.src);
  assert.ok(sources.some(src=>src.includes('googletagmanager.com/gtag/js')));
  assert.ok(sources.some(src=>src.endsWith('/e30/static/array.js')));

  // PostHog replays what was captured before its bundle arrived.
  const [,options] = h.win.posthog._i[0];
  const captured = [];
  options.loaded({capture:(event,props)=>captured.push([event,props]),opt_out_capturing(){}});
  assert.deepEqual(captured.map(([event])=>event),['$pageview']);
});

test('a browser without requestIdleCallback still loads the vendors after the paint',()=>{
  const timers = [];
  const h = harness({choice:'granted',paint:false,idleCallback:false,timers});
  assert.equal(h.scripts.length,0);
  h.finishPaint();
  assert.equal(h.scripts.length,0,'Safari waits for the timer rather than an idle callback');
  while (timers.length) timers.shift()();
  assert.equal(h.scripts.length,2);
});

test('consent loads both vendors once with one page view and explicit safe events',()=>{
  const h = harness();
  h.click('#analytics-allow');
  // The page view is queued the moment consent is given, before either bundle
  // has been asked for, which is the whole point of holding them back.
  assert.equal(h.scripts.length,0);
  assert.equal(h.win.dataLayer.filter(args=>args[0] === 'event' && args[1] === 'page_view').length,1);
  h.finishPaint();
  assert.equal(h.scripts.length,2);
  assert.ok(h.scripts.every(script=>script.async && script.referrerPolicy === 'no-referrer'));
  const commands = h.win.dataLayer.map(args=>[...args]);
  assert.equal(commands.filter(args=>args[0] === 'event' && args[1] === 'page_view').length,1);
  const options = commands.find(args=>args[0] === 'config')[2];
  assert.equal(options.send_page_view,false);
  assert.equal(options.page_location,'https://www.javascriptin30words.com/javascript-closures/');
  assert.equal(options.page_referrer,'https://search.example');
  const phOptions = h.win.posthog._i[0][1];
  assert.equal(phOptions.autocapture,false);
  assert.equal(phOptions.disable_session_recording,true);
  assert.equal(phOptions.capture_exceptions,false);
  assert.equal(phOptions.capture_pageleave,true);
  const captures = [];
  h.win.posthog = {capture:(...args)=>captures.push(args),opt_out_capturing(){}};
  phOptions.loaded(h.win.posthog);
  h.events.get('documentclick')({target:{closest:()=>({dataset:{analyticsEvent:'practice_pad_click'}})}});
  assert.deepEqual(captures.map(args=>args[0]),['$pageview','practice_pad_click']);
  assert.equal(captures[1][1].concept,'javascript-closures');
  assert.equal(captures[1][1].destination,'practice-pad.app');
  h.click('#analytics-preferences');
  h.click('#analytics-allow');
  assert.equal(h.scripts.length,2,'No double initialization');
});

test('withdrawal stops a pending PostHog load and clears only analytics storage',()=>{
  const h = harness({choice:'granted'});
  const options = h.win.posthog._i[0][1];
  h.stored.set('ph_phc_test_posthog','analytics');
  h.stored.set('unrelated','keep');
  h.click('#analytics-decline');
  let optedOut = false;
  options.loaded({opt_out_capturing:()=>{optedOut=true;},capture:()=>assert.fail('No events after withdrawal')});
  assert.ok(optedOut);
  assert.equal(options.before_send({event:'$pageview'}),null);
  assert.equal(h.stored.has('ph_phc_test_posthog'),false);
  assert.equal(h.stored.get('unrelated'),'keep');
  assert.equal(h.win['ga-disable-G-TEST123'],true);
  assert.equal(h.win.reloaded,true);
});

test('consent works with blocked storage and withdrawal synchronizes across tabs',()=>{
  const h = harness({storageBlocked:true});
  h.click('#analytics-allow');
  h.finishPaint();
  assert.equal(h.scripts.length,2);
  h.events.get('windowstorage')({key:consentKey,newValue:'denied'});
  assert.equal(h.win['ga-disable-G-TEST123'],true);
});
