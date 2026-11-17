---
title: Artifacts
description: Declare prebuilt native plugins per target in box.json, bundle shared libraries, and understand the native cache.
icon: phosphor-duotone:package
---

An **artifact** is a prebuilt native plugin for one platform. A module lists its artifacts in `box.json`, under `matchbox.artifacts`, keyed by target triple.

## Declare artifacts

```json
{
    "slug": "bx-stats",
    "type": "boxlang-modules",
    "boxlang": { "moduleName": "stats" },
    "matchbox": {
        "artifacts": {
            "x86_64-unknown-linux-gnu": {
                "path": "lib/x86_64-unknown-linux-gnu/libbx_stats_native.so",
                "sha256": "<64 lowercase hex characters>",
                "abi": 1
            },
            "aarch64-apple-darwin": {
                "path": "lib/aarch64-apple-darwin/libbx_stats_native.dylib",
                "sha256": "<64 lowercase hex characters>",
                "abi": 1
            },
            "x86_64-pc-windows-msvc": {
                "path": "lib/x86_64-pc-windows-msvc/bx_stats_native.dll",
                "sha256": "<64 lowercase hex characters>",
                "abi": 1
            }
        }
    }
}
```

| Key | Description |
| --- | --- |
| `path` | The library's location inside the package. Any folder layout works |
| `url` | Instead of `path`: an HTTPS download, resolved when building. Up to 256 MiB |
| `sha256` | The library's SHA-256, checked before it is loaded |
| `abi` | The plugin ABI major version: `1` |
| `filename` | Optional. The file name to extract it as |
| `libraries` | Optional. Shared libraries the plugin needs. See [below](#bundled-shared-libraries) |

Give exactly one of `path` or `url`.

## Choosing targets

Build one artifact per operating system, CPU and C library you support. Common targets:

| Platform | Target |
| --- | --- |
| Linux x64 (glibc) | `x86_64-unknown-linux-gnu` |
| Linux ARM64 (glibc) | `aarch64-unknown-linux-gnu` |
| macOS Apple silicon | `aarch64-apple-darwin` |
| macOS Intel | `x86_64-apple-darwin` |
| Windows x64 | `x86_64-pc-windows-msvc` |

MatchBox picks the artifact for the platform it is building for. If there is none, it stops with `No native artifact published for <target>`. It never compiles a module's Rust code on the user's machine.

!!! tip "Baselines"
    A target triple does not pin a CPU feature level or a minimum OS or glibc version. Build on the oldest system you support, and avoid CPU features your users may not have.

## Bundled shared libraries

If the plugin links to shared libraries, list them so they ship with it:

```json
"x86_64-unknown-linux-gnu": {
    "path": "lib/linux/libimage.so",
    "sha256": "<hash>",
    "abi": 1,
    "libraries": [
        { "path": "vendor/linux/libcodec.so.2", "sha256": "<hash>" }
    ]
}
```

- Each library has a `path` or an HTTPS `url`, and a `sha256`. A library given by `url` also needs a `filename`.
- Include transitive dependencies too. Order does not matter.
- File names must be unique within the artifact.

All files are verified and extracted together into one folder, so the plugin finds its libraries next to itself:

| OS | How to link |
| --- | --- |
| Linux | Link the plugin **and** each library with `-Wl,-rpath,$ORIGIN`. File names must match the `DT_NEEDED` names |
| macOS | Use `@loader_path` install names, or `@rpath` with loader-relative paths |
| Windows | Nothing extra: the extracted folder is searched |

Libraries without an entry here must already be installed on the user's system.

## The native cache

When a program starts, MatchBox writes the plugin and its libraries to a private cache, verifies every file, then loads it.

- The folder name is a hash of every file name and SHA-256, so a changed library gets a new folder.
- Files are written atomically, so programs starting at the same time do not conflict.
- A modified cache file is rejected, not trusted.
- The default location is the user cache folder, such as `~/.cache/matchbox/native` on Linux. Set `MATCHBOX_NATIVE_CACHE` to choose another.

Native binaries and `.bxb` files carry the plugin bytes inside them. They never download anything at startup.

## Security

!!! danger "Plugins are trusted code"
    A plugin runs as native code with the application's permissions. The SHA-256 proves the bytes match what the author published, not who the author is. Only install plugins from sources you trust.

The cache is private to the user, so other users cannot replace the code. Protecting against a compromised user account is outside this model.

## Where artifacts work

| Target | Native plugins |
| --- | --- |
| `matchbox app.bxs` | Yes |
| `--build` (`.bxb`) | Yes, embedded |
| `--target native` | Yes, embedded |
| Web server | Yes, but only `path` artifacts. Startup is offline |
| WebAssembly, WASI, ESP32 | No |

Linux is tested end to end. macOS and Windows artifacts use the same format.
