#!/usr/bin/env bash
# Optional: normal site builds use the already-committed runtime assets.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ "$(wasm-bindgen --version)" != "wasm-bindgen 0.2.114" ]]; then
  echo 'Install the matching wasm-bindgen-cli: cargo install wasm-bindgen-cli --version 0.2.114 --locked' >&2
  exit 1
fi

export RUSTFLAGS='--cfg getrandom_backend="wasm_js" -C link-arg=--max-memory=134217728'
cargo build --locked --manifest-path playground-runtime/Cargo.toml --target wasm32-unknown-unknown --release
wasm-bindgen --target web --no-typescript --out-name matchbox --out-dir assets/runtime \
  playground-runtime/target/wasm32-unknown-unknown/release/matchbox_playground.wasm
node tools/check-playground.js

# Redistribute dependency license texts with the generated binary.
python3 - <<'PY'
import json
import subprocess
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path

metadata = json.loads(subprocess.check_output([
    'cargo', 'metadata', '--manifest-path', 'playground-runtime/Cargo.toml',
    '--locked', '--format-version', '1', '--filter-platform', 'wasm32-unknown-unknown',
]))
resolved = {node['id'] for node in metadata['resolve']['nodes']}
licenses = defaultdict(list)
for package in metadata['packages']:
    if package['id'] not in resolved or not package['source']:
        continue
    root = Path(package['manifest_path']).parent
    files = sorted(path for path in root.iterdir() if path.is_file() and
                   path.name.lower().startswith(('license', 'copying', 'copyright')))
    if not files:
        raise RuntimeError(f"Review missing license files for {package['name']}")
    for path in files:
        label = f"{package['name']} {package['version']} ({package['license']}) — {path.name}"
        licenses[path.read_text(encoding='utf-8').strip()].append(label)
notices = ['Cargo dependency notices (including build-time dependencies).\nIdentical texts are grouped below.']
for text, packages in licenses.items():
    notices.append('\n'.join(packages) + '\n\n' + text)
Path('assets/runtime/THIRD-PARTY-NOTICES.txt').write_text('\n\n' + ('\n\n' + '=' * 72 + '\n\n').join(notices) + '\n', encoding='utf-8')

class Text(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
    def handle_data(self, data):
        self.parts.append(data)

sysroot = Path(subprocess.check_output(['rustc', '--print', 'sysroot'], text=True).strip())
copyright = sysroot / 'share/doc/rust/COPYRIGHT-library.html'
if not copyright.exists():
    raise RuntimeError('Install standard-library notices: rustup component add rust-docs')
text = Text()
text.feed(copyright.read_text(encoding='utf-8'))
Path('assets/runtime/RUST-NOTICES.txt').write_text(''.join(text.parts), encoding='utf-8')
revision = subprocess.check_output(['git', '-C', '../matchbox', 'describe', '--always', '--dirty'], text=True)
version = subprocess.check_output(['rustc', '--version'], text=True)
Path('assets/runtime/BUILD.txt').write_text(f'MatchBox source: {revision}{version}wasm-bindgen 0.2.114\nRebuild: bash tools/build-runtime.sh\n', encoding='utf-8')
PY
