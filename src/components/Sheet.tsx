import { animate, motion, useMotionValue } from 'motion/react';
import { type ReactNode, useLayoutEffect, useRef } from 'react';
import { BOTTOM_INSET } from '@/theme/tokens';

const RESIZE = { duration: 0.32, ease: [0.215, 0.61, 0.355, 1] } as const;
const CONTENT_FADE = { duration: 0.22 } as const;

const GAPS = { none: 'gap-0', tight: 'gap-3', regular: 'gap-4', loose: 'gap-5' } as const;

type Props = {
  children: ReactNode;
  gap?: keyof typeof GAPS;
  // The sheet's full height, reported as soon as its content is laid out rather than while
  // it animates, so the map can frame itself for where the sheet ends up.
  onMeasure?: (height: number) => void;
  // A sheet raised to a fixed height, such as Where to filling the screen; without it the
  // sheet fits its content.
  height?: number;
};

// The height of the sheet last shown over the map. The next step's sheet starts from it,
// so moving between steps resizes one white sheet instead of swapping two.
let shownHeight = 0;

// The white bottom sheet that sits over the map. It has no grabber: nothing drags it.
export function Sheet({ children, gap = 'tight', onMeasure, height: fixedHeight }: Props) {
  const content = useRef<HTMLDivElement>(null);
  const height = useMotionValue<number | 'auto'>(shownHeight || 'auto');
  const onMeasureRef = useRef(onMeasure);
  onMeasureRef.current = onMeasure;

  useLayoutEffect(() => {
    const node = content.current;
    if (!node) return;
    function resize(next: number) {
      onMeasureRef.current?.(next);
      const current = height.get();
      if (current === 'auto' || current === next) height.set(next);
      else animate(height, next, RESIZE);
      shownHeight = next;
    }
    resize(node.offsetHeight);
    const observer = new ResizeObserver(() => resize(node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, [height]);

  return (
    <motion.div
      className="pointer-events-auto overflow-hidden rounded-t-[20px] bg-background-secondary"
      style={{ height }}
    >
      <motion.div
        ref={content}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={CONTENT_FADE}
        // A sheet raised over the whole screen brings its own nav bar, so it needs no top space.
        className={`flex flex-col ${fixedHeight ? '' : 'pt-5'} ${GAPS[gap]}`}
        style={{
          height: fixedHeight,
          paddingBottom: BOTTOM_INSET,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
