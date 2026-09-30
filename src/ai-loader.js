// Definitions and examples need no AI code. Fetch the panel and provider client
// only when a reader opens the optional panel, including a restored open panel.
export function prepareAIPanel(panel, load = () => import('./ai-panel.js')) {
  if (!panel) return;
  let started = false;
  const open = async () => {
    if (!panel.open || started) return;
    started = true;
    panel.setAttribute('aria-busy', 'true');
    try {
      await load();
    } catch {
      panel.querySelector('#ai-error').textContent = 'AI is unavailable. Refresh this page to try again.';
    } finally {
      panel.removeAttribute('aria-busy');
    }
  };
  panel.addEventListener('toggle', open);
  open();
}

if (typeof document !== 'undefined') prepareAIPanel(document.querySelector('[data-ai-panel]'));
