---
title: Installation
description: Install the MatchBox CLI on Linux, macOS, or Windows and verify your environment.
order: 3
icon: phosphor-duotone:download-simple
---

# Install MatchBox

The official installer offers a release or snapshot and installs the Fat CLI, including embedded runners for supported deployment targets. Running ordinary BoxLang code does not require a JVM.

## Linux and macOS

```sh
curl -sSL https://raw.githubusercontent.com/ortus-boxlang/matchbox/master/install/install.sh | bash
```

## Windows PowerShell

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

## Choose a distribution

| Distribution | Intended use |
| --- | --- |
| Fat CLI (`matchbox`) | Development, compilation, REPL, and bundled target runners. Recommended starting point. |
| Slim CLI (`matchbox-slim`) | Local execution and CI when embedded cross-target stubs are not needed. |
| Server (`matchbox-server`) | Native webroot and routed application-server deployments. |
| Docker | Containerized CLI without installing MatchBox on the host. |

For Docker, see [the Docker guide](../building-and-deploying/docker-image.md). For repeatable builds, choose a pinned version from [GitHub Releases](https://github.com/ortus-boxlang/matchbox/releases) instead of relying on a moving snapshot or `latest` tag.

## Do I need Rust?

Not to run the prebuilt CLI or ordinary standalone applications. Rust is required to [build MatchBox from source](building-matchbox.md) or compile [Native Fusion](../building-and-deploying/native-fusion.md) code. Browser packaging and ESP32 builds have additional target-specific toolchain requirements; see [JavaScript and WebAssembly](../building-and-deploying/javascript-and-wasm.md) and the [ESP32 guide](../building-and-deploying/esp32.md).
