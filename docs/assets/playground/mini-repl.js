// Small live REPL for the home page. Starts the WebAssembly runtime only when the section scrolls into view.
const root = document.getElementById('mini');
if (root) {
  const out = document.getElementById('mini-out');
  const form = document.getElementById('mini-form');
  const input = document.getElementById('mini-input');
  const status = document.getElementById('mini-status');
  const chips = [...root.querySelectorAll('[data-code]')];
  let worker;
  let timer;
  let ready = false;
  let busy = false;

  const append = (kind, text) => {
    const line = document.createElement('div');
    line.className = `mini-${kind}`;
    line.textContent = text;
    out.append(line);
    while (out.children.length > 40) out.firstElementChild.remove();
    out.scrollTop = out.scrollHeight;
  };
  const setReady = value => {
    ready = value;
    input.readOnly = !value;
    chips.forEach(chip => { chip.disabled = !value; });
  };
  const start = () => {
    status.textContent = 'Loading the WebAssembly runtime (about 2 MB)...';
    try {
      worker = new Worker(new URL('./playground-worker.js', import.meta.url), { type: 'module' });
    } catch {
      status.textContent = 'This browser cannot start module workers. Open the full playground in a current browser.';
      return;
    }
    timer = setTimeout(() => { status.textContent = 'The runtime took too long to load. Reload to retry.'; }, 30000);
    worker.onerror = () => { clearTimeout(timer); setReady(false); status.textContent = 'The runtime could not start in this browser.'; };
    worker.onmessage = ({ data }) => {
      clearTimeout(timer);
      if (data.type === 'ready') {
        setReady(true);
        status.textContent = 'Ready. Runs on your device; nothing is sent to a server.';
      } else if (data.type === 'result') {
        busy = false;
        if (data.output) append('so', data.output.replace(/\n$/, ''));
        if (data.value != null) append('val', `=> ${data.value}`);
        if (data.error) append('err', data.error.split('\n')[0]);
        if (!data.output && data.value == null && !data.error) append('info', 'Done.');
        setReady(true);
      } else if (data.type === 'fatal') {
        busy = false;
        setReady(false);
        status.textContent = 'The runtime stopped. Reload to start a new session.';
        append('err', data.message);
      }
    };
  };
  const run = source => {
    source = source.trim();
    if (!ready || busy || !source) return;
    busy = true;
    setReady(false);
    append('cmd', `bx> ${source}`);
    clearTimeout(timer);
    timer = setTimeout(() => {
      worker.terminate();
      busy = false;
      status.textContent = 'Stopped after 5 seconds. Reload to start a new session.';
      append('err', 'Stopped after the 5 second limit.');
    }, 5000);
    worker.postMessage({ type: 'evaluate', source });
  };
  chips.forEach(chip => chip.addEventListener('click', () => { input.value = chip.dataset.code; run(chip.dataset.code); input.value = ''; }));
  document.getElementById('mini-clear')?.addEventListener('click', () => { out.replaceChildren(); input.value = ''; });
  form.addEventListener('submit', event => { event.preventDefault(); run(input.value); input.value = ''; });
  setReady(false);
  const begin = () => { if (!worker) start(); };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries, observer) => {
      if (entries.some(entry => entry.isIntersecting)) { begin(); observer.disconnect(); }
    }, { rootMargin: '200px' }).observe(root);
  } else begin();
  input.addEventListener('focus', begin);
}
