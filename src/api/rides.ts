import { drivingRoute } from '@/api/mapbox';
import type { Coord, Place } from '@/mocks/places';
import { drivers, type RideClassId, rideClasses } from '@/mocks/ride-classes';
import { delay } from '@/utils/delay';
import { roadDistanceKm } from '@/utils/geo';

// Average city traffic speed, used until Mapbox has routed the trip.
const ESTIMATED_SPEED_KMH = 18;
// Long enough for the Finding driver frame to be seen, short enough for a demo.
const DRIVER_SEARCH_MS = 4000;

export type Route = {
  path: readonly Coord[];
  distanceKm: number;
  durationMinutes: number;
};

export type Quote = {
  rideClassId: RideClassId;
  name: string;
  car: string;
  seats: number;
  image: (typeof rideClasses)[number]['image'];
  priceEur: number;
  etaMinutes: number;
};

export type Driver = { name: string; car: string; plate: string; etaMinutes: number };

export type TripStatus = 'searching' | 'on-the-way' | 'scheduled' | 'cancelled';

export type Trip = {
  id: string;
  pickup: Place;
  stops: readonly Place[];
  destination: Place;
  rideClassId: RideClassId;
  rideClassName: string;
  car: string;
  priceEur: number;
  pickupAt: Date;
  status: TripStatus;
  driver: Driver | null;
};

export type RideRequest = {
  pickup: Place;
  stops: readonly Place[];
  destination: Place;
  rideClassId: RideClassId;
  scheduledAt: Date | null;
};

let trips: Trip[] = [];

function rideClassFor(rideClassId: RideClassId) {
  const rideClass = rideClasses.find((candidate) => candidate.id === rideClassId);
  if (!rideClass) throw new Error(`Unknown ride class ${rideClassId}`);
  return rideClass;
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

export function getPickupEta() {
  return rideClasses[0].etaMinutes;
}

function priceFor(rideClassId: RideClassId, distanceKm: number) {
  const rideClass = rideClassFor(rideClassId);
  return Math.round(rideClass.baseFareEur + rideClass.perKmEur * distanceKm);
}

export function getQuotes(waypoints: readonly Coord[]): Quote[] {
  const { distanceKm } = estimateRoute(waypoints);
  return rideClasses.map((rideClass) => ({
    rideClassId: rideClass.id,
    name: rideClass.name,
    car: rideClass.car,
    seats: rideClass.seats,
    image: rideClass.image,
    priceEur: priceFor(rideClass.id, distanceKm),
    etaMinutes: rideClass.etaMinutes,
  }));
}

export function requestRide(request: RideRequest) {
  const rideClass = rideClassFor(request.rideClassId);
  const { distanceKm } = estimateRoute([
    request.pickup.coord,
    ...request.stops.map((stop) => stop.coord),
    request.destination.coord,
  ]);
  const trip: Trip = {
    id: String(Date.now()),
    pickup: request.pickup,
    stops: request.stops,
    destination: request.destination,
    rideClassId: rideClass.id,
    rideClassName: rideClass.name,
    car: rideClass.car,
    priceEur: priceFor(rideClass.id, distanceKm),
    pickupAt: request.scheduledAt ?? new Date(),
    status: request.scheduledAt ? 'scheduled' : 'searching',
    driver: null,
  };
  trips = [trip, ...trips];
  return trip;
}

function updateTrip(tripId: string, changes: Partial<Trip>) {
  trips = trips.map((trip) => (trip.id === tripId ? { ...trip, ...changes } : trip));
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

  const rideClass = rideClassFor(trip.rideClassId);
  const pick = drivers[Number(tripId) % drivers.length];
  updateTrip(tripId, {
    status: 'on-the-way',
    driver: {
      name: pick.name,
      plate: pick.plate,
      car: rideClass.car,
      etaMinutes: rideClass.etaMinutes,
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
