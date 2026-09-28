import { type ReactNode, useState } from 'react';
import { useNavigate } from 'react-router';
import { type RideRequest, requestRide } from '@/api/rides';
import { Button } from '@/components/Button';
import { FloatingButton } from '@/components/FloatingButton';
import { Icon } from '@/components/Icon';
import { Sheet } from '@/components/Sheet';
import { useBooking } from '@/hooks/use-booking';
import { messageOf } from '@/hooks/use-request';
import type { Place } from '@/mocks/places';
import { MapLayer, TOP_CONTROL } from '@/screens/home/MapLayer';
import { useShowStep, useStepBack } from '@/screens/home/steps';
import { TripSummary } from '@/screens/home/TripSummary';
import { formatPickupTime } from '@/utils/format';

// Both services share this sheet, so they are the same height and the route sits in the
// same place; only the middle differs: Premium's cars, Business's standard.
// Tall enough for the car photos to read, short enough to leave the map about half the screen.
export const SERVICE_MIDDLE_HEIGHT = 144;

type Props = {
  title: string;
  // Beside the title, on the same line: "Book in advance", "4 min away".
  subtitle: string;
  children: ReactNode;
  pickup: Place;
  destination: Place;
  // "Order now · €35", or with a car: "Order the Maybach · €120".
  orderLabel: string;
  request: RideRequest;
  onSchedule: () => void;
  onMeasure: (height: number) => void;
};

export function ServiceSheet({
  title,
  subtitle,
  children,
  pickup,
  destination,
  orderLabel,
  request,
  onSchedule,
  onMeasure,
}: Props) {
  const navigate = useNavigate();
  const showStep = useShowStep();
  const stepBack = useStepBack();
  const { reset } = useBooking();
  const [requestError, setRequestError] = useState<string | null>(null);
  const { scheduledAt } = request;

  function order() {
    try {
      const created = requestRide(request);
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

  return (
    <MapLayer>
      <div className="absolute left-5" style={{ top: TOP_CONTROL }}>
        <FloatingButton icon="chevron-left" label="Back" onPress={() => stepBack()} />
      </div>
      <div className="absolute inset-x-0 bottom-0">
        <Sheet gap="loose" onMeasure={onMeasure}>
          <div className="flex items-baseline gap-3 px-5">
            <h2 className="font-serif text-title2">{title}</h2>
            <p className="min-w-0 flex-1 truncate text-right text-subheadline text-label-secondary">
              {subtitle}
            </p>
          </div>
          <div style={{ height: SERVICE_MIDDLE_HEIGHT }}>{children}</div>
          <div className="px-5">
            <TripSummary
              pickup={pickup}
              destination={destination}
              onEdit={() => showStep({ name: 'where-to' })}
            />
          </div>
          <div className="flex flex-col gap-2 px-5">
            {requestError ? (
              <p className="text-center text-footnote text-label-secondary">{requestError}</p>
            ) : null}
            <div className="flex gap-2">
              <div className="min-w-0 flex-1">
                <Button label={orderLabel} onPress={order} />
              </div>
              <button
                type="button"
                onClick={onSchedule}
                aria-label={
                  scheduledAt
                    ? `Pickup ${formatPickupTime(scheduledAt)}. Change time`
                    : 'Schedule for later'
                }
                className="flex h-14 shrink-0 items-center gap-1.5 rounded-[14px] bg-background-tertiary px-4 text-headline font-semibold active:opacity-70"
              >
                <Icon name="clock" />
                {scheduledAt ? formatPickupTime(scheduledAt) : 'Later'}
              </button>
            </div>
          </div>
        </Sheet>
      </div>
    </MapLayer>
  );
}
