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
// Click a copy button once any earlier confirmation has cleared, then wait for its own confirmation.
const copyClick = async (page, selector) => {
  await page.waitForSelector(`${selector}.flashed`, { state: 'detached', timeout: 5000 });
  await page.click(selector);
  await flashed(page, selector);
};
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
    await copyClick(page, '#copy-link');
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
    await copyClick(page, '#copy-link');
    await page.waitForFunction(() => /too large/i.test(document.getElementById('execution-status').textContent));
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
    await copyClick(page, '#share-copy-snippet');
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), await snippet());
    await copyClick(page, '#share-copy-link');
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
    await copyClick(embed, '#copy-link');
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

    // 9. Course lessons: every .bxs snippet gets a Run button that opens the playground embed with that code -----
    const lesson = await context.newPage();
    lesson.on('pageerror', e => errors.push(e.message));
    await lesson.goto(`${origin}/course/01-welcome/`);
    assert.match(await lesson.locator('body').innerText(), /Lesson 1 of 10/, 'the course shows its position');
    const runs = lesson.locator('.tryit-run');
    assert.equal(await runs.count(), 1, 'one runnable snippet in lesson 1');
    assert.equal(await lesson.locator('.tryit-frame').count(), 0, 'nothing loads until the reader asks');
    await runs.first().click();
    const lessonFrame = lesson.frameLocator('.tryit-frame');
    await lessonFrame.locator('#run-code:not([disabled])').waitFor({ timeout: 30000 });
    assert.match(await lessonFrame.locator('#source-code').inputValue(), /function greet/, 'the snippet is loaded in the playground');
    assert.equal(await lessonFrame.locator('#source-filename').innerText(), 'hello.bxs', 'the snippet keeps its file name');
    await lessonFrame.locator('#run-code').click();
    await lessonFrame.locator('#console-output').getByText('Hello, MatchBox!').waitFor();
    assert.ok((await lessonFrame.locator('#console-output').innerText()).includes('▶ hello.bxs'), 'the console labels the run with the file name');
    await runs.first().click();
    assert.equal(await lesson.locator('.tryit-frame').count(), 0, 'the button closes the playground again');
    await lesson.goto(`${origin}/course/`);
    assert.equal(await lesson.locator('ol a[href*="/course/"]').count(), 10, 'the course index lists ten lessons');
    await lesson.goto(`${origin}/course/09-build-and-ship/`);
    assert.equal(await lesson.locator('.tryit-run').count(), 1, 'shell snippets get no Run button, only the .bxs one');

    // 10. Home page: the course section and a complete install section ---------------------------------------
    const homePage = await context.newPage();
    homePage.on('pageerror', e => errors.push(e.message));
    await homePage.goto(`${origin}/`);
    const lessonLinks = homePage.locator('#learn .lessons a');
    assert.equal(await lessonLinks.count(), 10, 'the home page lists all ten lessons');
    for (const href of await lessonLinks.evaluateAll(links => links.map(a => a.getAttribute('href')))) {
      const response = await homePage.request.get(new URL(href, `${origin}/`).href);
      assert.equal(response.status(), 200, `lesson link ${href} resolves`);
    }
    assert.match(await homePage.locator('#learn .cta a.btn.p').getAttribute('href'), /course\/$/);
    const installText = await homePage.locator('#install').innerText();
    for (const needle of ['install.sh', 'install.ps1', 'mvm install latest', 'matchbox --version', 'matchbox hello.bxs', 'matchbox --target native hello.bxs']) {
      assert.ok(installText.includes(needle), `the install section shows ${needle}`);
    }
    assert.equal(await homePage.locator('#install .steps > li').count(), 3, 'three install steps');
    assert.equal(await homePage.locator('#install .steps .install button[data-copy]').count(), 6, 'every command has a Copy button');
    await homePage.locator('#install .steps > li').first().locator('.install button').first().click();
    assert.match(await homePage.evaluate(() => navigator.clipboard.readText()), /^curl -fsSL https:\/\/raw\.githubusercontent\.com\/ortus-boxlang\/matchbox-quick-installer\/main\/install\/install\.sh \| bash$/, 'Copy puts the installer command on the clipboard');
    await homePage.locator('#install .steps > li').nth(1).locator('.install button').first().click();
    assert.equal(await homePage.evaluate(() => navigator.clipboard.readText()), 'mvm install latest && mvm use latest', 'entities are not copied');

    assert.deepEqual(errors, [], `no page errors: ${errors.join(' | ')}`);
    console.log('PASS: playground UI: Clear, Copy link, Share dialog, embed (read only and editable), full screen, damaged and oversized links, course Run buttons, home course and install sections.');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
