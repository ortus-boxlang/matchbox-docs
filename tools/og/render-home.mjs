// Renders tools/og/home.html to docs/assets/og-home.png (1200x630) with Playwright.
// Run: node tools/og/render-home.mjs   (needs the `playwright` package and a Chromium)
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const page = fileURLToPath(new URL('./home.html', import.meta.url));
const out = fileURLToPath(new URL('../../docs/assets/og-home.png', import.meta.url));
const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await tab.goto(`file://${page}`);
await tab.evaluate(() => document.fonts.ready);
await tab.screenshot({ path: out });
await browser.close();
console.log(`Wrote ${out}`);
