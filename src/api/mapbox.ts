import type { Coord, Place } from '@/mocks/places';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? '';
const SEARCH_URL = 'https://api.mapbox.com/search/searchbox/v1';
const DIRECTIONS_URL = 'https://api.mapbox.com/directions/v5/mapbox/driving';
const TIMEOUT_MS = 6000;

export const mapboxToken = TOKEN;

async function getJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Mapbox responded ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isCoord = (value: unknown): value is Coord =>
  Array.isArray(value) &&
  value.length >= 2 &&
  typeof value[0] === 'number' &&
  typeof value[1] === 'number';

function toPlace(feature: unknown): Place | null {
  if (!isRecord(feature) || !isRecord(feature.geometry) || !isRecord(feature.properties)) {
    return null;
  }
  const { coordinates } = feature.geometry;
  const { mapbox_id, name, full_address, place_formatted } = feature.properties;
  if (!isCoord(coordinates) || typeof mapbox_id !== 'string' || typeof name !== 'string') {
    return null;
  }
  const address = typeof full_address === 'string' ? full_address : place_formatted;
  return {
    id: mapbox_id,
    name,
    address: typeof address === 'string' ? address.replace(/, Lithuania$/, '') : '',
    coord: [coordinates[0], coordinates[1]],
    kind: 'place',
  };
}

function toPlaces(body: unknown) {
  if (!isRecord(body) || !Array.isArray(body.features)) return [];
  return body.features.map(toPlace).filter((place): place is Place => place !== null);
}

export async function forwardSearch(query: string, near: Coord) {
  const params = new URLSearchParams({
    q: query,
    proximity: `${near[0]},${near[1]}`,
    country: 'lt',
    language: 'en',
    limit: '8',
    access_token: TOKEN,
  });
  return toPlaces(await getJson(`${SEARCH_URL}/forward?${params}`));
}

export async function reverseSearch([longitude, latitude]: Coord) {
  const params = new URLSearchParams({
    longitude: String(longitude),
    latitude: String(latitude),
    language: 'en',
    limit: '1',
    access_token: TOKEN,
  });
  return toPlaces(await getJson(`${SEARCH_URL}/reverse?${params}`))[0] ?? null;
}

export async function drivingRoute(waypoints: readonly Coord[]) {
  const path = waypoints.map(([lng, lat]) => `${lng},${lat}`).join(';');
  const params = new URLSearchParams({
    geometries: 'geojson',
    overview: 'full',
    access_token: TOKEN,
  });
  const body = await getJson(`${DIRECTIONS_URL}/${path}?${params}`);
  const route = isRecord(body) && Array.isArray(body.routes) ? body.routes[0] : null;
  if (!isRecord(route) || !isRecord(route.geometry) || !Array.isArray(route.geometry.coordinates)) {
    throw new Error('Mapbox returned no route');
  }
  if (typeof route.distance !== 'number' || typeof route.duration !== 'number') {
    throw new Error('Mapbox returned an incomplete route');
  }
  return {
    path: route.geometry.coordinates.filter(isCoord),
    distanceKm: route.distance / 1000,
    durationMinutes: route.duration / 60,
  };
}
