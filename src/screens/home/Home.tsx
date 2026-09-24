import { AnimatePresence } from 'motion/react';
import { useRef, useState } from 'react';
import { type MapHandlers, type MapScene, MapView } from '@/components/MapView';
import { useBooking } from '@/hooks/use-booking';
import type { Coord } from '@/mocks/places';
import { ChooseRideStep } from '@/screens/home/ChooseRideStep';
import { FindingDriverStep } from '@/screens/home/FindingDriverStep';
import { HomeStep } from '@/screens/home/HomeStep';
import { MapStageContext } from '@/screens/home/map-scene';
import { PickupStep } from '@/screens/home/PickupStep';
import { ScheduleSheet } from '@/screens/home/ScheduleSheet';
import { useStep } from '@/screens/home/steps';
import { WhereToStep } from '@/screens/home/WhereToStep';

// The one screen with a map. Booking moves through its steps by changing the bottom sheet,
// so the map stays loaded and its camera glides from one step to the next.
export function Home() {
  const step = useStep();
  const { booking } = useBooking();
  const [scene, setScene] = useState<MapScene | null>(null);
  const handlers = useRef<MapHandlers>({});
  const [stage] = useState(() => ({ show: setScene, handlers }));
  const [isScheduling, setIsScheduling] = useState(false);

  function changeCenter(coord: Coord) {
    handlers.current.onCenterChange?.(coord);
  }

  function pressMarker(id: string) {
    handlers.current.onMarkerPress?.(id);
  }

  return (
    // Isolated, so the map's controls and the sheet stay under the pages opened over Home.
    <div className="absolute inset-0 isolate bg-map-land">
      {scene ? (
        <MapView {...scene} onCenterChange={changeCenter} onMarkerPress={pressMarker} />
      ) : null}
      <MapStageContext value={stage}>
        {step.name === 'where-to' ? (
          <WhereToStep key="where-to" />
        ) : step.name === 'pickup-on-map' ? (
          <PickupStep key={`pickup-on-map-${step.target}`} target={step.target} />
        ) : step.name === 'choose-ride' && booking.destination ? (
          <ChooseRideStep key="choose-ride" destination={booking.destination} />
        ) : step.name === 'finding-driver' ? (
          <FindingDriverStep key={`finding-driver-${step.tripId}`} tripId={step.tripId} />
        ) : (
          <HomeStep key="home" onSchedule={() => setIsScheduling(true)} />
        )}
      </MapStageContext>
      <AnimatePresence>
        {isScheduling ? <ScheduleSheet onClose={() => setIsScheduling(false)} /> : null}
      </AnimatePresence>
    </div>
  );
}
