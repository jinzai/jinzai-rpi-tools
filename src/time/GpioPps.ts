import { EventEmitter } from "node:events";
import { createRequire } from "node:module";
import type { PpsSource } from "../spi/PpsSource.js";

type Pull = "up" | "down" | "off";
export interface GpioPpsOptions {
  glitchUs?: number;       // default 50
  risingOnly?: boolean;    // default true
  minIntervalMs?: number;  // default 200
  pull?: Pull;             // default "down"
}

export class GpioPps extends EventEmitter implements PpsSource {
  private gpio: any | undefined;
  private lastEmitTick: number | undefined;
  private opts: Required<GpioPpsOptions>;

  constructor(private pin: number, opts: GpioPpsOptions = {}) {
    super();
    this.opts = {
      glitchUs: opts.glitchUs ?? 50,
      risingOnly: opts.risingOnly ?? true,
      minIntervalMs: opts.minIntervalMs ?? 200,
      pull: opts.pull ?? "down",
    };
  }

  private onAlert = (level: number, tick: number) => {
    // pigpio 'alert' gives (level, tick[µs since boot], tick wraps every ~71.6 min)
    if (this.opts.risingOnly && level !== 1) return;

    // Hold-off FIRST and be wrap-aware
    const last = this.lastEmitTick;
    if (last !== undefined) {
        const WRAP = 0x100000000; // 2^32
        const dt = tick >= last ? (tick - last) : (tick + WRAP - last); // µs since last emit
        if (dt < this.opts.minIntervalMs * 1000) return;
    }
    this.lastEmitTick = tick;

    // Emit using hrtime seconds (same as SimPps and /status)
    const nowSec = Number(process.hrtime.bigint()) / 1e9;
    this.emit("pps", nowSec);
  };

  async start(): Promise<void> {
        if (this.gpio) return;
        try {
        const req = createRequire(process.cwd() + "/package.json");
        const pigpio = req("pigpio");
        const Gpio = pigpio.Gpio ?? pigpio.default?.Gpio;

        const pullMap = { up: Gpio.PUD_UP, down: Gpio.PUD_DOWN, off: Gpio.PUD_OFF } as const;

        this.gpio = new Gpio(this.pin, {
            mode: Gpio.INPUT,
            pullUpDown: pullMap[this.opts.pull],
            alert: true, // request alert mode
        });

        // Some builds require explicit enable with a boolean
        this.gpio.enableAlert?.(true);

        if (this.opts.glitchUs && this.gpio.glitchFilter) this.gpio.glitchFilter(this.opts.glitchUs);

        this.gpio.on("alert", this.onAlert);
        } catch (e: any) {
        throw new Error(`pigpio not available or failed to init: ${e?.message ?? e}`);
        }
  }

  async stop(): Promise<void> {
        try { this.gpio?.off?.("alert", this.onAlert); } catch {}
        try { this.gpio?.disableAlert?.(); } catch {}
        try { this.gpio?.close?.(); } catch {}
        this.gpio = undefined;
        this.lastEmitTick = undefined;
  }
}
