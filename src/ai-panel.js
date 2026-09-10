import {PROVIDERS, MAX_QUESTION_LENGTH, readConnection, saveConnection, checkConnection, listModels, askAI} from './ai-client.js';

const panel = document.querySelector('[data-ai-panel]');
if (panel) initialise(panel);

function appendInline(parent, text) {
  for (const part of text.split(/(`[^`\n]+`|\*\*[^*\n]+\*\*)/g)) {
    if (part.startsWith('`') && part.endsWith('`')) {
      const code = document.createElement('code'); code.textContent = part.slice(1,-1); parent.append(code);
    } else if (part.startsWith('**') && part.endsWith('**')) {
      const strong = document.createElement('strong'); strong.textContent = part.slice(2,-2); parent.append(strong);
    } else parent.append(document.createTextNode(part));
  }
}

function renderAnswer(parent, text) {
  // Create elements explicitly; provider text is never parsed as HTML or executed.
  for (const chunk of text.split(/(```[\s\S]*?```)/g)) {
    if (!chunk.trim()) continue;
    if (chunk.startsWith('```') && chunk.endsWith('```')) {
      const pre = document.createElement('pre'), code = document.createElement('code');
      pre.tabIndex = 0;
      code.textContent = chunk.slice(3,-3).replace(/^[^\n]*\n/,'').trimEnd();
      pre.append(code); parent.append(pre); continue;
    }
    for (const paragraph of chunk.trim().split(/\n\s*\n/)) {
      const lines = paragraph.split('\n');
      if (lines.every(line => /^\s*(?:[-*]|\d+\.)\s+/.test(line))) {
        const list = document.createElement(/^\s*\d+\./.test(lines[0]) ? 'ol' : 'ul');
        for (const line of lines) { const li = document.createElement('li'); appendInline(li, line.replace(/^\s*(?:[-*]|\d+\.)\s+/,'')); list.append(li); }
        parent.append(list);
      } else {
        const element = document.createElement(/^#{1,6}\s+/.test(paragraph) ? 'h3' : 'p');
        appendInline(element, paragraph.replace(/^#{1,6}\s+/,'')); parent.append(element);
      }
    }
  }
}

function initialise(panel) {
  const context = JSON.parse(panel.dataset.aiContext);
  const get = id => document.getElementById(id);
  const dialog = get('ai-connect-dialog'), settingsForm = get('ai-settings-form');
  const providerField = get('ai-provider'), modelField = get('ai-model'), keyField = get('ai-key');
  const customModelField = get('ai-custom-model');
  const rememberField = get('ai-remember'), connectButton = get('ai-connect');
  const questionForm = get('ai-question-form'), questionField = get('ai-question');
  const sendButton = get('ai-send'), stopButton = get('ai-stop');
  const messages = get('ai-messages'), status = get('ai-status'), errorBox = get('ai-error');
  let storage;
  try { storage = window.sessionStorage; } catch { /* Memory-only mode remains available. */ }
  let connection = readConnection(storage), history = [], requestController = null, connectionController = null, modelController = null;
  let remember = Boolean(connection), verifying = false;
  function updateConnection() {
    connectButton.textContent = connection ? 'Connection settings' : 'Connect your API key';
    get('ai-connection-status').textContent = connection ? `${PROVIDERS[connection.provider].name} · ${connection.model}` : '';
    get('ai-connection-status').hidden = !connection;
    get('ai-disconnect').hidden = !connection;
    get('ai-clear').hidden = history.length === 0;
    setBusy(Boolean(requestController));
  }

  function updateModelSelection() {
    const custom = modelField.value === 'custom';
    get('ai-custom-model-row').hidden = !custom;
    customModelField.disabled = !custom;
    customModelField.required = custom;
  }

  function selectedModel() {
    return modelField.value === 'custom' ? customModelField.value.trim() : modelField.value;
  }

  function renderModelOptions(models = [], selected = '') {
    const placeholder = document.createElement('option');
    placeholder.value = ''; placeholder.textContent = 'Load models with your API key'; placeholder.disabled = true;
    modelField.replaceChildren(placeholder, ...[...models, {id:'custom',name:'Other model…'}].map(model => {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = model.name === model.id || model.id === 'custom' ? model.name : `${model.name} (${model.id})`;
      return option;
    }));
    modelField.value = selected ? (models.some(model => model.id === selected) ? selected : 'custom') : '';
    customModelField.value = modelField.value === 'custom' ? selected : '';
    updateModelSelection();
  }

  function cancelModelLoad() {
    modelController?.abort(); modelController = null;
    settingsForm.querySelector('fieldset').disabled = verifying;
    get('ai-load-models').textContent = 'Load models';
  }

  function updateProvider(selectedModel) {
    cancelModelLoad();
    const provider = PROVIDERS[providerField.value];
    get('ai-key-link').href = provider.keyURL;
    get('ai-key-link').textContent = `Get a ${provider.name} API key ↗`;
    renderModelOptions(selectedModel ? [{id:selectedModel,name:selectedModel}] : [], selectedModel);
    get('ai-model-status').textContent = '';
    get('ai-key-help').textContent = `Your key is sent directly to ${provider.name}. It stays in memory unless you choose to remember it in this tab.`;
  }

  function openConnection() {
    providerField.value = connection?.provider || 'openai';
    updateProvider(connection?.model);
    keyField.value = '';
    keyField.required = !connection;
    keyField.placeholder = connection ? 'Leave blank to keep your current key' : 'Paste your API key';
    rememberField.checked = remember;
    get('ai-settings-error').textContent = '';
    get('ai-settings-submit').textContent = connection ? 'Save connection' : 'Connect';
    dialog.showModal();
    (connection ? modelField : keyField).focus();
  }

  connectButton.addEventListener('click', openConnection);
  get('ai-dialog-close').addEventListener('click', () => dialog.close());
  get('ai-dialog-cancel').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    connectionController?.abort();
    cancelModelLoad();
    keyField.value = '';
    keyField.type = 'password';
    get('ai-key-show').textContent = 'Show';
    get('ai-key-show').setAttribute('aria-pressed','false');
  });
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  providerField.addEventListener('change', () => {
    updateProvider(); keyField.value = ''; keyField.required = true; keyField.placeholder = 'Paste your API key';
    get('ai-settings-error').textContent = '';
  });
  keyField.addEventListener('input', () => {
    cancelModelLoad(); renderModelOptions(); get('ai-model-status').textContent = '';
  });
  modelField.addEventListener('change', () => {
    updateModelSelection();
    if (modelField.value === 'custom') customModelField.focus();
  });
  get('ai-key-show').addEventListener('click', event => {
    const show = keyField.type === 'password'; keyField.type = show ? 'text' : 'password';
    event.currentTarget.textContent = show ? 'Hide' : 'Show'; event.currentTarget.setAttribute('aria-pressed',String(show));
  });

  get('ai-load-models').addEventListener('click', async () => {
    if (verifying || modelController) return;
    const provider = providerField.value, chosen = selectedModel();
    const key = keyField.value || (connection?.provider === provider ? connection.key : '');
    const controller = new AbortController(); modelController = controller;
    const errorBox = get('ai-settings-error'), modelStatus = get('ai-model-status');
    errorBox.textContent = ''; modelStatus.textContent = 'Loading models from your provider…';
    settingsForm.querySelector('fieldset').disabled = true;
    get('ai-load-models').textContent = 'Loading…';
    const timeout = setTimeout(() => controller.abort('timeout'), 20000);
    try {
      const models = await listModels({provider,key}, {signal:controller.signal});
      if (modelController !== controller || controller.signal.aborted || !dialog.open) return;
      const preferred = models.some(model => model.id === PROVIDERS[provider].model) ? PROVIDERS[provider].model : models[0]?.id;
      renderModelOptions(models, chosen || preferred || '');
      modelStatus.textContent = models.length ? `${models.length} models loaded. Choose a text model for your explanations.` : 'No models were returned for this key. You can still enter a model ID manually.';
    } catch (error) {
      if (modelController !== controller || !dialog.open) return;
      modelStatus.textContent = '';
      errorBox.textContent = controller.signal.aborted ? 'Loading models timed out. Try again or enter a model ID manually.'
        : error.status === 403 ? 'Your key cannot list models. Check its permissions or choose “Other model…” to enter a model ID.' : error.message;
    } finally {
      clearTimeout(timeout);
      if (modelController === controller) cancelModelLoad();
    }
  });

  settingsForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (verifying || modelController) return;
    verifying = true;
    const button = get('ai-settings-submit'), settingsError = get('ai-settings-error');
    settingsError.textContent = ''; button.textContent = 'Checking connection…';
    const settings = {provider:providerField.value, model:selectedModel(), key:keyField.value || (connection?.provider === providerField.value ? connection.key : '')};
    const shouldRemember = rememberField.checked;
    settingsForm.querySelector('fieldset').disabled = true;
    connectionController = new AbortController();
    const controller = connectionController;
    const timeout = setTimeout(() => controller.abort('timeout'), 20000);
    try {
      const checked = await checkConnection(settings, {signal:controller.signal});
      if (controller.signal.aborted || !dialog.open) return;
      if (connection && (connection.provider !== checked.provider || connection.model !== checked.model || connection.key !== checked.key)) clearConversation();
      connection = checked;
      const saved = saveConnection(storage, connection, shouldRemember);
      remember = shouldRemember && saved;
      updateConnection();
      status.textContent = saved ? 'Connected. Your concept and example will be included when you ask a question.' : 'Connected for this page. Browser storage is unavailable, so the key is only kept in memory.';
      dialog.close(); questionField.focus();
    } catch (error) {
      if (!dialog.open) return;
      settingsError.textContent = controller.signal.aborted ? 'The connection check timed out. Please try again.' : error.message;
    } finally {
      clearTimeout(timeout); connectionController = null; verifying = false;
      settingsForm.querySelector('fieldset').disabled = false;
      button.textContent = connection ? 'Save connection' : 'Connect';
    }
  });

  function clearConversation() {
    history = []; messages.replaceChildren(); messages.hidden = true;
    get('ai-clear').hidden = true; errorBox.textContent = ''; status.textContent = '';
  }
  get('ai-clear').addEventListener('click', clearConversation);
  get('ai-disconnect').addEventListener('click', () => {
    requestController?.abort(); connectionController?.abort(); cancelModelLoad();
    connection = null; remember = false; saveConnection(storage, null, false);
    clearConversation(); updateConnection(); dialog.close(); status.textContent = 'Disconnected. Your saved key has been removed.';
  });

  function appendMessage(role, text) {
    const message = document.createElement('article');
    message.className = `ai-message ai-message-${role}`;
    const label = document.createElement('p'); label.className = 'ai-message-label'; label.textContent = role === 'user' ? 'You' : PROVIDERS[connection.provider].name;
    message.append(label);
    if (role === 'assistant') renderAnswer(message, text);
    else { const content = document.createElement('p'); content.textContent = text; message.append(content); }
    messages.hidden = false; messages.append(message); return message;
  }

  function setBusy(busy) {
    questionForm.querySelector('fieldset').disabled = !connection;
    sendButton.disabled = busy || !connection; questionField.disabled = busy || !connection;
    connectButton.disabled = busy; get('ai-clear').disabled = busy || !connection;
    panel.querySelectorAll('[data-ai-prompt]').forEach(button => { button.disabled = busy || !connection; });
    stopButton.hidden = !busy; messages.setAttribute('aria-busy',String(busy));
  }

  questionForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (requestController || !connection) return;
    const question = questionField.value.trim();
    if (!question || question.length > MAX_QUESTION_LENGTH) { questionField.reportValidity(); return; }
    errorBox.textContent = ''; status.textContent = `Asking ${PROVIDERS[connection.provider].name}…`;
    const userMessage = appendMessage('user',question);
    setBusy(true);
    const controller = new AbortController(); requestController = controller;
    const timeout = setTimeout(() => controller.abort('timeout'), 60000);
    try {
      const result = await askAI(connection, context, history, question, {signal:controller.signal});
      if (controller.signal.aborted) throw new DOMException('Request stopped', 'AbortError');
      appendMessage('assistant',result.text);
      history.push({role:'user',content:question}, {role:'assistant',content:result.text});
      history = history.slice(-10);
      questionField.value = ''; get('ai-clear').hidden = false;
      status.textContent = result.truncated ? 'The answer reached its length limit. Ask your AI to continue if you need more detail.' : 'Ask a follow-up whenever you need it.';
    } catch (error) {
      userMessage.remove(); messages.hidden = messages.children.length === 0;
      status.textContent = '';
      errorBox.textContent = controller.signal.aborted
        ? (controller.signal.reason === 'timeout' ? 'Your AI took too long to respond. Your question is still here; try again.' : 'Request stopped. Your question is still here.')
        : error.message;
    } finally {
      clearTimeout(timeout); requestController = null; setBusy(false); questionField.focus({preventScroll:true});
    }
  });
  stopButton.addEventListener('click', () => requestController?.abort('stopped'));
  panel.querySelectorAll('[data-ai-prompt]').forEach(button => button.addEventListener('click', () => {
    questionField.value = button.dataset.aiPrompt;
    questionForm.requestSubmit();
  }));
  questionField.addEventListener('keydown', event => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) { event.preventDefault(); questionForm.requestSubmit(); }
  });
  window.addEventListener('pagehide', () => {
    requestController?.abort(); connectionController?.abort(); cancelModelLoad(); keyField.value = ''; connection = null;
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) { connection = readConnection(storage); remember = Boolean(connection); updateConnection(); }
  });
  updateConnection();
}
