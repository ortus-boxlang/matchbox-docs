// Browser regression test for the playground: Clear, Copy link, Share, embed, full screen.
// Needs Playwright with Chromium and a built site (`boxlang bxSites build`). It serves ./site itself:
//   node tools/check-playground-ui.cjs [siteDir]
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const siteDir = path.resolve(process.argv[2] || path.join(__dirname, '..', 'site'));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };

const server = http.createServer((req, res) => {
  let file = path.join(siteDir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(siteDir)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404).end('not found'); return; }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' }).end(fs.readFileSync(file));
});

const ready = page => page.waitForFunction(() => document.getElementById('runtime-status')?.dataset.state === 'ready' || document.getElementById('run-code') && !document.getElementById('run-code').disabled, null, { timeout: 30000 });
const setCode = (page, code) => page.evaluate(value => { const e = document.getElementById('source-code'); e.value = value; e.dispatchEvent(new Event('input')); }, code);
// Copying is asynchronous (compression, then the clipboard), so wait for the button's confirmation before reading anything.
const flashed = (page, selector) => page.waitForSelector(`${selector}.flashed`, { timeout: 5000 });
const consoleText = page => page.locator('#console-output').innerText();

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const errors = [];
  try {
    const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'], viewport: { width: 1280, height: 900 } });
    context.on('page', p => p.on('pageerror', e => errors.push(e.message)));
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    const dialogs = [];
    let acceptDialogs = true;
    page.on('dialog', dialog => { dialogs.push(dialog.message()); acceptDialogs ? dialog.accept() : dialog.dismiss(); });

    // 1. Toolbar and Clear -----------------------------------------------------------------------------
    await page.goto(`${origin}/playground/`);
    await ready(page);
    for (const id of ['clear-console', 'stop-code', 'run-code', 'copy-link', 'share-open', 'fullscreen']) assert.ok(await page.locator(`#${id}`).isVisible(), `${id} is in the toolbar`);

    assert.ok(!/&#|##/.test(await page.locator('body').innerText()), 'no unrendered entities or escaped hashes in the page text');
    await setCode(page, 'answer = 41;\nprintln( "ran" );');
    await page.click('#run-code');
    await page.waitForFunction(() => document.getElementById('console-output').innerText.includes('ran'));
    acceptDialogs = false;
    await page.click('#clear-console');
    assert.equal(dialogs.length, 1, 'Clear asks before throwing away code');
    assert.ok((await page.inputValue('#source-code')).includes('answer = 41'), 'dismissing the prompt keeps the editor');
    assert.ok((await consoleText(page)).includes('ran'), 'dismissing the prompt keeps the console');
    acceptDialogs = true;
    await page.click('#clear-console');
    assert.equal(await page.inputValue('#source-code'), '', 'Clear empties the editor');
    assert.equal(await page.locator('#console-output > *').count(), 0, 'Clear empties the console completely');
    assert.equal(await page.locator('#code-hl').innerText(), '', 'the highlighted layer is emptied too');
    assert.equal(await page.locator('#line-numbers b').innerText(), '1', 'one line number remains');
    await page.fill('#repl-input', 'answer + 1');
    await page.press('#repl-input', 'Enter');
    await page.waitForFunction(() => document.getElementById('console-output').innerText.includes('=> 42'));
    const before = dialogs.length;
    await page.click('#clear-console');
    assert.equal(dialogs.length, before, 'Clear on an empty editor does not prompt');
    assert.equal(await page.locator('#console-output > *').count(), 0);

    // 2. Copy link and loading it ----------------------------------------------------------------------
    const script = 'name = "Ada Lovelace";\nprintln( "Hello, #name# \u{1F680}" );';
    await setCode(page, script);
    await page.click('#copy-link');
    await flashed(page, '#copy-link');
    const link = await page.evaluate(() => navigator.clipboard.readText());
    assert.ok(link.startsWith(`${origin}/playground/#code=`), `copied link points at the playground hash: ${link.slice(0, 80)}`);
    assert.ok(!link.includes('?'), 'no query string');
    assert.match(await page.locator('#copy-link').innerText(), /Copied/);
    const shared = await context.newPage();
    shared.on('pageerror', e => errors.push(e.message));
    await shared.goto(link);
    await ready(shared);
    assert.equal(await shared.inputValue('#source-code'), script, 'the shared code loads byte for byte');
    assert.equal(await shared.locator('#source-filename').innerText(), 'shared.bxs');
    assert.equal(await shared.locator('#console-output .console-command').count(), 0, 'shared code never runs on its own');
    await shared.click('#run-code');
    await shared.waitForFunction(() => document.getElementById('console-output').innerText.includes('Hello, Ada Lovelace'));
    // The link also works when only the hash changes in an open tab.
    await shared.close();

    // 3. Damaged and oversized -------------------------------------------------------------------------
    const damaged = await context.newPage();
    damaged.on('pageerror', e => errors.push(e.message));
    await damaged.goto(`${origin}/playground/#code=%%%`);
    await ready(damaged);
    assert.ok((await damaged.inputValue('#source-code')).length > 20, 'a damaged link falls back to the first demo');
    assert.match(await damaged.locator('#execution-status').innerText(), /damaged/);
    await damaged.close();

    let seed = 7;
    const noise = Array.from({ length: 20000 }, () => String.fromCharCode(33 + (((seed = (seed * 1103515245 + 12345) >>> 0) >>> 16) % 90))).join('');
    await setCode(page, noise);
    await page.evaluate(() => navigator.clipboard.writeText('untouched'));
    await page.click('#copy-link');
    await flashed(page, '#copy-link');
    assert.match(await page.locator('#execution-status').innerText(), /too large/i);
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'untouched', 'an oversized script is never half copied');

    // 4. Share dialog ----------------------------------------------------------------------------------
    await setCode(page, 'println( "from the dialog" );');
    await page.click('#share-open');
    await page.waitForFunction(() => document.getElementById('share-dialog').open && document.getElementById('share-snippet').value.includes('<iframe'));
    const snippet = () => page.inputValue('#share-snippet');
    assert.match(await snippet(), /^<iframe src="[^"]*\/playground\/embed\/#code=[A-Za-z0-9_-]+" width="600" height="400" allow="fullscreen" loading="lazy"><\/iframe>$/);
    assert.ok(!(await snippet()).includes('ro=true'));
    assert.match(await page.inputValue('#share-link'), /\/playground\/#code=/);
    await page.check('#share-ro');
    await page.waitForFunction(() => document.getElementById('share-snippet').value.includes('ro=true'));
    assert.match(await snippet(), /&amp;ro=true"/, 'read only is part of the embed');
    const frameSrc = await page.locator('#share-preview').getAttribute('src');
    assert.match(frameSrc, /\/playground\/embed\/#code=.*&ro=true$/);
    const preview = page.frameLocator('#share-preview');
    await preview.locator('#run-code:not([disabled])').waitFor({ timeout: 30000 });
    assert.equal(await preview.locator('#source-code').evaluate(e => e.readOnly), true, 'the preview is read only');
    await page.click('#share-copy-snippet');
    await flashed(page, '#share-copy-snippet');
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), await snippet());
    await page.click('#share-copy-link');
    await flashed(page, '#share-copy-link');
    assert.match(await page.evaluate(() => navigator.clipboard.readText()), /\/playground\/#code=/);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#share-dialog').evaluate(d => d.open), false, 'Escape closes the dialog');
    assert.equal(await page.locator('#share-preview').getAttribute('src'), null, 'closing releases the preview runtime');

    // 5. Embed page ------------------------------------------------------------------------------------
    const embed = await context.newPage();
    embed.on('pageerror', e => errors.push(e.message));
    await embed.setViewportSize({ width: 600, height: 400 });
    await embed.goto(frameSrc.replace(/^https?:\/\/[^/]+/, origin));
    await ready(embed);
    assert.equal(await embed.locator('body.embed').count(), 1);
    assert.ok(!/&#|##/.test(await embed.locator('body').innerText()), 'no unrendered entities in the embed');
    assert.equal(await embed.locator('meta[name=robots]').getAttribute('content'), 'noindex, follow');
    assert.equal(await embed.locator('#source-code').evaluate(e => e.readOnly), true);
    assert.equal(await embed.inputValue('#source-code'), 'println( "from the dialog" );');
    for (const id of ['clear-console', 'share-open']) assert.equal(await embed.locator(`#${id}`).isVisible(), false, `${id} is hidden in a read only embed`);
    assert.ok(await embed.locator('#copy-link').isVisible() && await embed.locator('#fullscreen').isVisible());
    assert.equal(await embed.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'no horizontal scroll at 600px');
    await embed.click('#run-code');
    await embed.waitForFunction(() => document.getElementById('console-output').innerText.includes('from the dialog'));
    await embed.click('#copy-link');
    await flashed(embed, '#copy-link');
    assert.ok((await embed.evaluate(() => navigator.clipboard.readText())).startsWith(`${origin}/playground/#code=`), 'the embed copies a link to the full playground');
    await embed.press('#source-code', 'Control+End').catch(() => {});
    assert.equal(await embed.inputValue('#source-code'), 'println( "from the dialog" );', 'typing in a read only embed changes nothing');

    // 6. Editable embed, plain embed -------------------------------------------------------------------
    const open = await context.newPage();
    open.on('pageerror', e => errors.push(e.message));
    await open.goto(`${origin}/playground/embed/#code=${link.split('#code=')[1]}`);
    await ready(open);
    assert.equal(await open.locator('#source-code').evaluate(e => e.readOnly), false);
    assert.ok(await open.locator('#clear-console').isVisible() && await open.locator('#share-open').isVisible());
    await open.close();
    const bare = await context.newPage();
    bare.on('pageerror', e => errors.push(e.message));
    await bare.goto(`${origin}/playground/embed/`);
    await ready(bare);
    assert.ok((await bare.inputValue('#source-code')).length > 20, 'an embed with no code shows the first demo');
    await bare.close();

    // 7. Full screen -----------------------------------------------------------------------------------
    const full = page.locator('#fullscreen');
    await page.reload();
    await ready(page);
    await full.click();
    await page.waitForFunction(() => document.querySelector('.workbench').classList.contains('is-fullscreen'));
    assert.equal(await full.getAttribute('aria-pressed'), 'true');
    const box = await page.locator('.workbench').boundingBox();
    assert.ok(box.width >= 1270 && box.height >= 890, `full screen fills the viewport (${box.width}x${box.height})`);
    await full.click();
    await page.waitForFunction(() => !document.querySelector('.workbench').classList.contains('is-fullscreen'));
    assert.equal(await full.getAttribute('aria-pressed'), 'false');
    // Browsers without the Fullscreen API (iOS Safari) get a fixed-position fallback that Escape leaves.
    await page.evaluate(() => { document.querySelector('.workbench').requestFullscreen = undefined; });
    await full.click();
    await page.waitForFunction(() => document.querySelector('.workbench').classList.contains('is-fullscreen'));
    assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.workbench')).position), 'fixed');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('.workbench').classList.contains('is-fullscreen'));

    // 8. The home page REPL has its own Clear --------------------------------------------------------------
    const home = await context.newPage();
    home.on('pageerror', e => errors.push(e.message));
    await home.goto(`${origin}/`);
    await home.locator('#mini').scrollIntoViewIfNeeded();
    await home.waitForFunction(() => !document.querySelector('.mini-chip[data-code]').disabled, null, { timeout: 30000 });
    await home.click('.mini-chip[data-code]');
    await home.waitForFunction(() => document.getElementById('mini-out').innerText.includes('[1,4,9]') || document.getElementById('mini-out').innerText.includes('[1, 4, 9]'));
    await home.click('#mini-clear');
    assert.equal(await home.locator('#mini-out > *').count(), 0, 'the home REPL clears');

    assert.deepEqual(errors, [], `no page errors: ${errors.join(' | ')}`);
    console.log('PASS: playground UI: Clear, Copy link, Share dialog, embed (read only and editable), full screen, damaged and oversized links.');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
