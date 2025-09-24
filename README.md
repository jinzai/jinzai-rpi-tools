# jinzai-rpi-tools

Low-level GNSS/RTK toolkit for Raspberry Pi (and Linux) written in TypeScript.
Provides serial I/O, NMEA parsing, and PPS (pulse-per-second) adapters. Designed
to be embedded into apps like **scoutapp** via dependency injection.

## Features

- **Serial transport** wrapper (`SerialPortTransport`) for GNSS receivers.
- **NMEA driver** (`NmeaDriver`) emitting parsed sentences + TPV samples.
- **PPS sources**:
  - `GpioPps` (hardware PPS via `pigpio`)
  - `SimPps` (1 Hz simulator for dev/CI)
- Typed interfaces (`TpvSample`, `NmeaSentence`, `PpsSource`, `ByteTransport`).
- ESM-first build with `.d.ts` types; `prepare` builds on git install.

## Install

> Until this package is published to npm, install from git **by tag** or use a local path during development.

**From git tag (recommended for CI):**
```bash
# SSH
npm i git+ssh://git@github.com/jinzai/jinzai-rpi-tools.git#v0.1.1
# or HTTPS
npm i git+https://github.com/jinzai/jinzai-rpi-tools.git#v0.1.1
