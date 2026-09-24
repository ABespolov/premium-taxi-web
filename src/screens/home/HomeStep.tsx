import { useState } from 'react';
import { useNavigate } from 'react-router';
import { getSavedPlaces } from '@/api/places';
import { getPickupEta } from '@/api/rides';
import { FloatingButton } from '@/components/FloatingButton';
import { Icon, placeIcons } from '@/components/Icon';
import { PlaceRow } from '@/components/PlaceRow';
import { Sheet } from '@/components/Sheet';
import { useBooking } from '@/hooks/use-booking';
import { useSafeArea } from '@/hooks/use-safe-area';
import type { Place } from '@/mocks/places';
import { MapLayer, TOP_CONTROL } from '@/screens/home/MapLayer';
import { useMapScene } from '@/screens/home/map-scene';
import { useShowStep } from '@/screens/home/steps';
import { formatMinutes, formatPickupTime } from '@/utils/format';

const SHEET_HEIGHT_ESTIMATE = 354;
const PICKUP_ZOOM = 16;
// Space between the recenter button and the sheet.
const RECENTER_GAP = 12;

// The first sheet: where to, when, and saved places.
export function HomeStep({ onSchedule }: { onSchedule: () => void }) {
  const insets = useSafeArea();
  const navigate = useNavigate();
  const showStep = useShowStep();
  const { booking, update } = useBooking();
  const [sheetHeight, setSheetHeight] = useState(SHEET_HEIGHT_ESTIMATE);
  const [focusKey, setFocusKey] = useState(0);
  const savedPlaces = getSavedPlaces();
  const etaLabel = formatMinutes(getPickupEta());

  useMapScene({
    focus: { coords: [booking.pickup.coord], zoom: PICKUP_ZOOM },
    focusKey,
    padding: { top: insets.top, bottom: sheetHeight, left: 0, right: 0 },
    markers: [{ id: 'pickup', kind: 'pin', coord: booking.pickup.coord, label: etaLabel }],
  });

  function rideTo(place: Place) {
    update({ destination: place, stops: [] });
    showStep({ name: 'choose-ride' });
  }

  return (
    <MapLayer>
      <div className="absolute left-5" style={{ top: TOP_CONTROL }}>
        <FloatingButton icon="person" label="Account" onPress={() => navigate('/account')} />
      </div>
      <div className="absolute right-5" style={{ bottom: sheetHeight + RECENTER_GAP }}>
        <FloatingButton
          icon="recenter"
          label="Back to pickup"
          onPress={() => setFocusKey((key) => key + 1)}
        />
      </div>
      <div className="absolute inset-x-0 bottom-0">
        <Sheet onMeasure={setSheetHeight}>
          <div className="px-5">
            <div className="flex h-14 items-center gap-3 rounded-[14px] bg-background-tertiary pr-1.5 pl-4">
              <button
                type="button"
                onClick={() => showStep({ name: 'where-to' })}
                className="flex h-full flex-1 items-center gap-3 text-left"
              >
                <Icon name="search" />
                <span className="text-title3 font-semibold">Where to?</span>
              </button>
              <PickupTimePill scheduledAt={booking.scheduledAt} onPress={onSchedule} />
            </div>
          </div>
          <div className="px-5">
            {savedPlaces.map((place, index) => (
              <PlaceRow
                key={place.id}
                icon={placeIcons[place.kind]}
                title={place.name}
                subtitle={place.address}
                hasDivider={index < savedPlaces.length - 1}
                onPress={() => rideTo(place)}
              />
            ))}
          </div>
        </Sheet>
      </div>
    </MapLayer>
  );
}

type PillProps = { scheduledAt: Date | null; onPress: () => void };

function PickupTimePill({ scheduledAt, onPress }: PillProps) {
  const label = scheduledAt ? formatPickupTime(scheduledAt) : 'Later';
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={scheduledAt ? `Pickup ${label}. Change time` : 'Schedule for later'}
      className="flex items-center gap-1.5 rounded-[18px] bg-background-secondary py-3 pr-2.5 pl-3 active:opacity-70"
    >
      <Icon name="clock" size={16} />
      <span className="text-subheadline font-semibold">{label}</span>
    </button>
  );
}
