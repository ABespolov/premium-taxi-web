import { Icon, type IconName } from '@/components/Icon';

type Props = { icon: IconName; label: string; onPress: () => void };

// The round white control floating over the map: account, back, recenter. It fades in with
// its step.
export function FloatingButton({ icon, label, onPress }: Props) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={label}
      className="fade-in pointer-events-auto flex size-11 items-center justify-center rounded-full bg-background-secondary shadow-floating active:opacity-70"
    >
      <Icon name={icon} />
    </button>
  );
}
