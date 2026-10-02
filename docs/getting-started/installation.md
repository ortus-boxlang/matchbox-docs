---
title: Installation
description: Install the MatchBox CLI on Linux, macOS, or Windows and verify your environment.
order: 3
icon: phosphor-duotone:download-simple
---

# Install MatchBox

MatchBox publishes one full CLI per supported operating system and architecture, with the VM, compiler, REPL, built-in webroot server, and embedded cross-platform runners. Running ordinary BoxLang code does not require a JVM.

## Install with MVM

[MatchBox Version Manager (MVM)](https://github.com/ortus-boxlang/matchbox-quick-installer) installs stable versions side by side and manages a rolling snapshot installation.

### Linux and macOS

```sh
curl -fsSL https://raw.githubusercontent.com/ortus-boxlang/matchbox-quick-installer/main/install/install.sh | bash
```

### Windows PowerShell

```powershell
irm https://raw.githubusercontent.com/ortus-boxlang/matchbox-quick-installer/main/install/install.ps1 | iex
```

Review the installer before executing it, then follow its shell/PATH instructions and open a new terminal if needed.

### Select a MatchBox version

```sh
mvm install latest
mvm use latest
matchbox --version
```

For development builds:

```sh
mvm install snapshot
mvm use snapshot
mvm current
```

Running `mvm install snapshot` again refreshes the installation when its build ID or revision changes. Unchanged builds are skipped unless you pass `--force`. MVM keeps the `snapshot` slot, saves `version.json`, and displays the actual version, build ID, and source revision in version listings and `current`.

MVM verifies the binary's SHA-256 checksum before replacing an installation. A failed verification leaves the existing installation intact. Verification uses Linux `sha256sum`, macOS `shasum`, or Windows PowerShell `Get-FileHash`. Historical releases without `version.json` cannot be newly installed with verified-download MVM.

Use `latest` for the latest stable release, `snapshot` for the rolling development build, or a stable version such as `0.11.0`. Versioned snapshot names are not MVM install selectors. See [releases and downloads](../reference/releases.md) for channels and build identity.

## Direct CLI installation

The direct MatchBox installer prompts for stable or snapshot and installs a single CLI outside MVM's version management. Unlike MVM, these scripts do not currently verify published checksums.

### Linux and macOS

```sh
curl -sSL https://raw.githubusercontent.com/ortus-boxlang/matchbox/master/install/install.sh | bash
```

### Windows PowerShell

```powershell
iex (Invoke-RestMethod -Uri https://raw.githubusercontent.com/ortus-boxlang/matchbox/master/install/install.ps1)
```

These commands download and execute an installer. Review the [shell installer](https://github.com/ortus-boxlang/matchbox/blob/master/install/install.sh) or [PowerShell installer](https://github.com/ortus-boxlang/matchbox/blob/master/install/install.ps1) before running it if you prefer. Follow its PATH instructions and open a new terminal if needed.

## Verify the installation

```sh
matchbox --version
matchbox --help
matchbox
```

The last command starts the REPL. Try `println("Hello from MatchBox!");`, then press `Ctrl+D` to exit.

## Published distributions

| Distribution | Intended use |
| --- | --- |
| Full CLI (`matchbox`) | Development, compilation, REPL, built-in webroot serving, and bundled target runners. |
| Docker | The same released CLI packaged for Linux `amd64` and `arm64`. |

Slim and standalone server binaries are no longer published. Custom build options and the server crate remain available [from source](building-matchbox.md).

| Platform | CLI architectures |
| --- | --- |
| Linux | `x64`, `x86`, `arm64`, `armv7` |
| macOS | `x64`, `arm64` |
| Windows | `x64`, `arm64` |

Manual downloads are individual executables named `matchbox-<os>-<arch>` (`.exe` on Windows), not release archives. Download the appropriate binary from [GitHub Releases](https://github.com/ortus-boxlang/matchbox/releases) or [S3](../reference/releases.md#download-locations), rename it to `matchbox` or `matchbox.exe`, and add its directory to PATH. On Linux/macOS, make it executable with `chmod +x matchbox`. Verify its checksum against the same release's `SHA256SUMS` before running it.

For Docker, see [the Docker guide](../building-and-deploying/docker-image.md). For repeatable builds, pin a stable version or image digest rather than a moving snapshot or `latest` tag.

## Do I need Rust?

Not to run the prebuilt CLI or ordinary standalone applications. Rust is required to [build MatchBox from source](building-matchbox.md) or compile [Native Fusion](../building-and-deploying/native-fusion.md) code. Browser packaging and ESP32 builds have additional target-specific toolchain requirements; see [JavaScript and WebAssembly](../building-and-deploying/javascript-and-wasm.md) and the [ESP32 guide](../building-and-deploying/esp32.md).
