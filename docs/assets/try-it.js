// Adds a "Run" button to every code block whose title ends in .bxs. Clicking it opens the playground embed under the
// block with that code loaded, so a reader can run it and edit it without leaving the lesson. Nothing loads until the
// click: the WebAssembly runtime (about 2 MB) is only fetched when a reader asks for it.
(() => {
  const script = document.currentScript;
  if (!script || !('CompressionStream' in window)) return;
  const embedBase = new URL('../playground/embed/', script.src).href;
  const shareModule = import(new URL('./playground/share.js', script.src).href);

  const blocks = document.querySelectorAll('pre[data-bxsites-title$=".bxs"]');
  for (const pre of blocks) {
    const code = pre.querySelector('code')?.textContent ?? '';
    if (!code.trim()) continue;

    const wrap = document.createElement('div');
    wrap.className = 'tryit';
    const bar = document.createElement('div');
    bar.className = 'tryit-bar';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tryit-run';
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg><span>Run this in your browser</span>';
    const note = document.createElement('span');
    note.className = 'tryit-note';
    note.textContent = 'Edit it, break it, run it again. Nothing leaves your device.';
    bar.append(button, note);
    pre.after(wrap);
    wrap.append(bar);

    let frame;
    button.addEventListener('click', async () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      if (open) {
        frame?.remove();
        frame = undefined;
        button.setAttribute('aria-expanded', 'false');
        button.querySelector('span').textContent = 'Run this in your browser';
        return;
      }
      const { buildShareUrl } = await shareModule;
      const url = await buildShareUrl(embedBase, code, { name: pre.dataset.bxsitesTitle });
      if (!url) { note.textContent = 'This snippet is too large to open in the playground.'; return; }
      frame = document.createElement('iframe');
      frame.className = 'tryit-frame';
      frame.title = `MatchBox playground: ${pre.dataset.bxsitesTitle}`;
      frame.allow = 'fullscreen';
      frame.src = url;
      wrap.append(frame);
      button.setAttribute('aria-expanded', 'true');
      button.querySelector('span').textContent = 'Close the playground';
    });
  }
})();
