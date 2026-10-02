---
title: Releases and Downloads
description: Stable releases, next-version snapshots, download channels, and verified build metadata.
order: 2
icon: phosphor-duotone:package
---

# Releases and downloads

MatchBox publishes eight full CLI binaries and a Linux multiarchitecture Docker image. See [installation](../getting-started/installation.md) for supported platforms and MVM commands, or [Docker](../building-and-deploying/docker-image.md) for image usage.

## Stable and snapshot versions

The root `Cargo.toml` holds the base version. A push to `master` releases that version, creates a stable Git tag such as `v0.11.0`, and finalizes the changelog. Stable tags are never overwritten.

After publication succeeds, CI commits the finalized changelog to `master`, advances `develop` to the next minor version, and dispatches its snapshot build. For example, releasing `0.11.0` advances development to `0.12.0`.

| Build | GitHub release tag | Build identity example |
| --- | --- | --- |
| Stable | `v0.11.0` | `0.11.0+42` |
| Development snapshot | `snapshot` | `0.12.0-snapshot+133` |

The `+<build-number>` suffix identifies the CI build. The CLI's `--version` output also reports its source commit and build date. GitHub release titles and Docker image version labels include the build number; Git tags and Docker tags omit it.

## Download locations

[GitHub Releases](https://github.com/ortus-boxlang/matchbox/releases) and S3 publish the same platform filenames, plus `version.json` and `SHA256SUMS`.

S3 download directories are:

```text
https://downloads.ortussolutions.com/ortussolutions/matchbox/<version>/
https://downloads.ortussolutions.com/ortussolutions/matchbox/latest/
https://downloads.ortussolutions.com/ortussolutions/matchbox/snapshot/
```

Examples for Linux x64:

```text
https://downloads.ortussolutions.com/ortussolutions/matchbox/0.11.0/matchbox-linux-x64
https://downloads.ortussolutions.com/ortussolutions/matchbox/latest/matchbox-linux-x64
https://downloads.ortussolutions.com/ortussolutions/matchbox/snapshot/matchbox-linux-x64
https://downloads.ortussolutions.com/ortussolutions/matchbox/0.12.0-snapshot/matchbox-linux-x64
```

Stable version directories are immutable. The `latest` and `snapshot` channels, rolling GitHub snapshot assets, and version-keyed snapshot directories are refreshed. A path such as `0.12.0-snapshot/` is **not** an immutable build pin, and the build number is not a separate download directory. Use a stable version or Docker image digest for reproducible deployments.

## Metadata and verification

`version.json` records the base version, full build version, build ID, source revision, channel, release tag, and SHA-256 checksum for each binary. `SHA256SUMS` covers all eight binaries and `version.json`.

Download metadata/checksums from the same release or directory as the executable and verify the checksum before executing it. Linux `sha256sum`, macOS `shasum -a 256`, and Windows PowerShell `Get-FileHash -Algorithm SHA256` can calculate the binary's digest.

[MVM](../getting-started/installation.md#install-with-mvm) uses these checksums before replacing installations and compares build identity to refresh changed snapshots. It retains one rolling `snapshot` slot, not an archive of every historical snapshot build.

## Published artifacts versus source capabilities

Slim and standalone server executables are no longer published. Their source and custom build options remain available. Browser JavaScript/WASM distribution is deferred; this does not remove local browser packaging or other deployment targets. ESP32 runner publication remains disabled pending toolchain/dependency fixes; see [the ESP32 guide](../building-and-deploying/esp32.md) for local builds.
