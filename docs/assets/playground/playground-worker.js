import init, { Repl } from './runtime/matchbox.js';

let repl;
try {
  await init();
  repl = new Repl();
  postMessage({ type: 'ready' });
} catch (error) {
  postMessage({ type: 'fatal', message: `Could not initialize MatchBox: ${error}` });
}

self.onmessage = ({ data }) => {
  if (!repl || data.type !== 'evaluate' || typeof data.source !== 'string') return;
  try {
    const start = performance.now();
    const result = JSON.parse(repl.evaluate(data.source));
    postMessage({ type: 'result', ...result, elapsed: performance.now() - start });
  } catch (error) {
    // A trapped/aborted WASM instance is not reusable. The page replaces this worker.
    postMessage({ type: 'fatal', message: `The runtime stopped (${error}). The session will be reset.` });
  }
};
