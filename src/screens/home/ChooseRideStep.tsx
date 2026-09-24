import { useState } from 'react';
import { useNavigate } from 'react-router';
import { getPreferences, getWallet } from '@/api/profile';
import { estimateRoute, getQuotes, getRoute, requestRide } from '@/api/rides';
import { Button } from '@/components/Button';
import { FloatingButton } from '@/components/FloatingButton';
import { Icon } from '@/components/Icon';
import type { MapMarker } from '@/components/MapView';
import { PaymentIcon } from '@/components/PaymentIcon';
import { SettingsRow } from '@/components/SettingsRow';
import { Sheet } from '@/components/Sheet';
import { useBooking } from '@/hooks/use-booking';
import { messageOf, useRequest } from '@/hooks/use-request';
import { useSafeArea } from '@/hooks/use-safe-area';
import type { Place } from '@/mocks/places';
import type { RideClassId } from '@/mocks/ride-classes';
import { ClassRow } from '@/screens/home/ClassRow';
import { MapLayer, TOP_CONTROL } from '@/screens/home/MapLayer';
import { useMapScene } from '@/screens/home/map-scene';
import { useShowStep } from '@/screens/home/steps';
import { formatClock } from '@/utils/format';

const SHEET_HEIGHT_ESTIMATE = 477;
const NAV_HEIGHT = 48;

// Ride classes and prices for the route, framed on the map above the sheet.
export function ChooseRideStep({ destination }: { destination: Place }) {
  const insets = useSafeArea();
  const navigate = useNavigate();
  const showStep = useShowStep();
  const { booking, update, reset } = useBooking();
  const [sheetHeight, setSheetHeight] = useState(SHEET_HEIGHT_ESTIMATE);
  const [requestError, setRequestError] = useState<string | null>(null);

  const { pickup, stops, rideClassId, scheduledAt } = booking;
  const waypoints = [pickup.coord, ...stops.map((stop) => stop.coord), destination.coord];
  const routed = useRequest(() => getRoute(waypoints), [JSON.stringify(waypoints)]);
  // Read on every render: Wallet and Ride preferences are edited on pages over Home.
  const wallet = getWallet();
  const preferences = getPreferences();

  const route = routed.status === 'success' ? routed.data : estimateRoute(waypoints);
  const quotes = getQuotes(waypoints);
  const selected = quotes.find((quote) => quote.rideClassId === rideClassId);
  const pickupTime = scheduledAt ?? new Date();
  const arrival = new Date(
    pickupTime.getTime() + ((selected?.etaMinutes ?? 0) + route.durationMinutes) * 60_000,
  );

  const markers: MapMarker[] = [
    { id: 'pickup', kind: 'pickup', coord: pickup.coord, label: pickup.name, isPressable: true },
    ...stops.map((stop, index) => ({
      id: `stop-${index}`,
      kind: 'stop' as const,
      coord: stop.coord,
    })),
    {
      id: 'dropoff',
      kind: 'dropoff',
      coord: destination.coord,
      label: destination.name,
      sublabel: `Arrive ${formatClock(arrival)}`,
      isPressable: true,
    },
  ];

  function editRoute() {
    showStep({ name: 'where-to' });
  }

  useMapScene(
    {
      focus: { coords: waypoints },
      padding: { top: insets.top + NAV_HEIGHT, bottom: sheetHeight, left: 0, right: 0 },
      markers,
      route: routed.status === 'success' ? routed.data.path : undefined,
    },
    { onMarkerPress: editRoute },
  );

  const payment = wallet.methods.find((method) => method.id === wallet.defaultMethodId);

  function selectClass(id: RideClassId) {
    update({ rideClassId: id });
  }

  function request() {
    try {
      const created = requestRide({ pickup, stops, destination, rideClassId, scheduledAt });
      reset();
      if (created.status === 'scheduled') {
        showStep({ name: 'home' }, { replace: true });
        navigate('/trips');
        return;
      }
      showStep({ name: 'finding-driver', tripId: created.id }, { replace: true });
    } catch (caught) {
      setRequestError(messageOf(caught));
    }
  }

  const actionVerb = scheduledAt ? 'Schedule' : 'Request';
  const actionLabel = selected ? `${actionVerb} ${selected.name}` : actionVerb;

  return (
    <MapLayer>
      <div className="absolute left-5" style={{ top: TOP_CONTROL }}>
        <FloatingButton icon="chevron-left" label="Back" onPress={editRoute} />
      </div>
      <div className="absolute inset-x-0 bottom-0">
        <Sheet gap="none" onMeasure={setSheetHeight}>
          <div className="px-5 pt-3.5 pb-2.5">
            <h2 className="font-serif text-title2">Choose a ride</h2>
          </div>
          <div className="flex flex-col gap-3 px-5 pb-4">
            <div className="flex flex-col gap-1" role="radiogroup" aria-label="Ride class">
              {quotes.map((quote) => (
                <ClassRow
                  key={quote.rideClassId}
                  quote={quote}
                  isSelected={quote.rideClassId === rideClassId}
                  onSelect={selectClass}
                />
              ))}
            </div>
            <p className="text-footnote text-label-secondary">
              You’ll ride in a {selected?.car} or similar
            </p>
          </div>
          <div className="px-5 pt-1 pb-3">
            <div className="border-t border-separator">
              <SettingsRow
                inset="plain"
                leading={payment ? <PaymentIcon brand={payment.brand} /> : <Icon name="wallet" />}
                title={payment?.label ?? 'Payment'}
                value="Personal"
                onPress={() => navigate('/wallet')}
              />
              <SettingsRow
                inset="plain"
                leading={<Icon name="person" />}
                title="Ride preferences"
                value={preferences.conversation}
                hasDivider={false}
                onPress={() => navigate('/ride-preferences')}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 px-5">
            {requestError ? (
              <p className="text-center text-footnote text-label-secondary">{requestError}</p>
            ) : null}
            <Button label={actionLabel} onPress={request} isDisabled={!selected} />
          </div>
        </Sheet>
      </div>
    </MapLayer>
  );
}
