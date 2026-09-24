import { forwardSearch, reverseSearch } from '@/api/mapbox';
import {
  type Coord,
  currentLocation,
  knownPlaces,
  type Place,
  recentPlaces,
  savedPlaces,
} from '@/mocks/places';
import { straightDistanceKm } from '@/utils/geo';

// A pinned point this close to a known place snaps to it rather than to a street address.
const SNAP_RADIUS_KM = 0.08;
const MAX_RESULTS = 8;

const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{M}/gu, '').replace(/[’']/g, '').toLowerCase();

export function getCurrentLocation() {
  return currentLocation;
}

export function getSavedPlaces() {
  return savedPlaces;
}

// Answers at once from the places the demo knows; recents when nothing is typed.
export function searchKnownPlaces(query: string): readonly Place[] {
  const needle = normalize(query.trim());
  if (!needle) return recentPlaces;
  return knownPlaces.filter(
    (place) =>
      place.kind !== 'recent' &&
      (normalize(place.name).includes(needle) || normalize(place.address).includes(needle)),
  );
}

// Adds Mapbox results the known places do not already cover.
export async function searchMorePlaces(query: string, near: Coord) {
  if (!query.trim()) return [];
  const knownNames = new Set(searchKnownPlaces(query).map((place) => normalize(place.name)));
  const remote = await forwardSearch(query, near);
  return remote.filter((place) => !knownNames.has(normalize(place.name)));
}

export function mergeResults(known: readonly Place[], more: readonly Place[]) {
  return [...known, ...more].slice(0, MAX_RESULTS);
}

// What a pin can be named without asking Mapbox: a known place close by, or its coordinates.
export function placeNear(coord: Coord): Place {
  const nearest = knownPlaces
    .map((place) => ({ place, distanceKm: straightDistanceKm(place.coord, coord) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)[0];
  if (nearest && nearest.distanceKm < SNAP_RADIUS_KM) return { ...nearest.place, coord };
  return {
    id: `pin-${coord[0].toFixed(5)},${coord[1].toFixed(5)}`,
    name: 'Pinned location',
    address: `${coord[1].toFixed(4)}° N, ${coord[0].toFixed(4)}° E`,
    coord,
    kind: 'place',
  };
}

// The street address Mapbox has for a pin, when it is not a known place.
export async function addressAt(coord: Coord) {
  const near = placeNear(coord);
  if (!near.id.startsWith('pin-')) return near;
  const found = await reverseSearch(coord);
  return found ? { ...found, coord } : near;
}
