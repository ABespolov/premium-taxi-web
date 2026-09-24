import type { ReactNode, Ref } from 'react';

// A step's controls over the map. The layer itself lets touches through to the map; only
// its buttons and sheet catch them.
export function MapLayer({ children, ref }: { children: ReactNode; ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 z-10">
      {children}
    </div>
  );
}

// Where a floating control sits: 4px under the safe area, 20px in from the side.
export const TOP_CONTROL = 'calc(env(safe-area-inset-top) + 4px)';
