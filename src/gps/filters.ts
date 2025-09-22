import { haversineDistance } from "./haversineDistance.js";

export interface TpvLike { lat: number; lon: number; speed?: number }

export function shouldLogTPV(
  prev: TpvLike | null,
  curr: TpvLike,
  metersThreshold: number,
  minSpeedDelta = 0.2
): boolean {
  if (!prev) return true;
  const dist = haversineDistance(prev.lat, prev.lon, curr.lat, curr.lon);
  const speedDelta = Math.abs((curr.speed ?? 0) - (prev.speed ?? 0));
  return dist >= metersThreshold || speedDelta >= minSpeedDelta;
}
