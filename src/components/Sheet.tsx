import { type ReactNode, useLayoutEffect, useRef } from 'react';

const GAPS = { none: 'gap-0', tight: 'gap-3', regular: 'gap-4' } as const;

type Props = {
  children: ReactNode;
  gap?: keyof typeof GAPS;
  // The sheet's full height, reported as soon as its content is laid out rather than while
  // it animates, so the map can frame itself for where the sheet ends up.
  onMeasure?: (height: number) => void;
  // A sheet raised to a fixed height, such as Where to filling the screen; without it the
  // sheet fits its content.
  height?: number;
  hasGrabber?: boolean;
};

// The height of the sheet last shown over the map. The next step's sheet starts from it,
// so moving between steps resizes one white sheet instead of swapping two.
let shownHeight = 0;

// Moves the white background to `offset` at once, then lets the CSS transition carry it
// back to the sheet's edge.
function slideFrom(background: HTMLElement, offset: number) {
  background.classList.remove('is-sliding');
  background.style.transform = `translateY(${offset}px)`;
  background.getBoundingClientRect();
  background.classList.add('is-sliding');
  background.style.transform = '';
}

// Where the background is right now, mid-slide or not.
function currentOffset(background: HTMLElement) {
  return new DOMMatrix(getComputedStyle(background).transform).m42;
}

// The white bottom sheet that sits over the map, with its grabber. It takes its new height
// at once; only its white background slides from the old edge to the new one, a transform a
// phone animates without laying the sheet out again every frame.
export function Sheet({
  children,
  gap = 'tight',
  onMeasure,
  height: fixedHeight,
  hasGrabber = true,
}: Props) {
  const content = useRef<HTMLDivElement>(null);
  const background = useRef<HTMLDivElement>(null);
  const onMeasureRef = useRef(onMeasure);
  onMeasureRef.current = onMeasure;

  useLayoutEffect(() => {
    const node = content.current;
    const white = background.current;
    if (!node || !white) return;
    let height = node.offsetHeight;
    onMeasureRef.current?.(height);
    if (shownHeight > 0 && shownHeight !== height) slideFrom(white, height - shownHeight);
    shownHeight = height;

    const observer = new ResizeObserver(() => {
      const next = node.offsetHeight;
      if (next === height) return;
      onMeasureRef.current?.(next);
      slideFrom(white, currentOffset(white) + next - height);
      height = next;
      shownHeight = next;
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="pointer-events-auto relative">
      {/* Runs past the bottom of the screen, so sliding it never uncovers the map below. */}
      <div
        ref={background}
        className="sheet-background absolute inset-x-0 top-0 -bottom-[100vh] rounded-t-[20px] bg-background-secondary"
        aria-hidden
      />
      <div
        ref={content}
        className={`fade-in-late relative flex flex-col pt-2.5 ${GAPS[gap]}`}
        style={{
          height: fixedHeight,
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
        }}
      >
        {hasGrabber ? (
          <div
            className="h-[5px] w-9 shrink-0 self-center rounded-[3px] bg-label-tertiary"
            aria-hidden
          />
        ) : null}
        {children}
      </div>
    </div>
  );
}
