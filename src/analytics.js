import {analyticsConfig as config} from './analytics-config.js';

export const consentKey = 'js30.analytics-consent.v1';
const allowedEvents = new Set(['$pageview','practice_pad_click','contact_click','output_revealed','ai_panel_opened']);
const campaignKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];

export function safePageURL(value) {
  try {
    const source = new URL(value);
    const safe = new URL(source.origin + source.pathname);
    for (const key of campaignKeys) {
      const value = source.searchParams.get(key);
      if (value && /^[a-z0-9_ .-]{1,100}$/i.test(value)) safe.searchParams.set(key,value);
    }
    return safe.href;
  } catch { return ''; }
}

// Allow only explicit events and basic anonymous usage metadata. Never collect
// DOM text, input values, AI messages, exception details, or arbitrary URLs.
export function sanitizePosthogEvent(event) {
  if (!event || !allowedEvents.has(event.event)) return null;
  const keep = new Set(['token','distinct_id','$device_id','$session_id','$window_id','$insert_id','$time',
    '$lib','$lib_version','$browser','$browser_version','$os','$os_version','$device_type',
    '$screen_height','$screen_width','$viewport_height','$viewport_width','$timezone',
    '$host','$pathname','$title','$is_identified','$process_person_profile','page_path','page_title',
    'concept','placement','destination',...campaignKeys]);
  const properties = Object.fromEntries(Object.entries(event.properties || {}).filter(([key,value]) => keep.has(key) && ['string','number','boolean'].includes(typeof value)));
  properties.$current_url = safePageURL(event.properties?.$current_url || '');
  try { properties.$referrer = new URL(event.properties?.$referrer).origin; } catch { properties.$referrer = ''; }
  return {...event,properties};
}

export function startAnalytics(win = window, doc = document, settings = config) {
  const banner = doc.querySelector('#analytics-consent');
  const preferences = doc.querySelector('#analytics-preferences');
  // Production allowlist prevents localhost and deploy previews polluting reports.
  if (win.location.protocol !== 'https:' || !settings.productionHosts.includes(win.location.hostname)) return;
  if (!settings.googleMeasurementId && !settings.posthogProjectToken) return;
  const context = doc.querySelector('[data-analytics-page]')?.dataset;
  const page = {
    page_path:context?.analyticsPage || '/',
    page_title:doc.title,
    concept:context?.analyticsConcept || 'home',
  };
  let consent = null;
  let started = false;
  let posthogReady = false;
  const pending = [];
  try { consent = win.localStorage.getItem(consentKey); } catch { /* Memory-only choice when storage is unavailable. */ }
  if (!['granted','denied'].includes(consent)) consent = null;
  if (!consent && settings.suppressConsentPrompt) consent = 'granted';
  const script = (src,onload) => {
    const element = doc.createElement('script');
    element.async = true;
    element.src = src;
    element.referrerPolicy = 'no-referrer';
    if (onload) element.onload = onload;
    doc.head.append(element);
  };
  const track = (event,details = {}) => {
    if (consent !== 'granted' || !allowedEvents.has(event)) return;
    const props = {...page,...details};
    if (settings.googleMeasurementId) win.gtag?.('event',event === '$pageview' ? 'page_view' : event,props);
    if (settings.posthogProjectToken) {
      if (posthogReady) win.posthog.capture(event,props);
      else if (pending.length < 20) pending.push([event,props]);
    }
  };
  const start = () => {
    if (started || consent !== 'granted') return;
    started = true;
    if (settings.googleMeasurementId) {
      win.dataLayer = win.dataLayer || [];
      win.gtag = function() { win.dataLayer.push(arguments); };
      win.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
      win.gtag('js',new Date());
      let referrer = '';
      try { referrer = new URL(doc.referrer).origin; } catch { /* No referrer. */ }
      win.gtag('config',settings.googleMeasurementId,{
        send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,
        page_location:safePageURL(win.location.href),page_referrer:referrer,
        cookie_flags:'SameSite=Lax;Secure',cookie_expires:60 * 60 * 24 * 180,
      });
      script(`https://www.googletagmanager.com/gtag/js?id=${settings.googleMeasurementId}`);
    }
    if (settings.posthogProjectToken) {
      // The official snippet's initialization queue, loaded only after consent.
      const stub = [];
      stub._i = [];
      stub.__SV = 1;
      stub.people = [];
      stub.toString = () => 'posthog (stub)';
      win.posthog = stub;
      const options = {
        api_host:settings.posthogHost,defaults:'2026-05-30',
        autocapture:false,capture_pageview:false,capture_pageleave:false,
        capture_dead_clicks:false,capture_heatmaps:false,capture_performance:false,
        capture_exceptions:false,disable_session_recording:true,disable_surveys:true,
        enable_recording_console_log:false,advanced_disable_feature_flags:true,
        person_profiles:'never',persistence:'localStorage',
        before_send:event => consent === 'granted' ? sanitizePosthogEvent(event) : null,
        loaded:instance => {
          posthogReady = true;
          if (consent !== 'granted') { pending.length = 0; instance.opt_out_capturing(); return; }
          for (const [event,props] of pending.splice(0)) instance.capture(event,props);
        },
      };
      stub._i.push([settings.posthogProjectToken,options,'posthog']);
      script(`${settings.posthogHost.replace('.i.posthog.com','-assets.i.posthog.com')}/static/array.js`);
    }
    track('$pageview');
  };
  const clearAnalyticsStorage = () => {
    try {
      const prefix = `ph_${settings.posthogProjectToken}_`;
      for (let index = win.localStorage.length - 1; index >= 0; index--) {
        const key = win.localStorage.key(index);
        if (settings.posthogProjectToken && key?.startsWith(prefix)) win.localStorage.removeItem(key);
      }
    } catch { /* Storage is optional. */ }
    const domains = ['',win.location.hostname,'.' + win.location.hostname,'.javascriptin30words.com'];
    for (const cookie of doc.cookie.split(';')) {
      const name = cookie.trim().split('=')[0];
      if (!/^_ga(?:_|$)/.test(name)) continue;
      for (const domain of domains) doc.cookie = `${name}=;Max-Age=0;Path=/;${domain ? `Domain=${domain};` : ''}SameSite=Lax;Secure`;
    }
  };
  const choose = (value, persist = true) => {
    const wasStarted = started;
    consent = value;
    if (persist) try { win.localStorage.setItem(consentKey,value); } catch { /* Keep choice in memory. */ }
    if (banner) banner.hidden = true;
    if (value === 'granted') {
      win[`ga-disable-${settings.googleMeasurementId}`] = false;
      if (wasStarted) { win.location.reload(); return; }
      start();
    } else {
      win[`ga-disable-${settings.googleMeasurementId}`] = true;
      pending.length = 0;
      if (posthogReady) win.posthog.opt_out_capturing();
      clearAnalyticsStorage();
      if (wasStarted) win.location.reload();
    }
  };
  if (preferences) {
    preferences.hidden = false;
    preferences.addEventListener('click',() => { banner.hidden = false; doc.querySelector('#analytics-allow')?.focus(); });
  }
  doc.querySelector('#analytics-allow')?.addEventListener('click',() => choose('granted'));
  doc.querySelector('#analytics-decline')?.addEventListener('click',() => choose('denied'));
  win.addEventListener('storage',event => {
    if (event.key === consentKey && event.newValue !== consent) choose(event.newValue === 'granted' ? 'granted' : 'denied',false);
  });
  doc.addEventListener('click',event => {
    const link = event.target.closest?.('a[data-analytics-event]');
    if (!link) return;
    track(link.dataset.analyticsEvent,{placement:'footer',destination:link.dataset.analyticsEvent === 'practice_pad_click' ? 'practice-pad.app' : 'email'});
  });
  doc.querySelector('.output-toggle')?.addEventListener('change',event => { if (event.target.checked) track('output_revealed'); });
  doc.querySelector('[data-ai-panel]')?.addEventListener('toggle',event => { if (event.target.open) track('ai_panel_opened'); });
  if (consent === 'granted') start();
  else if (!consent && banner) banner.hidden = false;
}

if (typeof window !== 'undefined') startAnalytics();
