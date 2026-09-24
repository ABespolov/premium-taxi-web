import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { mergeResults, searchKnownPlaces, searchMorePlaces } from '@/api/places';
import { Icon, placeIcons } from '@/components/Icon';
import { NavBar } from '@/components/NavBar';
import { PlaceRow } from '@/components/PlaceRow';
import { Sheet } from '@/components/Sheet';
import { useBooking } from '@/hooks/use-booking';
import { useRequest } from '@/hooks/use-request';
import type { Coord, Place } from '@/mocks/places';
import { MapLayer } from '@/screens/home/MapLayer';
import { RouteCard, RouteRow } from '@/screens/home/RouteCard';
import { useShowStep } from '@/screens/home/steps';
import { formatDistanceKm } from '@/utils/format';
import { roadDistanceKm } from '@/utils/geo';

const SEARCH_DEBOUNCE_MS = 250;
// Once the sheet has risen, plus a beat so the keyboard reads as a second step.
const FOCUS_DELAY_MS = 570;
const INPUT_CLASS =
  'h-[22px] w-full border-0 bg-transparent p-0 text-body placeholder:text-label-tertiary';

type Field = 'destination' | 'new-stop';

// A phone opens the keyboard only for a focus made during a tap, so there the rider taps the
// field; with a mouse and keyboard the field is ready to type into.
const canFocusUnprompted = () => window.matchMedia('(pointer: fine)').matches;

// The sheet raised over the whole screen to plan the route.
export function WhereToStep() {
  const showStep = useShowStep();
  const { booking, update, addStop, removeStop, canAddStop } = useBooking();
  const layer = useRef<HTMLDivElement>(null);
  const [layerHeight, setLayerHeight] = useState(0);
  const destinationInput = useRef<HTMLInputElement>(null);
  const [field, setField] = useState<Field>('destination');
  const [destinationQuery, setDestinationQuery] = useState(booking.destination?.name ?? '');
  const [stopQuery, setStopQuery] = useState<string | null>(null);

  useLayoutEffect(() => {
    const node = layer.current;
    if (!node) return;
    setLayerHeight(node.offsetHeight);
    const observer = new ResizeObserver(() => setLayerHeight(node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const shouldFocus = !booking.destination;
  useEffect(() => {
    if (!shouldFocus || !canFocusUnprompted()) return;
    const timer = setTimeout(() => destinationInput.current?.focus(), FOCUS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [shouldFocus]);

  const activeQuery = field === 'new-stop' ? (stopQuery ?? '') : destinationQuery;
  const hasPickedDestination = booking.destination?.name === destinationQuery;
  const query = hasPickedDestination && field === 'destination' ? '' : activeQuery;
  const searchQuery = useDebouncedValue(query);
  const more = useRequest(
    async () => ({
      query: searchQuery,
      places: await searchMorePlaces(searchQuery, booking.pickup.coord),
    }),
    [searchQuery, booking.pickup.coord],
  );
  const hasMoreForQuery = more.status === 'success' && more.data.query === query;
  const isSearchSettled = hasMoreForQuery || (more.status === 'error' && searchQuery === query);
  const results = mergeResults(searchKnownPlaces(query), hasMoreForQuery ? more.data.places : []);

  function changeDestination(text: string) {
    setDestinationQuery(text);
    if (booking.destination) update({ destination: null });
  }

  function clearDestination() {
    changeDestination('');
    destinationInput.current?.focus();
  }

  function cancelStop() {
    setStopQuery(null);
    setField('destination');
  }

  function swap() {
    if (!booking.destination) return;
    update({ pickup: booking.destination, destination: booking.pickup });
    setDestinationQuery(booking.pickup.name);
  }

  function choose(place: Place) {
    if (field === 'new-stop') {
      addStop(place);
      cancelStop();
      destinationInput.current?.focus();
      return;
    }
    update({ destination: place });
    setDestinationQuery(place.name);
    showStep({ name: 'choose-ride' });
  }

  const actions = (
    <>
      <IconAction
        icon="plus"
        label="Add stop"
        onPress={() => {
          setStopQuery('');
          setField('new-stop');
        }}
        isDisabled={!canAddStop || stopQuery !== null}
      />
      <IconAction
        icon="swap"
        label="Swap pickup and destination"
        onPress={swap}
        isDisabled={!booking.destination}
      />
    </>
  );

  return (
    <MapLayer ref={layer}>
      <div className="absolute inset-x-0 bottom-0">
        <Sheet gap="none" height={layerHeight || undefined} hasGrabber={false}>
          <div
            className="flex min-h-0 flex-1 flex-col"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
          >
            <NavBar title="Plan your ride" onBack={() => showStep({ name: 'home' })} />
            <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 pt-6">
              <RouteCard actions={actions}>
                <RouteRow key="pickup" marker="pickup">
                  <button
                    type="button"
                    onClick={() => showStep({ name: 'pickup-on-map', target: 'pickup' })}
                    aria-label={`Pickup, ${booking.pickup.name}. Change on map`}
                    className="truncate text-left text-body"
                  >
                    {booking.pickup.name}
                  </button>
                </RouteRow>
                {booking.stops.map((stop, index) => (
                  <RouteRow
                    key={stop.id}
                    marker="stop"
                    trailing={
                      <ClearButton
                        label={`Remove stop ${stop.name}`}
                        onPress={() => removeStop(index)}
                      />
                    }
                  >
                    <span className="truncate text-body">{stop.name}</span>
                  </RouteRow>
                ))}
                {stopQuery !== null ? (
                  <RouteRow
                    key="new-stop"
                    marker="stop"
                    trailing={<ClearButton label="Cancel stop" onPress={cancelStop} />}
                  >
                    <input
                      value={stopQuery}
                      onChange={(event) => setStopQuery(event.target.value)}
                      onFocus={() => setField('new-stop')}
                      placeholder="Add a stop"
                      // biome-ignore lint/a11y/noAutofocus: the rider just asked for this field.
                      autoFocus
                      autoComplete="off"
                      autoCorrect="off"
                      className={INPUT_CLASS}
                    />
                  </RouteRow>
                ) : null}
                <RouteRow
                  key="destination"
                  marker="dropoff"
                  trailing={
                    <>
                      {destinationQuery ? (
                        <ClearButton label="Clear destination" onPress={clearDestination} />
                      ) : null}
                      <button
                        type="button"
                        onClick={() => showStep({ name: 'pickup-on-map', target: 'destination' })}
                        aria-label="Choose destination on map"
                        className="flex size-10 items-center justify-center rounded-xl bg-background-tertiary active:opacity-60"
                      >
                        <Icon name="map-pin" />
                      </button>
                    </>
                  }
                >
                  <input
                    ref={destinationInput}
                    value={destinationQuery}
                    onChange={(event) => changeDestination(event.target.value)}
                    onFocus={() => setField('destination')}
                    placeholder="Where to?"
                    autoComplete="off"
                    autoCorrect="off"
                    enterKeyHint="search"
                    className={INPUT_CLASS}
                  />
                </RouteRow>
              </RouteCard>
              <Results
                places={results}
                isSettled={isSearchSettled}
                origin={booking.pickup.coord}
                onSelect={choose}
              />
            </div>
          </div>
        </Sheet>
      </div>
    </MapLayer>
  );
}

function useDebouncedValue(value: string) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value]);
  return debounced;
}

type ResultsProps = {
  places: readonly Place[];
  isSettled: boolean;
  origin: Coord;
  onSelect: (place: Place) => void;
};

function Results({ places, isSettled, origin, onSelect }: ResultsProps) {
  if (places.length === 0) {
    if (!isSettled) return null;
    return (
      <p className="py-6 text-center text-subheadline text-label-secondary">
        No places match. Try a street or a landmark.
      </p>
    );
  }
  return (
    <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
      {places.map((place, index) => (
        <PlaceRow
          key={place.id}
          icon={placeIcons[place.kind]}
          title={place.name}
          subtitle={place.address}
          meta={formatDistanceKm(roadDistanceKm(origin, place.coord))}
          hasDivider={index < places.length - 1}
          onPress={() => onSelect(place)}
        />
      ))}
    </div>
  );
}

function ClearButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <button type="button" onClick={onPress} aria-label={label} className="active:opacity-50">
      <Icon name="clear" />
    </button>
  );
}

type IconActionProps = {
  icon: 'plus' | 'swap';
  label: string;
  onPress: () => void;
  isDisabled: boolean;
};

function IconAction({ icon, label, onPress, isDisabled }: IconActionProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={isDisabled}
      aria-label={label}
      className="flex size-11 items-center justify-center enabled:active:opacity-50 disabled:opacity-30"
    >
      <Icon name={icon} />
    </button>
  );
}
