import { useLayoutEffect, useRef, useState } from 'react';
import { getPremiumCars, getRoute, premiumCarFor } from '@/api/rides';
import type { MapMarker } from '@/components/MapView';
import { useBooking } from '@/hooks/use-booking';
import { useRequest } from '@/hooks/use-request';
import { useSafeArea } from '@/hooks/use-safe-area';
import type { Place } from '@/mocks/places';
import type { PremiumCar } from '@/mocks/ride-classes';
import { useMapScene } from '@/screens/home/map-scene';
import { ServiceSheet } from '@/screens/home/ServiceSheet';
import { formatMinutes, formatPriceEur } from '@/utils/format';

const SHEET_HEIGHT_ESTIMATE = 400;
const NAV_HEIGHT = 48;
const CARD_WIDTH = 300;
const CARD_GAP = 12;

type Props = { destination: Place; onSchedule: () => void };

// Premium: the route on the map, and the cars to swipe through and pick from.
export function PremiumStep({ destination, onSchedule }: Props) {
  const insets = useSafeArea();
  const { booking, update } = useBooking();
  const [sheetHeight, setSheetHeight] = useState(SHEET_HEIGHT_ESTIMATE);
  const cars = getPremiumCars();
  const car = premiumCarFor(booking.premiumCarId);
  const { pickup, stops, scheduledAt } = booking;
  const waypoints = [pickup.coord, ...stops.map((stop) => stop.coord), destination.coord];
  const routed = useRequest(() => getRoute(waypoints), [JSON.stringify(waypoints)]);

  const markers: MapMarker[] = [
    { id: 'pickup', kind: 'pickup', coord: pickup.coord, label: pickup.name },
    ...stops.map((stop, index) => ({
      id: `stop-${index}`,
      kind: 'stop' as const,
      coord: stop.coord,
    })),
    { id: 'dropoff', kind: 'dropoff', coord: destination.coord, label: destination.name },
  ];

  useMapScene({
    focus: { coords: waypoints },
    padding: { top: insets.top + NAV_HEIGHT, bottom: sheetHeight, left: 0, right: 0 },
    markers,
    route: routed.status === 'success' ? routed.data.path : undefined,
  });

  return (
    <ServiceSheet
      title="Premium"
      subtitle="Book in advance"
      pickup={pickup}
      destination={destination}
      orderLabel={`${scheduledAt ? 'Book' : 'Order'} the ${car.shortName} · ${formatPriceEur(car.priceEur)}`}
      request={{ ...booking, destination, service: 'premium' }}
      onSchedule={onSchedule}
      onMeasure={setSheetHeight}
    >
      <CarCarousel
        cars={cars}
        selectedId={car.id}
        onSelect={(id) => update({ premiumCarId: id })}
      />
    </ServiceSheet>
  );
}

type CarouselProps = {
  cars: readonly PremiumCar[];
  selectedId: string;
  onSelect: (id: string) => void;
};

// Swiping only browses; a tap picks the car. The picked card carries a check and a frame,
// so the choice never depends on where the list happens to be scrolled.
function CarCarousel({ cars, selectedId, onSelect }: CarouselProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const selectedIndex = Math.max(
    0,
    cars.findIndex((car) => car.id === selectedId),
  );

  // Opens on the car picked last time.
  // biome-ignore lint/correctness/useExhaustiveDependencies: only where the carousel starts.
  useLayoutEffect(() => {
    scroller.current?.scrollTo({ left: selectedIndex * (CARD_WIDTH + CARD_GAP) });
  }, []);

  function pick(car: PremiumCar, index: number) {
    onSelect(car.id);
    scroller.current?.scrollTo({ left: index * (CARD_WIDTH + CARD_GAP), behavior: 'smooth' });
  }

  return (
    <div
      ref={scroller}
      role="radiogroup"
      aria-label="Car"
      className="no-scrollbar flex h-full snap-x snap-mandatory scroll-px-5 overflow-x-auto overscroll-x-contain px-5"
      style={{ gap: CARD_GAP }}
    >
      {cars.map((car, index) => {
        const isSelected = car.id === selectedId;
        return (
          <button
            key={car.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${car.name}, ${car.details}, ${formatPriceEur(car.priceEur)}`}
            onClick={() => pick(car, index)}
            className="h-full shrink-0 snap-start text-left"
            style={{ width: CARD_WIDTH }}
          >
            <span className="relative flex h-full w-full gap-1 overflow-hidden rounded-2xl">
              <span className="relative h-full min-w-0 flex-1">
                <img
                  src={car.carImage}
                  alt=""
                  draggable={false}
                  className="h-full w-full object-cover"
                />
                {/* Name, price and wait sit on the photo, so the card needs no rows below. */}
                <span className="absolute inset-x-0 bottom-0 flex flex-col bg-gradient-to-t from-black/75 to-transparent px-3 pt-8 pb-2.5 text-white">
                  <span className="truncate text-subheadline font-semibold">{car.name}</span>
                  <span className="text-subheadline">
                    {formatPriceEur(car.priceEur)} · in {formatMinutes(car.etaMinutes)}
                  </span>
                </span>
              </span>
              <img
                src={car.cabinImage}
                alt=""
                draggable={false}
                className="h-full w-[76px] shrink-0 object-cover"
              />
              {isSelected ? (
                <span className="pointer-events-none absolute inset-0 rounded-2xl ring-[3px] ring-label-primary ring-inset" />
              ) : null}
              <RadioMark isSelected={isSelected} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

// The radio in the photo's corner: an empty ring to say "can be picked", a check once it is.
function RadioMark({ isSelected }: { isSelected: boolean }) {
  return (
    <span
      className={`pointer-events-none absolute top-2.5 left-2.5 flex size-6 items-center justify-center rounded-full border-2 border-white shadow-floating ${isSelected ? 'bg-label-primary' : 'bg-black/20'}`}
      aria-hidden
    >
      {isSelected ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d="M2.5 6.2L4.9 8.5L9.5 3.5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}
