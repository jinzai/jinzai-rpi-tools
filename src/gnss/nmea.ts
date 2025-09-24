import type { NmeaSentence } from "./types.js";
const HEX = (b:number)=>b.toString(16).toUpperCase().padStart(2,"0");

function checksumOK(line: string): boolean {
  const m = /^\$(.*)\*([0-9A-Fa-f]{2})\s*$/.exec(line); if (!m) return false;
  const body = m[1], want = m[2].toUpperCase(); let cs = 0;
  for (let i=0;i<body.length;i++) cs ^= body.charCodeAt(i);
  return HEX(cs) === want;
}
function dmToDeg(dm: string, hemi: string): number | undefined {
  if (!dm || !hemi) return undefined;
  const f = parseFloat(dm); if (Number.isNaN(f)) return undefined;
  const deg = Math.floor(f/100), min = f - deg*100, sign = (hemi==="S"||hemi==="W")?-1:1;
  return sign*(deg + min/60);
}
export function parseNmeaLine(line: string): NmeaSentence | null {
  if (!line.startsWith("$") || !checksumOK(line)) return null;
  const body = line.slice(1, line.indexOf("*"));
  const parts = body.split(",");
  const talker = parts[0].slice(0,2), id = parts[0].slice(2);
  if (id === "GGA") {
    const lat = dmToDeg(parts[2], parts[3]), lon = dmToDeg(parts[4], parts[5]);
    const fixQ = Number(parts[6]); const sats = Number(parts[7])||undefined;
    const hdop = Number(parts[8])||undefined; const alt = Number(parts[9])||undefined;
    return { type: "GGA", raw: line, lat, lon, sats, hdop, alt, fixQ };
  }
  if (id === "RMC") {
    const valid = parts[2] === "A";
    const lat = dmToDeg(parts[3], parts[4]), lon = dmToDeg(parts[5], parts[6]);
    const speedKts = parts[7] ? Number(parts[7]) : undefined;
    return { type: "RMC", raw: line, lat, lon, speedKts, valid };
  }
  return { type: "OTHER", raw: line, id: talker+id };
}
