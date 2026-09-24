import type { Coord } from '@/mocks/places';

const EARTH_RADIUS_KM = 6371;
// Streets are longer than a straight line; used when there is no routed distance.
const ROAD_FACTOR = 1.05;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export function straightDistanceKm([lngA, latA]: Coord, [lngB, latB]: Coord) {
  const dLat = toRadians(latB - latA);
  const dLng = toRadians(lngB - lngA);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(latA)) * Math.cos(toRadians(latB)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function roadDistanceKm(from: Coord, to: Coord) {
  return straightDistanceKm(from, to) * ROAD_FACTOR;
}
