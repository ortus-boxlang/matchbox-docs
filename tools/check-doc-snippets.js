// Run every runnable snippet outside the course (the language reference, the compatibility page and the like)
// through the shipped WebAssembly runtime, the same one the Run button uses, and check the output shown on the page.
// A runnable snippet is a ```boxlang fence titled *.bxs. If a ```text fence follows it (only prose in between), it is
// the expected output and must equal what println() wrote; without one the snippet must simply run without an error.
// `<!-- expect-error: text -->` on the line before a snippet means it is shown failing on purpose.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { initSync, Repl } from '../docs/assets/playground/runtime/matchbox.js';

initSync({ module: readFileSync(new URL('../docs/assets/playground/runtime/matchbox_bg.wasm', import.meta.url)) });

const docs = new URL('../docs/', import.meta.url).pathname;
const skip = new Set(['course', 'assets', 'data', '.overrides']);
const pages = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (skip.has(name) && dir === docs) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith('.md')) pages.push(path);
  }
})(docs);

const fence = /^(?:<!-- expect-error: (.+) -->\n)?```boxlang title="([^"]+\.bxs)"[^\n]*\n([\s\S]*?)```\n/gm;
const expectedOutputAfter = rest => {
  const next = rest.search(/^(```|#)/m);
  return next >= 0 && rest.startsWith('```text', next) ? rest.slice(next).match(/^```text[^\n]*\n([\s\S]*?)```/)[1] : undefined;
};

let snippets = 0;
let checked = 0;
for (const page of pages.sort()) {
  const text = readFileSync(page, 'utf8');
  for (const match of text.matchAll(fence)) {
    const [whole, expectError, title, code] = match;
    const where = `${relative(docs, page)} ${title}`;
    const expected = expectedOutputAfter(text.slice(match.index + whole.length));
    snippets++;
    const repl = new Repl();
    const result = JSON.parse(repl.evaluate(code));
    repl.free();
    if (expectError) {
      assert.ok(result.error, `${where}: expected an error`);
      assert.ok(result.error.includes(expectError), `${where}: error should mention "${expectError}", got: ${result.error.split('\n')[0]}`);
      continue;
    }
    assert.equal(result.error, undefined, `${where}: ${result.error}`);
    if (expected !== undefined) {
      assert.equal((result.output ?? '').trimEnd(), expected.trimEnd(), `${where}: printed output differs from the output shown on the page`);
      checked++;
    }
  }
}
assert.ok(snippets > 0, 'expected runnable snippets outside the course');
console.log(`PASS: ${snippets} runnable snippets in ${pages.length} pages run in WebAssembly, ${checked} outputs match the page.`);
