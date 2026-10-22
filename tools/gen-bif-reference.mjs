#!/usr/bin/env node
// Generates the MatchBox function reference from the MatchBox Rust workspace.
//
//   node tools/gen-bif-reference.mjs [matchbox-dir] [--check] [--boxlang <dir>]
//
// Writes docs/data/functions.json and docs/reference/functions/*.md.
// With --check nothing is written; the script exits 1 when a committed file
// differs from what would be generated. No packages are required.
//
// Inputs read from the MatchBox tree:
//   crates/matchbox-vm/src/bifs/*.rs       global BIF registrations (with cfg feature gates)
//   crates/matchbox-vm/src/vm/mod.rs       resolve_member_method (member functions of built-in types)
//   crates/matchbox-compiler/src/prelude.bxs   BIFs written in BoxLang
//   crates/matchbox-compiler/src/compiler/mod.rs   compiler intrinsics (println, print, isNull)
//   crates/matchbox-esp32-runner/src/*.rs  ESP32 firmware BIFs
//   crates/matchbox-tui/src/lib.rs         TUI classes (feature bif-tui)
//   impl BxNativeObject blocks and #[bx_methods] impls   methods of native objects
//   Cargo.toml files                        feature table
// The BoxLang parity list is derived from a BoxLang checkout when --boxlang is
// given; otherwise the list stored in docs/data/functions.json is reused.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..');
const OUT_DATA = path.join(REPO, 'docs/data/functions.json');
const OUT_DIR = path.join(REPO, 'docs/reference/functions');

// ---------------------------------------------------------------- arguments
const argv = process.argv.slice(2);
let CHECK = false;
let BOXLANG_DIR = null;
const positional = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--check') CHECK = true;
  else if (a === '--boxlang') BOXLANG_DIR = path.resolve(argv[++i] ?? '');
  else if (a.startsWith('--boxlang=')) BOXLANG_DIR = path.resolve(a.slice(10));
  else if (a === '-h' || a === '--help') {
    console.log('usage: node tools/gen-bif-reference.mjs [matchbox-dir] [--check] [--boxlang <dir>]');
    process.exit(0);
  } else positional.push(a);
}
const MB = positional[0] ? path.resolve(positional[0]) : path.resolve(REPO, '../matchbox');
if (!fs.existsSync(path.join(MB, 'crates/matchbox-vm/src/bifs/mod.rs'))) {
  console.error(`MatchBox source tree not found at ${MB}`);
  process.exit(2);
}

// ------------------------------------------------------------ source helpers
const read = (rel) => fs.readFileSync(path.join(MB, rel), 'utf8');

/** Blank out comments (length preserving) so offsets and line numbers stay valid. */
function stripComments(src) {
  const out = src.split('');
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (c === '/' && d === '/') {
      while (i < n && src[i] !== '\n') out[i++] = ' ';
    } else if (c === '/' && d === '*') {
      let depth = 1;
      out[i] = out[i + 1] = ' ';
      i += 2;
      while (i < n && depth > 0) {
        if (src[i] === '/' && src[i + 1] === '*') { depth++; out[i] = out[i + 1] = ' '; i += 2; }
        else if (src[i] === '*' && src[i + 1] === '/') { depth--; out[i] = out[i + 1] = ' '; i += 2; }
        else { if (src[i] !== '\n') out[i] = ' '; i++; }
      }
    } else if (c === '"') {
      i++;
      while (i < n && src[i] !== '"') { if (src[i] === '\\') i++; i++; }
      i++;
    } else if (c === "'") {
      const m = /^'(?:\\.[^']*|[^\\'])'/.exec(src.slice(i, i + 12));
      i += m ? m[0].length : 1;
    } else i++;
  }
  return out.join('');
}

/** Index just past the string/char literal starting at i, or i+1. */
function skipLiteral(s, i) {
  if (s[i] === '"') {
    let j = i + 1;
    while (j < s.length && s[j] !== '"') { if (s[j] === '\\') j++; j++; }
    return j + 1;
  }
  if (s[i] === "'") {
    const m = /^'(?:\\.[^']*|[^\\'])'/.exec(s.slice(i, i + 12));
    return i + (m ? m[0].length : 1);
  }
  return i + 1;
}

/** Offset of the matching close brace for the open brace at `open`. */
function matchBrace(s, open) {
  let depth = 0;
  for (let i = open; i < s.length; ) {
    const c = s[i];
    if (c === '"' || c === "'") { i = skipLiteral(s, i); continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return i; }
    i++;
  }
  return s.length;
}

function lineIndex(src) {
  const starts = [0];
  for (let i = 0; i < src.length; i++) if (src[i] === '\n') starts.push(i + 1);
  return (off) => {
    let lo = 0, hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= off) lo = mid; else hi = mid - 1;
    }
    return lo + 1;
  };
}

/** Body range [open, close] of `fn name(...) ... { }` or null. */
function fnBody(s, name, from = 0) {
  const re = new RegExp(`\\bfn\\s+${name}\\b`, 'g');
  re.lastIndex = from;
  const m = re.exec(s);
  if (!m) return null;
  let i = m.index;
  // find the body brace: first `{` after the parameter list at paren depth 0
  let paren = 0;
  for (; i < s.length; i++) {
    if (s[i] === '(') paren++;
    else if (s[i] === ')') paren--;
    else if (s[i] === '{' && paren === 0) break;
  }
  return [i, matchBrace(s, i)];
}

// ---------------------------------------------------------------- cfg gates
/** Parse `#[cfg( ... )]` starting at i; returns { expr, end } or null. */
function parseCfgAttr(s, i) {
  const m = /^#\[cfg\(/.exec(s.slice(i, i + 8));
  if (!m) return null;
  let j = i + m[0].length;
  let depth = 1;
  const start = j;
  while (j < s.length && depth > 0) {
    if (s[j] === '"') { j = skipLiteral(s, j); continue; }
    if (s[j] === '(') depth++;
    else if (s[j] === ')') depth--;
    j++;
  }
  const expr = s.slice(start, j - 1).trim();
  while (j < s.length && s[j] !== ']') j++;
  return { expr, end: j + 1 };
}

/** Collapse a list of cfg expressions into { gate, requires[], flags[], notWasm, note }. */
function describeGate(cfgs) {
  const features = [];
  const cfgFlags = [];
  let notWasm = false;
  const text = cfgs.join(' && ');
  for (const m of text.matchAll(/feature\s*=\s*"([^"]+)"/g)) {
    if (!features.includes(m[1])) features.push(m[1]);
  }
  if (/not\(\s*target_arch\s*=\s*"wasm32"\s*\)/.test(text)) notWasm = true;
  for (const m of text.matchAll(/\b(matchbox_camera_supported)\b/g)) {
    if (!cfgFlags.includes(m[1])) cfgFlags.push(m[1]);
  }
  return { features, cfgFlags, notWasm, raw: cfgs };
}

// ------------------------------------------------------- global registrations
/**
 * Find every `<map>.insert("name".to_string(), handler as BxNativeFunction)`
 * inside the body of the given registration function, with the cfg gates that
 * enclose it.
 */
function scanRegistrations(rel, fnName) {
  const raw = read(rel);
  const s = stripComments(raw);
  const lineOf = lineIndex(raw);
  const body = fnBody(s, fnName);
  if (!body) throw new Error(`fn ${fnName} not found in ${rel}`);
  const found = [];
  const stack = [];
  let pending = null;
  let depth = 0;
  const insertRe = /^(?:bifs|map)\s*\.insert\(\s*"([^"]+)"\s*\.to_string\(\)\s*,\s*([\w:]+)\s+as\s+BxNativeFunction\s*,?\s*\)/;
  for (let i = body[0] + 1; i < body[1]; ) {
    const c = s[i];
    if (c === '#' && s[i + 1] === '[') {
      const attr = parseCfgAttr(s, i);
      if (attr) { pending = attr.expr; i = attr.end; continue; }
    }
    if (c === '"' || c === "'") { i = skipLiteral(s, i); continue; }
    if (c === '{') {
      depth++;
      if (pending !== null) { stack.push({ depth, cfg: pending }); pending = null; }
      i++; continue;
    }
    if (c === '}') {
      if (stack.length && stack[stack.length - 1].depth === depth) stack.pop();
      depth--; i++; continue;
    }
    if (c === ';') { pending = null; i++; continue; }
    if ((c === 'b' || c === 'm') && /^(bifs|map)\s*\./.test(s.slice(i, i + 8))) {
      const m = insertRe.exec(s.slice(i, i + 400));
      if (m) {
        const cfgs = stack.map((x) => x.cfg);
        if (pending !== null) cfgs.push(pending);
        pending = null;
        found.push({ key: m[1], handler: m[2], file: rel, line: lineOf(i), cfgs });
        i += m[0].length; continue;
      }
    }
    i++;
  }
  return found;
}

/** Registrar calls made from register_all (order does not matter). */
const VM_REGISTRARS = [
  ['crates/matchbox-vm/src/bifs/mod.rs', 'register_all'],
  ['crates/matchbox-vm/src/bifs/math_datetime.rs', 'register_math_datetime_bifs'],
  ['crates/matchbox-vm/src/bifs/async_runtime.rs', 'register_async_bifs'],
  ['crates/matchbox-vm/src/bifs/list_query_extra.rs', 'register_list_query_extra_bifs'],
  ['crates/matchbox-vm/src/bifs/type_format.rs', 'register_type_format_bifs'],
  ['crates/matchbox-vm/src/bifs/binary.rs', 'register_binary_bifs'],
  ['crates/matchbox-vm/src/bifs/set.rs', 'register_set_bifs'],
  ['crates/matchbox-vm/src/bifs/i18n.rs', 'register_i18n_bifs'],
  ['crates/matchbox-vm/src/bifs/watcher.rs', 'register_watcher_bifs'],
  ['crates/matchbox-vm/src/bifs/xml.rs', 'register_xml_bifs'],
  ['crates/matchbox-vm/src/bifs/cache.rs', 'register_cache_bifs'],
  ['crates/matchbox-vm/src/bifs/net.rs', 'register_net_bifs'],
];

// ------------------------------------------------------------------ prelude
function scanPrelude() {
  const rel = 'crates/matchbox-compiler/src/prelude.bxs';
  const raw = read(rel);
  const lineOf = lineIndex(raw);
  const out = [];
  const re = /^function\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*\{/gm;
  for (const m of raw.matchAll(re)) {
    const params = m[2].replace(/\s+/g, ' ').trim();
    out.push({ name: m[1], params, file: rel, line: lineOf(m.index) });
  }
  return out;
}

// ------------------------------------------------------------ member table
const MEMBER_BLOCKS = [
  { re: /receiver\.is_bool\(\)/, type: 'boolean' },
  { re: /receiver\.is_number\(\)/, type: 'number' },
  { re: /__xml_kind/, type: 'xml' },
  { re: /GcObject::String/, type: 'string' },
  { re: /GcObject::Array/, type: 'array' },
  { re: /GcObject::Struct/, type: 'struct' },
  { re: /GcObject::Future/, type: 'future' },
  { re: /GcObject::DateTime/, type: 'datetime' },
  { re: /GcObject::JsValue/, type: 'js' },
];

function scanMemberTable() {
  const rel = 'crates/matchbox-vm/src/vm/mod.rs';
  const raw = read(rel);
  const s = stripComments(raw);
  const lineOf = lineIndex(raw);
  const body = fnBody(s, 'resolve_member_method');
  if (!body) throw new Error('resolve_member_method not found');
  const out = [];
  const matchRe = /match\s+name\.as_str\(\)\s*\{/g;
  matchRe.lastIndex = body[0];
  let prevEnd = body[0];
  let m;
  while ((m = matchRe.exec(s)) && m.index < body[1]) {
    const open = m.index + m[0].length - 1;
    const close = matchBrace(s, open);
    const ctx = s.slice(prevEnd, m.index);
    let type = null;
    let best = -1;
    for (const b of MEMBER_BLOCKS) {
      const re = new RegExp(b.re.source, 'g');
      let last = -1, mm;
      while ((mm = re.exec(ctx))) last = mm.index;
      if (last > best) { best = last; type = b.type; }
    }
    if (!type) throw new Error(`member block without a receiver type at ${rel}:${lineOf(m.index)}`);
    const block = s.slice(open + 1, close);
    const armRe = /((?:"\w+"\s*(?:\|\s*)?)+)=>\s*(?:\{\s*)?Some\(\s*"(\w+)"\s*\.to_string\(\)\s*\)/g;
    for (const a of block.matchAll(armRe)) {
      const names = [...a[1].matchAll(/"(\w+)"/g)].map((x) => x[1]);
      const line = lineOf(open + 1 + a.index);
      for (const nm of names) out.push({ type, member: nm, target: a[2], file: rel, line });
    }
    prevEnd = close;
    matchRe.lastIndex = close;
  }
  return out;
}

// ------------------------------------------------------- native object methods
/** Walk the arms of the `match` whose body is s[open..close]; returns [{names, line}]. */
function topLevelArms(s, open, close, lineOf) {
  const arms = [];
  let i = open + 1;
  const patRe = /^((?:"[^"\\]*"\s*(?:\|\s*)?)+)(?:if\s[^=]*)?=>/;
  while (i < close) {
    while (i < close && /[\s,]/.test(s[i])) i++;
    if (i >= close) break;
    const m = patRe.exec(s.slice(i, i + 600));
    if (m) {
      arms.push({ names: [...m[1].matchAll(/"([^"\\]*)"/g)].map((x) => x[1]), line: lineOf(i) });
      i += m[0].length;
    } else {
      // wildcard or binding pattern: skip to `=>`
      const j = s.indexOf('=>', i);
      if (j < 0 || j > close) break;
      i = j + 2;
    }
    // skip the arm body
    while (i < close && /\s/.test(s[i])) i++;
    let depth = 0;
    while (i < close) {
      const c = s[i];
      if (c === '"' || c === "'") { i = skipLiteral(s, i); continue; }
      if (c === '{' || c === '(' || c === '[') depth++;
      else if (c === '}' || c === ')' || c === ']') depth--;
      else if (c === ',' && depth === 0) { i++; break; }
      i++;
      if (depth === 0 && s[i - 1] === '}') {
        // block arm: optional trailing comma
        let k = i;
        while (k < close && /\s/.test(s[k])) k++;
        if (s[k] === ',') i = k + 1;
        break;
      }
    }
  }
  return arms;
}

function scanNativeObjects(files) {
  const out = [];
  for (const rel of files) {
    const raw = read(rel);
    const s = stripComments(raw);
    const lineOf = lineIndex(raw);
    const implRe = /impl\s+BxNativeObject\s+for\s+(\w+)\s*\{/g;
    for (const m of s.matchAll(implRe)) {
      const open = m.index + m[0].length - 1;
      const close = matchBrace(s, open);
      const body = fnBody(s.slice(0, close), 'call_method', open);
      if (!body) continue;
      const mm = /match\s+[^{;]*?\.as_str\(\)\s*\{/.exec(s.slice(body[0], body[1]));
      if (!mm) continue;
      const mOpen = body[0] + mm.index + mm[0].length - 1;
      const mClose = matchBrace(s, mOpen);
      for (const arm of topLevelArms(s, mOpen, mClose, lineOf)) {
        for (const nm of arm.names) {
          if (nm.startsWith('_')) continue;
          out.push({ object: m[1], method: nm, file: rel, line: arm.line });
        }
      }
    }
    // #[bx_methods] impls
    const bxRe = /#\[bx_methods\]\s*impl\s+(\w+)\s*\{/g;
    for (const m of s.matchAll(bxRe)) {
      const open = m.index + m[0].length - 1;
      const close = matchBrace(s, open);
      const block = s.slice(open + 1, close);
      const fnRe = /\bfn\s+(\w+)\s*\(\s*(&\s*(?:mut\s+)?self)/g;
      for (const f of block.matchAll(fnRe)) {
        let nm = f[1].toLowerCase();
        if (nm.startsWith('bx_')) nm = nm.slice(3);
        if (nm.startsWith('_')) continue;
        out.push({ object: m[1], method: nm, file: rel, line: lineOf(open + 1 + f.index) });
      }
    }
  }
  return out;
}

// ----------------------------------------------------------- compiler intrinsics
function scanIntrinsics() {
  const rel = 'crates/matchbox-compiler/src/compiler/mod.rs';
  const raw = read(rel);
  const lineOf = lineIndex(raw);
  const out = [];
  for (const m of raw.matchAll(/lower_name\s*==\s*"(\w+)"(?:\s*\|\|\s*lower_name\s*==\s*"(\w+)")?/g)) {
    for (const nm of [m[1], m[2]].filter(Boolean)) out.push({ name: nm, file: rel, line: lineOf(m.index) });
  }
  return out;
}


// ------------------------------------------------------------ BoxLang census
/**
 * Enumerate BoxLang's global BIFs from a BoxLang checkout: every class under
 * bifs/global that carries @BoxBIF, named by its alias values or by the class
 * name. Also collects explicit @BoxMember names (used only for letter case).
 */
function scanBoxLang(dir) {
  const root = path.join(dir, 'src/main/java/ortus/boxlang/runtime/bifs/global');
  if (!fs.existsSync(root)) throw new Error(`BoxLang BIF directory not found: ${root}`);
  const files = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.java')) files.push(p);
    }
  })(root);
  const bifs = new Map();
  const members = new Set();
  for (const f of files) {
    const t = fs.readFileSync(f, 'utf8');
    if (!t.includes('@BoxBIF')) continue;
    const cls = path.basename(f, '.java');
    const cat = path.relative(root, f).split(path.sep)[0];
    for (const m of t.matchAll(/@BoxBIF\s*(?:\(([^)]*)\))?/g)) {
      const al = /alias\s*=\s*"([^"]+)"/.exec(m[1] || '');
      const nm = al ? al[1] : cls;
      if (!bifs.has(nm.toLowerCase())) bifs.set(nm.toLowerCase(), { name: nm, category: cat });
    }
    for (const m of t.matchAll(/@BoxMember\s*\(([^)]*)\)/g)) {
      const nm = /name\s*=\s*"([^"]+)"/.exec(m[1]);
      if (nm) members.add(nm[1]);
    }
  }
  return {
    globals: [...bifs.values()].sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1)),
    memberNames: [...members].sort(),
  };
}



// =========================================================== classification
const CATEGORIES = [
  { slug: 'strings', title: 'Strings', icon: 'text-aa', summary: 'String, regular expression and StringBuilder functions.' },
  { slug: 'arrays', title: 'Arrays', icon: 'brackets-square', summary: 'Array functions and array member functions.' },
  { slug: 'structs', title: 'Structs', icon: 'brackets-curly', summary: 'Struct functions and struct member functions.' },
  { slug: 'numbers-and-math', title: 'Numbers and Math', icon: 'calculator', summary: 'Arithmetic, rounding, trigonometry, random numbers, bit operations and number formatting.' },
  { slug: 'dates-and-time', title: 'Dates and Time', icon: 'calendar', summary: 'Date and time creation, parts, arithmetic, formatting and time zones.' },
  { slug: 'lists', title: 'Lists', icon: 'list-bullets', summary: 'Delimited-list functions.' },
  { slug: 'queries-and-datasources', title: 'Queries and Datasources', icon: 'database', summary: 'Query objects, queryExecute, transactions and datasource registration.' },
  { slug: 'types-and-decisions', title: 'Types and Decisions', icon: 'question', summary: 'Type checks, conversions and boolean formatting.' },
  { slug: 'system-and-cli', title: 'System and CLI', icon: 'terminal-window', summary: 'Output, runtime information, process execution, command-line input, Java interop and TUI classes.' },
  { slug: 'files-and-io', title: 'Files and I/O', icon: 'folder-open', summary: 'File, directory and path functions, plus ZIP and archive functions.' },
  { slug: 'data-formats', title: 'JSON, YAML, TOML and XML', icon: 'file-code', summary: 'Serialization and parsing of JSON, YAML, TOML and XML.' },
  { slug: 'encoding-and-crypto', title: 'Encoding and Crypto', icon: 'lock-key', summary: 'Hashing, encryption, Base64, binary encoding and character sets.' },
  { slug: 'async-and-futures', title: 'Async and Futures', icon: 'lightning', summary: 'Futures, executors, threads and locking.' },
  { slug: 'sets', title: 'Sets', icon: 'circles-three', summary: 'Set construction and set member functions.' },
  { slug: 'cache-and-watchers', title: 'Cache and Watchers', icon: 'clock-countdown', summary: 'Cache access and file system watchers.' },
  { slug: 'i18n', title: 'Locales and Currency', icon: 'globe', summary: 'Locale and currency functions.' },
  { slug: 'http', title: 'HTTP and Network', icon: 'cloud-arrow-down', summary: 'HTTP requests, SOAP clients and local host information.' },
  { slug: 'esp32', title: 'ESP32', icon: 'cpu', summary: 'Functions available to programs running on the ESP32 firmware.' },
  { slug: 'objects', title: 'Native Object Methods', icon: 'cube', summary: 'Methods of the objects that built-in functions return.' },
];
const CAT_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));

// Names that do not follow a prefix rule. Keys are lower case.
const CATEGORY_OVERRIDES = {
  // strings
  ascii: 'strings', camelcase: 'strings', char: 'strings', chr: 'strings', compare: 'strings', comparenocase: 'strings',
  find: 'strings', findnocase: 'strings', findoneof: 'strings', indexof: 'strings', insert: 'strings', jsstringformat: 'strings',
  kebabcase: 'strings', lcase: 'strings', left: 'strings', len: 'strings', ljustify: 'strings', ltrim: 'strings', mid: 'strings',
  paragraphformat: 'strings', pascalcase: 'strings', preservesinglequotes: 'strings', reescape: 'strings', refind: 'strings',
  refindnocase: 'strings', rematch: 'strings', rematchnocase: 'strings', removechars: 'strings', repeatstring: 'strings',
  replace: 'strings', replacelist: 'strings', replacenocase: 'strings', rereplace: 'strings', rereplacenocase: 'strings',
  reverse: 'strings', right: 'strings', rjustify: 'strings', rtrim: 'strings', slugify: 'strings', snakecase: 'strings',
  spanexcluding: 'strings', spanincluding: 'strings', stripcr: 'strings', trim: 'strings', ucase: 'strings', ucfirst: 'strings',
  wrap: 'strings', isstringbuilder: 'strings', gettoken: 'lists',
  // numbers
  atan: 'numbers-and-math', atan2: 'numbers-and-math', atn: 'numbers-and-math', precisionevaluate: 'numbers-and-math',
  formatbasen: 'numbers-and-math', inputbasen: 'numbers-and-math', numberformat: 'numbers-and-math', decimalformat: 'numbers-and-math',
  val: 'numbers-and-math', isnumeric: 'types-and-decisions',
  // dates
  dateformat: 'dates-and-time', timeformat: 'dates-and-time', datetimeformat: 'dates-and-time', now: 'dates-and-time',
  toepochmillis: 'dates-and-time', isleapyear: 'dates-and-time', parsedatetime: 'dates-and-time', gettickcount: 'dates-and-time',
  // queries
  sqlprettify: 'queries-and-datasources', isquery: 'types-and-decisions', querystringtostruct: 'structs',
  isintransaction: 'queries-and-datasources', iswithintransaction: 'queries-and-datasources',
  // types
  cast: 'types-and-decisions', nullvalue: 'types-and-decisions', getmetadata: 'types-and-decisions', duplicate: 'types-and-decisions',
  isinstanceof: 'types-and-decisions', tostring: 'types-and-decisions', tonumeric: 'types-and-decisions',
  tomodifiable: 'types-and-decisions', tounmodifiable: 'types-and-decisions', parsenumber: 'types-and-decisions',
  booleanformat: 'types-and-decisions', truefalseformat: 'types-and-decisions', yesnoformat: 'types-and-decisions',
  isbinary: 'types-and-decisions', isnull: 'types-and-decisions', isdefined: 'types-and-decisions', isempty: 'types-and-decisions',
  isvalid: 'types-and-decisions', isdate: 'types-and-decisions', isnumericdate: 'types-and-decisions', isjson: 'data-formats',
  isxml: 'data-formats', isipv6: 'types-and-decisions', islocalhost: 'types-and-decisions',
  // data formats
  serializejson: 'data-formats', deserializejson: 'data-formats', jsonserialize: 'data-formats', jsondeserialize: 'data-formats',
  jsonprettify: 'data-formats', deserializeyaml: 'data-formats', deserializetoml: 'data-formats', toscript: 'data-formats',
  datanavigate: 'data-formats',
  // encoding
  tobase64: 'encoding-and-crypto', tobinary: 'encoding-and-crypto', urlencodedformat: 'encoding-and-crypto',
  charsetdecode: 'encoding-and-crypto', charsetencode: 'encoding-and-crypto', bytesnew: 'encoding-and-crypto',
  bytesget: 'encoding-and-crypto', bytesset: 'encoding-and-crypto', byteslen: 'encoding-and-crypto',
  binarydecode: 'encoding-and-crypto', binaryencode: 'encoding-and-crypto',
  // files
  expandpath: 'files-and-io', contractpath: 'files-and-io', getcanonicalpath: 'files-and-io', getdirectoryfrompath: 'files-and-io',
  getfilefrompath: 'files-and-io', getfileinfo: 'files-and-io', gettempdirectory: 'files-and-io', gettempfile: 'files-and-io',
  loadproperties: 'files-and-io', propertyfile: 'files-and-io', createtempdirectory: 'files-and-io', createtempfile: 'files-and-io',
  extract: 'files-and-io', compress: 'files-and-io', iszipfile: 'files-and-io', isfileobject: 'types-and-decisions',
  // async
  lock: 'async-and-futures', runasync: 'async-and-futures', runthreadincontext: 'async-and-futures', yield: 'async-and-futures',
  asyncallapply: 'async-and-futures', isinthread: 'async-and-futures', isthreadalive: 'async-and-futures',
  isthreadinterrupted: 'async-and-futures',
  // sets
  toset: 'sets', listtoset: 'sets', objecttoset: 'sets', structkeyset: 'sets', structvalueset: 'sets',
  // i18n
  lsnumberformat: 'i18n', lsisnumeric: 'i18n', currencyformat: 'i18n', iscurrency: 'i18n', parsecurrency: 'i18n',
  // http
  http: 'http', soap: 'http', getlocalhostip: 'http',
  // system
  echo: 'system-and-cli', writeoutput: 'system-and-cli', exit: 'system-and-cli', sleep: 'system-and-cli', createguid: 'system-and-cli',
  createuuid: 'system-and-cli', createobject: 'system-and-cli', systemexecute: 'system-and-cli', systemoutput: 'system-and-cli',
  invoke: 'system-and-cli', trace: 'system-and-cli', writelog: 'system-and-cli', datasourceregister: 'queries-and-datasources',
  datasourceunregister: 'queries-and-datasources',
};

// Prefix rules, tried in order after the overrides.
const CATEGORY_PREFIXES = [
  [/^esp32/, 'esp32'],
  [/^stringbuilder/, 'strings'],
  [/^string/, 'strings'],
  [/^array/, 'arrays'],
  [/^struct/, 'structs'],
  [/^list/, 'lists'],
  [/^query/, 'queries-and-datasources'],
  [/^transaction/, 'queries-and-datasources'],
  [/^datasource/, 'queries-and-datasources'],
  [/^(file|directory)/, 'files-and-io'],
  [/^cli/, 'system-and-cli'],
  [/^(future|executor|thread)/, 'async-and-futures'],
  [/^cache/, 'cache-and-watchers'],
  [/^watcher/, 'cache-and-watchers'],
  [/^xml/, 'data-formats'],
  [/^isxml/, 'data-formats'],
  [/^bit/, 'numbers-and-math'],
  [/^(ls|locale|getlocale|setlocale|clearlocale)/, 'i18n'],
  [/^is/, 'types-and-decisions'],
  [/^(rand|round|floor|ceil|int$|fix$|sgn$|sqr$|abs$|min$|max$|exp$|log|sin$|cos$|tan$|asin$|acos$|pi$|incrementvalue|decrementvalue)/, 'numbers-and-math'],
  [/^(date|time|create(date|time|odbc)|day|month|year|hour|minute|second|millisecond|nanosecond|quarter|week|offset|settimezone|gettimezone|cleartimezone|getnumericdate|gettime|firstdayofmonth|monthasstring)/, 'dates-and-time'],
];

// BoxLang category (from the BoxLang source) used when no rule above matched.
const BOXLANG_CATEGORY_MAP = {
  array: 'arrays', async: 'async-and-futures', binary: 'encoding-and-crypto', cache: 'cache-and-watchers', cli: 'system-and-cli',
  conversion: 'types-and-decisions', decision: 'types-and-decisions', encryption: 'encoding-and-crypto', format: 'types-and-decisions',
  i18n: 'i18n', io: 'files-and-io', java: 'system-and-cli', jdbc: 'queries-and-datasources', list: 'lists', math: 'numbers-and-math',
  net: 'http', query: 'queries-and-datasources', scheduler: 'system-and-cli', set: 'sets', stream: 'types-and-decisions',
  string: 'strings', stringbuilder: 'strings', struct: 'structs', system: 'system-and-cli', temporal: 'dates-and-time',
  type: 'types-and-decisions', watcher: 'cache-and-watchers', xml: 'data-formats', zip: 'files-and-io',
};

const FILE_CATEGORY = {
  'set.rs': 'sets', 'cache.rs': 'cache-and-watchers', 'i18n.rs': 'i18n', 'watcher.rs': 'cache-and-watchers', 'xml.rs': 'data-formats',
  'async_runtime.rs': 'async-and-futures', 'binary.rs': 'encoding-and-crypto', 'math_datetime.rs': 'numbers-and-math',
  'type_format.rs': 'types-and-decisions', 'list_query_extra.rs': 'lists', 'net.rs': 'http',
};

function classify(lower, boxlangCategory, file) {
  if (CATEGORY_OVERRIDES[lower]) return CATEGORY_OVERRIDES[lower];
  for (const [re, slug] of CATEGORY_PREFIXES) if (re.test(lower)) return slug;
  if (boxlangCategory && BOXLANG_CATEGORY_MAP[boxlangCategory]) return BOXLANG_CATEGORY_MAP[boxlangCategory];
  const base = file ? file.split('/').pop() : '';
  if (FILE_CATEGORY[base]) return FILE_CATEGORY[base];
  return 'system-and-cli';
}

/** Default category of a member function without a public global target. */
const RECEIVER_CATEGORY = {
  string: 'strings', array: 'arrays', struct: 'structs', number: 'numbers-and-math', datetime: 'dates-and-time',
  future: 'async-and-futures', xml: 'data-formats', boolean: 'types-and-decisions',
};

// Internal helpers: registered as globals only to back the member table.
const isInternalHelper = (lower) => lower.startsWith('boxset') || lower === 'arrayappendmember';

// ========================================================== case recovery
const lowerFirst = (s) => (s ? s[0].toLowerCase() + s.slice(1) : s);

/** BoxLang class names are PascalCase; the docs use camelCase: UCase -> uCase, XMLParse -> xmlParse, HTTP -> http. */
function camelFromPascal(name) {
  const m = /^[A-Z]+/.exec(name);
  if (!m) return name;
  const run = m[0];
  if (run.length === name.length) return name.toLowerCase();
  if (run.length === 1) return name[0].toLowerCase() + name.slice(1);
  return run.slice(0, -1).toLowerCase() + name.slice(run.length - 1);
}

/** snake_case handler name -> camelCase when it spells `lower` (ignoring case). */
function camelFromHandler(handler, lower) {
  const last = handler.split('::').pop();
  const parts = last.split('_').filter(Boolean);
  for (const drop of [0, 1]) {
    // allow a trailing `_bif` suffix to be dropped
    const ps = drop && parts[parts.length - 1] === 'bif' ? parts.slice(0, -1) : parts;
    if (ps.join('') === lower && ps.length > 1) {
      return ps[0] + ps.slice(1).map((p) => p[0].toUpperCase() + p.slice(1)).join('');
    }
  }
  return null;
}

// ================================================================ the model
// Words that do not occur in any function name but appear in native object method names.
const SEED_WORDS = ['get', 'set', 'is', 'to', 'aws', 'id', 'url', 'http', 'ws', 'json', 'text', 'bytes', 'message', 'broadcast', 'ttl', 'seconds', 'header', 'cookie', 'session', 'value', 'route', 'params', 'view', 'render', 'html', 'ajax', 'except', 'only', 'collection', 'private', 'content', 'method', 'identity', 'client', 'context', 'logger', 'log', 'group', 'webhook', 'signature', 'timestamp', 'tolerance', 'replay', 'prefix', 'secret', 'path', 'name', 'state', 'running', 'stopped', 'poll', 'restart', 'shutdown', 'start', 'stop', 'kind', 'relative', 'root', 'watch', 'static', 'files', 'build', 'listen', 'enable', 'websockets', 'use', 'submit', 'operations', 'statistics', 'remaining', 'time', 'millis', 'memory', 'limit', 'mb', 'invoked', 'function', 'version', 'arn', 'stream', 'current', 'row', 'rows', 'column', 'columns', 'meta', 'names', 'cell', 'struct', 'structs', 'array', 'delete', 'insert', 'swap', 'slice', 'sort', 'reverse', 'prepend', 'append', 'clear', 'exists', 'key', 'result', 'count', 'len', 'length', 'size', 'list', 'data', 'contains', 'starts', 'ends', 'with', 'param', 'widget', 'find', 'left', 'right', 'mid', 'trim', 'replace', 'read', 'write', 'line', 'close', 'string', 'run', 'cors'];
const ESP32_REGISTRARS = [
  ['crates/matchbox-esp32-runner/src/hid.rs', 'register_bifs'],
  ['crates/matchbox-esp32-runner/src/wifi.rs', 'register_bifs'],
  ['crates/matchbox-esp32-runner/src/esp32_bifs.rs', 'register_bifs'],
];

const NATIVE_OBJECT_FILES = [
  'crates/matchbox-vm/src/bifs/mod.rs', 'crates/matchbox-vm/src/bifs/fs.rs', 'crates/matchbox-vm/src/bifs/watcher.rs',
  'crates/matchbox-vm/src/bifs/cache.rs', 'crates/matchbox-vm/src/bifs/async_runtime.rs', 'crates/matchbox-vm/src/bifs/net.rs',
  'crates/matchbox-vm/src/datasource/mod.rs', 'crates/matchbox-server/src/app_server.rs', 'crates/matchbox-server/src/websocket.rs',
  'crates/matchbox-lambda-runner/src/lib.rs', 'crates/matchbox-tui/src/widget.rs', 'crates/matchbox-tui/src/lib.rs',
  'crates/matchbox-tui/src/terminal.rs', 'crates/matchbox-tui/src/rendering_context.rs',
];

/** Native object classes: label shown in the docs, the gate and an optional origin. */
const OBJECTS = {
  StringBuilderObject: { label: 'StringBuilder', gate: 'always' },
  FileObject: { label: 'File', gate: 'bif-io' },
  WatcherObject: { label: 'Watcher', gate: 'always' },
  WatcherNameObject: { label: 'WatcherName', gate: 'always' },
  WatcherEventObject: { label: 'WatcherEvent', gate: 'always' },
  CacheObject: { label: 'Cache', gate: 'always' },
  CacheNameObject: { label: 'CacheName', gate: 'always' },
  ExecutorObject: { label: 'Executor', gate: 'always' },
  SoapClient: { label: 'Soap', gate: 'always' },
  BxQuery: { label: 'Query', gate: 'bif-datasource' },
  WebNamespace: { label: 'web', gate: 'server' },
  ServerAppObject: { label: 'ServerApp', gate: 'server' },
  RouteGroupObject: { label: 'RouteGroup', gate: 'server' },
  WebhookBuilderObject: { label: 'WebhookBuilder', gate: 'server' },
  AppMiddlewareNamespaceObject: { label: 'Middleware', gate: 'server' },
  RequestContextObject: { label: 'RequestContext', gate: 'server' },
  NextMiddlewareObject: { label: 'NextMiddleware', gate: 'server' },
  WebSocketChannelObject: { label: 'WebSocketChannel', gate: 'server' },
  LambdaContextObject: { label: 'LambdaContext', gate: 'matchbox-lambda-runner' },
  LambdaLoggerObject: { label: 'LambdaLogger', gate: 'matchbox-lambda-runner' },
  TextWidget: { label: 'tui.Text', gate: 'bif-tui' },
  ButtonWidget: { label: 'tui.Button', gate: 'bif-tui' },
  ListWidget: { label: 'tui.List', gate: 'bif-tui' },
  ProgressBarWidget: { label: 'tui.ProgressBar', gate: 'bif-tui' },
  BlockWidget: { label: 'tui.Block', gate: 'bif-tui' },
  InputWidget: { label: 'tui.Input', gate: 'bif-tui' },
  VBoxWidget: { label: 'tui.VBox', gate: 'bif-tui' },
  HBoxWidget: { label: 'tui.HBox', gate: 'bif-tui' },
  TableWidget: { label: 'tui.Table', gate: 'bif-tui' },
  TUIApp: { label: 'tui.App', gate: 'bif-tui' },
  TUI: { label: 'tui.TUI', gate: 'bif-tui' },
};

function gateText(d) {
  const parts = [...d.features];
  if (d.cfgFlags.includes('matchbox_camera_supported')) parts.push('ESP32-S3 target');
  return parts.length ? parts.join(' + ') : 'always';
}

function buildModel(boxlang) {
  // ---- registrations
  const vmRegs = VM_REGISTRARS.flatMap(([f, n]) => scanRegistrations(f, n));
  // every register_*_bifs function in the bifs directory must be scanned
  const dir = path.join(MB, 'crates/matchbox-vm/src/bifs');
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.rs')).sort()) {
    for (const m of read(`crates/matchbox-vm/src/bifs/${f}`).matchAll(/pub fn (register_\w+_bifs)\s*\(/g)) {
      if (!VM_REGISTRARS.some(([, n]) => n === m[1])) throw new Error(`unscanned registrar ${m[1]} in ${f}; add it to VM_REGISTRARS`);
    }
  }
  const espRegs = ESP32_REGISTRARS.flatMap(([f, n]) => scanRegistrations(f, n));
  const tuiRegs = scanRegistrations('crates/matchbox-tui/src/lib.rs', 'register_classes');
  const prelude = scanPrelude();
  const intrinsics = scanIntrinsics().filter((x) => ['println', 'echo', 'print'].includes(x.name));

  // ---- letter case dictionary
  const blByLower = new Map(boxlang.globals.map((g) => [g.name.toLowerCase(), g]));
  const display = new Map();
  const setDisplay = (lower, name) => { if (!display.has(lower)) display.set(lower, name); };
  for (const r of [...vmRegs, ...espRegs]) if (/[A-Z]/.test(r.key)) setDisplay(r.key.toLowerCase(), r.key);
  for (const p of prelude) setDisplay(p.name.toLowerCase(), p.name);
  for (const g of boxlang.globals) setDisplay(g.name.toLowerCase(), camelFromPascal(g.name));
  for (const r of vmRegs) {
    const c = camelFromHandler(r.handler, r.key.toLowerCase());
    if (c) setDisplay(r.key.toLowerCase(), c);
  }
  for (const r of espRegs) setDisplay(r.key.toLowerCase(), r.key.toLowerCase());
  for (const n of ['lcase', 'ucase', 'ltrim', 'rtrim', 'ljustify', 'rjustify']) display.set(n, n); // the usual all-lowercase spelling
  for (const n of ['serializeJSON', 'deserializeJSON', 'deserializeTOML', 'deserializeYAML']) display.set(n.toLowerCase(), n);
  const disp = (lower) => display.get(lower) ?? lower;

  // ---- global entries keyed by lower-case name
  const globals = new Map();
  const entry = (lower) => {
    if (!globals.has(lower)) globals.set(lower, { lower, defs: [] });
    return globals.get(lower);
  };
  for (const r of vmRegs) {
    const d = describeGate(r.cfgs);
    entry(r.key.toLowerCase()).defs.push({ kind: 'native', file: r.file, line: r.line, gate: gateText(d), features: d.features, notWasm: d.notWasm, flags: d.cfgFlags, crate: 'matchbox_vm' });
  }
  for (const p of prelude) {
    if (p.name.startsWith('_')) continue;
    entry(p.name.toLowerCase()).defs.push({ kind: 'prelude', file: p.file, line: p.line, gate: 'always', features: [], params: p.params, crate: 'matchbox-compiler' });
  }
  for (const x of intrinsics) {
    entry(x.name).defs.push({ kind: 'intrinsic', file: x.file, line: x.line, gate: 'always', features: [], crate: 'matchbox-compiler' });
  }
  for (const r of espRegs) {
    const lower = r.key.toLowerCase();
    const e = entry(lower);
    if (e.defs.some((d) => d.crate === 'matchbox-esp32-runner')) continue; // lower/camel duplicates
    const d = describeGate(r.cfgs);
    const gate = ['matchbox-esp32-runner', ...d.features, ...(d.cfgFlags.length ? ['ESP32-S3 target'] : [])].join(' + ');
    e.defs.push({ kind: 'native', file: r.file, line: r.line, gate, features: d.features, notWasm: true, flags: d.cfgFlags, crate: 'matchbox-esp32-runner' });
  }
  for (const r of tuiRegs) {
    const lower = r.key.toLowerCase();
    setDisplay(lower, r.key);
    entry(lower).defs.push({ kind: 'class', file: r.file, line: r.line, gate: 'bif-tui', features: ['bif-tui'], notWasm: true, crate: 'matchbox_tui' });
  }

  // ---- finalize globals
  const rows = [];
  for (const [lower, e] of [...globals].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    if (isInternalHelper(lower)) continue;
    const order = { intrinsic: 0, prelude: 1, class: 2, native: 3 };
    const defs = [...e.defs].sort((a, b) => order[a.kind] - order[b.kind]);
    const primary = defs[0];
    const free = defs.find((d) => d.gate === 'always') ?? primary;
    const isEsp = defs[0].crate === 'matchbox-esp32-runner';
    const kinds = [...new Set(defs.map((d) => d.kind))];
    const row = {
      name: isEsp ? (display.get(lower) ?? lower) : disp(lower),
      kind: 'global',
      category: isEsp ? 'esp32' : lower.startsWith('tui.') ? 'system-and-cli' : classify(lower, blByLower.get(lower)?.category, primary.file),
      gate: free.gate,
      source: `${primary.file}:${primary.line}`,
      definedIn: kinds.length === 1 ? kinds[0] : kinds.join('+'),
      notes: [],
    };
    if (defs.some((d) => d.kind === 'prelude')) row.params = defs.find((d) => d.kind === 'prelude').params;
    if (free.notWasm && !isEsp) row.notWasm = true;
    row.playground = free.gate === 'always' && !free.notWasm;
    if (kinds.includes('prelude') && kinds.includes('native')) {
      row.notes.push('Defined in the prelude and as a native function; the prelude definition is the one that runs.');
    }
    if (free.notWasm && !isEsp && free.gate === 'always') row.notes.push('Not built for wasm32 targets.');
    rows.push({ ...row, lower });
  }

  // ---- member functions
  const memberTable = scanMemberTable().filter((m) => m.type !== 'js');
  const publicGlobals = new Map(rows.map((r) => [r.lower, r]));
  const caseForMember = new Map();
  for (const n of boxlang.memberNames) caseForMember.set(n.toLowerCase(), n);
  const MEMBER_CASE = { touppercase: 'toUpperCase', tolowercase: 'toLowerCase', toquerystring: 'toQueryString', tosorted: 'toSorted', tomodifiable: 'toModifiable', tounmodifiable: 'toUnmodifiable', toodbcdatetime: 'toOdbcDateTime', toodbcdate: 'toOdbcDate', toodbctime: 'toOdbcTime', toepochmillis: 'toEpochMillis', listgettoken: 'listGetToken' };
  const memberDisplay = (member, target) => {
    const t = display.get(target);
    if (t && t.toLowerCase().endsWith(member)) return lowerFirst(t.slice(t.length - member.length));
    if (MEMBER_CASE[member]) return MEMBER_CASE[member];
    if (caseForMember.has(member)) return camelFromPascal(caseForMember.get(member));
    if (display.has(member)) return lowerFirst(display.get(member));
    return member;
  };
  const members = [];
  for (const m of memberTable.sort((a, b) => (a.type + '.' + a.member < b.type + '.' + b.member ? -1 : 1))) {
    const target = publicGlobals.get(m.target);
    const helper = isInternalHelper(m.target);
    const known = globals.has(m.target);
    let category;
    if (target) category = target.category;
    else if (helper && m.type === 'array') category = publicGlobals.has('array' + m.member) || m.member === 'contains' ? 'arrays' : 'sets';
    else category = RECEIVER_CATEGORY[m.type] ?? 'system-and-cli';
    const notes = [];
    if (!known) notes.push('Handled inside the VM; there is no global function with this name.');
    const vmGate = target ? target.gate : 'always';
    members.push({
      name: memberDisplay(m.member, m.target),
      kind: 'member',
      receiver: m.type,
      category,
      gate: vmGate,
      target: target ? target.name : helper ? '(internal helper)' : m.target,
      targetLower: m.target,
      source: `${m.file}:${m.line}`,
      notes,
      playground: target ? target.playground : known || !helper,
      lower: m.member,
    });
  }

  for (const r of rows) {
    if (r.definedIn === 'prelude' && members.some((m) => m.targetLower === r.lower)) {
      r.notes.push('Member form needs the prelude function kept; see "Prelude functions called as members" on the index page.');
    }
  }

  // ---- native object methods
  const words = new Set(SEED_WORDS);
  const addWords = (s) => { for (const w of s.match(/[A-Z]?[a-z0-9]+|[A-Z]+(?![a-z])/g) ?? []) if (w.length > 1) words.add(w.toLowerCase()); };
  for (const v of display.values()) addWords(v);
  for (const n of boxlang.memberNames) addWords(camelFromPascal(n));
  const segment = (lower) => {
    if (/[_.]/.test(lower)) return lower;
    const best = new Array(lower.length + 1).fill(null);
    best[0] = [];
    for (let i = 1; i <= lower.length; i++) {
      for (let j = 0; j < i; j++) {
        if (best[j] && words.has(lower.slice(j, i))) {
          const cand = [...best[j], lower.slice(j, i)];
          if (!best[i] || cand.length < best[i].length) best[i] = cand;
        }
      }
    }
    const segs = best[lower.length];
    if (!segs) return lower;
    return segs[0] + segs.slice(1).map((w) => w[0].toUpperCase() + w.slice(1)).join('');
  };
  const objRaw = scanNativeObjects(NATIVE_OBJECT_FILES);
  const methods = [];
  const seen = new Set();
  for (const o of objRaw.sort((a, b) => (a.object + '.' + a.method < b.object + '.' + b.method ? -1 : 1))) {
    const info = OBJECTS[o.object];
    if (!info) {
      if (['JavaClassPlaceholder', 'VariablesScopeProxy', 'JniObject', 'MathRng', 'StaticFilesMiddlewareObject', 'NotFoundHandlerObject'].includes(o.object)) continue;
      throw new Error(`native object ${o.object} (${o.file}:${o.line}) is not described in OBJECTS`);
    }
    const key = `${info.label}.${o.method}`;
    if (seen.has(key)) continue;
    seen.add(key);
    methods.push({
      name: segment(o.method),
      kind: 'method',
      receiver: info.label,
      category: 'objects',
      gate: info.gate,
      source: `${o.file}:${o.line}`,
      notes: info.notWasm ? ['Not built for wasm32 targets.'] : [],
      playground: info.gate === 'always' && !info.notWasm,
      lower: o.method,
    });
  }
  return { rows, members, methods, internal: [...globals.keys()].filter(isInternalHelper).sort(), prelude, vmRegs, display };
}


// ======================================================== descriptions/notes
// Short descriptions. Only behaviour that was confirmed by running MatchBox 0.11.0
// belongs here; leave a function out when it was not confirmed. Keys: lower-case
// global name, "receiver.member" for member-only rows, "Object.method" for objects.
const DESCRIPTIONS = {
  "abs": "Returns the absolute value.",
  "array.addall": "Appends all values of another array in place.",
  "array.append": "Appends a value in place and returns the array, so calls can be chained.",
  "array.clear": "Removes all elements in place.",
  "array.delete": "Removes the element equal to the value (not the element at that index) and returns the array.",
  "array.find": "With a callback, returns the first element for which it returns true (the element itself, not its index).",
  "array.has": "Returns true when the array contains the value.",
  "array.isempty": "Returns true when the array has no elements.",
  "array.remove": "Removes the element equal to the value (not the element at that index) and returns the array.",
  "array.removeall": "Removes every element that appears in the other array.",
  "array.retainall": "Keeps only the elements that also appear in the other array.",
  "array.tolist": "Joins the elements into a comma-separated string.",
  "arrayappend": "Adds a value to the end of the array in place.",
  "arrayavg": "Returns the average of the elements.",
  "arraychunk": "Splits the array into arrays of at most the given size.",
  "arrayclear": "Removes all elements in place.",
  "arraycontains": "Returns true when the array contains the value (case-sensitive for strings).",
  "arraycontainsnocase": "Like arrayContains, ignoring case.",
  "arraydelete": "Removes the first matching value in place and returns true.",
  "arraydeleteat": "Removes the element at an index in place and returns it.",
  "arrayeach": "Calls the callback for each element.",
  "arrayevery": "Returns true when the callback is true for every element.",
  "arrayfilter": "Returns the elements for which the callback returns true.",
  "arrayfind": "Returns the 1-based index of the first match, or 0.",
  "arrayfindall": "Returns the indexes of all matches.",
  "arrayfindfirst": "Returns the first element for which the callback returns true.",
  "arrayfindnocase": "Like arrayFind, ignoring case.",
  "arrayfirst": "Returns the first element.",
  "arrayflatmap": "Maps each element to an array and concatenates the results.",
  "arrayflatten": "Flattens nested arrays.",
  "arraygroupby": "Groups elements into a struct by the callback result.",
  "arrayindexexists": "Returns true when the index exists.",
  "arrayinsertat": "Inserts a value at an index in place.",
  "arrayisempty": "Returns true when the array has no elements.",
  "arraylast": "Returns the last element.",
  "arraylen": "Returns the number of elements in an array.",
  "arraymap": "Returns a new array of the callback results.",
  "arraymax": "Returns the largest element.",
  "arraymedian": "Returns the median of the elements.",
  "arraymerge": "Returns an array with the elements of the first array followed by those of the second.",
  "arraymin": "Returns the smallest element.",
  "arraynew": "Creates an empty array.",
  "arraynone": "Returns true when the callback is true for no element.",
  "arraypop": "Removes the last element and returns it.",
  "arrayprepend": "Adds a value to the start of the array in place.",
  "arrayrange": "Returns an array of consecutive integers from start to end.",
  "arrayreduce": "Folds the array into one value: callback( accumulator, element ), initial value.",
  "arrayreduceright": "Like arrayReduce, from the last element to the first.",
  "arrayreject": "Returns the elements for which the callback returns false.",
  "arrayreverse": "Returns a reversed copy and leaves the original unchanged.",
  "arrayshift": "Removes the first element and returns it.",
  "arraysome": "Returns true when the callback is true for at least one element.",
  "arraysort": "Sorts the array in place and returns it. Arguments: array, sort type, sort order.",
  "arraysum": "Returns the sum of the elements.",
  "arrayswap": "Swaps the elements at two indexes in place.",
  "arraytolist": "Joins the elements with a delimiter, comma by default.",
  "arraytostruct": "Converts an array to a struct keyed by 1-based index.",
  "arraytranspose": "Swaps the rows and columns of a two-dimensional array.",
  "arrayunique": "Returns the distinct values, keeping the first occurrence of each.",
  "arrayzip": "Combines two arrays element by element into pairs.",
  "ascii": "Returns the character code of the first character.",
  "asyncallapply": "Applies a function to each element in parallel and returns the results in order.",
  "binarydecode": "Decodes text such as hex into binary data.",
  "binaryencode": "Encodes binary data as text, for example \"hex\".",
  "bitand": "Bitwise AND.",
  "bitnot": "Bitwise NOT.",
  "bitor": "Bitwise OR.",
  "bitshln": "Shifts bits left by n positions.",
  "bitshrn": "Shifts bits right by n positions.",
  "bitxor": "Bitwise XOR.",
  "booleanformat": "Converts a value to the string \"true\" or \"false\".",
  "camelcase": "Converts text to camelCase.",
  "ceiling": "Rounds up to an integer.",
  "chr": "Returns the character for a character code.",
  "compare": "Compares two strings case-sensitively and returns -1, 0 or 1.",
  "comparenocase": "Like compare, ignoring case.",
  "createdate": "Creates a date from year, month and day.",
  "createdatetime": "Creates a date-time. All seven arguments are required: year, month, day, hour, minute, second, millisecond.",
  "createguid": "Creates a random identifier in the form 8-4-4-4-12 hex digits.",
  "createodbcdate": "Returns an ODBC date string such as {d '2024-03-15'}.",
  "createodbcdatetime": "Returns an ODBC timestamp string.",
  "createodbctime": "Returns an ODBC time string.",
  "createuuid": "Creates a random identifier in the form 8-4-4-4-12 hex digits.",
  "currencyformat": "Formats a number as currency; the result is $1,234.50 for 1234.5 in the default locale.",
  "dateadd": "Adds an amount of a date part to a date: dateAdd( part, number, date ).",
  "datecompare": "Returns -1, 0 or 1 when the first date is before, equal to or after the second.",
  "datediff": "Returns the difference between two dates in the given part: dateDiff( part, date1, date2 ).",
  "dateformat": "Formats a date with a pattern such as \"yyyy-MM-dd\". Pattern letters follow Java: \"MM\" is the month and \"mm\" is the minute.",
  "datetimeformat": "Formats a date and time with a Java-style pattern.",
  "day": "Returns the day of the month.",
  "dayofweek": "Returns the day of the week; Sunday is 1.",
  "dayofyear": "Returns the day of the year.",
  "daysinmonth": "Returns the number of days in the month of a date.",
  "daysinyear": "Returns the number of days in the year of a date.",
  "decrementvalue": "Subtracts 1.",
  "decrypt": "Decrypts a value produced by encrypt.",
  "deserializejson": "Parses a JSON string into structs, arrays and simple values.",
  "deserializetoml": "Parses a TOML string into structs, arrays and simple values.",
  "deserializeyaml": "Parses a YAML string into structs, arrays and simple values.",
  "directoryexists": "Returns true when the directory exists.",
  "duplicate": "Returns a deep copy.",
  "encrypt": "Encrypts a string: encrypt( value, key, algorithm, encoding ).",
  "exp": "Returns e raised to a power.",
  "fileexists": "Returns true when the file exists.",
  "fileiseof": "Always fails in this version with the error \"fileIsEOF() is not yet implemented: file handle infrastructure required\".",
  "fileseek": "Always fails in this version with the error \"fileSeek() is not yet implemented: file handle infrastructure required\".",
  "find": "Returns the 1-based position of the first case-sensitive match, or 0.",
  "findnocase": "Like find, ignoring case.",
  "fix": "Removes the fractional part (rounds toward zero).",
  "floor": "Rounds down to an integer.",
  "formatbasen": "Converts a number to a string in the given base.",
  "futureexceptionally": "Handles an error in the future with a function.",
  "futurenew": "Creates a future from a function.",
  "futurethen": "Chains a function onto a future's result.",
  "generatesecretkey": "Generates a key for the given algorithm, for example \"AES\".",
  "getlocale": "Returns the current locale name.",
  "getlocalhostip": "Returns the local IP address as a string, or as an array holding one address when the first argument is true.",
  "getsystemsetting": "Reads an environment variable, with an optional default for when it is not set.",
  "gettickcount": "Returns a millisecond counter that increases with time.",
  "gettoken": "Returns the nth token of a string split on the given delimiters.",
  "hash": "Returns the hash as hex text; MD5 unless an algorithm is given.",
  "hash40": "Returns the SHA-1 hash of a string as hex.",
  "hmac": "Returns the HMAC of a message: hmac( message, key, algorithm ).",
  "hour": "Returns the hour of a date-time.",
  "incrementvalue": "Adds 1.",
  "inputbasen": "Parses a string in the given base.",
  "insert": "Inserts text after the given position: insert( text, string, position ).",
  "isarray": "Returns true for an array.",
  "isboolean": "Returns true for a boolean value.",
  "isclosure": "Returns true for a closure or lambda.",
  "isdate": "Returns true for a date object or a string that parses as a date.",
  "isdefined": "Returns true when a variable with the given name exists.",
  "isempty": "Returns true for an empty string, array or struct.",
  "isjson": "Returns true when the string is valid JSON.",
  "isleapyear": "Returns true for a leap year.",
  "isnumeric": "Returns true for a number or a numeric string.",
  "isquery": "Returns true for a query object.",
  "issimplevalue": "Returns true for a string, number, boolean or date.",
  "isstringbuilder": "Returns true for a StringBuilder object.",
  "isstruct": "Returns true for a struct.",
  "isvalid": "Validates a value against a type such as \"email\" or \"integer\".",
  "isxml": "Returns true for an XML document or a string of well-formed XML.",
  "jsondeserialize": "Parses a JSON string.",
  "jsonprettify": "Reformats a JSON string with indentation.",
  "jsonserialize": "Converts a value to a JSON string.",
  "kebabcase": "Converts text to kebab-case.",
  "lcase": "Converts a string to lower case.",
  "left": "Returns the first n characters.",
  "listappend": "Adds an item at the end and returns the new list.",
  "listavg": "Returns the average of numeric items.",
  "listchangedelims": "Replaces the delimiter.",
  "listdeleteat": "Removes the item at a position and returns the new list.",
  "listevery": "Returns true when the callback is true for every item.",
  "listfilter": "Returns the items for which the callback returns true.",
  "listfind": "Returns the 1-based position of an item (case-sensitive), or 0.",
  "listfindnocase": "Like listFind, ignoring case.",
  "listfirst": "Returns the first item.",
  "listgetat": "Returns the item at a 1-based position.",
  "listinsertat": "Inserts an item at a position and returns the new list.",
  "listlast": "Returns the last item.",
  "listlen": "Returns the number of items; empty items are skipped by default.",
  "listmap": "Returns a list of the callback results.",
  "listnone": "Returns true when the callback is true for no item.",
  "listprepend": "Adds an item at the start and returns the new list.",
  "listqualify": "Wraps each item in a qualifier character.",
  "listreduce": "Folds the items into one value: callback( accumulator, item ), initial value.",
  "listremoveduplicates": "Removes repeated items.",
  "listrest": "Returns the list without its first item.",
  "listsetat": "Replaces the item at a position and returns the new list.",
  "listsome": "Returns true when the callback is true for at least one item.",
  "listsort": "Sorts the items; arguments are list, sort type and sort order.",
  "listtoarray": "Splits a list into an array; empty items are skipped unless the third argument is true.",
  "listtoset": "Creates a set from a list.",
  "listvaluecount": "Counts the items equal to a value.",
  "ljustify": "Pads on the right so the text is left-justified in the given width.",
  "log10": "Returns the base-10 logarithm.",
  "ltrim": "Removes leading whitespace.",
  "max": "Returns the larger of two numbers.",
  "mid": "Returns count characters starting at a 1-based position.",
  "min": "Returns the smaller of two numbers.",
  "minute": "Returns the minute of a date-time.",
  "month": "Returns the month (1 to 12) of a date.",
  "now": "Returns the current date and time.",
  "numberformat": "Formats a number with a mask such as \"9,999.99\".",
  "object.file": "Created by fileOpen.",
  "object.query": "Created by queryNew. The properties recordCount and columnCount are available.",
  "object.soap": "Created by soap. getOperations always returns add, subtract, multiply and divide.",
  "object.stringbuilder": "Created by stringBuilderNew. The append method returns the builder, so calls can be chained.",
  "parsenumber": "Parses a numeric string.",
  "pascalcase": "Converts text to PascalCase.",
  "pi": "Returns pi.",
  "quarter": "Returns the quarter (1 to 4).",
  "queryaddrow": "Adds a row, optionally from a struct.",
  "querycolumnexists": "Returns true when the query has the column.",
  "querycolumnlist": "Returns the column names as a comma-separated list.",
  "querydeleterow": "Removes a row.",
  "querygetcell": "Returns the value of a cell: queryGetCell( query, column, row ).",
  "queryrecordcount": "Returns the number of rows.",
  "queryregisterfunction": "Always fails in this version with the error \"queryRegisterFunction() not supported\".",
  "queryrowdata": "Returns a row as a struct.",
  "querysetcell": "Sets the value of a cell: querySetCell( query, column, value, row ).",
  "querystringtostruct": "Parses a URL query string into a struct.",
  "rand": "Returns a random number from 0 up to, but not including, 1.",
  "randrange": "Returns a random integer between two bounds, inclusive.",
  "refind": "Returns the 1-based position of the first regular expression match, or 0.",
  "rematch": "Returns an array of all regular expression matches.",
  "removechars": "Removes count characters starting at a position.",
  "repeatstring": "Repeats a string count times.",
  "replace": "Replaces the first match; with the scope \"all\" it replaces every match.",
  "replacelist": "Replaces each item of one list with the item at the same position of another list.",
  "replacenocase": "Like replace, ignoring case.",
  "rereplace": "Replaces the first regular expression match; with the scope \"all\" it replaces every match.",
  "reverse": "Reverses a string.",
  "right": "Returns the last n characters.",
  "rjustify": "Pads on the left so the text is right-justified in the given width.",
  "round": "Rounds to the nearest integer, or to the given number of decimals.",
  "rtrim": "Removes trailing whitespace.",
  "runasync": "Runs a function on another thread and returns a future.",
  "second": "Returns the second of a date-time.",
  "serializejson": "Converts a value to a JSON string.",
  "setnew": "Creates a set; the first argument may be a type such as \"linked\" (keeps insertion order).",
  "setof": "Creates a set from its arguments; duplicates are dropped.",
  "sgn": "Returns -1, 0 or 1 for the sign of a number.",
  "sleep": "Pauses the program for the given number of milliseconds.",
  "slugify": "Converts text to a URL slug.",
  "snakecase": "Converts text to snake_case.",
  "soap": "Returns a client object for a WSDL URL. The client only has the methods getOperations and getStatistics, and getOperations always returns add, subtract, multiply and divide whatever the URL.",
  "spanexcluding": "Returns the leading characters that are not in the given set.",
  "spanincluding": "Returns the leading characters that are all in the given set.",
  "sqr": "Returns the square root.",
  "stringbuildernew": "Creates a StringBuilder object; see the StringBuilder methods on the native objects page.",
  "structappend": "Copies the keys of the second struct into the first, in place.",
  "structclear": "Removes all keys.",
  "structcopy": "Returns a shallow copy.",
  "structcount": "Returns the number of keys.",
  "structdelete": "Removes a key.",
  "structequals": "Compares two structs by content.",
  "structevery": "Returns true when the callback is true for every entry.",
  "structfilter": "Returns the entries for which the callback returns true.",
  "structfind": "Returns the value of a key.",
  "structget": "Returns the value of a key.",
  "structinsert": "Adds a key; returns true.",
  "structisempty": "Returns true when the struct has no keys.",
  "structisordered": "Returns true for a struct created with structNew( \"ordered\" ).",
  "structkeyarray": "Returns the keys as an array.",
  "structkeyexists": "Returns true when the key exists.",
  "structkeylist": "Returns the keys as a delimited list, comma by default.",
  "structmap": "Returns a struct of the callback results: callback( key, value ).",
  "structnone": "Returns true when the callback is true for no entry.",
  "structreduce": "Folds the entries into one value: callback( accumulator, key, value ), initial value.",
  "structsome": "Returns true when the callback is true for at least one entry.",
  "structtoquerystring": "Builds a URL query string from the entries.",
  "structupdate": "Sets the value of a key.",
  "structvaluearray": "Returns the values as an array.",
  "systemexecute": "Runs a program and returns a struct with output, error, exitCode, pid, terminated and timeout. It always fails with \"systemExecute() is not supported on this target\" on wasm and ESP32 targets.",
  "timeformat": "Formats the time of a date with a Java-style pattern such as \"HH:mm:ss\".",
  "tobase64": "Encodes a string or binary as Base64.",
  "tobinary": "Decodes a Base64 string to binary.",
  "toepochmillis": "Returns the milliseconds since 1970-01-01T00:00:00Z.",
  "tonumeric": "Converts a value to a number.",
  "toset": "Creates a set from an array.",
  "tostring": "Converts a value to a string.",
  "trim": "Removes leading and trailing whitespace.",
  "ucase": "Converts a string to upper case.",
  "ucfirst": "Upper-cases the first character.",
  "urlencodedformat": "Percent-encodes a string for use in a URL.",
  "val": "Parses the leading number of a string, 0 when there is none.",
  "xmlformat": "Escapes text for use in XML.",
  "xmlparse": "Parses an XML string into an XML document.",
  "year": "Returns the year of a date.",
  "yesnoformat": "Returns \"Yes\" or \"No\"."
};

// Extra notes that come straight from source (key: lower-case global name).
const NOTES = {
  createobject: ['`createObject( "java", class )` needs the `bif-jni` feature; `"rust"` constructs a registered native class.'],
  queryexecute: ['Query of queries (`dbtype: "query"` in the options struct) also needs the `qoq` feature.'],
  http: ['See [HTTP requests](../../http.md).'],
};

// ================================================================ gate info
const GATE_INFO = {
  always: 'Built into every build that includes the VM.',
  'bif-io': 'File, directory and path functions.',
  'bif-crypto': 'Hashing, HMAC, key generation, encryption.',
  'bif-cli': 'Command-line input and exit functions.',
  'bif-http': 'The `http()` function.',
  'bif-zip': 'ZIP and archive functions.',
  'bif-datasource': 'Query objects, `queryExecute` and datasource/transaction functions (PostgreSQL driver).',
  'bif-tui': 'TUI classes (`tui.App`, `tui.Text`, ...), registered by the root crate.',
  server: 'Web server objects (`ServerApp`, `RequestContext`, ...), from the `matchbox_server` crate.',
  'matchbox-lambda-runner': 'Lambda context objects, available inside the AWS Lambda runner.',
  'matchbox-esp32-runner': 'ESP32 firmware functions, available only in programs running on the ESP32 runner.',
  'platform-bluetooth': 'ESP32 runner feature for Bluetooth and printer functions.',
};

function parseFeatures(rel) {
  const text = read(rel);
  const m = /\[features\]([\s\S]*?)(?:\n\[|$)/.exec(text);
  const out = {};
  if (!m) return out;
  const body = m[1].replace(/\\\n/g, ' ');
  for (const f of body.matchAll(/^\s*([A-Za-z0-9_-]+)\s*=\s*\[([^\]]*)\]/gm)) {
    out[f[1]] = [...f[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  }
  return out;
}

function playgroundFeatures() {
  // The docs repo builds the playground from playground-runtime/Cargo.toml.
  const p = path.join(REPO, 'playground-runtime/Cargo.toml');
  if (!fs.existsSync(p)) return { features: [], source: null };
  const line = fs.readFileSync(p, 'utf8').split('\n').find((l) => /^matchbox_vm\s*=/.test(l)) ?? '';
  const feats = /features\s*=\s*\[([^\]]*)\]/.exec(line);
  const noDefault = /default-features\s*=\s*false/.test(line);
  return { features: feats ? [...feats[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : [], noDefault, source: 'playground-runtime/Cargo.toml' };
}

// ====================================================================== build
function mdCell(s) { return s.replace(/\\/g, '\\\\').replace(/\|/g, '\\|'); }
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const ci = (a, b) => cmp(a.toLowerCase(), b.toLowerCase()) || cmp(a, b);

function formFor(row, params, receiver) {
  if (receiver) {
    const rest = params !== undefined ? params.split(',').slice(1).join(',').trim() : null;
    return `${receiver}.${row}( ${rest !== null ? (rest || '') : '...'} )`.replace('(  )', '()');
  }
  return `${row}( ${params !== undefined ? params : '...'} )`.replace('(  )', '()');
}

function assemble(model, boxlang) {
  const { rows, members, methods } = model;
  const byLower = new Map(rows.map((r) => [r.lower, r]));
  const pageRows = new Map(CATEGORIES.map((c) => [c.slug, []]));
  const memberFormsByTarget = new Map();
  const memberOnly = new Map();

  for (const m of members) {
    const target = byLower.get(m.targetLower);
    if (target) {
      if (!memberFormsByTarget.has(m.targetLower)) memberFormsByTarget.set(m.targetLower, []);
      memberFormsByTarget.get(m.targetLower).push(m);
    } else {
      const key = `${m.category}|${m.receiver}|${m.targetLower}`;
      if (!memberOnly.has(key)) memberOnly.set(key, []);
      memberOnly.get(key).push(m);
    }
  }

  for (const r of rows) {
    const forms = [];
    if (r.kind === 'global') {
      if (r.definedIn === 'class') forms.push(`createObject( "rust", "${r.name}" )`);
      else forms.push(formFor(r.name, r.params));
    }
    const ms = memberFormsByTarget.get(r.lower) ?? [];
    for (const m of ms) forms.push(formFor(m.name, r.params, m.receiver));
    const notes = [...r.notes, ...(NOTES[r.lower] ?? [])];
    if (r.definedIn === 'class') notes.unshift('Native class; create it with createObject.');
    pageRows.get(r.category).push({
      sort: '0' + r.name, name: r.name, forms, gate: r.gate, notes, desc: DESCRIPTIONS[r.lower] ?? '', playground: r.playground,
    });
  }
  for (const [key, ms] of memberOnly) {
    const first = ms[0];
    const forms = ms.map((m) => formFor(m.name, undefined, m.receiver));
    const notes = [...new Set(ms.flatMap((m) => m.notes))];
    const desc = ms.map((m) => DESCRIPTIONS[`${m.receiver}.${m.name.toLowerCase()}`]).find(Boolean) ?? '';
    pageRows.get(first.category).push({
      sort: `1${first.receiver}.${first.name}`, name: `${first.receiver}.${first.name}`, forms, gate: first.gate, notes, desc, playground: first.playground,
    });
  }
  for (const rowsOfPage of pageRows.values()) rowsOfPage.sort((a, b) => ci(a.sort, b.sort));
  return pageRows;
}

function renderCategoryPage(cat, rows, order, extra = '') {
  const lines = [];
  lines.push('---');
  lines.push(`title: ${cat.title}`);
  lines.push(`summary: ${cat.summary}`);
  lines.push(`description: ${cat.summary}`);
  lines.push(`icon: phosphor-duotone:${cat.icon}`);
  lines.push(`order: ${order}`);
  lines.push('---');
  lines.push('');
  lines.push(`# ${cat.title}`);
  lines.push('');
  lines.push(`${cat.summary} ${rows.length} entries. This page is generated from the MatchBox source; see the [function reference index](index.md) for how to read the tables and what each gate means.`);
  lines.push('');
  if (extra) { lines.push(extra); lines.push(''); }
  lines.push('| Function | Forms | Gate | Notes |');
  lines.push('| --- | --- | --- | --- |');
  for (const r of rows) {
    const forms = r.forms.map((f) => '`' + f + '`').join(', ');
    const notes = [r.desc, ...r.notes].filter(Boolean).join(' ');
    lines.push(`| \`${mdCell(r.name)}\` | ${mdCell(forms)} | ${r.gate === 'always' ? 'always' : '`' + mdCell(r.gate) + '`'} | ${mdCell(notes)} |`);
  }
  lines.push('');
  return lines.join('\n');
}

function frontmatter(title, summary, icon, order) {
  return ['---', `title: ${title}`, `summary: ${summary}`, `description: ${summary}`, `icon: phosphor-duotone:${icon}`, `order: ${order}`, '---', ''].join('\n');
}

const RECEIVER_LABEL = {
  string: 'string', array: 'array', struct: 'struct', number: 'number', datetime: 'datetime', future: 'future', xml: 'xml', boolean: 'boolean',
};

function renderMembersPage(members, order) {
  const lines = [];
  lines.push(frontmatter('Member Functions', 'Every member function the VM resolves for built-in types, and the function each one calls.', 'arrow-elbow-down-right', order));
  lines.push('# Member functions');
  lines.push('');
  lines.push('A member call such as `"abc".ucase()` or `items.map( fn )` is resolved by a fixed table in the VM (`resolve_member_method`). Each entry maps `(type, member name)` to a function and calls it with the value as the first argument. Names are matched without regard to case. A function that has no entry for a type cannot be called as a member on that type, even when the global function exists.');
  lines.push('');
  lines.push('Struct values also run any function stored under the member name in the struct itself, before the table is consulted. Class instances, native objects and Java objects use their own methods; see [Native object methods](objects.md).');
  lines.push('');
  const types = [...new Set(members.map((m) => m.receiver))].sort(cmp);
  for (const ty of types) {
    const list = members.filter((m) => m.receiver === ty).sort((a, b) => ci(a.name, b.name));
    lines.push(`## ${RECEIVER_LABEL[ty] ?? ty}`);
    lines.push('');
    lines.push(`${list.length} members.`);
    lines.push('');
    lines.push('| Member | Calls | Gate |');
    lines.push('| --- | --- | --- |');
    for (const m of list) {
      const calls = m.target === '(internal helper)' ? 'internal helper' : '`' + m.target + '`';
      lines.push(`| \`${ty}.${m.name}\` | ${calls} | ${m.gate === 'always' ? 'always' : '`' + m.gate + '`'} |`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function renderObjectsPage(methods, order) {
  const lines = [];
  lines.push(frontmatter('Native Object Methods', 'Methods of the objects that built-in functions and the runtimes return.', 'cube', order));
  lines.push('# Native object methods');
  lines.push('');
  lines.push('Some built-in functions return native objects (a query, a file handle, a watcher, ...). These objects have their own methods, listed here by object. Method names are matched without regard to case. Web server, Lambda and TUI objects are only available in those runtimes or builds; the gate is shown for each object.');
  lines.push('');
  const objs = [...new Set(methods.map((m) => m.receiver))].sort(ci);
  for (const o of objs) {
    const list = methods.filter((m) => m.receiver === o).sort((a, b) => ci(a.name, b.name));
    lines.push(`## ${o}`);
    lines.push('');
    const gate = list[0].gate;
    lines.push(`Gate: ${gate === 'always' ? 'always' : '`' + gate + '`'}. ${list.length} ${list.length === 1 ? 'method' : 'methods'}.${list[0].notes.length ? ' ' + list[0].notes.join(' ') : ''}`);
    const d = DESCRIPTIONS['object.' + o.toLowerCase()];
    if (d) lines.push('', d);
    lines.push('');
    lines.push(list.map((m) => '`' + m.name + '`').join(', '));
    lines.push('');
  }
  return lines.join('\n');
}

function renderIndex(ctx) {
  const { counts, pageRows, parity, pageOrder } = ctx;
  const L = [];
  L.push(frontmatter('Function Reference', 'Built-in functions and member functions, grouped by purpose.', 'function', 1));
  L.push('# Function reference');
  L.push('');
  L.push('Explore built-in functions and member methods by topic. These pages are generated from runtime registrations; availability depends on the target and build. For broader language documentation, see [BoxLang](https://boxlang.ortusbooks.com/).');
  L.push('');
  L.push('## How to read the tables');
  L.push('');
  L.push('| Column | Meaning |');
  L.push('| --- | --- |');
  L.push('| Function | The function name. Member-only entries are written `type.name`. |');
  L.push('| Forms | How to call it. `name( ... )` is the global form and `type.name( ... )` is the member form on a value of that type, for example `string.ucase( ... )`. A literal `...` means the argument list is not recorded here. Functions written in BoxLang show their real parameters. |');
  L.push('| Gate | `always`, or the cargo feature or crate that must be enabled for the function to exist. |');
  L.push('| Notes | Behavior notes. Text appears only where it was checked against the source or by running MatchBox. |');
  L.push('');
  L.push('Function names are not case sensitive; the pages show the usual spelling.');
  L.push('');
  L.push('## Pages');
  L.push('');
  L.push('| Page | Entries | Member forms |');
  L.push('| --- | --- | --- |');
  for (const c of CATEGORIES) {
    if (!pageOrder.has(c.slug)) continue;
    const n = counts.byCategory[c.slug] ?? { entries: 0, memberForms: 0 };
    L.push(`| [${c.title}](${c.slug}.md) | ${n.entries} | ${n.memberForms || ''} |`);
  }
  L.push(`| [Member functions](members.md) | ${counts.members} | |`);
  L.push('');
  L.push('## Counts');
  L.push('');
  L.push(`- Global functions: ${counts.publicGlobals}. ${counts.native} are native Rust functions, ${counts.prelude} are written in BoxLang (the prelude), ${counts.both} exist in both, ${counts.intrinsic} are handled by the compiler (println, print and echo; echo also exists as a native function) and ${counts.classes} are TUI class names.`);
  L.push(`- ESP32 firmware functions: ${counts.esp32} (included in the global count above).`);
  L.push(`- Member functions on built-in types: ${counts.members}.`);
  L.push(`- Native object methods: ${counts.methods}.`);
  L.push(`- Internal helper functions that only back the member table (\`boxSet*\`, \`arrayAppendMember\`) are not listed: ${counts.internal}.`);
  L.push('');
  L.push('## Feature gates');
  L.push('');
  L.push('A gate names the build feature or runner a function needs. Features can also be enabled by dependencies; see [source builds](../../getting-started/building-matchbox.md#cargo-features) for custom builds. The browser playground includes only `always` functions.');
  L.push('');
  L.push('Other features change behavior without adding functions:');
  L.push('');
  L.push('- `qoq` (not default): enables query of queries. `queryExecute` with `dbtype: "query"` returns the error "QoQ support is not enabled in this build" without it.');
  L.push('- `bif-jni` (default): `createObject( "java", ... )` creates Java objects. Without it the call fails with "Java interoperability is not enabled in this build."');
  L.push('');
  L.push('## Not available in the browser playground');
  L.push('');
  L.push(`${parity.notInPlayground} of the ${counts.publicGlobals} global functions are not available in the playground build: the gated functions, including the ESP32 functions and the TUI classes. Common examples are \`hash\`, \`encrypt\`, \`fileRead\`, \`directoryList\`, \`http\`, \`queryNew\`, \`queryExecute\`, \`cliRead\` and \`exit\`. Member functions whose target function is gated are unavailable there too, for example \`string.hash( ... )\`.`);
  L.push('');
  L.push('## Prelude functions called as members');
  L.push('');
  L.push('The prelude is the part of the standard library written in BoxLang. Tree-shaking removes unused functions when compiling an application. For dynamically selected functions, use `--keep name` or `--no-shaking` when needed.');
  L.push('');
  L.push('## Regenerating');
  L.push('');
  L.push('```bash');
  L.push('node tools/gen-bif-reference.mjs ../matchbox            # rewrite docs/data/functions.json and these pages');
  L.push('node tools/gen-bif-reference.mjs ../matchbox --check    # exit 1 when the committed files are stale');
  L.push('```');
  L.push('');
  return L.join('\n');
}

function gateInfo(gate, espDefaults) {
  if (GATE_INFO[gate]) return GATE_INFO[gate];
  const parts = gate.split(' + ');
  if (parts[0] === 'matchbox-esp32-runner') {
    const need = [];
    for (const p of parts.slice(1)) {
      if (p === 'platform-bluetooth') need.push(`the \`platform-bluetooth\` feature${espDefaults.includes(p) ? ' (on by default in the runner)' : ''}`);
      else if (p === 'ESP32-S3 target') need.push('a build for the `xtensa-esp32s3-espidf` target');
      else need.push(`the \`${p}\` feature`);
    }
    return 'ESP32 firmware runner' + (need.length ? ', built with ' + need.join(' and ') : '') + '.';
  }
  return parts.map((p) => GATE_INFO[p] ?? p).join(' ');
}

function generate() {
  const version = /^version\s*=\s*"([^"]+)"/m.exec(read('Cargo.toml'))[1];
  const rootFeatures = parseFeatures('Cargo.toml');
  const espFeatures = parseFeatures('crates/matchbox-esp32-runner/Cargo.toml');
  const rootDefault = rootFeatures.default ?? [];
  const playground = playgroundFeatures();

  // BoxLang name list: fresh census or the one stored in the previous output.
  let boxlang;
  if (BOXLANG_DIR) boxlang = scanBoxLang(BOXLANG_DIR);
  else if (fs.existsSync(OUT_DATA)) {
    const prev = JSON.parse(fs.readFileSync(OUT_DATA, 'utf8')).boxlang;
    boxlang = { globals: prev?.globals ?? [], memberNames: prev?.memberNames ?? [] };
  } else boxlang = { globals: [], memberNames: [] };

  const model = buildModel(boxlang);
  const { rows, members, methods } = model;
  const pageRows = assemble(model, boxlang);

  // ---- counts
  const counts = {
    publicGlobals: rows.length,
    native: rows.filter((r) => r.definedIn === 'native').length,
    prelude: rows.filter((r) => r.definedIn === 'prelude').length,
    both: rows.filter((r) => r.definedIn === 'prelude+native').length,
    intrinsic: rows.filter((r) => r.definedIn.includes('intrinsic')).length,
    classes: rows.filter((r) => r.definedIn === 'class').length,
    esp32: rows.filter((r) => r.category === 'esp32').length,
    members: members.length,
    methods: methods.length,
    internal: model.internal.length,
    byCategory: {},
  };
  for (const c of CATEGORIES) {
    const list = pageRows.get(c.slug);
    counts.byCategory[c.slug] = { entries: list.length, memberForms: list.reduce((n, r) => n + r.forms.filter((f) => /^[a-z]+\./.test(f) && !f.startsWith('tui.') && !f.startsWith('esp32')).length, 0) };
  }
  counts.byCategory.objects = { entries: methods.length, memberForms: 0 };

  // ---- gates
  const gateCount = new Map();
  for (const r of rows) gateCount.set(r.gate, { globals: (gateCount.get(r.gate)?.globals ?? 0) + 1, methods: gateCount.get(r.gate)?.methods ?? 0 });
  for (const r of methods) gateCount.set(r.gate, { globals: gateCount.get(r.gate)?.globals ?? 0, methods: (gateCount.get(r.gate)?.methods ?? 0) + 1 });
  const gateRows = [...gateCount].map(([gate, c]) => {
    const parts = gate === 'always' ? [] : gate.split(' + ');
    const featureParts = parts.filter((p) => !['matchbox-esp32-runner', 'matchbox-lambda-runner', 'ESP32-S3 target'].includes(p));
    let inDefault;
    if (gate === 'always') inDefault = 'yes';
    else if (parts[0] === 'matchbox-esp32-runner') inDefault = 'ESP32 runner only';
    else if (parts[0] === 'matchbox-lambda-runner') inDefault = 'Lambda runner only';
    else inDefault = featureParts.every((f) => rootDefault.includes(f)) ? 'yes' : 'no';
    return { gate, globals: c.globals, methods: c.methods, inDefault, inPlayground: gate === 'always' ? 'yes' : 'no', info: gateInfo(gate, espFeatures.default ?? []) };
  }).sort((a, b) => (a.gate === 'always' ? -1 : b.gate === 'always' ? 1 : cmp(a.gate, b.gate)));

  // ---- parity
  const have = new Set([...rows.map((r) => r.lower), ...model.internal]);
  let parity = { defaultFeatures: rootDefault, notInPlayground: rows.filter((r) => !r.playground).length, boxlang: null };
  let boxlangOut = { source: 'BoxLang source tree, runtime/bifs/global, classes annotated with @BoxBIF', globals: boxlang.globals, memberNames: boxlang.memberNames };
  if (boxlang.globals.length) {
    const missing = boxlang.globals.filter((g) => !have.has(g.name.toLowerCase()));
    const cats = new Map();
    for (const g of missing) {
      if (!cats.has(g.category)) cats.set(g.category, []);
      cats.get(g.category).push(g.name);
    }
    for (const v of cats.values()) v.sort(ci);
    parity.boxlang = {
      note: 'in the source tree used for this reference',
      total: boxlang.globals.length,
      have: boxlang.globals.length - missing.length,
      internalMatched: boxlang.globals.filter((g) => model.internal.includes(g.name.toLowerCase())).length,
      missing: missing.map((g) => g.name).sort(ci),
      missingByCategory: [...cats].sort((a, b) => cmp(a[0], b[0])),
    };
    boxlangOut = { ...boxlangOut, total: parity.boxlang.total, matched: parity.boxlang.have, missing: parity.boxlang.missing };
  }

  // ---- pages
  const files = new Map(); // relative path (from repo root) -> text
  const pageOrder = new Map();
  let order = 2;
  for (const c of CATEGORIES) {
    if (c.slug === 'objects') continue;
    pageOrder.set(c.slug, order++);
  }
  const extras = {
    http: 'For the options and result fields of `http()`, see [HTTP requests](../../http.md).',
    esp32: 'These functions exist only in programs running on the ESP32 firmware runner. See the ESP32 build guide for building and flashing.',
  };
  delete extras.esp32; // no verified link target
  for (const c of CATEGORIES) {
    if (c.slug === 'objects') continue;
    files.set(`docs/reference/functions/${c.slug}.md`, renderCategoryPage(c, pageRows.get(c.slug), pageOrder.get(c.slug), extras[c.slug] ?? ''));
  }
  files.set('docs/reference/functions/members.md', renderMembersPage(members, order));
  files.set('docs/reference/functions/objects.md', renderObjectsPage(methods, order + 1));
  pageOrder.set('objects', order + 1);
  const indexText = renderIndex({ counts, pageRows, gateRows, parity, version, playground, pageOrder });
  files.set('docs/reference/functions/index.md', indexText);

  // ---- JSON
  const clean = (x) => {
    const o = { name: x.name, kind: x.kind };
    if (x.receiver) o.receiver = x.receiver;
    o.category = x.category;
    o.gate = x.gate;
    o.playground = x.playground;
    if (x.target) o.target = x.target;
    if (x.definedIn) o.definedIn = x.definedIn;
    if (x.params !== undefined) o.params = x.params;
    o.source = x.source;
    const desc = x.kind === 'global' ? DESCRIPTIONS[x.lower] : x.kind === 'member' ? DESCRIPTIONS[`${x.receiver}.${x.lower}`] : undefined;
    if (desc) o.description = desc;
    const notes = [...x.notes, ...(x.kind === 'global' ? NOTES[x.lower] ?? [] : [])];
    if (notes.length) o.notes = notes;
    return o;
  };
  const fnList = [
    ...rows.map(clean),
    ...members.map(clean),
    ...methods.map(clean),
  ].sort((a, b) => cmp(a.kind, b.kind) || cmp(a.category, b.category) || ci(a.name, b.name) || cmp(a.receiver ?? '', b.receiver ?? ''));
  const head = {
    generator: 'tools/gen-bif-reference.mjs',
    matchbox: { version },
    counts: { ...counts, byCategory: undefined },
    categories: CATEGORIES.map((c) => ({ slug: c.slug, title: c.title, entries: counts.byCategory[c.slug].entries })),
    gates: gateRows,
    internalHelpers: model.internal,
  };
  const body = JSON.stringify(head, null, 2);
  const out = body.slice(0, -2) +
    ',\n  "functions": [\n' + fnList.map((f) => '    ' + JSON.stringify(f)).join(',\n') + '\n  ],\n' +
    '  "boxlang": {\n' +
    `    "source": ${JSON.stringify(boxlangOut.source)},\n` +
    (boxlangOut.total !== undefined ? `    "total": ${boxlangOut.total},\n    "matched": ${boxlangOut.matched},\n    "missing": ${JSON.stringify(boxlangOut.missing)},\n` : '') +
    '    "globals": [\n' + boxlang.globals.map((g) => '      ' + JSON.stringify({ name: g.name, category: g.category })).join(',\n') + '\n    ],\n' +
    `    "memberNames": ${JSON.stringify(boxlang.memberNames)}\n  }\n}\n`;
  files.set('docs/data/functions.json', out);

  for (const [f, text] of files) {
    if (text.includes(String.fromCharCode(0x2014))) throw new Error(`em dash in generated output for ${f}`);
  }
  return files;
}

// ====================================================================== main
const files = generate();
let stale = [];
if (CHECK) {
  for (const [rel, text] of files) {
    const p = path.join(REPO, rel);
    if (!fs.existsSync(p) || fs.readFileSync(p, 'utf8') !== text) stale.push(rel);
  }
  if (fs.existsSync(OUT_DIR)) {
    for (const f of fs.readdirSync(OUT_DIR)) {
      if (!files.has(`docs/reference/functions/${f}`)) stale.push(`docs/reference/functions/${f} (not generated)`);
    }
  }
  if (stale.length) {
    console.error('Function reference is out of date:\n  ' + stale.join('\n  ') + '\nRun: node tools/gen-bif-reference.mjs ' + path.relative(REPO, MB));
    process.exit(1);
  }
  console.log(`Function reference is up to date (${files.size} files).`);
} else {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(OUT_DATA), { recursive: true });
  for (const f of fs.existsSync(OUT_DIR) ? fs.readdirSync(OUT_DIR) : []) {
    if (!files.has(`docs/reference/functions/${f}`)) fs.rmSync(path.join(OUT_DIR, f));
  }
  for (const [rel, text] of files) fs.writeFileSync(path.join(REPO, rel), text);
  console.log(`Wrote ${files.size} files.`);
}
