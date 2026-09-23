import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { searchPages } from '../assets/site.js';

const pages = JSON.parse(readFileSync(new URL('../site/search-index.json', import.meta.url)));
assert.equal(searchPages(pages, 'HTTP requests')[0].url, 'docs/http.html');
assert.equal(searchPages(pages, '  dOcKeR  ')[0].url, 'docs/docker.html');
assert.ok(searchPages(pages, 'connectionTimeout').some(page => page.url === 'docs/http.html'));
assert.ok(searchPages(pages, 'WASI Preview').some(page => page.url === 'docs/wasi.html'));
assert.deepEqual(searchPages(pages, 'unfindable-xyz-987'), []);
assert.deepEqual(searchPages(pages, '<script>alert(1)</script>'), []);
assert.equal(searchPages(pages, '').length, pages.length);
assert.equal(searchPages(pages, ' \n ').length, pages.length);
assert.ok(searchPages(pages, 'native binary').every(page =>
  `${page.title} ${page.category} ${page.description} ${page.text}`.toLowerCase().includes('binary')));
console.log('PASS: search ranking, case/whitespace, full text, multiple terms, and empty/no-match queries.');
