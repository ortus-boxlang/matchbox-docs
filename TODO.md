# Documentation follow-ups

## Content maintenance

Keep the guides focused on normal usage and important target differences. Release history belongs in release notes, not repeated version caveats or exhaustive compatibility matrices.

- [ ] Put CLI flags before entry files in the remaining examples, especially ESP32 commands.
- [ ] Add a short end-to-end example of installing and bundling a native module.
- [ ] Refresh generated function signatures and remove obsolete behavior notes.
- [ ] Keep runnable examples checked against the playground and CLI.
- [ ] Add CI checks for native, browser, WASI and ESP32 Fusion builds where toolchains are available.

## Site build

- [ ] Restore custom theme loading: local bxSites ignores `docs/.overrides/bootstrap`, rendering its stock homepage and missing the custom playground layouts. Re-run the site audit and browser UI tests once resolved.

## WASI packaging

- [ ] Ship and verify a WASI runner stub that embeds bytecode without requiring the source checkout or Rust on the user's machine.
- [ ] Test released CLI packaging and execution in Wasmtime, including stdout, arguments, exit codes and filesystem grants.
- [ ] Validate WASI HTTP and container deployment separately before removing their experimental labels.
