import { haversineDistance } from "./haversineDistance.js";

export function averageLatLon(samples: Array<{ lat: number; lon: number }>): { lat: number; lon: number } {
  if (!samples.length) return { lat: NaN, lon: NaN };
  const s = samples.reduce((a, c) => ({ lat: a.lat + c.lat, lon: a.lon + c.lon }), { lat: 0, lon: 0 });
  return { lat: s.lat / samples.length, lon: s.lon / samples.length };
}

export function maxDeviationMeters(
  center: { lat: number; lon: number },
  samples: Array<{ lat: number; lon: number }>
): number {
  let max = 0;
  for (const p of samples) {
    const d = haversineDistance(center.lat, center.lon, p.lat, p.lon);
    if (d > max) max = d;
  }
  return max;
}
