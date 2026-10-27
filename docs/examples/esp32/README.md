---
title: ESP32 example
description: Flash a small routed web app to an ESP32 board, with route files under app/ and an Application.bx.
---

This example is a small web app for an ESP32 board. The device joins Wi-Fi and serves the files under `app/`.

```
esp32/
├── main.bxs               entry script passed to matchbox
├── Application.bx         runs onApplicationStart at boot
└── app/
    ├── index.bxm          GET /
    ├── hello/[name].bxm   GET /hello/:name
    └── echo.post.bxs      POST /echo
```

The ESP32 runner does not run standalone scripts. It runs `Application.bx` and the route files in `app/`. `main.bxs` is only the entry point for the command line. See [Building for ESP32](../../building-and-deploying/esp32.md) for the full model.

## Run it

1. Connect the board over USB and note its chip (`esp32`, `esp32s3`, `esp32c3`, ...).
2. Activate ESP-IDF and the Rust ESP toolchain in your shell:
   ```sh
   source /path/to/esp-idf/export.sh
   export RUSTUP_TOOLCHAIN=esp
   matchbox esp32-doctor
   ```
3. Set your Wi-Fi network for the build, then build and flash from this directory:
   ```sh
   export MATCHBOX_ESP32_WIFI_SSID="my-network"
   export MATCHBOX_ESP32_WIFI_PASSWORD="my-password"
   matchbox main.bxs --target esp32 --esp32-web --chip esp32s3 --full-flash
   ```
   You can put the same values in a `box.json` in this directory instead; see the guide.
4. Watch the serial output and wait for the line that prints the address of the HTTP server:
   ```sh
   espflash monitor
   ```
5. Open the address in a browser, or use curl:
   ```sh
   curl http://<device-ip>/
   curl http://<device-ip>/hello/ESP32
   curl -d "msg=hi" http://<device-ip>/echo
   curl http://<device-ip>/__matchbox/status
   ```

`/__matchbox/status` is served by the runner and reports heap, partitions and the list of routes, which is a quick way to confirm which app is on the device.

## Change the app

Edit a file under `app/` and run the same command again with `--flash` instead of `--full-flash` to write only the app. If the device keeps serving the old pages, repeat with `--full-flash`.

With `--watch` in place of `--full-flash`, saving `main.bxs` redeploys the app. Saving a file under `app/` does not trigger a redeploy on its own.
