// Share links and embeds for the playground. Code travels in the URL hash, which browsers never send to a server:
//   #code=<base64url of deflate-raw( UTF-8 source )>&ro=true&name=file.bxs
// No dependencies: CompressionStream is built into current browsers and Node 18+.

export const MAX_ENCODED_LENGTH = 8000;

const toBase64Url = bytes => {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
};

const fromBase64Url = text => {
  const binary = atob(text.replaceAll('-', '+').replaceAll('_', '/'));
  return Uint8Array.from(binary, ch => ch.charCodeAt(0));
};

async function pipe(bytes, stream) {
  const writer = stream.writable.getWriter();
  writer.write(bytes).catch(() => {});
  writer.close().catch(() => {});
  return new Uint8Array(await new Response(stream.readable).arrayBuffer());
}

export async function encodeCode(source) {
  return toBase64Url(await pipe(new TextEncoder().encode(source), new CompressionStream('deflate-raw')));
}

// Returns the source, or null when the text is not something encodeCode produced.
export async function decodeCode(encoded) {
  try {
    if (!encoded || !/^[A-Za-z0-9_-]+$/.test(encoded)) return null;
    const bytes = await pipe(fromBase64Url(encoded), new DecompressionStream('deflate-raw'));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

// "#code=...&ro=true" -> { code: string|null, readOnly: boolean }
export async function parseShareHash(hash) {
  const params = new URLSearchParams(String(hash).replace(/^#/, ''));
  const encoded = params.get('code');
  const name = params.get('name');
  return {
    code: encoded == null ? null : await decodeCode(encoded),
    readOnly: params.get('ro') === 'true',
    present: encoded != null,
    name: name && /^[\w.-]{1,60}$/.test(name) ? name : null,
  };
}

// Absolute URL for a page plus the share hash. Returns null when the code is too large to share by URL.
export async function buildShareUrl(pageUrl, source, { readOnly = false, name = '' } = {}) {
  const encoded = await encodeCode(source);
  if (encoded.length > MAX_ENCODED_LENGTH) return null;
  const url = new URL(pageUrl);
  url.hash = `code=${encoded}${readOnly ? '&ro=true' : ''}${/^[\w.-]{1,60}$/.test(name) ? `&name=${name}` : ''}`;
  return url.href;
}

export const iframeSnippet = (embedUrl, { width = 600, height = 400 } = {}) =>
  `<iframe src="${embedUrl.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}" width="${width}" height="${height}" allow="fullscreen" loading="lazy"></iframe>`;
