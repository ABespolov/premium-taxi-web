import { useLayoutEffect, useRef, useState } from 'react';

export const WHEEL_ROW_HEIGHT = 36;
const VISIBLE_ROWS = 5;
const EDGE_ROWS = (VISIBLE_ROWS - 1) / 2;
const SETTLE_MS = 120;

// Figma fades rows by their distance from the selection: 100%, 50%, then 25%.
const ROW_TEXT = [
  'text-title3 font-semibold',
  'text-body opacity-50',
  'text-subheadline opacity-25',
] as const;

type Props = {
  labels: readonly string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  align?: 'left' | 'right';
  width: number;
  label: string;
};

// A snapping column standing in for Figma's date and time picker.
export function Wheel({ labels, selectedIndex, onChange, align = 'left', width, label }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [centeredIndex, setCenteredIndex] = useState(selectedIndex);

  // biome-ignore lint/correctness/useExhaustiveDependencies: placed once; later changes come from scrolling.
  useLayoutEffect(() => {
    scroller.current?.scrollTo({ top: selectedIndex * WHEEL_ROW_HEIGHT });
  }, []);

  function indexAt(offset: number) {
    return Math.min(labels.length - 1, Math.max(0, Math.round(offset / WHEEL_ROW_HEIGHT)));
  }

  function track() {
    const node = scroller.current;
    if (!node) return;
    const index = indexAt(node.scrollTop);
    setCenteredIndex(index);
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      if (index !== selectedIndex) onChange(index);
    }, SETTLE_MS);
  }

  function step(delta: number) {
    const index = Math.min(labels.length - 1, Math.max(0, selectedIndex + delta));
    scroller.current?.scrollTo({ top: index * WHEEL_ROW_HEIGHT, behavior: 'smooth' });
  }

  function handleKey(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown') step(1);
    if (event.key === 'ArrowUp') step(-1);
  }

  return (
    <div
      ref={scroller}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuetext={labels[selectedIndex]}
      aria-valuenow={selectedIndex}
      onScroll={track}
      onKeyDown={handleKey}
      className="no-scrollbar snap-y snap-mandatory overflow-y-auto overscroll-contain"
      style={{
        width,
        height: WHEEL_ROW_HEIGHT * VISIBLE_ROWS,
        paddingBlock: WHEEL_ROW_HEIGHT * EDGE_ROWS,
      }}
    >
      {labels.map((text, index) => (
        <button
          type="button"
          key={text}
          tabIndex={-1}
          onClick={() => step(index - selectedIndex)}
          className={`flex w-full snap-center items-center ${align === 'left' ? 'justify-start pl-4' : 'justify-end'} ${ROW_TEXT[Math.min(2, Math.abs(index - centeredIndex))]}`}
          style={{ height: WHEEL_ROW_HEIGHT }}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
