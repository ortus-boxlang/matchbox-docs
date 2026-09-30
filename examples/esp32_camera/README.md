---
title: ESP32 Camera Streamer
 description: An ESP32 example showing BoxLang-to-native BIF registration and serial output.
---

# ESP32 camera streamer

This example shows a BoxLang script calling native Rust functions for `cameraInit()`, `cameraTake()`, and `serialWrite()`. The script sends ten byte arrays over the serial interface.

> [!warning] Camera capture is simulated
> The current Rust implementation does not initialize an ESP32 camera or capture real frames. `cameraInit()` reports simulated success, and `cameraTake()` returns a fixed ten-byte sample. Only `serialWrite()` writes the supplied bytes to UART0.

The example is useful for exploring how a Rust runner can register native BIFs for BoxLang code. It is not a working camera firmware project. See the [ESP32 guide](../../building-and-deploying/esp32.md) for the supported embedded workflow and the [regular ESP32 example](../esp32/README.md) for a simple flashable script.