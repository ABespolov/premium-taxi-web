import { useEffect, useState } from 'react';
import { cancelRide, findDriver, getTrip, type Trip } from '@/api/rides';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Sheet } from '@/components/Sheet';
import { messageOf } from '@/hooks/use-request';
import { useSafeArea } from '@/hooks/use-safe-area';
import { MapLayer } from '@/screens/home/MapLayer';
import { useMapScene } from '@/screens/home/map-scene';
import { useShowStep } from '@/screens/home/steps';
import { formatMinutes, formatPriceEur } from '@/utils/format';

const SHEET_HEIGHT_ESTIMATE = 385;
const PICKUP_ZOOM = 16;

export function FindingDriverStep({ tripId }: { tripId: string }) {
  const insets = useSafeArea();
  const [sheetHeight, setSheetHeight] = useState(SHEET_HEIGHT_ESTIMATE);
  const [trip, setTrip] = useState(() => getTrip(tripId));
  const [searchError, setSearchError] = useState<string | null>(null);
  const isSearching = trip.status === 'searching';

  // The driver search is a long-running server job this step subscribes to.
  useEffect(() => {
    if (trip.status !== 'searching') return;
    let isCurrent = true;
    findDriver(trip.id).then(
      (updated) => {
        if (isCurrent) setTrip(updated);
      },
      (error: unknown) => {
        if (isCurrent) setSearchError(messageOf(error));
      },
    );
    return () => {
      isCurrent = false;
    };
  }, [trip.id, trip.status]);

  useMapScene({
    focus: { coords: [trip.pickup.coord], zoom: PICKUP_ZOOM },
    padding: { top: insets.top, bottom: sheetHeight, left: 0, right: 0 },
    markers: [
      isSearching
        ? { id: 'pulse', kind: 'pulse', coord: trip.pickup.coord }
        : { id: 'pickup', kind: 'pin', coord: trip.pickup.coord },
    ],
    isInteractive: false,
  });

  return (
    <MapLayer>
      <div className="absolute inset-x-0 bottom-0">
        <Sheet gap="regular" onMeasure={setSheetHeight}>
          <TripSheet trip={trip} searchError={searchError} />
        </Sheet>
      </div>
    </MapLayer>
  );
}

function TripSheet({ trip, searchError }: { trip: Trip; searchError: string | null }) {
  const showStep = useShowStep();
  const isSearching = trip.status === 'searching';

  function cancel() {
    cancelRide(trip.id);
    showStep({ name: 'home' }, { replace: true });
  }

  function done() {
    showStep({ name: 'home' }, { replace: true });
  }

  return (
    <div className="flex flex-col gap-4 px-5">
      <div className="flex flex-col gap-1 pt-2" aria-live="polite">
        <h2 className="font-serif text-title2">
          {trip.driver ? `${trip.driver.name} is on the way` : 'Finding your driver'}
        </h2>
        <p className="text-subheadline text-label-secondary">
          {trip.driver
            ? `${trip.driver.car} · ${trip.driver.plate} · ${formatMinutes(trip.driver.etaMinutes)}`
            : 'Usually under a minute'}
        </p>
      </div>
      <Progress isSearching={isSearching} />
      <div className="rounded-[14px] bg-background-tertiary px-4">
        <div className="flex items-center gap-3.5 border-b border-separator py-3">
          <Icon name="summary-pickup" />
          <span className="min-w-0 flex-1 truncate text-body">{trip.pickup.name}</span>
        </div>
        <div className="flex items-center gap-3.5 py-3">
          <Icon name="summary-dropoff" />
          <span className="min-w-0 flex-1 truncate text-body">{trip.destination.name}</span>
        </div>
        <div className="flex justify-between border-t border-separator pt-3 pb-3.5">
          <span className="min-w-0 flex-1 truncate text-subheadline text-label-secondary">
            {trip.rideClassName} · {trip.car} or similar
          </span>
          <span className="text-subheadline font-semibold">{formatPriceEur(trip.priceEur)}</span>
        </div>
      </div>
      {searchError ? (
        <p className="text-center text-footnote text-label-secondary">{searchError}</p>
      ) : null}
      {isSearching ? (
        <Button label="Cancel request" variant="secondary" onPress={cancel} />
      ) : (
        <div className="flex flex-col gap-3">
          <Button label="Done" onPress={done} />
          <Button label="Cancel ride" variant="secondary" onPress={cancel} />
        </div>
      )}
    </div>
  );
}

// Figma's progress track: an indicator sweeping while the search runs, full once it ends.
function Progress({ isSearching }: { isSearching: boolean }) {
  return (
    <div
      className="h-1 shrink-0 overflow-hidden rounded-sm bg-background-tertiary"
      role="progressbar"
      aria-busy={isSearching}
    >
      <div
        className={`h-1 rounded-sm bg-label-primary ${isSearching ? 'progress-sweep w-[120px]' : 'w-full'}`}
      />
    </div>
  );
}
