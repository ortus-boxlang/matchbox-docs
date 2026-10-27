---
title: ESP32 Camera Streamer
description: An ESP32 example showing BoxLang-to-native BIF registration and serial output.
---

This example shows a BoxLang script calling native Rust functions for `cameraInit()`, `cameraTake()`, and `serialWrite()`. The script sends ten byte arrays over the serial interface.

> [!warning] Camera capture is simulated
> The current Rust implementation does not initialize an ESP32 camera or capture real frames. `cameraInit()` reports simulated success, and `cameraTake()` returns a fixed ten-byte sample. Only `serialWrite()` writes the supplied bytes to UART0.

The example is useful for exploring how a Rust runner can register native BIFs for BoxLang code. It is not a working camera firmware project.

## Build

A `native/` directory next to the entry script makes MatchBox build a Native Fusion runner for the board. That runner executes the compiled script directly instead of serving routes:

```sh
source /path/to/esp-idf/export.sh
export RUSTUP_TOOLCHAIN=esp
matchbox main.bxs --target esp32 --chip esp32s3 --full-flash
```

The native code calls `esp_idf_sys`, so the project needs the ESP toolchain from the [ESP32 guide](../../building-and-deploying/esp32.md). That guide also covers the routed app model and the real camera functions (`esp32CameraCapture()` on `esp32s3`). For a project that serves pages, start from the [regular ESP32 example](../esp32/README.md).
