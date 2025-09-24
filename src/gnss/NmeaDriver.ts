import { EventEmitter } from "node:events";
import type { ByteTransport } from "../spi/ByteTransport.js";
import { parseNmeaLine } from "./nmea.js";
import type { GnssDriver, TpvSample } from "./types.js";

export class NmeaDriver extends EventEmitter implements GnssDriver {
  private buf = ""; private last: Partial<TpvSample> = {};
  constructor(private transport: ByteTransport) { super(); }

  async start() {
    this.transport.on("data", (chunk: Buffer)=> this.onChunk(chunk));
    await this.transport.start();
  }
  async stop() {
    await this.transport.stop();
    this.removeAllListeners();
  }

  private onChunk(chunk: Buffer) {
    this.emit("raw", chunk);
    this.buf += chunk.toString("utf8");
    let idx: number;
    while ((idx = this.buf.indexOf("\n")) >= 0) {
      const line = this.buf.slice(0, idx).trimEnd();
      this.buf = this.buf.slice(idx + 1);
      if (line.startsWith("$")) this.handleNmea(line);
    }
  }

  private handleNmea(line: string) {
    const parsed = parseNmeaLine(line);
    if (!parsed) return;
    this.emit("nmea", parsed);

    const now = Date.now()/1000;
    if (parsed.type === "RMC" && parsed.valid) {
      if (parsed.lat!==undefined) this.last.lat = parsed.lat;
      if (parsed.lon!==undefined) this.last.lon = parsed.lon;
      if (parsed.speedKts!==undefined) this.last.speed = parsed.speedKts*0.514444;
      this.last.ts = now;
    } else if (parsed.type === "GGA") {
      if (parsed.lat!==undefined) this.last.lat = parsed.lat;
      if (parsed.lon!==undefined) this.last.lon = parsed.lon;
      if (parsed.alt!==undefined) this.last.alt = parsed.alt;
      this.last.fix = parsed.fixQ; this.last.ts = now;
    }
    if (this.last.lat!==undefined && this.last.lon!==undefined && this.last.ts!==undefined) {
      const tpv: TpvSample = { ts:this.last.ts!, lat:this.last.lat!, lon:this.last.lon!,
        alt:this.last.alt, speed:this.last.speed, fix:this.last.fix };
      this.emit("tpv", tpv);
    }
  }
}
