import { drivingRoute } from '@/api/mapbox';
import type { Coord, Place } from '@/mocks/places';
import {
  business,
  drivers,
  type PremiumCar,
  premiumCars,
  type ServiceId,
} from '@/mocks/ride-classes';
import { delay } from '@/utils/delay';
import { destinationPoint, roadDistanceKm } from '@/utils/geo';

// Average city traffic speed, used until Mapbox has routed the trip.
const ESTIMATED_SPEED_KMH = 18;
// Long enough for the Finding driver frame to be seen, short enough for a demo.
const DRIVER_SEARCH_MS = 4000;
// Where the nearest Business car waits: this far from the pickup, and in this direction.
const NEAREST_CAR_KM = 0.6;
const NEAREST_CAR_BEARING = 320;

export type Route = {
  path: readonly Coord[];
  distanceKm: number;
  durationMinutes: number;
};

export type Driver = { name: string; car: string; plate: string; etaMinutes: number };

export type TripStatus = 'searching' | 'on-the-way' | 'scheduled' | 'cancelled';

export type Trip = {
  id: string;
  pickup: Place;
  stops: readonly Place[];
  destination: Place;
  service: ServiceId;
  serviceName: string;
  // "Mercedes E‑Class or similar" for Business, the booked car for Premium.
  car: string;
  priceEur: number;
  etaMinutes: number;
  pickupAt: Date;
  status: TripStatus;
  driver: Driver | null;
};

export type RideRequest = {
  pickup: Place;
  stops: readonly Place[];
  destination: Place;
  service: ServiceId;
  premiumCarId: string;
  scheduledAt: Date | null;
};

let trips: Trip[] = [];

export function getPremiumCars() {
  return premiumCars;
}

export function premiumCarFor(id: string): PremiumCar {
  const car = premiumCars.find((candidate) => candidate.id === id);
  if (!car) throw new Error(`Unknown car ${id}`);
  return car;
}

// A straight-line estimate the fare is fixed on, so the price never moves once shown.
export function estimateRoute(waypoints: readonly Coord[]): Route {
  let distanceKm = 0;
  for (let i = 1; i < waypoints.length; i++) {
    distanceKm += roadDistanceKm(waypoints[i - 1], waypoints[i]);
  }
  return {
    path: waypoints,
    distanceKm,
    durationMinutes: (distanceKm / ESTIMATED_SPEED_KMH) * 60,
  };
}

// The street route Mapbox draws; the estimate stands in when it cannot be reached.
export async function getRoute(waypoints: readonly Coord[]): Promise<Route> {
  try {
    return await drivingRoute(waypoints);
  } catch {
    return estimateRoute(waypoints);
  }
}

export function getBusiness() {
  return business;
}

// The Business car closest to the pickup, which is the one an order now would send.
export function nearestBusinessCar(pickup: Coord) {
  return {
    coord: destinationPoint(pickup, NEAREST_CAR_KM, NEAREST_CAR_BEARING),
    etaMinutes: business.etaMinutes,
  };
}

// Short rides pay the minimum, which is what Home quotes before there is a route.
export function businessFare(waypoints: readonly Coord[]) {
  const { distanceKm } = estimateRoute(waypoints);
  return Math.max(
    business.minimumFareEur,
    Math.round(business.baseFareEur + business.perKmEur * distanceKm),
  );
}

export function cheapestPremiumFare() {
  return Math.min(...premiumCars.map((car) => car.priceEur));
}

export function requestRide(request: RideRequest) {
  const { pickup, stops, destination, service, scheduledAt } = request;
  const waypoints = [pickup.coord, ...stops.map((stop) => stop.coord), destination.coord];
  const premiumCar = service === 'premium' ? premiumCarFor(request.premiumCarId) : null;
  const trip: Trip = {
    id: String(Date.now()),
    pickup,
    stops,
    destination,
    service,
    serviceName: premiumCar ? 'Premium' : business.name,
    car: premiumCar ? premiumCar.name : `${business.car} or similar`,
    priceEur: premiumCar ? premiumCar.priceEur : businessFare(waypoints),
    etaMinutes: premiumCar ? premiumCar.etaMinutes : business.etaMinutes,
    pickupAt: scheduledAt ?? new Date(),
    status: scheduledAt ? 'scheduled' : 'searching',
    driver: null,
  };
  trips = [trip, ...trips];
  return trip;
}

function updateTrip(tripId: string, changes: Partial<Trip>) {
  trips = trips.map((trip) => (trip.id === tripId ? { ...trip, ...changes } : trip));
}

// Trips live in memory, so a reload forgets them.
export function hasTrip(tripId: string) {
  return trips.some((trip) => trip.id === tripId);
}

export function getTrip(tripId: string) {
  const trip = trips.find((candidate) => candidate.id === tripId);
  if (!trip) throw new Error('This ride no longer exists');
  return trip;
}

// Resolves once a driver accepts, or with the trip as it is if the rider cancelled first.
export async function findDriver(tripId: string) {
  await delay(DRIVER_SEARCH_MS);
  const trip = getTrip(tripId);
  if (trip.status !== 'searching') return trip;

  const pick = drivers[Number(tripId) % drivers.length];
  updateTrip(tripId, {
    status: 'on-the-way',
    driver: {
      name: pick.name,
      plate: pick.plate,
      car: trip.car,
      etaMinutes: trip.etaMinutes,
    },
  });
  return getTrip(tripId);
}

export function cancelRide(tripId: string) {
  updateTrip(tripId, { status: 'cancelled' });
}

export function getTrips() {
  return trips.filter((trip) => trip.status !== 'cancelled');
}

export function signOutRides() {
  trips = [];
}
