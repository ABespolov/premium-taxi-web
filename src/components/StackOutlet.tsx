import { AnimatePresence, motion } from 'motion/react';
import { createContext, type ReactNode, use, useRef } from 'react';
import {
  UNSAFE_LocationContext as LocationContext,
  useLocation,
  useNavigate,
  useNavigationType,
  useOutlet,
} from 'react-router';

// iOS push timing: the new page slides over while the old one drifts a third of the way.
const SLIDE = { type: 'tween', ease: [0.32, 0.72, 0, 1], duration: 0.42 } as const;
const PARALLAX = '-30%';

type Direction = 'forward' | 'back';

const variants = {
  enter: (direction: Direction) => ({ x: direction === 'forward' ? '100%' : PARALLAX }),
  center: { x: 0 },
  exit: (direction: Direction) => ({
    x: direction === 'forward' ? PARALLAX : '100%',
    zIndex: direction === 'back' ? 1 : 0,
  }),
};

// A menu page slides in from the left as a side drawer, over a dimmed screen, and back
// slides it away there. Its x is relative to its own width, so -100% is just off screen.
const drawerVariants = {
  enter: (direction: Direction) => ({ x: direction === 'forward' ? '-100%' : PARALLAX }),
  center: { x: 0 },
  exit: (direction: Direction) => ({
    x: direction === 'forward' ? PARALLAX : '-100%',
    zIndex: direction === 'back' ? 1 : 0,
  }),
};

// The page the router is on now; a page that is not it is on its way out.
const CurrentPageContext = createContext('');

// Renders the child route as a page in a stack: pushed pages slide in from the right and
// back slides them away. A leaving page keeps showing what it showed.
type Props = {
  // Pages that share one slot, so moving between them is not a page transition.
  group?: (pathname: string) => string;
  // A route with no page of its own (Home): what is under the stack takes its touches.
  emptyPath?: string;
  // Pages that open from the left edge, as a side menu, instead of the right.
  isDrawer?: (pathname: string) => boolean;
};

export function StackOutlet({ group, emptyPath, isDrawer }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const isDrawerOpen = isDrawer?.(location.pathname) ?? false;
  const outlet = useOutlet();
  const direction: Direction = useNavigationType() === 'POP' ? 'back' : 'forward';
  const key = group ? group(location.pathname) : location.pathname;

  return (
    <CurrentPageContext value={key}>
      <AnimatePresence initial={false}>
        {isDrawerOpen ? (
          <motion.button
            key="drawer-scrim"
            type="button"
            aria-label="Close menu"
            onClick={() => (location.key === 'default' ? navigate(emptyPath ?? '/') : navigate(-1))}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={SLIDE}
            className="absolute inset-0 bg-black/30"
          />
        ) : null}
      </AnimatePresence>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={key}
          custom={direction}
          // Each page keeps its own variants as it leaves, so a drawer also closes to the left.
          variants={isDrawer?.(location.pathname) ? drawerVariants : variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={SLIDE}
          className={
            location.pathname === emptyPath
              ? 'pointer-events-none absolute inset-0'
              : isDrawerOpen
                ? 'absolute inset-y-0 left-0 w-[85%] max-w-[340px] shadow-floating'
                : 'absolute inset-0'
          }
        >
          <Frozen pageKey={key}>{outlet}</Frozen>
        </motion.div>
      </AnimatePresence>
    </CurrentPageContext>
  );
}

type FrozenProps = { pageKey: string; children: ReactNode };

// While a page is current it follows the router; once it starts leaving it keeps the route
// and address it last had, so it does not turn into the page coming in.
function Frozen({ pageKey, children }: FrozenProps) {
  const route = use(LocationContext);
  const currentKey = use(CurrentPageContext);
  const last = useRef({ route, children });
  if (pageKey === currentKey) last.current = { route, children };
  return <LocationContext value={last.current.route}>{last.current.children}</LocationContext>;
}
