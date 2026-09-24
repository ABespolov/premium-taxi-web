import type { ReactNode } from 'react';
import { useVisualViewport } from '@/hooks/use-visual-viewport';

// A full page pushed over the stack: white, clear of the status bar.
export function Page({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex h-full flex-col bg-background-primary"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {children}
    </div>
  );
}

// The part of a page that scrolls when it does not fit above the keyboard.
export function PageBody({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain ${className}`}>
      {children}
    </div>
  );
}

// Figma keeps a form's button 16px above the keyboard, and 8px above the home indicator
// when the keyboard is down.
export function FormFooter({ children }: { children: ReactNode }) {
  const { keyboardHeight } = useVisualViewport();
  return (
    <div
      className="flex shrink-0 flex-col gap-2 px-5 pt-2"
      style={{
        paddingBottom: keyboardHeight > 0 ? 16 : 'calc(env(safe-area-inset-bottom) + 8px)',
      }}
    >
      {children}
    </div>
  );
}
