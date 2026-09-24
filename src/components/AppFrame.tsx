import type { ReactNode } from 'react';
import { useVisualViewport } from '@/hooks/use-visual-viewport';

// The app keeps a phone-width column, as it was designed, and sizes itself to the visible
// area so the keyboard shrinks it the way it would on a phone.
export function AppFrame({ children }: { children: ReactNode }) {
  const { height } = useVisualViewport();
  return (
    <div
      className="relative mx-auto w-full max-w-[430px] overflow-hidden bg-white"
      style={{ height }}
    >
      {children}
    </div>
  );
}
