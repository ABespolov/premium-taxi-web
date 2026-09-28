import { useState } from 'react';
import { useNavigate } from 'react-router';
import { getSavedPlaces } from '@/api/places';
import { businessFare, cheapestPremiumFare, getBusiness, getRoute } from '@/api/rides';
import ghostCar from '@/assets/cars/ghost-car.jpg';
import { FloatingButton } from '@/components/FloatingButton';
import { Icon, placeIcons } from '@/components/Icon';
import type { MapMarker } from '@/components/MapView';
import { Sheet } from '@/components/Sheet';
import { useBooking } from '@/hooks/use-booking';
import { useRequest } from '@/hooks/use-request';
import { useSafeArea } from '@/hooks/use-safe-area';
import type { Place } from '@/mocks/places';
import type { ServiceId } from '@/mocks/ride-classes';
import { MapLayer, TOP_CONTROL } from '@/screens/home/MapLayer';
import { useMapScene } from '@/screens/home/map-scene';
import { useShowStep } from '@/screens/home/steps';
import { formatMinutes, formatPriceEur } from '@/utils/format';

const SHEET_HEIGHT_ESTIMATE = 420;
const PICKUP_ZOOM = 16;
// Space between the recenter button and the sheet.
const RECENTER_GAP = 12;
// The floating menu button and the 4px above it.
const CONTROL_HEIGHT = 48;

// The first sheet: the two services, where to, and saved places. Once a destination is set
// the map shows the route and the services quote it; a service opens only with one.
export function HomeStep() {
  const insets = useSafeArea();
  const navigate = useNavigate();
  const showStep = useShowStep();
  const { booking, update } = useBooking();
  const [sheetHeight, setSheetHeight] = useState(SHEET_HEIGHT_ESTIMATE);
  const [focusKey, setFocusKey] = useState(0);
  const savedPlaces = getSavedPlaces();
  const business = getBusiness();
  const { pickup, stops, destination } = booking;
  const waypoints = destination
    ? [pickup.coord, ...stops.map((stop) => stop.coord), destination.coord]
    : [pickup.coord];
  const routed = useRequest(
    async () => (waypoints.length > 1 ? getRoute(waypoints) : null),
    [JSON.stringify(waypoints)],
  );
  const pickupLabel = `Pickup in ${formatMinutes(business.etaMinutes)}`;

  const markers: MapMarker[] = destination
    ? [
        { id: 'pickup', kind: 'pickup', coord: pickup.coord, label: pickupLabel },
        ...stops.map((stop, index) => ({
          id: `stop-${index}`,
          kind: 'stop' as const,
          coord: stop.coord,
        })),
        { id: 'dropoff', kind: 'dropoff', coord: destination.coord, label: destination.name },
      ]
    : [
        {
          id: 'pickup',
          kind: 'pickup',
          coord: pickup.coord,
          label: pickupLabel,
          isLabelAbove: true,
        },
      ];

  useMapScene({
    focus: destination ? { coords: waypoints } : { coords: [pickup.coord], zoom: PICKUP_ZOOM },
    focusKey,
    // The route keeps clear of the menu button in the top corner.
    padding: { top: insets.top + CONTROL_HEIGHT, bottom: sheetHeight, left: 0, right: 0 },
    markers,
    route: routed.status === 'success' && routed.data ? routed.data.path : undefined,
  });

  function openService(service: ServiceId) {
    if (destination) showStep({ name: service });
    else showStep({ name: 'where-to', next: service });
  }

  return (
    <MapLayer>
      <div className="absolute left-5" style={{ top: TOP_CONTROL }}>
        <FloatingButton icon="menu" label="Account" onPress={() => navigate('/account')} />
      </div>
      <div className="absolute right-5" style={{ bottom: sheetHeight + RECENTER_GAP }}>
        <FloatingButton
          icon="recenter"
          label={destination ? 'Show the route' : 'Back to pickup'}
          onPress={() => setFocusKey((key) => key + 1)}
        />
      </div>
      <div className="absolute inset-x-0 bottom-0">
        <Sheet gap="regular" onMeasure={setSheetHeight}>
          <div className="flex gap-3 px-5">
            <ServiceCard
              title="Premium"
              kind="Book in advance"
              lines={['You choose the car', `from ${formatPriceEur(cheapestPremiumFare())}`]}
              image={ghostCar}
              onPress={() => openService('premium')}
            />
            <ServiceCard
              title={business.name}
              kind="Right now"
              lines={[
                `Nearest ${business.model}`,
                `${formatPriceEur(destination ? businessFare(waypoints) : business.minimumFareEur)}, ${formatMinutes(business.etaMinutes)} away`,
              ]}
              image={business.image}
              onPress={() => openService('business')}
            />
          </div>
          <div className="px-5">
            <div className="flex h-14 items-center gap-3 rounded-[14px] bg-background-tertiary pr-1.5 pl-4">
              <button
                type="button"
                onClick={() => showStep({ name: 'where-to' })}
                className="flex h-full min-w-0 flex-1 items-center gap-3 text-left"
              >
                {destination ? (
                  <>
                    <Icon name="summary-dropoff" />
                    <span className="truncate text-headline font-semibold">{destination.name}</span>
                  </>
                ) : (
                  <span className="text-headline font-semibold">Where to?</span>
                )}
              </button>
              {destination ? (
                <button
                  type="button"
                  onClick={() => update({ destination: null, stops: [] })}
                  aria-label="Clear destination"
                  className="active:opacity-50"
                >
                  <Icon name="clear" />
                </button>
              ) : null}
            </div>
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto overscroll-x-contain px-5">
            {savedPlaces.map((place) => (
              <PlaceChip
                key={place.id}
                place={place}
                isSelected={destination?.id === place.id}
                onPress={() => update({ destination: place, stops: [] })}
              />
            ))}
          </div>
        </Sheet>
      </div>
    </MapLayer>
  );
}

type PlaceChipProps = { place: Place; isSelected: boolean; onPress: () => void };

// A saved place as one compact chip: a tap sets it as the destination.
function PlaceChip({ place, isSelected, onPress }: PlaceChipProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={`Ride to ${place.name}, ${place.address}`}
      aria-pressed={isSelected}
      className={`flex h-11 shrink-0 items-center gap-2 rounded-[22px] pr-3.5 pl-3 active:opacity-70 ${isSelected ? 'bg-label-primary text-background-primary' : 'bg-background-tertiary'}`}
    >
      <span className={isSelected ? 'invert' : ''}>
        <Icon name={placeIcons[place.kind]} />
      </span>
      <span className="text-subheadline font-semibold whitespace-nowrap">{place.name}</span>
    </button>
  );
}

type ServiceCardProps = {
  title: string;
  // How the service works, the one thing that tells them apart: Premium is a particular car
  // booked ahead, Business the nearest car now.
  kind: string;
  lines: readonly [string, string];
  image: string;
  onPress: () => void;
};

// One of the two services: a photo over its name, how it works, and what it offers.
function ServiceCard({ title, kind, lines, image, onPress }: ServiceCardProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="flex min-w-0 flex-1 flex-col gap-2.5 text-left active:opacity-70"
    >
      <img
        src={image}
        alt=""
        draggable={false}
        className="h-[124px] w-full rounded-[14px] object-cover"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-headline font-semibold">{title}</span>
        <span className="text-subheadline font-semibold text-accent">{kind}</span>
        <span className="text-subheadline text-label-secondary">
          {lines[0]}
          <br />
          {lines[1]}
        </span>
      </span>
    </button>
  );
}
