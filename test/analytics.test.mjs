import test from 'node:test';
import assert from 'node:assert/strict';
import {startAnalytics,safePageURL,sanitizePosthogEvent,consentKey} from '../src/analytics.js';

const settings = {googleMeasurementId:'G-TEST123',posthogProjectToken:'phc_test',posthogHost:'https://eu.i.posthog.com',productionHosts:['www.javascriptin30words.com']};
function harness({hostname='www.javascriptin30words.com',choice=null,storageBlocked=false} = {}) {
  const scripts = [], events = new Map(), elements = new Map(), stored = new Map(choice ? [[consentKey,choice]] : []);
  for (const selector of ['#analytics-consent','#analytics-preferences','#analytics-allow','#analytics-decline','.output-toggle','[data-ai-panel]','[data-analytics-page]']) {
    elements.set(selector,{hidden:true,dataset:{analyticsPage:'/javascript-closures/',analyticsConcept:'javascript-closures'},addEventListener:(name,fn)=>events.set(selector+name,fn),focus(){}});
  }
  const win = {
    location:{protocol:hostname === '127.0.0.1' ? 'http:' : 'https:',hostname,href:`https://${hostname}/javascript-closures/?api_key=private#secret`,reload(){win.reloaded=true;}},
    localStorage:{getItem:key=>{if(storageBlocked) throw Error('blocked');return stored.get(key) ?? null;},setItem:(key,value)=>{if(storageBlocked) throw Error('blocked');stored.set(key,value);},get length(){return stored.size;},key:index=>[...stored.keys()][index],removeItem:key=>stored.delete(key)},
    addEventListener:(name,fn)=>events.set('window'+name,fn),
  };
  const doc = {
    querySelector:selector=>elements.get(selector),title:'Closures | JavaScript in 30 Words',referrer:'https://search.example/results?q=private',cookie:'',
    createElement:()=>({}),head:{append:element=>scripts.push(element)},addEventListener:(name,fn)=>events.set('document'+name,fn),
  };
  startAnalytics(win,doc,settings);
  return {win,doc,scripts,stored,elements,events,click:selector=>events.get(selector+'click')()};
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
  assert.equal(event.properties.token,'phc_test');
  assert.equal(sanitizePosthogEvent({event:'$snapshot',properties:{}}),null);
  assert.equal(sanitizePosthogEvent({event:'$autocapture',properties:{}}),null);
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

test('consent loads both vendors once with one page view and explicit safe events',()=>{
  const h = harness();
  h.click('#analytics-allow');
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
  assert.equal(h.scripts.length,2);
  h.events.get('windowstorage')({key:consentKey,newValue:'denied'});
  assert.equal(h.win['ga-disable-G-TEST123'],true);
});
