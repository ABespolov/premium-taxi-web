import { useState } from 'react';
import { businessFare, getBusiness, getRoute, nearestBusinessCar } from '@/api/rides';
import { Icon } from '@/components/Icon';
import { useBooking } from '@/hooks/use-booking';
import { useRequest } from '@/hooks/use-request';
import { useSafeArea } from '@/hooks/use-safe-area';
import type { Place } from '@/mocks/places';
import { useMapScene } from '@/screens/home/map-scene';
import { ServiceSheet } from '@/screens/home/ServiceSheet';
import { formatMinutes, formatPickupTime, formatPriceEur } from '@/utils/format';
import { bearingDeg } from '@/utils/geo';

const SHEET_HEIGHT_ESTIMATE = 553;
const NAV_HEIGHT = 48;

type Props = { destination: Place; onSchedule: () => void };

// Business: no car to choose. The map shows the nearest one driving over to the pickup.
export function BusinessStep({ destination, onSchedule }: Props) {
  const insets = useSafeArea();
  const { booking } = useBooking();
  const [sheetHeight, setSheetHeight] = useState(SHEET_HEIGHT_ESTIMATE);
  const business = getBusiness();

  const { pickup, stops, scheduledAt } = booking;
  const car = nearestBusinessCar(pickup.coord);
  const approach = useRequest(
    () => getRoute([car.coord, pickup.coord]),
    [JSON.stringify(car.coord), JSON.stringify(pickup.coord)],
  );
  const path = approach.status === 'success' ? approach.data.path : [car.coord, pickup.coord];
  const waypoints = [pickup.coord, ...stops.map((stop) => stop.coord), destination.coord];
  const etaLabel = formatMinutes(car.etaMinutes);
  const fare = formatPriceEur(businessFare(waypoints));

  useMapScene({
    focus: { coords: [car.coord, pickup.coord] },
    padding: { top: insets.top + NAV_HEIGHT, bottom: sheetHeight, left: 0, right: 0 },
    markers: scheduledAt
      ? [{ id: 'pickup', kind: 'pickup', coord: pickup.coord }]
      : [
          {
            id: 'car',
            kind: 'car',
            coord: car.coord,
            label: etaLabel,
            bearing: bearingDeg(path[0], path[1] ?? pickup.coord),
          },
          { id: 'pickup', kind: 'pickup', coord: pickup.coord },
        ],
    route: scheduledAt || approach.status !== 'success' ? undefined : path,
  });

  return (
    <ServiceSheet
      title={business.name}
      subtitle={
        scheduledAt
          ? `Pickup ${formatPickupTime(scheduledAt)}`
          : `Nearest car arrives in ${etaLabel}`
      }
      pickup={pickup}
      destination={destination}
      orderLabel={`${scheduledAt ? 'Book' : 'Order now'} · ${fare}`}
      request={{ ...booking, destination, service: 'business' }}
      onSchedule={onSchedule}
      onMeasure={setSheetHeight}
    >
      <div className="flex h-full items-center gap-4 px-5">
        {/* The photo keeps its 4:3 frame, so the car is never cropped. */}
        <img
          src={business.image}
          alt=""
          draggable={false}
          className="aspect-[4/3] w-[188px] shrink-0 rounded-2xl object-cover"
        />
        <ul className="flex min-w-0 flex-1 flex-col gap-3">
          {business.standards.map((standard) => (
            <li key={standard.text} className="flex items-center gap-2">
              <Icon name={standard.icon} size={18} />
              <span className="min-w-0 flex-1 text-subheadline">{standard.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </ServiceSheet>
  );
}
