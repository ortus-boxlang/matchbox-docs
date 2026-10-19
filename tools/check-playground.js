// Exercise the shipped WASM, not a mock or the native CLI. No packages required.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initSync, Repl } from '../docs/assets/playground/runtime/matchbox.js';
import { demos } from '../docs/assets/playground/playground-demos.js';

const wasm = initSync({ module: readFileSync(new URL('../docs/assets/playground/runtime/matchbox_bg.wasm', import.meta.url)) });
assert.throws(() => wasm.memory.grow(2048), RangeError, '128 MiB memory ceiling must be enforced');
const repl = new Repl();
const evaluate = source => JSON.parse(repl.evaluate(source));
assert.equal(evaluate('1 + 2').value, '3');
assert.equal(evaluate('answer = 40;').value, '40');
assert.equal(evaluate('answer += 2; answer').value, '42');
assert.equal(evaluate('function twice(n) { return n * 2; }').error, undefined);
assert.equal(evaluate('twice(answer)').value, '84');
assert.equal(evaluate('println("🦀 Hello!"); print("still here");').output, '🦀 Hello!\nstill here');
// These trapped ("time not implemented on this platform") before the VM used web_time clocks.
assert.equal(evaluate('[1,2,3].map( n => n * 2 )').value, '[2,4,6]', 'Member calls must not trap');
assert.equal(evaluate('getTickCount() > 0').value, 'true', 'getTickCount must not trap');
assert.equal(evaluate('sleep( 5 ); "awake"').value, 'awake', 'sleep must not trap');
assert.equal(evaluate('runAsync( () => 21 * 2 ).get()').value, '42', 'Cooperative futures must work');
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
// Editor highlighter: markup is escaped, classes are right, and the text always round-trips.
const { highlight } = await import('../docs/assets/playground/highlight.js');
const plainText = html => html.replace(/<span class="tk-[a-z]">/g, '').replaceAll('</span>', '').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
const samples = [
  ...demos.map(demo => demo.code),
  '// c\nx = "a ""quoted"" #name# ##literal## string"; /* block\nspans */ y = 0x1F + 3.14e2 - .5;',
  'if ( a < b && c >= d ) { return true; } else { throw "x" }',
  'unterminated = "open string with #interp',
  '/* unterminated block',
  '<script>alert("&")</script>',
  '',
];
for (const sample of samples) assert.equal(plainText(highlight(sample)), sample, 'highlighter must not change the text');
const tokens = highlight('function add( a, b ) { return a + b; } // sum\nx = "hi #n#"; y = 42; z = true; this.f( 1 )');
for (const cls of ['tk-k', 'tk-f', 'tk-c', 'tk-s', 'tk-i', 'tk-n', 'tk-l', 'tk-v', 'tk-o']) assert.ok(tokens.includes(`class="${cls}"`), `expected a ${cls} token`);
const escaped = highlight('<b>x</b>');
assert.ok(escaped.includes('&lt;') && !escaped.includes('<b>') && !escaped.includes('</b>'), 'HTML must be escaped');
assert.ok(!highlight('a.return').includes('tk-k'), 'a keyword after a dot is a member name');
// Share links: lossless round trip, a stable hash format, safe failure on junk, and a size ceiling.
const share = await import('../docs/assets/playground/share.js');
for (const sample of ['', 'x = 1;', 'println( "héllo wörld 🚀 日本語" );\n', ...demos.map(demo => demo.code), '\u0000\ud83d\ude80 tabs\t\r\n']) {
  assert.equal(await share.decodeCode(await share.encodeCode(sample)), sample, 'share encoding must round-trip');
}
const encoded = await share.encodeCode('println( "hi" );');
assert.match(encoded, /^[A-Za-z0-9_-]+$/, 'encoded code must be URL safe (no +, / or =)');
assert.equal(await share.decodeCode(encoded + '!'), null, 'junk is rejected');
assert.equal(await share.decodeCode('not base64 at all'), null);
assert.equal(await share.decodeCode('AAAA'), null, 'valid base64 that is not deflate is rejected');
assert.equal(await share.decodeCode(''), null);
const hashed = await share.buildShareUrl('https://matchbox.test/playground/', 'a = 1;', { readOnly: true });
assert.ok(hashed.startsWith('https://matchbox.test/playground/#code='), 'code travels in the hash, never the query');
assert.ok(!hashed.includes('?'), 'no query string');
assert.ok(hashed.endsWith('&ro=true'));
assert.deepEqual(await share.parseShareHash(new URL(hashed).hash), { code: 'a = 1;', readOnly: true, present: true });
assert.deepEqual(await share.parseShareHash(''), { code: null, readOnly: false, present: false });
assert.deepEqual(await share.parseShareHash('#main'), { code: null, readOnly: false, present: false });
assert.deepEqual(await share.parseShareHash('#code=%%%'), { code: null, readOnly: false, present: true }, 'damaged links are reported, not thrown');
let seed = 12345;
const noise = Array.from({ length: 20000 }, () => String.fromCharCode(33 + (((seed = (seed * 1103515245 + 12345) >>> 0) >>> 16) % 90))).join('');
assert.equal(await share.buildShareUrl('https://matchbox.test/playground/', noise), null, 'incompressible code over the ceiling is refused');
assert.notEqual(await share.buildShareUrl('https://matchbox.test/playground/', 'println( 1 );\n'.repeat(3000)), null, 'repetitive code compresses under the ceiling');
const snippet = share.iframeSnippet('https://matchbox.test/playground/embed/#code=abc&ro=true');
assert.equal(snippet, '<iframe src="https://matchbox.test/playground/embed/#code=abc&amp;ro=true" width="600" height="400" allow="fullscreen" loading="lazy"></iframe>');
assert.ok(!share.iframeSnippet('https://x.test/#"onload="alert(1)').includes('"onload'), 'quotes are escaped in the snippet');

console.log('PASS: shipped WASM, persistent REPL, output/errors, UTF-8 limits, memory ceiling, and all six demos + follow-up expressions.');
