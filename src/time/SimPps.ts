import { EventEmitter } from "node:events";
import type { PpsSource } from "../spi/PpsSource.js";

export class SimPps extends EventEmitter implements PpsSource {
  private t?: ReturnType<typeof setInterval>;
  constructor(private hz = 1) { super(); }
  async start() { if (!this.t) this.t = setInterval(()=> {
    const s = Number(process.hrtime.bigint())/1e9; this.emit("pps", s);
  }, 1000/this.hz); }
  async stop() { if (this.t) clearInterval(this.t); this.t = undefined; }
}
