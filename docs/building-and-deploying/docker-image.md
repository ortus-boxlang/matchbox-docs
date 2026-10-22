---
title: Docker image
description: Run, build and serve with the MatchBox container image on GitHub Container Registry, for Linux amd64 and arm64.
---

# Docker Image

MatchBox publishes a general-purpose Docker image to GitHub Container Registry:

```bash
ghcr.io/ortus-boxlang/matchbox
```

The image supports Linux `amd64` and `arm64`. CI packages the same full CLI binaries published in GitHub releases using `Dockerfile.release`; the original `Dockerfile` remains available for local source builds.

The image runs the main `matchbox` CLI as its entrypoint. That makes it useful for CI builds, direct script execution, bytecode compilation, native executable generation, and webroot serving without installing MatchBox on the host.

---

## Tags

Stable releases publish:

| Tag | Description |
| :--- | :--- |
| `latest` | Most recent stable release |
| `vX.Y.Z` | Specific release version, matching the Git tag/Cargo version |

Develop snapshots publish:

| Tag | Description |
| :--- | :--- |
| `vX.Y.Z-snapshot` | Refreshed snapshot image for the next base version |
| `develop` | Latest build from the `develop` branch |
| `snapshot` | Rolling snapshot alias |
| `be` | Rolling BE/development image alias |

Pull the stable image:

```bash
docker pull ghcr.io/ortus-boxlang/matchbox:latest
```

Pull the current develop image:

```bash
docker pull ghcr.io/ortus-boxlang/matchbox:develop
```

---

## Basic Usage

The container workdir is `/app`. Mount your project there and pass normal MatchBox arguments:

```bash
docker run --rm -v "$PWD:/app" ghcr.io/ortus-boxlang/matchbox:latest --help
docker run --rm -v "$PWD:/app" ghcr.io/ortus-boxlang/matchbox:latest --version
docker run --rm -v "$PWD:/app" ghcr.io/ortus-boxlang/matchbox:latest my_script.bxs
```

Because `matchbox` is the entrypoint, arguments after the image name are passed directly to MatchBox. Docker selects the matching image architecture automatically; use `--platform linux/amd64` or `--platform linux/arm64` when selecting it explicitly.

Use `--version` or the image's version label to identify a build. See [releases and downloads](../reference/releases.md) for stable and snapshot channels.

---

## Build Artifacts

Compile bytecode into the mounted project directory:

```bash
docker run --rm -v "$PWD:/app" ghcr.io/ortus-boxlang/matchbox:latest --build my_script.bxs
```

Build a native Linux artifact:

```bash
docker run --rm -v "$PWD:/app" ghcr.io/ortus-boxlang/matchbox:latest --target native my_app.bxs
```

Native artifacts produced inside the container target Linux. Use the release binaries or source builds when you need macOS or Windows native artifacts.

The image holds only the CLI binary and CA certificates (see `Dockerfile.release`). It has no Rust toolchain and no `wasm-bindgen`, so `--target js` and Native Fusion builds (a `native/` directory) cannot run inside it. WASI targets are [experimental](wasm-container.md).

---

## Webroot Server

To serve `.bxm` templates and static files, bind the server to `0.0.0.0` inside the container and publish the port:

```bash
docker run --rm \
  -p 8080:8080 \
  -v "$PWD/www:/app" \
  ghcr.io/ortus-boxlang/matchbox:latest \
  --serve --host 0.0.0.0 --port 8080 --webroot /app
```

Then open `http://localhost:8080`.

---

## CI Example

Use the image in a CI job when you only need the MatchBox CLI:

```bash
docker run --rm -v "$PWD:/app" ghcr.io/ortus-boxlang/matchbox:latest --build src/main.bxs
docker run --rm -v "$PWD:/app" ghcr.io/ortus-boxlang/matchbox:latest --target native src/main.bxs
```

For production and repeatable CI, pin a stable version tag or an image digest instead of `latest`. Snapshot tags, including `vX.Y.Z-snapshot`, are mutable and are not immutable build pins.
