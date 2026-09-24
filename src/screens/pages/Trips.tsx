import { useNavigate } from 'react-router';
import { getTrips, type TripStatus } from '@/api/rides';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { NavBar } from '@/components/NavBar';
import { Page, PageBody } from '@/components/Page';
import { PlaceRow } from '@/components/PlaceRow';
import { stepHref } from '@/screens/home/steps';
import { formatClock, formatDay, formatPriceEur } from '@/utils/format';

const STATUS_LABELS: Record<TripStatus, string> = {
  searching: 'Finding a driver',
  'on-the-way': 'Driver on the way',
  scheduled: 'Scheduled',
  cancelled: 'Cancelled',
};

export function Trips() {
  const navigate = useNavigate();
  const trips = getTrips();

  return (
    <Page>
      <NavBar />
      <div className="px-5 pt-8">
        <h1 className="font-serif text-large-title">Trips</h1>
      </div>
      {trips.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-10 pb-24">
          <div className="flex size-16 items-center justify-center rounded-full bg-background-tertiary">
            <Icon name="clock-large" />
          </div>
          <div className="h-1" />
          <p className="text-title3 font-semibold">No trips yet</p>
          <p className="text-center text-subheadline text-label-secondary">
            Rides you book or schedule will appear here.
          </p>
          <Button
            label="Plan a ride"
            variant="secondary"
            size="compact"
            onPress={() => navigate(stepHref({ name: 'where-to' }))}
          />
        </div>
      ) : (
        <PageBody className="px-5 pt-4">
          {trips.map((trip) => (
            <PlaceRow
              key={trip.id}
              icon={trip.status === 'scheduled' ? 'clock' : 'place'}
              title={trip.destination.name}
              subtitle={`${formatDay(trip.pickupAt)}, ${formatClock(trip.pickupAt)} · ${STATUS_LABELS[trip.status]}`}
              meta={formatPriceEur(trip.priceEur)}
            />
          ))}
        </PageBody>
      )}
    </Page>
  );
}
