---
title: Building for ESP32
description: Build and flash MatchBox firmware for ESP32 chips, serve routes from an app directory, and use the ESP32 built-in functions.
---

# Building for ESP32

`matchbox --target esp32` cross-compiles the MatchBox ESP32 runner, flashes it, and writes your application to a flash partition. The standard runner is a small web application server: it starts Wi-Fi, listens for HTTP, and runs BoxLang files in response to requests.

## What the runner executes

The runner executes only two things: the `Application` class (its `onApplicationStart` method) and the route files in the embedded app. It has no loader for a standalone script, so a file that only calls `println` and `sleep` is compiled but the device does not run it.

Routes come from an `app/` directory next to your entry script, not from `web.server()` calls. The entry script is still required on the command line. It is compiled and checked, but the routes are built from the files in `app/`.

```
my-device/
├── main.bxs                  entry script passed to matchbox
├── Application.bx            optional, runs onApplicationStart at boot
├── box.json                  optional build settings
└── app/
    ├── index.bxm             GET /
    ├── status.get.bxs        GET /status
    ├── print.post.bxs        POST /print
    └── printer/
        └── [id].bxm          GET /printer/:id
```

Route rules:

- Only `.bxm` (template) and `.bxs` (script) files under `app/` become routes.
- `index` maps to the directory path. Other names map to a path segment, so `app/about.bxm` is `/about`.
- A method suffix before the extension sets the method: `get`, `post`, `put`, `patch`, `delete`, `head` or `options`. The default is `GET`.
- `[name]` in a file or directory name captures that segment as `name`.
- A route matches when the segment count is equal and each literal segment is equal. If several routes match, the first one in alphabetical path order wins.
- `Application.bx` is found next to the entry script or in `src/main/bx/`.

Each request runs the route file in a shared VM and responds as follows:

| Route file | Response |
| :--- | :--- |
| `.bxm` | The captured output as `text/html; charset=utf-8`. |
| `.bxs` that writes output | The captured output as `text/html; charset=utf-8`. |
| `.bxs` that writes nothing | Its result value serialized as `application/json`. |
| Error while running | `500` with `Embedded route execution failed: <error>`. |
| No route | `404` with `Embedded route not found`. |

Inside a route the scopes are strings only:

| Scope | Contents |
| :--- | :--- |
| `url` | Query parameters, then route parameters (a route parameter overwrites a query parameter of the same name). |
| `form` | Fields of an `application/x-www-form-urlencoded` body. Other body types are not read. |
| `request` | Empty struct. |
| `cgi` | `request_method`, `path_info` and `request_uri`. |

Not available: sessions, cookies, static files, `event.setView()`, `app.listen()`, webhooks and WebSockets. Compile-time checks on the entry script reject `app.listen()`, `event.setView()` / `event.renderTemplate()`, `app.middleware.buildStaticFiles()`, webhook helpers, cookie helpers and session helpers.

## Prerequisites

You need these on the development machine:

1. **Rust ESP32 toolchain**, installed with `espup`:
   ```sh
   cargo install espup
   espup install
   ```
2. **ESP-IDF**, a real checkout activated in your shell. MatchBox builds with `ESP_IDF_TOOLS_INSTALL_DIR=fromenv` so it uses the tools of the activated environment instead of downloading its own.
3. **espflash** for flashing.
4. **ldproxy**, the linker wrapper used by the runner:
   ```sh
   cargo install ldproxy
   ```
5. A C toolchain, Python, CMake and Ninja, as required by ESP-IDF.
6. **A MatchBox source checkout.** A build with `--esp32-web` compiles the runner from `crates/matchbox-esp32-runner` in the source tree the CLI was built from.

Activate ESP-IDF and switch the Rust toolchain in the shell you run MatchBox from:

```sh
source /path/to/esp-idf/export.sh
export RUSTUP_TOOLCHAIN=esp
```

Do not layer other ESP export scripts on top of that shell. Without these variables the runner build fails.

### Check your setup

```sh
matchbox esp32-doctor
```

The command prints `[ok]`, `[warning]` or `[fail]` for each of: `IDF_PATH`, `idf.py`, `RUSTUP_TOOLCHAIN`, `cargo`, `cmake`, `ninja`, `ldproxy`, `espflash`, `LIBCLANG_PATH`, `ESP_IDF_ESPUP_CLANG_SYMLINK`, the bundled `esp32`, `esp32s3` and `esp32c3` stubs, a `.cargo/config.toml` in the current directory that forces an ESP target, and serial devices under `/dev`. It ends with a summary line and exits normally; read the `[fail]` lines.

### WSL users

Attach the USB device to the Linux instance with `usbipd-win`, from a Windows Administrator PowerShell:

```powershell
usbipd list
usbipd attach --busid <BUSID> --auto-attach
```

## Build and flash

```sh
matchbox main.bxs --target esp32 --esp32-web --chip esp32s3 --full-flash
```

| Flag | Meaning |
| :--- | :--- |
| `--target esp32` | Build for ESP32. |
| `--esp32-web` | Build the routed web runner and embed the `app/` routes. Required for the `app/` model. Without it a `web.server()` call in the entry script is rejected at compile time. |
| `--chip <name>` | `esp32`, `esp32s2`, `esp32s3`, `esp32c3`, `esp32c6` or `esp32h2`. `esp32c3`, `esp32c6` and `esp32h2` build for `riscv32imc-esp-espidf`; the others for the matching Xtensa target. Any other value, and an omitted flag, builds for `esp32` while still passing your text to `espflash`, so check the spelling. |
| `--full-flash` | Build the runner, flash the firmware with the project partition table, and write the app. Implies flashing. |
| `--flash` | Fast deploy: skip the firmware build and write only the app to flash. |
| `--watch` | Watch mode, see below. Implies flashing. |
| `--output <file>` | Where to write the firmware ELF. Default: the entry script with an `.elf` extension. |

A `--esp32-web` build always compiles the runner locally with `cargo build --release --no-default-features --features embedded-web` (adding `psram` when enabled). The route table is compiled into that firmware, and the runner falls back to it when the storage partition holds no valid app. Use `--full-flash` for the first flash, after changing chip, `box.json` or MatchBox, and whenever a fast deploy does not change what the device serves.

A fast deploy compiles the routes, then writes a 4-byte little-endian length followed by the serialized route table with `espflash write-bin` and resets the board. Run it from the shell where `espflash` can open the serial port.

### Serial port permissions

On Linux the build can succeed while flashing fails because your user cannot open the serial device (for example `/dev/ttyACM0`):

```sh
groups
sudo usermod -aG dialout $USER
# or the serial group of your distribution, such as uucp
```

Log out and back in before retrying. Do not rerun the whole `matchbox ... --full-flash` command with `sudo`; that repeats the build as root. Build as your user, then flash the ELF with `espflash` (see [Manual flash](#manual-flash)).

## Watch mode

```sh
matchbox main.bxs --target esp32 --esp32-web --chip esp32s3 --watch
```

1. The first deploy is a full flash.
2. The CLI detects the serial port with `espflash board-info`, falling back to `/dev/ttyACM0`, `/dev/ttyUSB0`, `/dev/ttyACM1` or `/dev/ttyUSB1`, and prints the device output by reading the port with `stty` and `cat`.
3. When the entry script file is saved, it stops the reader, recompiles, rediscovers `app/`, fast-deploys (three attempts) and restarts the reader.

Only saves of the entry script itself trigger a redeploy. Saving a file under `app/` does not; touch the entry script afterwards. Watch mode works on Unix-style systems that have `stty` and `cat`.

## Partitions

The project partition table (`crates/matchbox-esp32-runner/partitions.csv`, passed to `espflash`) assumes **8 MB of flash** (`CONFIG_ESPTOOLPY_FLASHSIZE_8MB`).

| Name | Type | Size |
| :--- | :--- | :--- |
| `nvs` | data, nvs | 0x4000 |
| `otadata` | data, ota | 0x2000 |
| `phy_init` | data, phy | 0x1000 |
| `factory` | app | 3 MiB |
| `coredump` | data, coredump | 64 KiB |
| `storage` | data, subtype `0x81` | 0x2F0000 (about 2.9 MiB) |

The runner finds the `storage` partition by subtype, memory-maps it, and reads the app from it. Core dumps are written to flash (`CONFIG_ESP_COREDUMP_ENABLE_TO_FLASH`).

## Runner internals

- The runner starts a FreeRTOS task named `matchbox-runner` with a **24 KiB** stack (`24576` bytes) on core 0. A project with a `native/` directory builds a Native Fusion runner instead, whose VM task has a 48 KiB stack.
- The HTTP server task stack is 6144 bytes. The background fiber thread has 8192 bytes.
- Request handling takes a garbage collection before and after each route.
- Standard BIFs such as `println` write to the serial console.

### HTTP server limits

| Setting | Value |
| :--- | :--- |
| `max_sessions` | 2 |
| `max_open_sockets` | 2 |
| `max_uri_handlers` | 20 |
| Methods routed to your files | `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS` |
| Port | 80 unless `webPort` or `MATCHBOX_ESP32_WEB_PORT` is set at build time |

### Built-in endpoints

These paths are served by the runner and cannot be used by routes:

| Path | Response |
| :--- | :--- |
| `/__matchbox` | HTML page with hostname, IP, features and route count. |
| `/__matchbox/ping` | `pong` as text. |
| `/__matchbox/status` | JSON with `hostname`, `ip`, `features`, `heap`, `diagnostics`, `partitions` and `routes`. |
| `/__matchbox/photo/<id>` | The captured photo with that id (`image/jpeg`), or `404`. |
| `/generate_204`, `/gen_204`, `/hotspot-detect.html`, `/library/test/success.html`, `/connecttest.txt`, `/ncsi.txt` | `302` redirect to `http://192.168.4.1/`, for captive-portal checks when the device runs as an access point. |

## Configuration

### Wi-Fi and port

The runner's own Wi-Fi connection and its HTTP port are fixed when the firmware is built. Provide them in one of two ways:

**`box.json` in the directory where you run `matchbox`:**

```json
{
  "esp32": {
    "board": "xiao-esp32s3-sense",
    "psram": true,
    "webPort": 80,
    "wifi": {
      "ssid": "my-network",
      "password": "my-password",
      "hostname": "my-device"
    }
  }
}
```

**Environment variables** set before running `matchbox`:

| Variable | Equivalent | Meaning |
| :--- | :--- | :--- |
| `MATCHBOX_ESP32_WIFI_SSID` | `wifi.ssid` | Station network name. |
| `MATCHBOX_ESP32_WIFI_PASSWORD` | `wifi.password` | Station password. |
| `MATCHBOX_ESP32_WIFI_HOSTNAME` | `wifi.hostname` | Device hostname. Default `matchbox-esp32`. |
| `MATCHBOX_ESP32_WEB_PORT` | `webPort` | HTTP port. |
| `MATCHBOX_ESP32_BOARD` | `board` | `xiao-esp32s3-sense` selects the XIAO ESP32-S3 Sense PSRAM settings. |
| `MATCHBOX_ESP32_PSRAM` | `psram` | Setting the variable to any value enables PSRAM. |

These values are read when the runner is compiled, so they apply to `--full-flash` builds, not to a fast deploy. `box.json` values are exported by the CLI for that build. Keep real credentials out of version control.

Alternatively connect from BoxLang in `Application.bx`. `onApplicationStart` runs before the runner opens its own connection, and a connection made there is reused:

```
class {
    function onApplicationStart() {
        esp32WifiStation( "my-network", "my-password", "my-device" );
    }
}
```

`application.esp32.wifi.ssid`, `.password`, `.hostname` and `application.esp32.web.port` are filled in before `onApplicationStart` and can be read in routes. Changing them does not reconnect Wi-Fi or move the HTTP port: the runner only prints them to the boot log.

### Features compiled into the runner

| Cargo feature | Provides |
| :--- | :--- |
| `platform-web` | HTTP routing. Enabled by `embedded-web`. |
| `platform-mdns` | mDNS announcement. |
| `platform-bluetooth` | BLE (NimBLE), required by the printer functions. |
| `platform-printer` | Printer helpers, depends on bluetooth. |
| `platform-camera`, `platform-pins`, `platform-sdcard` | Listed in the crate's default set. |
| `psram` | PSRAM support. |

The CLI builds the web runner with `--no-default-features --features embedded-web`, so the BLE and printer functions below are in the firmware only when the runner is built with the `platform-bluetooth` feature, for example by running `cargo build` in the runner crate yourself.

## ESP32 functions

### Wi-Fi

| Function | Returns |
| :--- | :--- |
| `esp32WifiStation( ssid, password, [hostname] )` | Connects as a station. Returns `{ mode: "station", ip }`. |
| `esp32WifiAccessPoint( ssid, [password], [channel=1] )` | Starts an access point. Returns `{ mode: "accessPoint", ip }`. |
| `esp32WifiStatus()` | `{ mode, ip }`, with mode `"off"` and an empty ip when not connected. |

### USB HID

These functions make the board act as a USB keyboard and mouse through the ESP-IDF TinyUSB driver. Calls that need the device install the driver first with the product name `MatchBox HID`; call `esp32RegisterAsHID()` first to choose another name. Commands go through a queue of eight, and each function returns `true` once the command is queued. An error is raised if the driver cannot be installed or the host has not mounted the device.

| Function | Purpose |
| :--- | :--- |
| `esp32RegisterAsHID( [productName] )` | Install the USB HID driver. |
| `esp32USBHidReady()` | `true` when the driver is installed and the host has mounted the device. |
| `esp32USBMouseMove( dx, dy )` | Move the pointer. Each value from -128 to 127. |
| `esp32USBMouseClick( button )` | Press and release. `1` left, `2` right, `3` middle; values 1 to 7 are accepted. |
| `esp32USBMouseDown( button )`, `esp32USBMouseUp( button )` | Hold and release a button. |
| `esp32USBMouseScroll( x, y )` | Scroll. Each value from -128 to 127. |
| `esp32USBKeyboardPress( keycode )`, `esp32USBKeyboardRelease( keycode )` | Press and release a key by USB HID usage code, 0 to 255. |
| `esp32USBKeyboardReleaseAll()` | Release all keys. |

Each name also exists in the spellings `esp32UsbMouseMove` and `esp32usbmousemove`.

### Camera

The camera functions are compiled in only for the `esp32s3` chip, and use the pin presets of the XIAO ESP32-S3 Sense.

| Function | Purpose |
| :--- | :--- |
| `esp32CameraCapture()` | Capture a JPEG and keep it in memory. Returns `{ id, format, imageUrl, bytes, width, height, version }`. |
| `esp32CameraCaptureBitmap()` | Capture and convert to a monochrome bitmap `{ width, height, bytesPerRow, bytes }`. |
| `esp32PhotoInfo( photo )` | The capture struct for a stored photo. |
| `esp32PhotoUrl( photo )` | `/__matchbox/photo/<id>?v=<version>`. |
| `esp32PhotoFree( [photo] )` | Release a stored photo. |
| `esp32BitmapFromJpeg( bytes )` | Convert JPEG bytes to the monochrome bitmap struct. |

`photo` is the struct returned by `esp32CameraCapture()` or its numeric `id`.

### BLE printer

Available only in a runner built with `platform-bluetooth` (see above). The functions send TSPL commands over a BLE characteristic; the default characteristic is `00002af1-0000-1000-8000-00805f9b34fb`.

| Function | Purpose |
| :--- | :--- |
| `esp32BluetoothConnect( options )` | Connect. `options` accepts `address`, `addressType`, `namePrefix`, `characteristicUuid` and `timeoutMs` (default 5000). Returns `{ handleId, deviceName, deviceId, writeMode, characteristicUuid }`. |
| `esp32BluetoothDisconnect( handle )` | Disconnect. |
| `esp32BluetoothWrite( address, characteristicUuid, payload )` | Write bytes or text to a characteristic. |
| `esp32PrintTspl( payload )` | Send TSPL to a printer. |
| `esp32PrintTsplTo( address, payload )` | Send TSPL to a printer at an address. |
| `esp32PrinterPrintTspl( handle, payload )` | Send TSPL over an open connection. |
| `esp32PrintHelloBoxLang()` | Print a test label. |
| `esp32PrinterCaptureBitmap( handle )`, `esp32CaptureAndPrint()`, `esp32CaptureBitmapAndPrintTo( address, ... )` | Capture a camera frame and print it. Also require the camera (`esp32s3`). |

`handle` is the connection struct or its `handleId`.

## Troubleshooting

### Missing `ldproxy`

If the runner build fails with `linker ldproxy not found`:

```sh
cargo install ldproxy
```

### Stale build artifacts

After changing ESP-IDF version, chip or shell environment, remove the runner build output and retry:

```sh
rm -rf crates/matchbox-esp32-runner/target
rm -rf target/esp32_stubs
```

### Manual flash

If the ELF builds but the CLI cannot open the serial device, flash it with `espflash`:

```sh
espflash flash \
  --chip esp32s3 \
  --port /dev/ttyACM0 \
  --partition-table crates/matchbox-esp32-runner/partitions.csv \
  main.elf
```
