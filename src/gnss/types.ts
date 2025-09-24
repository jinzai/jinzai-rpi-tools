import { EventEmitter } from "node:events";
export type TpvSample = { ts:number; lat:number; lon:number; alt?:number; speed?:number; fix?:number };
export type NmeaSentence =
  | { type: "GGA"; raw: string; lat?: number; lon?: number; sats?: number; hdop?: number; alt?: number; fixQ?: number }
  | { type: "RMC"; raw: string; lat?: number; lon?: number; speedKts?: number; valid: boolean }
  | { type: "OTHER"; raw: string; id: string };

export interface GnssDriver extends EventEmitter {
  start(): Promise<void>;
  stop(): Promise<void>;
  // Events: "raw" -> Buffer, "nmea" -> NmeaSentence, "tpv" -> TpvSample
}
