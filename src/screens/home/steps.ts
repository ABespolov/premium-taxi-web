import { useNavigate, useSearchParams } from 'react-router';

export type PinTarget = 'pickup' | 'destination';

// Home is the one screen over the map; each step of booking only swaps its bottom sheet.
// The step lives in the address, so the browser's back button walks back through them.
export type HomeStep =
  | { name: 'home' }
  | { name: 'where-to' }
  | { name: 'pickup-on-map'; target: PinTarget }
  | { name: 'choose-ride' }
  | { name: 'finding-driver'; tripId: string };

export function parseStep(params: URLSearchParams): HomeStep {
  const step = params.get('step');
  if (step === 'where-to') return { name: 'where-to' };
  if (step === 'pickup-on-map') {
    return {
      name: 'pickup-on-map',
      target: params.get('target') === 'destination' ? 'destination' : 'pickup',
    };
  }
  if (step === 'choose-ride') return { name: 'choose-ride' };
  const tripId = params.get('trip');
  if (step === 'finding-driver' && tripId) return { name: 'finding-driver', tripId };
  return { name: 'home' };
}

export function stepHref(step: HomeStep) {
  const params = new URLSearchParams();
  if (step.name !== 'home') params.set('step', step.name);
  if (step.name === 'pickup-on-map') params.set('target', step.target);
  if (step.name === 'finding-driver') params.set('trip', step.tripId);
  const query = params.toString();
  return query ? `/home?${query}` : '/home';
}

export function useStep() {
  const [params] = useSearchParams();
  return parseStep(params);
}

// Moves Home to a step. A finished ride replaces its history, so back does not reopen it.
export function useShowStep() {
  const navigate = useNavigate();
  return (step: HomeStep, options?: { replace?: boolean }) =>
    navigate(stepHref(step), { replace: options?.replace });
}
