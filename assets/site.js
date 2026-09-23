// Small, local full-text search. All tokens must match; titles rank first.
export function searchPages(pages, query) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return pages.map(page => {
    const title = page.title.toLowerCase();
    const text = `${title} ${page.category} ${page.description} ${page.text}`.toLowerCase();
    return { page, score: terms.every(term => text.includes(term))
      ? 1 + terms.reduce((score, term) => score + (title.includes(term) ? 10 : 0), 0) : 0 };
  }).filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(result => result.page);
}

if (typeof document !== 'undefined') {
  const root = document.body.dataset.root;
  const themeButton = document.querySelector('.theme-toggle');
  const updateThemeButton = () => {
    const light = document.documentElement.dataset.theme === 'light';
    themeButton.setAttribute('aria-label', `Switch to ${light ? 'dark' : 'light'} theme`);
    themeButton.querySelector('use').setAttribute('href', `${root}assets/icons.svg#${light ? 'moon' : 'sun'}`);
  };
  themeButton.hidden = false;
  updateThemeButton();
  themeButton.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('matchbox-theme', next); } catch { /* Storage may be disabled. */ }
    updateThemeButton();
  });

  const docsMenu = document.querySelector('.docs-menu');
  if (docsMenu) {
    const desktop = matchMedia('(min-width: 901px)');
    const updateMenu = () => { docsMenu.open = desktop.matches; };
    updateMenu();
    desktop.addEventListener('change', updateMenu);
  }
  document.querySelectorAll('.mobile-nav a').forEach(link => {
    link.addEventListener('click', () => { link.closest('details').open = false; });
  });

  document.querySelectorAll('[data-tab-group]').forEach(group => {
    const tabList = group.querySelector('[role="tablist"]');
    const tabs = [...tabList.querySelectorAll('[role="tab"]')];
    const activate = tab => {
      for (const item of tabs) {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
        document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
      }
    };
    group.classList.add('is-enhanced');
    tabList.hidden = false;
    activate(tabs[0]);
    for (const tab of tabs) {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', event => {
        let next;
        const index = tabs.indexOf(tab);
        if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
        if (event.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
        if (event.key === 'Home') next = tabs[0];
        if (event.key === 'End') next = tabs.at(-1);
        if (next) {
          event.preventDefault();
          activate(next);
          next.focus();
        }
      });
    }
  });

  document.querySelectorAll('.article pre:not(.output), .install-panel pre').forEach(pre => {
    const code = pre.querySelector('code');
    if (!code) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    pre.before(wrapper);
    wrapper.append(pre);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-button';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy code');
    wrapper.append(button);
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent);
        button.textContent = 'Copied!';
        document.getElementById('copy-status').textContent = 'Code copied to clipboard.';
      } catch {
        const range = document.createRange();
        range.selectNodeContents(code);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        button.textContent = 'Select & copy';
        document.getElementById('copy-status').textContent = 'Clipboard unavailable. Code selected; use your system copy shortcut.';
      }
      setTimeout(() => { button.textContent = 'Copy'; }, 2200);
    });
  });

  const dialog = document.querySelector('.search-dialog');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const status = document.getElementById('search-status');
  let indexPromise;
  let opener;

  async function renderResults() {
    if (!indexPromise) {
      status.textContent = 'Loading documentation…';
      indexPromise = fetch(`${root}search-index.json`).then(response => {
        if (!response.ok) throw new Error('Search index unavailable');
        return response.json();
      });
    }
    let pages;
    try {
      pages = await indexPromise;
    } catch {
      indexPromise = undefined;
      status.textContent = 'Search could not load. Check your connection or browse the documentation below. For a local preview, serve the site over HTTP.';
      results.replaceChildren();
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `${root}docs/index.html`;
      link.textContent = 'Browse all documentation →';
      item.append(link);
      results.append(item);
      return;
    }
    const query = input.value.trim();
    const matches = searchPages(pages, query);
    status.textContent = query ? (matches.length ? `${matches.length} matching ${matches.length === 1 ? 'page' : 'pages'}` : 'No results. Try another term, such as “native”, “WASI”, or “HTTP”.') : 'Start exploring';
    results.replaceChildren();
    for (const page of (query ? matches : matches.slice(0, 5))) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `${root}${page.url}`;
      const category = document.createElement('small');
      category.textContent = page.category;
      const title = document.createElement('strong');
      title.textContent = page.title;
      const excerpt = document.createElement('p');
      excerpt.textContent = page.description;
      link.append(category, title, excerpt);
      item.append(link);
      results.append(item);
    }
  }

  function openSearch(source) {
    if (dialog.open) { input.focus(); return; }
    opener = source;
    dialog.showModal();
    input.focus();
    renderResults();
  }
  document.querySelectorAll('[data-search]').forEach(trigger => {
    trigger.addEventListener('click', event => {
      event.preventDefault();
      openSearch(trigger);
    });
    const shortcut = trigger.querySelector('kbd');
    if (shortcut) shortcut.textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K';
  });
  document.querySelector('[data-close-search]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => { opener?.focus(); });
  input.addEventListener('input', renderResults);
  dialog.addEventListener('keydown', event => {
    // Search inputs can consume Escape to clear text before a dialog sees it.
    if (event.key === 'Escape') {
      event.preventDefault();
      dialog.close();
      return;
    }
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    const links = [...results.querySelectorAll('a')];
    if (!links.length) return;
    const index = links.indexOf(document.activeElement);
    const next = event.key === 'ArrowDown' ? (index + 1) % links.length : (index <= 0 ? links.length - 1 : index - 1);
    event.preventDefault();
    links[next].focus();
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openSearch(document.activeElement);
    }
    if (event.key === 'Escape') document.querySelectorAll('.mobile-nav[open]').forEach(menu => { menu.open = false; });
  });
}
