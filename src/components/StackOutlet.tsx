import { AnimatePresence, motion } from 'motion/react';
import { createContext, type ReactNode, use, useRef } from 'react';
import {
  UNSAFE_LocationContext as LocationContext,
  useLocation,
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

// The page the router is on now; a page that is not it is on its way out.
const CurrentPageContext = createContext('');

// Renders the child route as a page in a stack: pushed pages slide in from the right and
// back slides them away. A leaving page keeps showing what it showed.
type Props = {
  // Pages that share one slot, so moving between them is not a page transition.
  group?: (pathname: string) => string;
  // A route with no page of its own (Home): what is under the stack takes its touches.
  emptyPath?: string;
};

export function StackOutlet({ group, emptyPath }: Props) {
  const location = useLocation();
  const outlet = useOutlet();
  const direction: Direction = useNavigationType() === 'POP' ? 'back' : 'forward';
  const key = group ? group(location.pathname) : location.pathname;

  return (
    <CurrentPageContext value={key}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={key}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={SLIDE}
          className={
            location.pathname === emptyPath
              ? 'pointer-events-none absolute inset-0'
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
