import { createContext, type ReactNode, use, useState } from 'react';
import { currentLocation, type Place } from '@/mocks/places';
import { premiumCars } from '@/mocks/ride-classes';

const MAX_STOPS = 3;

export type Booking = {
  pickup: Place;
  stops: readonly Place[];
  destination: Place | null;
  // The car picked in Premium; Business sends whichever car is nearest.
  premiumCarId: string;
  scheduledAt: Date | null;
};

const initialBooking: Booking = {
  pickup: currentLocation,
  stops: [],
  destination: null,
  premiumCarId: premiumCars[0].id,
  scheduledAt: null,
};

type BookingContextValue = {
  booking: Booking;
  update: (changes: Partial<Booking>) => void;
  addStop: (stop: Place) => void;
  removeStop: (index: number) => void;
  canAddStop: boolean;
  reset: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

// The ride being put together across Home, Where to, Schedule, Premium and Business.
export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState(initialBooking);

  function update(changes: Partial<Booking>) {
    setBooking((current) => ({ ...current, ...changes }));
  }

  function addStop(stop: Place) {
    setBooking((current) => {
      if (current.stops.some((existing) => existing.id === stop.id)) return current;
      return { ...current, stops: [...current.stops, stop].slice(0, MAX_STOPS) };
    });
  }

  function removeStop(index: number) {
    setBooking((current) => ({ ...current, stops: current.stops.filter((_, i) => i !== index) }));
  }

  function reset() {
    setBooking(initialBooking);
  }

  const value = {
    booking,
    update,
    addStop,
    removeStop,
    canAddStop: booking.stops.length < MAX_STOPS,
    reset,
  };
  return <BookingContext value={value}>{children}</BookingContext>;
}

export function useBooking() {
  const value = use(BookingContext);
  if (!value) throw new Error('useBooking must be used inside BookingProvider');
  return value;
}
