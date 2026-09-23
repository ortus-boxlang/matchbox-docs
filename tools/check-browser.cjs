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

    const response = await context.request.get(new URL('search-index.json', base).href);
    const docs = await response.json();
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ['index.html', ...docs.map(doc => doc.url)]) {
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
    assert.deepEqual(errors, []);
    console.log('PASS: browser search, Escape/focus, clipboard, tabs, themes, all-page responsive layout, mobile and no-JS navigation.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
