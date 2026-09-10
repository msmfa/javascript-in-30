import test from 'node:test';
import assert from 'node:assert/strict';
import {PROVIDERS, STORAGE_KEY, validateSettings, readConnection, saveConnection, checkConnection, listModels, createMessages, askAI} from '../src/ai-client.js';
import {securityHeaders} from '../scripts/security.mjs';

const settings = {provider:'openai', model:'gpt-4.1-mini', key:'sk-test-only-not-a-real-key'};
const context = {title:'Closures',definition:'A function and its lexical environment.',code:'const add = n => () => ++n;',output:['2'],reference:'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures'};
const json = (value, status=200) => new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});
const memoryStorage = () => {const data=new Map();return {getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)}};

test('connections accept only fixed providers and valid model IDs', () => {
  assert.deepEqual(validateSettings({...settings,key:' '+settings.key+' '}),settings);
  for (const provider of ['constructor','__proto__','https://attacker.example']) assert.throws(()=>validateSettings({...settings,provider}));
  for (const model of ['','../../messages','name?key=secret','bad model']) assert.throws(()=>validateSettings({...settings,model}));
  assert.throws(()=>validateSettings({...settings,key:'short'}));
  assert.throws(()=>validateSettings({...settings,key:settings.key+'\ninjected'}));
});

test('keys are saved only with explicit tab-storage opt-in and disconnect removes them', () => {
  const storage=memoryStorage();
  assert.equal(saveConnection(storage,settings,false),true);
  assert.equal(storage.getItem(STORAGE_KEY),null);
  saveConnection(storage,settings,true);
  assert.deepEqual(readConnection(storage),settings);
  saveConnection(storage,null,false);
  assert.equal(readConnection(storage),null);
});

test('corrupt or unavailable storage is safe and does not disable memory-only mode', () => {
  const storage=memoryStorage();storage.setItem(STORAGE_KEY,'not json');
  assert.equal(readConnection(storage),null);assert.equal(storage.getItem(STORAGE_KEY),null);
  storage.setItem(STORAGE_KEY,JSON.stringify({...settings,provider:'other'}));assert.equal(readConnection(storage),null);
  const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')},removeItem(){throw Error('blocked')}};
  assert.equal(readConnection(blocked),null);assert.equal(saveConnection(blocked,settings,true),false);
  assert.equal(readConnection(undefined),null);
});

test('connection check authenticates against the chosen model without generating a paid reply', async () => {
  const result=await checkConnection(settings,{fetchImpl:async(url,init)=>{
    assert.equal(url,'https://api.openai.com/v1/models/gpt-4.1-mini');assert.equal(init.method,'GET');assert.equal(init.body,undefined);
    assert.equal(init.headers.Authorization,`Bearer ${settings.key}`);assert.equal(init.credentials,'omit');assert.equal(init.redirect,'error');
    return json({id:settings.model});
  }});
  assert.deepEqual(result,settings);
});

test('model discovery uses the key directly and includes new text models without preset limits', async () => {
  const result=await listModels(settings,{fetchImpl:async(url,init)=>{
    assert.equal(url,'https://api.openai.com/v1/models');assert.equal(init.method,'GET');assert.equal(init.body,undefined);
    assert.equal(init.headers.Authorization,`Bearer ${settings.key}`);assert.equal(init.credentials,'omit');
    return json({data:[{id:'gpt-4.1-mini',created:10},{id:'gpt-future-text',created:50},{id:'gpt-4.1-mini',created:10},{id:'ft:gpt-4.1:custom',created:20},{id:'gpt-image-2',created:60},{id:'text-embedding-3-small'},{id:'whisper-1'},{id:'gpt-realtime'},{id:'../../bad'}]});
  }});
  assert.deepEqual(result.map(model=>model.id),['gpt-future-text','ft:gpt-4.1:custom','gpt-4.1-mini']);
});

test('Anthropic model discovery follows every page and preserves display names', async () => {
  let calls=0;
  const result=await listModels({...settings,provider:'anthropic'},{fetchImpl:async(url,init)=>{
    calls++;assert.equal(init.headers['x-api-key'],settings.key);assert.equal(init.method,'GET');
    if(calls===1){assert.equal(url,'https://api.anthropic.com/v1/models?limit=1000');return json({data:[{id:'claude-new',display_name:'Claude New',created_at:'2026-09-01'}],has_more:true,last_id:'claude:new'});}
    assert.equal(url,'https://api.anthropic.com/v1/models?limit=1000&after_id=claude%3Anew');
    return json({data:[{id:'claude-older',display_name:'Claude Older',created_at:'2026-08-01'}],has_more:false});
  }});
  assert.equal(calls,2);assert.deepEqual(result,[{id:'claude-new',name:'Claude New'},{id:'claude-older',name:'Claude Older'}]);
});

test('empty model lists remain empty and malformed lists are actionable',async()=>{
  assert.deepEqual(await listModels(settings,{fetchImpl:async()=>json({data:[]})}),[]);
  await assert.rejects(listModels(settings,{fetchImpl:async()=>json({data:null})}),/unreadable model list/);
});

test('model discovery stops on broken or repeated pagination cursors',async()=>{
  let calls=0;
  await assert.rejects(listModels({...settings,provider:'anthropic'},{fetchImpl:async()=>{
    calls++;return json({data:[],has_more:true,last_id:'same-cursor'});
  }}),/could not finish listing/);
  assert.equal(calls,2);
  await assert.rejects(listModels({...settings,provider:'anthropic'},{fetchImpl:async()=>json({data:[],has_more:true})}),/could not finish listing/);
});

test('model lookup rejects invalid keys without sending them and never echoes provider errors',async()=>{
  let calls=0;
  await assert.rejects(listModels({...settings,key:'short'},{fetchImpl:async()=>{calls++}}),/valid API key/);
  assert.equal(calls,0);
  await assert.rejects(listModels(settings,{fetchImpl:async()=>json({error:{message:settings.key}},401)}),error=>{
    assert.match(error.message,/key was not accepted/);assert.ok(!error.message.includes(settings.key));return true;
  });
});

test('model discovery supports cancellation without retries',async()=>{
  const controller=new AbortController();controller.abort();let calls=0;
  await assert.rejects(listModels(settings,{signal:controller.signal,fetchImpl:async(_url,init)=>{calls++;init.signal.throwIfAborted()}}),{name:'AbortError'});
  assert.equal(calls,1);
});

test('context includes the concept, definition, code, expected output and bounded follow-ups', () => {
  const history=Array.from({length:16},(_,i)=>({role:i%2?'assistant':'user',content:String(i)}));
  const messages=createMessages(context,history,' Explain the output. ');
  assert.equal(messages.length,12);
  for(const value of [context.title,context.definition,context.code,context.output[0],context.reference])assert.ok(messages[0].content.includes(value));
  assert.equal(messages[1].content,'6');assert.equal(messages.at(-1).content,'Explain the output.');
  assert.throws(()=>createMessages(context,[],''));assert.throws(()=>createMessages(context,[],'a'.repeat(2001)));
});

test('OpenAI request uses Responses API, does not store responses, and extracts all text blocks', async () => {
  const result=await askAI(settings,context,[],'Explain it',{fetchImpl:async(url,init)=>{
    assert.equal(url,'https://api.openai.com/v1/responses');
    const body=JSON.parse(init.body);
    assert.equal(body.store,false);assert.equal(body.max_output_tokens,1200);assert.equal(body.model,settings.model);
    assert.ok(!init.body.includes(settings.key));assert.equal(init.referrerPolicy,'no-referrer');
    return json({status:'completed',output:[{type:'reasoning',summary:[]},{type:'message',content:[{type:'output_text',text:'First.'},{type:'output_text',text:'Second.'}]}]});
  }});
  assert.deepEqual(result,{text:'First.\nSecond.',truncated:false});
});

test('Anthropic sends only the Anthropic key headers and reads Messages API replies', async () => {
  const config={...settings,provider:'anthropic',model:PROVIDERS.anthropic.model};
  const result=await askAI(config,context,[{role:'user',content:'Previous'},{role:'assistant',content:'Answer'}],'Another example',{fetchImpl:async(url,init)=>{
    assert.equal(url,'https://api.anthropic.com/v1/messages');
    assert.equal(init.headers['x-api-key'],settings.key);assert.equal(init.headers.Authorization,undefined);
    assert.equal(init.headers['anthropic-dangerous-direct-browser-access'],'true');assert.equal(init.headers['anthropic-version'],'2023-06-01');
    const body=JSON.parse(init.body);assert.ok(body.system);assert.equal(body.max_tokens,1200);assert.equal(body.messages.at(-1).content,'Another example');
    return json({content:[{type:'thinking',thinking:'private'},{type:'text',text:'A small explanation.'}],stop_reason:'end_turn'});
  }});
  assert.deepEqual(result,{text:'A small explanation.',truncated:false});
});

for(const [status,pattern] of [[401,/key was not accepted/],[403,/permission/],[404,/model is not available/],[429,/limit/],[500,/temporarily unavailable/]]) {
  test(`provider error ${status} is actionable and never echoes a key`,async()=>{
    await assert.rejects(askAI(settings,context,[],'Explain',{fetchImpl:async()=>json({error:{message:`Invalid secret ${settings.key}`}},status)}),error=>{
      assert.match(error.message,pattern);assert.ok(!error.message.includes(settings.key));return true;
    });
  });
}

test('quota exhaustion directs the learner to provider billing',async()=>{
  await assert.rejects(askAI(settings,context,[],'Explain',{fetchImpl:async()=>json({error:{code:'insufficient_quota'}},429)}),/credits or a higher spending limit/);
});

test('network errors do not expose raw exception details',async()=>{
  await assert.rejects(askAI(settings,context,[],'Explain',{fetchImpl:async()=>{throw Error(settings.key)}}),error=>{
    assert.match(error.message,/Could not reach OpenAI/);assert.ok(!error.message.includes(settings.key));return true;
  });
});

test('stopped requests propagate cancellation instead of retrying',async()=>{
  const controller=new AbortController();controller.abort();let attempts=0;
  await assert.rejects(askAI(settings,context,[],'Explain',{signal:controller.signal,fetchImpl:async(_url,init)=>{attempts++;init.signal.throwIfAborted()}}),{name:'AbortError'});
  assert.equal(attempts,1);
});

test('truncated replies and refusals are surfaced instead of silently disappearing',async()=>{
  const partial=await askAI(settings,context,[],'Explain',{fetchImpl:async()=>json({status:'incomplete',output:[{type:'message',content:[{type:'output_text',text:'Beginning…'}]}]})});
  assert.equal(partial.truncated,true);
  const refusal=await askAI(settings,context,[],'Explain',{fetchImpl:async()=>json({output:[{type:'message',content:[{type:'refusal',refusal:'I can help with JavaScript instead.'}]}]})});
  assert.equal(refusal.text,'I can help with JavaScript instead.');
  await assert.rejects(askAI(settings,context,[],'Explain',{fetchImpl:async()=>json({output:[]})}),/No explanation/);
});

test('security policy limits connections and disallows injected scripts and forms',()=>{
  const policy=securityHeaders['Content-Security-Policy'];
  assert.match(policy,/script-src 'self' https:\/\/www\.googletagmanager\.com/);
  assert.ok(!policy.split('script-src ')[1].split(';')[0].includes("'unsafe-inline'"));
  assert.ok(policy.includes("form-action 'none'"));
  for(const provider of Object.values(PROVIDERS))assert.ok(policy.includes(new URL(provider.origin).origin));
  assert.ok(!policy.includes('unsafe-eval'));
});
