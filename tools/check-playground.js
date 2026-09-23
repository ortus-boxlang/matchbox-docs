// Exercise the shipped WASM, not a mock or the native CLI. No packages required.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initSync, Repl } from '../assets/runtime/matchbox.js';
import { demos } from '../assets/playground-demos.js';

const wasm = initSync({ module: readFileSync(new URL('../assets/runtime/matchbox_bg.wasm', import.meta.url)) });
assert.throws(() => wasm.memory.grow(2048), RangeError, '128 MiB memory ceiling must be enforced');
const repl = new Repl();
const evaluate = source => JSON.parse(repl.evaluate(source));
assert.equal(evaluate('1 + 2').value, '3');
assert.equal(evaluate('answer = 40;').value, '40');
assert.equal(evaluate('answer += 2; answer').value, '42');
assert.equal(evaluate('function twice(n) { return n * 2; }').error, undefined);
assert.equal(evaluate('twice(answer)').value, '84');
assert.equal(evaluate('println("🦀 Hello!"); print("still here");').output, '🦀 Hello!\nstill here');
assert.match(evaluate('function broken(').error, /error:/i);
const failure = evaluate('println("before error"); throw "deliberate error";');
assert.match(failure.error, /deliberate error/);
assert.equal(failure.output, 'before error\n');
assert.equal(evaluate('answer').value, '42', 'State must survive ordinary errors');
assert.equal(evaluate('isNull(js)').value, 'true', 'No JavaScript host bridge');
assert.match(evaluate('x'.repeat(65_537)).error, /64 KiB/);
assert.match(evaluate('// ' + '🦀'.repeat(20_000)).error, /64 KiB/, 'Source limit counts UTF-8 bytes');
for (const result of [evaluate('println(repeatString("🦀", 20000));').output, evaluate('repeatString("x", 70000)').value]) {
  assert.ok(result.endsWith('[Output truncated at 64 KiB]'));
  assert.ok(Buffer.byteLength(result) < 65_600);
  assert.ok(!result.includes('\uFFFD'), 'Truncation must preserve UTF-8');
}
repl.free();

const expected = {
  hello: { output: /Hello, browser!/, value: '42', probe: 'Hello, your name!' },
  pipeline: { output: /Revenue: \$149\nAwaiting payment: 1/, value: '149', probe: /Mechanical keyboard/ },
  fibonacci: { output: /10 → 55/, value: '610', probe: '6765' },
  classes: { output: /Third click:  3/, value: null, probe: '4' },
  mandelbrot: { output: /Mandelbrot \/ 64 × 24 samples/, value: null, probe: '1536' },
  life: { output: /Generation 4/, value: null, probe: '5' },
};
assert.equal(demos.length, Object.keys(expected).length);
for (const demo of demos) {
  const session = new Repl();
  try {
    const result = JSON.parse(session.evaluate(demo.code));
    const check = expected[demo.id];
    assert.equal(result.error, undefined, `${demo.id}: ${result.error}`);
    assert.match(result.output, check.output);
    assert.equal(result.value, check.value, demo.id);
    const probe = JSON.parse(session.evaluate(demo.hint));
    assert.equal(probe.error, undefined, demo.id);
    if (check.probe instanceof RegExp) assert.match(probe.value, check.probe);
    else assert.equal(probe.value, check.probe, demo.id);
    if (demo.id === 'mandelbrot') {
      const rows = result.output.split('\n').slice(0, 24);
      assert.equal(rows.length, 24);
      assert.ok(rows.every(row => row.length === 64));
      assert.ok(rows[12].includes('@@@@@@@@'));
    }
    if (demo.id === 'life') {
      const frames = result.output.trim().split('\n\n');
      assert.equal(frames.length, 5);
      assert.ok(frames.every(frame => (frame.match(/\[\]/g) || []).length === 5));
      assert.notEqual(frames[0].split('\n').slice(1).join('\n'), frames[4].split('\n').slice(1).join('\n'));
    }
  } finally { session.free(); }
}
console.log('PASS: shipped WASM, persistent REPL, output/errors, UTF-8 limits, memory ceiling, and all six demos + follow-up expressions.');
