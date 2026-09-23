// Optional UI regression check: start the static server, then pass its URL.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const base = new URL(process.argv[2] || 'http://127.0.0.1:8080/');
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(new URL('index.html', base).href);

    await page.getByRole('tab', { name: 'Windows', exact: true }).click();
    assert.ok(await page.locator('#panel-windows').isVisible());
    await page.keyboard.press('ArrowRight');
    assert.ok(await page.locator('#panel-docker').isVisible());
    await page.keyboard.press('Home');
    await page.locator('#panel-unix .copy-button').click();
    assert.match(await page.evaluate(() => navigator.clipboard.readText()), /curl -sSL/);

    await page.keyboard.press('Control+k');
    await page.locator('#search-input').fill('connectionTimeout');
    await page.locator('#search-results a').first().waitFor();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.waitForURL('**/docs/http.html');
    await page.locator('[data-search]').click();
    await page.locator('#search-input').fill('zzz-no-matching-page');
    await page.waitForFunction(() => document.querySelector('#search-status').textContent.startsWith('No results'));
    await page.keyboard.press('Escape');
    await page.locator('.search-dialog').waitFor({ state: 'hidden' });
    assert.ok(await page.locator('[data-search]').evaluate(element => element === document.activeElement));

    await page.getByRole('button', { name: 'Switch to light theme' }).click();
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');

    await page.goto(new URL('playground.html', base).href);
    const ready = () => page.waitForFunction(() => document.querySelector('#runtime-status').dataset.state === 'ready');
    const evaluate = async source => {
      await page.locator('#repl-input').fill(source);
      await page.locator('#repl-input').press('Enter');
      await ready();
    };
    await ready();
    const { demos } = await import('../assets/playground-demos.js');
    for (const demo of demos) {
      await page.locator(`[data-demo="${demo.id}"]`).click();
      await ready();
      assert.equal(await page.locator('#source-code').inputValue(), demo.code);
      await page.locator('#run-code').click();
      await ready();
      assert.equal(await page.locator('.console-error').count(), 0, demo.id);
      assert.ok((await page.locator('.console-stdout').innerText()).length > 0);
      if (demo.id === 'hello') assert.ok((await page.locator('.console-stdout').boundingBox()).height < 80, 'Output entries must not inherit console-panel dimensions');
    }
    await page.locator('[data-demo="classes"]').click();
    await ready();
    await page.locator('#run-code').click();
    await ready();
    await evaluate('counter.increment()');
    assert.equal(await page.locator('.console-value').last().innerText(), '=> 4');
    await context.setOffline(true);
    await evaluate('counter.increment()');
    assert.equal(await page.locator('.console-value').last().innerText(), '=> 5');
    await context.setOffline(false);
    await page.locator('#repl-input').fill('draft');
    await page.locator('#repl-input').press('ArrowUp');
    assert.equal(await page.locator('#repl-input').inputValue(), 'counter.increment()');
    await page.locator('#repl-input').press('ArrowDown');
    assert.equal(await page.locator('#repl-input').inputValue(), 'draft');
    await page.locator('#clear-console').click();
    await evaluate('counter.count');
    assert.equal(await page.locator('.console-value').last().innerText(), '=> 5');
    await evaluate('function broken(');
    assert.match(await page.locator('.console-error').last().innerText(), /error:/i);
    await evaluate('counter.increment()');
    assert.equal(await page.locator('.console-value').last().innerText(), '=> 6');
    await evaluate('println("<img src=x onerror=alert(1)>");');
    assert.match(await page.locator('.console-stdout').last().innerText(), /<img/);
    assert.equal(await page.locator('#console-output img').count(), 0, 'Output must be inert text');
    await page.locator('#reset-session').click();
    await ready();
    await evaluate('isNull(counter)');
    assert.equal(await page.locator('.console-value').last().innerText(), '=> true');

    await page.locator('#source-code').fill('println("Keyboard run"); checkpoint = 123;');
    await page.locator('#source-code').press('Control+Enter');
    await ready();
    assert.match(await page.locator('.console-stdout').last().innerText(), /Keyboard run/);
    await evaluate('checkpoint');
    assert.equal(await page.locator('.console-value').last().innerText(), '=> 123');
    page.once('dialog', dialog => dialog.dismiss());
    await page.locator('[data-demo="hello"]').click();
    assert.match(await page.locator('#source-code').inputValue(), /checkpoint/);
    page.once('dialog', dialog => dialog.accept());
    await page.locator('[data-demo="hello"]').click();
    await ready();
    assert.equal(await page.locator('#source-code').inputValue(), demos[0].code);
    await page.locator('#source-code').fill('// ' + '🦀'.repeat(20_000));
    await page.locator('#run-code').click();
    assert.match(await page.locator('.console-error').last().innerText(), /64 KiB/);

    await page.locator('#source-code').fill('while (true) {}');
    await page.locator('#run-code').click();
    await page.locator('[data-search]').click();
    await page.locator('.search-dialog').waitFor({ state: 'visible' });
    await page.keyboard.press('Escape');
    await page.locator('#stop-code').click();
    await ready();
    assert.match(await page.locator('.console-error').last().innerText(), /Stopped by you/);
    assert.equal(await page.locator('#source-code').inputValue(), 'while (true) {}');
    await page.locator('#run-code').click();
    await ready();
    assert.match(await page.locator('.console-error').last().innerText(), /5-second execution limit/);
    await evaluate('getTickCount()'); // This snapshot's native clock traps on bare WASM.
    assert.match(await page.locator('.console-error').last().innerText(), /runtime stopped/);
    await evaluate('6 * 7');
    assert.equal(await page.locator('.console-value').last().innerText(), '=> 42');

    const blocked = await browser.newContext();
    await blocked.route('**/runtime/*.wasm', route => route.abort());
    const failedPage = await blocked.newPage();
    await failedPage.goto(new URL('playground.html', base).href);
    await failedPage.waitForFunction(() => document.querySelector('#runtime-status').dataset.state === 'error');
    assert.ok(await failedPage.locator('#run-code').isDisabled());
    await blocked.unroute('**/runtime/*.wasm');
    await failedPage.locator('#reset-session').click();
    await failedPage.waitForFunction(() => document.querySelector('#runtime-status').dataset.state === 'ready');
    await blocked.close();

    const response = await context.request.get(new URL('search-index.json', base).href);
    const docs = await response.json();
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ['index.html', 'playground.html', ...docs.map(doc => doc.url)]) {
        await page.goto(new URL(path, base).href);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
        assert.equal(overflow, false, `Horizontal overflow at ${width}px: ${path}`);
      }
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base.href);
    await page.locator('.mobile-nav summary').click();
    await page.locator('.mobile-nav').getByRole('link', { name: 'Documentation', exact: true }).click();
    await page.waitForURL('**/docs/index.html');
    assert.equal(await page.locator('.docs-menu').getAttribute('open'), null);
    await page.locator('.docs-menu summary').click();
    await page.locator('.docs-menu nav').getByRole('link', { name: 'Installation', exact: true }).click();
    await page.waitForURL('**/docs/installation.html');

    const plain = await browser.newContext({ javaScriptEnabled: false });
    const nojs = await plain.newPage();
    await nojs.goto(base.href);
    assert.ok(await nojs.locator('#panel-windows').isVisible());
    await nojs.locator('[data-search]').click();
    await nojs.waitForURL('**/docs/index.html');
    assert.ok(await nojs.locator('.article').isVisible());
    await nojs.goto(new URL('playground.html', base).href);
    assert.ok(await nojs.locator('noscript .callout').isVisible());
    assert.ok(await nojs.locator('#run-code').isDisabled());
    assert.deepEqual(errors, []);
    console.log('PASS: browser search, clipboard, themes, responsive/no-JS navigation; six WASM demos, REPL state/history, offline execution, inert output, limits, Stop, trap and loading recovery.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
