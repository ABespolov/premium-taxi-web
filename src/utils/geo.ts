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

const toDegrees = (radians: number) => (radians * 180) / Math.PI;

// Compass bearing from one point to the next, clockwise from north.
export function bearingDeg([lngA, latA]: Coord, [lngB, latB]: Coord) {
  const dLng = toRadians(lngB - lngA);
  const y = Math.sin(dLng) * Math.cos(toRadians(latB));
  const x =
    Math.cos(toRadians(latA)) * Math.sin(toRadians(latB)) -
    Math.sin(toRadians(latA)) * Math.cos(toRadians(latB)) * Math.cos(dLng);
  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

// The point this far from `from` along a compass bearing.
export function destinationPoint([lng, lat]: Coord, distanceKm: number, bearing: number): Coord {
  const angular = distanceKm / EARTH_RADIUS_KM;
  const heading = toRadians(bearing);
  const latA = toRadians(lat);
  const latB = Math.asin(
    Math.sin(latA) * Math.cos(angular) + Math.cos(latA) * Math.sin(angular) * Math.cos(heading),
  );
  const lngB =
    toRadians(lng) +
    Math.atan2(
      Math.sin(heading) * Math.sin(angular) * Math.cos(latA),
      Math.cos(angular) - Math.sin(latA) * Math.sin(latB),
    );
  return [toDegrees(lngB), toDegrees(latB)];
}
