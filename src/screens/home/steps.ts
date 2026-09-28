import { useLocation, useNavigate, useSearchParams } from 'react-router';
import type { ServiceId } from '@/mocks/ride-classes';

export type PinTarget = 'pickup' | 'destination';

// Home is the one screen over the map; each step of booking only swaps its bottom sheet.
// The step lives in the address, so the browser's back button walks back through them.
//
// Booking asks each thing once: where (Where to), which car (Premium or Business), when (the
// service's Schedule button). A service is only opened with a destination, so where-to
// carries `next` when the rider picked the service first.
export type HomeStep =
  | { name: 'home' }
  | { name: 'where-to'; next?: ServiceId }
  | { name: 'pickup-on-map'; target: PinTarget; next?: ServiceId }
  | { name: ServiceId }
  | { name: 'finding-driver'; tripId: string };

const parseService = (value: string | null): ServiceId | undefined =>
  value === 'premium' || value === 'business' ? value : undefined;

export function parseStep(params: URLSearchParams): HomeStep {
  const step = params.get('step');
  const next = parseService(params.get('next'));
  if (step === 'where-to') return { name: 'where-to', next };
  if (step === 'pickup-on-map') {
    return {
      name: 'pickup-on-map',
      target: params.get('target') === 'destination' ? 'destination' : 'pickup',
      next,
    };
  }
  const service = parseService(step);
  if (service) return { name: service };
  const tripId = params.get('trip');
  if (step === 'finding-driver' && tripId) return { name: 'finding-driver', tripId };
  return { name: 'home' };
}

export function stepHref(step: HomeStep) {
  const params = new URLSearchParams();
  if (step.name !== 'home') params.set('step', step.name);
  if (step.name === 'pickup-on-map') params.set('target', step.target);
  if ((step.name === 'where-to' || step.name === 'pickup-on-map') && step.next) {
    params.set('next', step.next);
  }
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

// Steps back `count` entries, or to Home when the app was opened on this step directly.
export function useStepBack() {
  const navigate = useNavigate();
  const location = useLocation();
  return (count = 1) => {
    if (location.key === 'default') navigate(stepHref({ name: 'home' }), { replace: true });
    else navigate(-count);
  };
}
