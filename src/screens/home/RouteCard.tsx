import { Children, isValidElement, type ReactNode } from 'react';
import { Icon } from '@/components/Icon';

const ROW_HEIGHT = 52;
const DIVIDER_HEIGHT = 1;
// The connector runs from under the pickup dot down to the top of the dropoff square.
const CONNECTOR_TOP = 31.5;
const CONNECTOR_SHORTFALL = 11;

type CardProps = { children: ReactNode; actions: ReactNode };

// Figma's Route card: pickup, stops and destination joined by a connector, actions beside it.
export function RouteCard({ children, actions }: CardProps) {
  const rows = Children.toArray(children);
  const connectorHeight = (rows.length - 1) * (ROW_HEIGHT + DIVIDER_HEIGHT) - CONNECTOR_SHORTFALL;

  return (
    <div className="flex items-center gap-1">
      <div className="relative min-w-0 flex-1 rounded-2xl border-[1.5px] border-label-primary bg-background-secondary">
        {rows.map((row, index) => (
          <div key={isValidElement(row) && row.key !== null ? row.key : index}>
            {index > 0 ? (
              <div className="pl-[42px]">
                <div className="h-px bg-separator" />
              </div>
            ) : null}
            {row}
          </div>
        ))}
        <div
          className="absolute left-[21.25px] w-[1.5px] bg-label-tertiary"
          style={{ top: CONNECTOR_TOP, height: connectorHeight }}
          aria-hidden
        />
      </div>
      <div className="flex flex-col gap-1">{actions}</div>
    </div>
  );
}

type RowProps = {
  marker: 'pickup' | 'stop' | 'dropoff';
  children: ReactNode;
  trailing?: ReactNode;
};

// One 52px line of the route card: its dot, its text, and any trailing controls.
export function RouteRow({ marker, children, trailing }: RowProps) {
  return (
    <div className="flex h-[52px] items-center gap-3.5 pr-1.5 pl-4">
      <span className="flex size-3 items-center justify-center">
        {marker === 'pickup' ? <Icon name="pickup-dot" /> : null}
        {marker === 'stop' ? <Icon name="stop-dot" /> : null}
        {marker === 'dropoff' ? <span className="size-[11px] rounded-sm bg-label-primary" /> : null}
      </span>
      <div className="flex min-w-0 flex-1 flex-col justify-center">{children}</div>
      {trailing ? <div className="flex items-center gap-0.5">{trailing}</div> : null}
    </div>
  );
}
