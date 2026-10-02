// Check authored target markup/CSS, or pass a site URL to check the rendered homepage.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    if (process.argv[2]) {
      await page.goto(process.argv[2]);
    } else {
      const theme = path.join(__dirname, '../docs/.theme');
      const markup = fs.readFileSync(path.join(theme, 'home.bxm'), 'utf8').match(/<div class="mbx-targets"[\s\S]*?<\/div>\s*<\/div>/)[0];
      const css = fs.readFileSync(path.join(theme, 'assets/home.css'), 'utf8');
      await page.setContent(`<style>${css}</style><body class="bxsites-home matchbox-home">${markup}</body>`);
    }
    for (const theme of ['light', 'dark']) {
      await page.evaluate(value => document.documentElement.setAttribute('data-theme', value), theme);
      for (const width of [320, 390, 768, 1361]) {
        await page.setViewportSize({ width, height: 900 });
        const cells = await page.locator('.mbx-targets > div').evaluateAll(elements => elements.map(element => ({
          inset: element.querySelector('span').getBoundingClientRect().left - element.getBoundingClientRect().left,
          width: element.clientWidth,
          scrollWidth: element.scrollWidth,
        })));
        assert.equal(cells.length, 4);
        for (const cell of cells) {
          assert.ok(cell.inset >= 19, `${theme}/${width}: target label touches the divider`);
          assert.ok(cell.scrollWidth <= cell.width, `${theme}/${width}: target cell overflows`);
        }
      }
    }
    if (process.argv[3]) await page.locator('.mbx-targets').screenshot({ path: process.argv[3] });
    console.log('Homepage target spacing passed at mobile, tablet, and desktop widths in both themes.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
