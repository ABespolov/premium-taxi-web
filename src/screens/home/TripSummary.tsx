import type { ReactNode } from 'react';
import { Icon } from '@/components/Icon';
import type { Place } from '@/mocks/places';

type Props = {
  pickup: Place;
  destination: Place;
  // Opens the route to change it; without it the summary only shows the trip.
  onEdit?: () => void;
};

// Figma's Trip summary: pickup and destination.
export function TripSummary({ pickup, destination, onEdit }: Props) {
  return (
    <div className="rounded-[14px] bg-background-tertiary px-4">
      <SummaryRow onPress={onEdit} hasDivider label={`Pickup, ${pickup.name}`}>
        <Icon name="summary-pickup" />
        <span className="min-w-0 flex-1 truncate text-body">{pickup.name}</span>
      </SummaryRow>
      <SummaryRow onPress={onEdit} hasDivider={false} label={`Destination, ${destination.name}`}>
        <Icon name="summary-dropoff" />
        <span className="min-w-0 flex-1 truncate text-body">{destination.name}</span>
      </SummaryRow>
    </div>
  );
}

type RowProps = {
  children: ReactNode;
  onPress?: () => void;
  hasDivider: boolean;
  label: string;
};

function SummaryRow({ children, onPress, hasDivider, label }: RowProps) {
  const className = `flex w-full items-center gap-3.5 py-3 text-left ${hasDivider ? 'border-b border-separator' : ''}`;
  if (!onPress) return <div className={className}>{children}</div>;
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={`${label}. Change route`}
      className={`${className} active:opacity-60`}
    >
      {children}
    </button>
  );
}
