import { type ReactNode, use, useState } from 'react';
import {
  UNSAFE_LocationContext as LocationContext,
  useLocation,
  useNavigationType,
  useOutlet,
} from 'react-router';

type Direction = 'forward' | 'back';

type RouteState = React.ContextType<typeof LocationContext>;

type Entry = {
  key: string;
  page: ReactNode;
  // The address the page last had, so a page on its way out does not turn into the one
  // coming in.
  route: RouteState;
  phase: 'enter' | 'idle' | 'exit';
  direction: Direction;
  isEmpty: boolean;
};

type Props = {
  // Pages that share one slot, so moving between them is not a page transition.
  group?: (pathname: string) => string;
  // A route with no page of its own (Home): what is under the stack takes its touches.
  emptyPath?: string;
};

// Renders the child route as a page in a stack, with iOS push timing done in CSS: a pushed
// page slides in from the right over the old one, which drifts a third of the way left;
// back reverses it. A leaving page stays until its animation ends.
export function StackOutlet({ group, emptyPath }: Props) {
  const route = use(LocationContext);
  const location = useLocation();
  const outlet = useOutlet();
  const direction: Direction = useNavigationType() === 'POP' ? 'back' : 'forward';
  const key = group ? group(location.pathname) : location.pathname;
  const isEmpty = location.pathname === emptyPath;
  const [entries, setEntries] = useState<Entry[]>(() => [
    { key, page: outlet, route, phase: 'idle', direction, isEmpty },
  ]);

  const top = entries[entries.length - 1];
  if (top.key !== key) {
    setEntries([
      ...entries.map((entry) => ({ ...entry, phase: 'exit' as const, direction })),
      { key, page: outlet, route, phase: 'enter', direction, isEmpty },
    ]);
  } else if (top.route !== route && top.phase !== 'exit') {
    setEntries([...entries.slice(0, -1), { ...top, page: outlet, route, isEmpty }]);
  }

  function finish(entry: Entry) {
    setEntries((current) =>
      entry.phase === 'exit'
        ? current.filter((candidate) => candidate !== entry)
        : current.map((candidate) =>
            candidate === entry ? { ...candidate, phase: 'idle' } : candidate,
          ),
    );
  }

  return entries.map((entry) => (
    <div
      key={entry.key}
      className={`page ${entry.phase === 'idle' ? '' : `page-${entry.phase}-${entry.direction}`} ${entry.isEmpty ? 'pointer-events-none' : ''}`}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) finish(entry);
      }}
    >
      <LocationContext value={entry.route}>{entry.page}</LocationContext>
    </div>
  ));
}
