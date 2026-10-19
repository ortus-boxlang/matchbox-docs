// Run every runnable snippet in the Learn MatchBox course through the shipped WebAssembly runtime, the same one
// the Run button uses, and check the output shown on the page. No packages required.
//
// A runnable snippet is a ```boxlang fence titled *.bxs. The ```text fence that follows it (only prose in between)
// is the expected output and must equal what println() wrote. A snippet may be marked as expected to fail with
// a `<!-- expect-error: text -->` comment on the line before it, for lessons that show an error on purpose.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { initSync, Repl } from '../docs/assets/playground/runtime/matchbox.js';

initSync({ module: readFileSync(new URL('../docs/assets/playground/runtime/matchbox_bg.wasm', import.meta.url)) });

const courseDir = new URL('../docs/course/', import.meta.url);
const manifest = readFileSync(new URL('../docs/data/courses.yaml', import.meta.url), 'utf8');
const lessons = [...manifest.matchAll(/^\s+- (course\/[\w.-]+\.md)\s*$/gm)].map(match => match[1]);
assert.ok(lessons.length >= 8, `expected the course manifest to list its lessons, found ${lessons.length}`);
assert.deepEqual(lessons.map(l => l.replace('course/', '')), readdirSync(courseDir).filter(f => /^\d\d-.*\.md$/.test(f)).sort(),
  'every lesson file is in courses.yaml, in order, and nothing else is');

const fence = /^(?:<!-- expect-error: (.+) -->\n)?```boxlang title="([^"]+\.bxs)"[^\n]*\n([\s\S]*?)```\n/gm;
// The expected output is the first ```text fence after a snippet, as long as no other code fence or heading comes first.
const expectedOutputAfter = rest => {
  const next = rest.search(/^(```|#)/m);
  return next >= 0 && rest.startsWith('```text', next) ? rest.slice(next).match(/^```text[^\n]*\n([\s\S]*?)```/)[1] : undefined;
};
let snippets = 0;
let checked = 0;
for (const lesson of lessons) {
  const text = readFileSync(new URL(`../docs/${lesson}`, import.meta.url), 'utf8');
  assert.match(text, /^---\ntitle: .+\nsummary: .+\n/m, `${lesson}: needs title and summary frontmatter (the course index shows both)`);
  for (const match of text.matchAll(fence)) {
    const [whole, expectError, title, code] = match;
    const expected = expectedOutputAfter(text.slice(match.index + whole.length));
    snippets++;
    const repl = new Repl();
    const result = JSON.parse(repl.evaluate(code));
    repl.free();
    const where = `${lesson} ${title}`;
    if (expectError) {
      assert.ok(result.error, `${where}: expected an error`);
      assert.ok(result.error.includes(expectError), `${where}: error should mention "${expectError}", got: ${result.error.split('\n')[0]}`);
      continue;
    }
    assert.equal(result.error, undefined, `${where}: ${result.error}`);
    assert.notEqual(expected, undefined, `${where}: every runnable snippet needs an output block right after it`);
    assert.equal((result.output ?? '').trimEnd(), expected.trimEnd(), `${where}: printed output differs from the output shown on the page`);
    checked++;
  }
}
assert.ok(snippets >= 15, `expected at least 15 runnable snippets, found ${snippets}`);
console.log(`PASS: ${lessons.length} lessons, ${snippets} runnable snippets run in WebAssembly, ${checked} outputs match the page.`);
