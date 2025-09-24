# jinzai-rpi-tools

> Low-level GNSS/RTK toolkit for Raspberry Pi (and Linux) in TypeScript.  
> Provides serial I/O, NMEA parsing, and PPS (pulse-per-second) adapters.  
> Designed to be embedded into apps (e.g. **scoutapp**) via dependency injection.

**Status:** alpha (v0.1.x). API may change.

---

## Features

- **Serial transport** (`SerialPortTransport`) for GNSS receivers.
- **NMEA driver** (`NmeaDriver`) emitting parsed sentences and TPV samples.
- **PPS sources**
  - `GpioPps` — hardware PPS via [`pigpio`](https://github.com/fivdi/pigpio) (root/capabilities required).
  - `SimPps` — 1 Hz software PPS for development/CI.
- Strong TypeScript types, ESM output, `.d.ts` included.
- Built for DI (no singletons).

---

## Requirements

- Node.js **20+**
- Linux; tested on **Raspberry Pi 64-bit** (Bookworm).
- For **`GpioPps`**:
  - `pigpio` native addon (installed via npm)
  - Run as root (or grant GPIO capabilities)
  - Only one process may initialize pigpio at a time (`/var/run/pigpio.pid`)
  - Ensure kernel `dtoverlay=pps-gpio` is **disabled** if using `pigpio`

If you lack hardware PPS or root, use `SimPps`.

---

## Install

Until published to npm, install via **git tag** or **local path**.

### A) From git (recommended for CI)
~~~bash
# SSH
npm i git+ssh://git@github.com/jinzai/jinzai-rpi-tools.git#v0.1.0
# or HTTPS
npm i git+https://github.com/jinzai/jinzai-rpi-tools.git#v0.1.0
~~~
The package builds on install (via `prepare`).

### B) Local path (side-by-side dev)
~~~bash
npm i "file:../jinzai-rpi-tools"
~~~

---

## Quick Start

~~~ts
import {
  SerialPortTransport,
  NmeaDriver,
  GpioPps,    // or SimPps
  SimPps,
  type TpvSample,
  type NmeaSentence
} from "jinzai-rpi-tools";

// Serial GNSS
const transport = new SerialPortTransport("/dev/serial0", 115200);
transport.on("open",  () => console.log("serial open"));
transport.on("error", (e) => console.error("serial error", e));

const gnss = new NmeaDriver(transport);
gnss.on("nmea", (m: NmeaSentence) => {/* per-sentence */});
gnss.on("tpv",  (t: TpvSample)    => {/* lat/lon/alt/speed/fix */});
await gnss.start();

// PPS (hardware)
const pps = new GpioPps(18, { pull: "off", risingOnly: true, glitchUs: 1000, minIntervalMs: 200 });
pps.on("pps", (tsSec) => { /* tsSec is process.hrtime-based seconds */ });
await pps.start();

// PPS (sim)
// const pps = new SimPps(1); pps.on("pps", console.log); await pps.start();
~~~

---

## API Overview

### `SerialPortTransport(device: string, baud: number)`
- Events: `"open" | "close" | "error" | "data"`
- Methods: `start()`, `stop()`, `write(buf)`

### `NmeaDriver(transport: ByteTransport)`
- Emits:
  - `"raw"` → `Buffer` (exact bytes from serial)
  - `"nmea"` → `NmeaSentence` (parsed)
  - `"tpv"` → `TpvSample` (timestamp, lat, lon, alt, speed, fix)
- Methods: `start()`, `stop()`

### `GpioPps(pin: number, opts?: { pull, risingOnly, glitchUs, minIntervalMs })`
- Emits: `"pps"` → `number` (seconds; `process.hrtime` timebase)
- Notes: wrap-aware hold-off; explicit `enableAlert`.

### `SimPps(hz: number)`
- Emits: `"pps"` → `number` every `1/hz` seconds.

### Types
- `TpvSample`, `NmeaSentence`, `PpsSource`, `ByteTransport` exported from package root.

---

## Development

~~~bash
npm i
npm run build
~~~

Conventional commits encouraged.

---

## Versioning & Compatibility

| toolkit (`jinzai-rpi-tools`) | consumer (`scoutapp`) |
|---|---|
| v0.1.x | v0.1.x |

---

## License

MIT © 2025 jinzai
