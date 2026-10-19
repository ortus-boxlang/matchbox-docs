// A small BoxLang tokenizer for the playground editor. It returns HTML-escaped markup: one pass, no dependencies.
// Token classes: tk-c comment, tk-s string, tk-i #interpolation# inside a string, tk-n number, tk-k keyword,
// tk-l literal (true/false/null), tk-v scope (this/variables/...), tk-f function call, tk-o operator.

const KEYWORDS = new Set([
  'abstract', 'break', 'case', 'catch', 'class', 'continue', 'default', 'do', 'else', 'extends', 'final', 'finally', 'for', 'function',
  'if', 'implements', 'import', 'in', 'interface', 'new', 'package', 'private', 'property', 'public', 'remote', 'return', 'static',
  'switch', 'throw', 'try', 'var', 'while', 'component', 'required', 'type', 'contains', 'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is', 'not',
  'and', 'or', 'xor', 'mod', 'castas', 'instanceof',
]);
const LITERALS = new Set(['true', 'false', 'null']);
const SCOPES = new Set(['this', 'variables', 'local', 'arguments', 'super', 'request', 'server']);

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
const escape = text => text.replace(/[&<>]/g, ch => ESCAPES[ch]);
const span = (cls, text) => `<span class="${cls}">${escape(text)}</span>`;

const NUMBER = /^(?:0[xX][0-9a-fA-F]+|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/;
const IDENT = /^[A-Za-z_$][\w$]*/;
const OPERATOR = /^(?:=>|->|===|!==|==|!=|<=|>=|&&|\|\||\?\?|\?:|\+\+|--|::|\.\.|[+\-*/%&=<>!?:^|])/;

// A quoted string. BoxLang doubles the quote to escape it, and ## is a literal #.
function stringEnd(source, start) {
  const quote = source[start];
  let i = start + 1;
  while (i < source.length) {
    if (source[i] === quote) {
      if (source[i + 1] === quote) { i += 2; continue; }
      return i + 1;
    }
    i++;
  }
  return source.length;
}

function stringHtml(text) {
  if (text[0] !== '"') return span('tk-s', text);
  let html = '';
  let plain = '';
  let i = 0;
  while (i < text.length) {
    if (text[i] === '#' && text[i + 1] === '#') { plain += '##'; i += 2; continue; }
    if (text[i] === '#') {
      const close = text.indexOf('#', i + 1);
      if (close > i + 1) {
        if (plain) { html += span('tk-s', plain); plain = ''; }
        html += span('tk-i', text.slice(i, close + 1));
        i = close + 1;
        continue;
      }
    }
    plain += text[i++];
  }
  return html + (plain ? span('tk-s', plain) : '');
}

export function highlight(source) {
  let html = '';
  let i = 0;
  while (i < source.length) {
    const c = source[i];
    const d = source[i + 1];
    let rest;
    if (c === '/' && d === '/') {
      const end = source.indexOf('\n', i);
      const stop = end < 0 ? source.length : end;
      html += span('tk-c', source.slice(i, stop));
      i = stop;
    } else if (c === '/' && d === '*') {
      const end = source.indexOf('*/', i + 2);
      const stop = end < 0 ? source.length : end + 2;
      html += span('tk-c', source.slice(i, stop));
      i = stop;
    } else if (c === '"' || c === "'") {
      const stop = stringEnd(source, i);
      html += stringHtml(source.slice(i, stop));
      i = stop;
    } else if ((rest = source.slice(i, i + 40)) && (/\d/.test(c) || (c === '.' && /\d/.test(d || ''))) && NUMBER.test(rest)) {
      const match = rest.match(NUMBER)[0];
      html += span('tk-n', match);
      i += match.length;
    } else if (IDENT.test(source.slice(i, i + 80))) {
      const word = source.slice(i, i + 80).match(IDENT)[0];
      const lower = word.toLowerCase();
      const next = source.slice(i + word.length).match(/^\s*(.)/);
      const afterDot = html.length && source[i - 1] === '.';
      if (LITERALS.has(lower)) html += span('tk-l', word);
      else if (KEYWORDS.has(lower) && !afterDot) html += span('tk-k', word);
      else if (SCOPES.has(lower) && !afterDot) html += span('tk-v', word);
      else if (next && next[1] === '(') html += span('tk-f', word);
      else html += escape(word);
      i += word.length;
    } else if (OPERATOR.test(source.slice(i, i + 3))) {
      const op = source.slice(i, i + 3).match(OPERATOR)[0];
      html += span('tk-o', op);
      i += op.length;
    } else {
      html += escape(c);
      i++;
    }
  }
  return html;
}
