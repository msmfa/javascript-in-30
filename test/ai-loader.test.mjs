import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {prepareAIPanel} from '../src/ai-loader.js';

function harness() {
  const {document, Event} = parseHTML('<details><p id="ai-error" role="alert"></p></details>');
  const panel = document.querySelector('details');
  panel.open = false;
  return {panel, toggle(open) { panel.open = open; panel.dispatchEvent(new Event('toggle')); }};
}

test('reading a definition fetches no AI code; repeated opens share one load', async () => {
  const {panel, toggle} = harness();
  let calls = 0, finish;
  const loading = new Promise(resolve => { finish = resolve; });
  prepareAIPanel(panel, () => { calls++; return loading; });
  assert.equal(calls, 0);
  toggle(false);
  assert.equal(calls, 0);
  toggle(true);
  assert.equal(calls, 1);
  assert.equal(panel.getAttribute('aria-busy'), 'true');
  toggle(false);
  toggle(true);
  assert.equal(calls, 1);
  finish();
  await loading;
  assert.equal(panel.hasAttribute('aria-busy'), false);
  toggle(false);
  toggle(true);
  assert.equal(calls, 1);
});

test('a panel restored open loads immediately', async () => {
  const {panel} = harness();
  panel.open = true;
  let loaded = false;
  prepareAIPanel(panel, async () => { loaded = true; });
  await Promise.resolve();
  assert.equal(loaded, true);
  assert.equal(panel.hasAttribute('aria-busy'), false);
});

test('a failed download gives readers a recovery message and clears busy state', async () => {
  const {panel, toggle} = harness();
  prepareAIPanel(panel, async () => { throw new Error('Network unavailable'); });
  toggle(true);
  await Promise.resolve();
  assert.match(panel.querySelector('#ai-error').textContent, /Refresh this page/);
  assert.equal(panel.hasAttribute('aria-busy'), false);
});
