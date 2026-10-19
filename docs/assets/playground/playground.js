import { demos } from './playground-demos.js';
import { highlight } from './highlight.js';

const editor = document.getElementById('source-code');
const lineNumbers = document.getElementById('line-numbers');
const codeLayer = document.getElementById('code-hl');
const codeMarkup = codeLayer.firstElementChild;
const currentLine = document.getElementById('cur-line');
const versionLabel = document.getElementById('runtime-version');
const output = document.getElementById('console-output');
const input = document.getElementById('repl-input');
const run = document.getElementById('run-code');
const stop = document.getElementById('stop-code');
const submit = document.getElementById('repl-submit');
const reset = document.getElementById('reset-session');
const badge = document.getElementById('runtime-status');
const status = document.getElementById('execution-status');
let worker;
let timer;
let state = 'loading';
let selected = 0;
let history = [];
let historyIndex = 0;
let draft = '';

function setState(next) {
  state = next;
  badge.dataset.state = next;
  badge.textContent = { loading: 'Loading WebAssembly…', ready: 'MatchBox is ready', running: 'Running locally…', error: 'Runtime unavailable' }[next];
  run.disabled = submit.disabled = next !== 'ready';
  stop.disabled = next !== 'running';
  input.readOnly = next !== 'ready';
}

function append(kind, text) {
  const line = document.createElement('pre');
  line.className = `console-${kind}`;
  line.textContent = text;
  output.append(line);
  // Bound the transcript; longer-term history belongs in a downloaded script.
  while (output.children.length > 100) output.firstElementChild.remove();
  output.scrollTop = output.scrollHeight;
}

function clearOutput(message = 'Console cleared. Session variables are unchanged.') {
  output.replaceChildren();
  append('info', message);
}

function failed(message) {
  const wasRunning = state === 'running';
  clearTimeout(timer);
  worker?.terminate();
  append('error', message);
  if (wasRunning) startSession(false);
  else {
    setState('error');
    status.textContent = 'Could not load the runtime. Check your connection, then use Reset session to retry. Serve local copies over HTTP.';
  }
}

function startSession(clear = true) {
  clearTimeout(timer);
  worker?.terminate();
  setState('loading');
  status.textContent = 'Loading the compiler and starting a fresh VM…';
  if (clear) clearOutput('New session. Run a script or enter an expression below.');
  history = [];
  historyIndex = 0;
  draft = '';
  input.value = '';
  try {
    const active = new Worker(new URL('./playground-worker.js', import.meta.url), { type: 'module' });
    worker = active;
    timer = setTimeout(() => failed('The runtime took too long to load. Reset session to retry.'), 30_000);
    active.onerror = event => {
      event.preventDefault();
      if (worker === active) failed('The browser runtime could not continue. If this persists, check that WebAssembly and module workers are supported.');
    };
    active.onmessage = ({ data }) => {
      if (worker !== active) return;
      clearTimeout(timer);
      if (data.type === 'ready') {
        if (data.version) versionLabel.textContent = `MatchBox ${data.version}`;
        setState('ready');
        status.textContent = 'Ready when you are. Everything runs on your device.';
      } else if (data.type === 'result') {
        if (data.output) append('stdout', data.output.replace(/\n$/, ''));
        if (data.value != null) append('value', `=> ${data.value}`);
        if (data.error) append('error', data.error);
        if (!data.output && data.value == null && !data.error) append('info', 'Done (no return value).');
        setState('ready');
        status.textContent = `${data.error ? 'Error' : 'Completed'} in ${Math.round(data.elapsed)} ms · session state preserved`;
      } else if (data.type === 'fatal') failed(data.message);
    };
  } catch {
    failed('Could not start a Web Worker. Use a current browser and serve this page over HTTP or HTTPS.');
  }
}

function evaluate(source, label) {
  if (state !== 'ready') return false;
  if (!source.trim()) {
    status.textContent = 'Add some BoxLang code first.';
    return false;
  }
  if (new TextEncoder().encode(source).length > 65_536) {
    append('error', 'Source exceeds the 64 KiB playground limit. Try a smaller script.');
    return false;
  }
  append('command', label);
  setState('running');
  status.textContent = 'Compiling and running… Stop is available if you need it.';
  timer = setTimeout(() => failed('Stopped after the 5-second execution limit. Session reset; your script is unchanged.'), 5000);
  worker.postMessage({ type: 'evaluate', source });
  return true;
}

const LINE_HEIGHT = 22;
const EDITOR_PADDING = 14;

// Repaint the highlighted layer and the line numbers from the textarea, then place the caret line.
function updateEditor() {
  const text = editor.value;
  // A trailing newline needs a visible character, or the layer ends one line short of the textarea.
  codeMarkup.innerHTML = highlight(text) + (text.endsWith('\n') ? ' ' : '');
  const count = text.split('\n').length;
  lineNumbers.dataset.count = count;
  updateCaretLine(true);
  syncScroll();
}

let caretLine = 0;
function updateCaretLine(force = false) {
  const line = editor.value.slice(0, editor.selectionStart).split('\n').length;
  if (force || line !== caretLine || !lineNumbers.firstChild) {
    caretLine = line;
    const count = Number(lineNumbers.dataset.count) || 1;
    let html = '';
    for (let n = 1; n <= count; n++) html += (n === line ? `<b>${n}</b>` : n) + (n < count ? '\n' : '');
    lineNumbers.innerHTML = html;
  }
  placeCaretLine();
}

function placeCaretLine() {
  currentLine.style.transform = `translateY(${(caretLine - 1) * LINE_HEIGHT - editor.scrollTop}px)`;
  currentLine.style.display = document.activeElement === editor ? '' : 'none';
}

function syncScroll() {
  codeLayer.scrollTop = editor.scrollTop;
  codeLayer.scrollLeft = editor.scrollLeft;
  lineNumbers.scrollTop = editor.scrollTop;
  placeCaretLine();
}

function selectDemo(index, initial = false) {
  if (!initial && editor.value !== demos[selected].code && !window.confirm('Replace your edited script with this demo? Copy any changes you want to keep first.')) return;
  selected = index;
  const demo = demos[index];
  editor.value = demo.code;
  editor.scrollTop = editor.scrollLeft = 0;
  document.getElementById('source-filename').textContent = demo.file;
  document.getElementById('demo-description').textContent = demo.description;
  document.getElementById('demo-hint').textContent = demo.hint;
  document.querySelectorAll('.demo-card').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  updateEditor();
  startSession();
}

for (const [index, demo] of demos.entries()) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'demo-card';
  button.dataset.demo = demo.id;
  const tag = document.createElement('small');
  tag.textContent = demo.tag;
  const title = document.createElement('span');
  title.textContent = demo.title;
  button.append(tag, title);
  button.addEventListener('click', () => selectDemo(index));
  document.getElementById('demo-list').append(button);
}

run.addEventListener('click', () => evaluate(editor.value, `▶ ${demos[selected].file}`));
stop.addEventListener('click', () => failed('Stopped by you. Session reset; your script is unchanged.'));
reset.disabled = false;
reset.addEventListener('click', () => startSession());
document.getElementById('clear-console').addEventListener('click', () => clearOutput());
editor.addEventListener('input', updateEditor);
editor.addEventListener('scroll', syncScroll);
for (const event of ['keyup', 'click', 'select', 'focus', 'blur']) editor.addEventListener(event, () => updateCaretLine());
document.addEventListener('selectionchange', () => { if (document.activeElement === editor) updateCaretLine(); });
editor.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    run.click();
  }
});
document.getElementById('run-shortcut').textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ ↵' : 'Ctrl ↵';
document.getElementById('repl-form').addEventListener('submit', event => {
  event.preventDefault();
  const source = input.value.trim();
  if (!evaluate(source, `bx> ${source}`)) return;
  history.push(source);
  if (history.length > 50) history.shift();
  historyIndex = history.length;
  input.value = draft = '';
  input.focus();
});
input.addEventListener('keydown', event => {
  if (!['ArrowUp', 'ArrowDown'].includes(event.key) || !history.length) return;
  event.preventDefault();
  if (historyIndex === history.length) draft = input.value;
  historyIndex = Math.max(0, Math.min(history.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1)));
  input.value = historyIndex === history.length ? draft : history[historyIndex];
  input.setSelectionRange(input.value.length, input.value.length);
});
input.addEventListener('input', () => { historyIndex = history.length; });
window.addEventListener('pagehide', () => { clearTimeout(timer); worker?.terminate(); });
window.addEventListener('pageshow', event => { if (event.persisted) startSession(); });
selectDemo(0, true);
