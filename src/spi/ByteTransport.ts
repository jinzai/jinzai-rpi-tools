import { EventEmitter } from "node:events";

export interface ByteTransport extends EventEmitter {
  start(): Promise<void>;
  stop(): Promise<void>;
  write?(buf: Buffer): Promise<void>;
}

// Event: "data" -> Buffer
export abstract class ByteTransportBase extends EventEmitter implements ByteTransport {
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
  async write(_buf: Buffer): Promise<void> { /* optional */ }
}
    