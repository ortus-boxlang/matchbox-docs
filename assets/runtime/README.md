# MatchBox playground runtime

`matchbox.js` and `matchbox_bg.wasm` are generated, self-hosted assets. They contain the real MatchBox compiler, VM, and standard-library prelude, with a small persistent-REPL adapter from `playground-runtime/src/lib.rs` in the website repository. No filesystem, network, JavaScript host bridge, or JIT features are enabled.

Source: https://github.com/ortus-boxlang/matchbox/tree/805efbc24a337a17c33392ec550bfd0a40c58ffd

See `BUILD.txt` for build provenance. Regenerate with `bash tools/build-runtime.sh` from the website repository; see its main README for prerequisites and capability limits. Do not hand-edit the generated JavaScript or WASM. Keep both files together when deploying.

MatchBox is developed by Ortus Solutions and its contributors; consult the upstream project for its licensing terms. `THIRD-PARTY-NOTICES.txt` preserves Cargo dependency license texts, including build-time dependencies. `RUST-NOTICES.txt` preserves the Rust standard-library distribution notices, which also list components for targets not used by this WASM build. These notices do not change the licenses of the respective projects.
