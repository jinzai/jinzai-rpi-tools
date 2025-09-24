import { EventEmitter } from "node:events";
export interface PpsSource extends EventEmitter {
  start(): Promise<void>;
  stop(): Promise<void>;
}
// Event: "pps" -> number (seconds, monotonic)
