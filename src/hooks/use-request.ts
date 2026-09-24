import { type DependencyList, useEffect, useState } from 'react';

export type RequestState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T };

export const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong';

// Runs a network call and tracks it; it reruns when `deps` change. What is already on screen
// stays there while the next answer is on its way.
export function useRequest<T>(load: () => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<RequestState<T>>({ status: 'loading' });

  // biome-ignore lint/correctness/useExhaustiveDependencies: callers pass what `load` reads as `deps`.
  useEffect(() => {
    let isCurrent = true;
    load().then(
      (data) => {
        if (isCurrent) setState({ status: 'success', data });
      },
      (error: unknown) => {
        if (isCurrent) setState({ status: 'error', message: messageOf(error) });
      },
    );
    return () => {
      isCurrent = false;
    };
  }, [...deps]);

  return state;
}
