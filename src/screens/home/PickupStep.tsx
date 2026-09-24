import { useLayoutEffect, useRef, useState } from 'react';
import { addressAt, placeNear } from '@/api/places';
import { Button } from '@/components/Button';
import { FloatingButton } from '@/components/FloatingButton';
import { Icon, placeIcons } from '@/components/Icon';
import { PlaceRow } from '@/components/PlaceRow';
import { Sheet } from '@/components/Sheet';
import { useBooking } from '@/hooks/use-booking';
import { useRequest } from '@/hooks/use-request';
import { useSafeArea } from '@/hooks/use-safe-area';
import type { Coord } from '@/mocks/places';
import { MapLayer, TOP_CONTROL } from '@/screens/home/MapLayer';
import { useMapScene } from '@/screens/home/map-scene';
import { type PinTarget, useShowStep } from '@/screens/home/steps';

const SHEET_HEIGHT_ESTIMATE = 253;
const PIN_ZOOM = 17;
const PIN_WIDTH = 40;
const PIN_HEIGHT = 64;
// The pin's tip, where the stem meets the shadow, is 3px above the glyph's bottom.
const PIN_TIP_FROM_BOTTOM = 3;

const COPY = {
  pickup: { hint: 'Move the map to set pickup', title: 'Confirm pickup' },
  destination: { hint: 'Move the map to set destination', title: 'Confirm destination' },
} as const;

// The rider drags the map under a fixed pin to set a pickup or destination.
export function PickupStep({ target }: { target: PinTarget }) {
  const insets = useSafeArea();
  const showStep = useShowStep();
  const { booking, update } = useBooking();
  const start =
    target === 'destination' && booking.destination ? booking.destination : booking.pickup;
  const [center, setCenter] = useState<Coord>(start.coord);
  const layer = useRef<HTMLDivElement>(null);
  const [layerHeight, setLayerHeight] = useState(0);
  const [sheetHeight, setSheetHeight] = useState(SHEET_HEIGHT_ESTIMATE);
  const address = useRequest(() => addressAt(center), [center]);
  const hasAddressForCenter =
    address.status === 'success' &&
    address.data.coord[0] === center[0] &&
    address.data.coord[1] === center[1];
  const place = hasAddressForCenter ? address.data : placeNear(center);

  // Followed, not read once: arriving from Where to, the keyboard is still closing and the
  // screen grows back after this step appears.
  useLayoutEffect(() => {
    const node = layer.current;
    if (!node) return;
    setLayerHeight(node.offsetHeight);
    const observer = new ResizeObserver(() => setLayerHeight(node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useMapScene(
    {
      focus: { coords: [start.coord], zoom: PIN_ZOOM },
      padding: { top: insets.top, bottom: sheetHeight, left: 0, right: 0 },
    },
    { onCenterChange: setCenter },
  );

  const visibleCenterY = insets.top + (layerHeight - insets.top - sheetHeight) / 2;

  function editRoute() {
    showStep({ name: 'where-to' });
  }

  function confirm() {
    update(target === 'pickup' ? { pickup: place } : { destination: place });
    showStep({ name: target === 'destination' ? 'choose-ride' : 'where-to' });
  }

  return (
    <MapLayer ref={layer}>
      {layerHeight > 0 ? (
        <div
          className="absolute"
          style={{
            left: '50%',
            marginLeft: -PIN_WIDTH / 2,
            top: visibleCenterY - PIN_HEIGHT + PIN_TIP_FROM_BOTTOM,
          }}
        >
          <Icon name="center-pin" />
        </div>
      ) : null}
      <div
        className="absolute inset-x-0 flex h-11 items-center justify-center"
        style={{ top: TOP_CONTROL }}
      >
        <div className="rounded-lg bg-background-secondary px-2.5 py-[7px] text-footnote font-semibold shadow-floating">
          {COPY[target].hint}
        </div>
      </div>
      <div className="absolute left-5" style={{ top: TOP_CONTROL }}>
        <FloatingButton icon="chevron-left" label="Back" onPress={editRoute} />
      </div>
      <div className="absolute inset-x-0 bottom-0">
        <Sheet onMeasure={setSheetHeight}>
          <div className="flex flex-col gap-3 px-5">
            <h2 className="font-serif text-title2">{COPY[target].title}</h2>
            <PlaceRow
              icon={placeIcons.place}
              title={place.name}
              subtitle={place.address}
              hasDivider={false}
            />
            <Button label={COPY[target].title} onPress={confirm} />
          </div>
        </Sheet>
      </div>
    </MapLayer>
  );
}
