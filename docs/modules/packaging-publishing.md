---
title: Packaging and Publishing
description: Package a MatchBox module, add native artifacts for each target, and publish it to ForgeBox.
icon: phosphor-duotone:upload-simple
---

A published module is a zip of the module folder. For a pure BoxLang module, that is the source. For a module with a native plugin, the zip also holds one prebuilt library per target, and `box.json` lists them.

## Pure BoxLang modules

There is nothing to build. Zip the folder and publish it:

```text
bx-greeter-1.0.0.zip
  box.json
  ModuleConfig.bx
  bifs/
  components/
  interceptors/
  models/
```

## Modules with a native plugin

Keep the Rust source out of the published package. Users get the compiled libraries only:

```text
bx-stats/                      source repository
  box.json
  ModuleConfig.bx
  bifs/
  native/                      Rust crate: not published
    Cargo.toml
    src/lib.rs
  build/module/                the package you publish
    box.json                   with matchbox.artifacts
    ModuleConfig.bx
    bifs/
    lib/x86_64-unknown-linux-gnu/libbx_stats_native.so
```

!!! tip "Build output is ignored"
    MatchBox skips `build/`, `dist/` and `target/` at the module root when it looks for classes, so generated packages inside your source folder do not interfere when you run it with `--module .`.

### A packaging script

Automate the build, copy and checksum steps. This script builds for the current machine and writes `build/module/`:

```python
#!/usr/bin/env python3
# native/package.py: build the plugin and write build/module with its artifact.
import hashlib, json, shutil, subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[1]
target = next(l.split(": ", 1)[1] for l in subprocess.check_output(["rustc", "-vV"], text=True).splitlines() if l.startswith("host: "))
subprocess.run(["cargo", "build", "--release", "--target", target, "--manifest-path", str(root / "native/Cargo.toml")], check=True)

package = root / "build/module"
shutil.rmtree(package, ignore_errors=True)
package.mkdir(parents=True)
shutil.copy2(root / "ModuleConfig.bx", package)
shutil.copytree(root / "bifs", package / "bifs")

name = "bx_stats_native.dll" if "windows" in target else "libbx_stats_native.dylib" if "apple" in target else "libbx_stats_native.so"
library = Path("lib") / target / name
(package / library).parent.mkdir(parents=True)
shutil.copy2(root / "native/target" / target / "release" / name, package / library)

meta = json.loads((root / "box.json").read_text())
meta.setdefault("matchbox", {}).setdefault("artifacts", {})[target] = {
    "path": library.as_posix(),
    "sha256": hashlib.sha256((package / library).read_bytes()).hexdigest(),
    "abi": 1,
}
(package / "box.json").write_text(json.dumps(meta, indent="\t") + "\n")
print(package)
```

Run it once per target, on that platform or with a cross-compilation toolchain, then merge the artifacts into one `box.json`. CI is a good place for this.

### Test the package

Test the built package, not the source folder, so you test what users get:

```sh
matchbox --module build/module tests/run.bxs
matchbox --module build/module --target native --output run tests/run.bxs && ./run
```

## Publish to ForgeBox

Modules are published on [ForgeBox](https://forgebox.io) like any BoxLang module. Set `type` to `boxlang-modules`, and point `location` at your zip:

```json
{
    "name": "Stats",
    "slug": "bx-stats",
    "version": "1.0.0",
    "type": "boxlang-modules",
    "location": "https://example.com/downloads/bx-stats-1.0.0.zip",
    "boxlang": { "moduleName": "stats" }
}
```

Publish with CommandBox from the package folder:

```sh
box forgebox login
box publish
```

Users then install it with:

```sh
bx-module install bx-stats --local
```

## Versioning

- Version the module with [semantic versioning](https://semver.org). A dual module has **one** version for both backends.
- The plugin ABI is separate from the module version. Bump `abi` only if MatchBox introduces a new ABI major.
- Pin the SDK to a commit (or, once published, a version) in `Cargo.toml`, so rebuilding an old release gives the same plugin.

## Checklist

- [ ] `box.json` has `slug`, `version`, `type: boxlang-modules` and `boxlang.moduleName`.
- [ ] Every supported target has an artifact with the right `sha256` and `abi: 1`.
- [ ] Shared libraries are listed under `libraries`, and linked with a loader-relative path.
- [ ] The package contains no Rust source or `target/` folder.
- [ ] Tests pass with `--module build/module`, interpreted and as a native binary.
- [ ] For a dual module, the same test script passes on the JVM.
