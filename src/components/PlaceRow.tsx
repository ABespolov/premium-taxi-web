import { Icon, type IconName } from '@/components/Icon';

type Props = {
  icon: IconName;
  title: string;
  subtitle: string;
  meta?: string;
  hasDivider?: boolean;
  onPress?: () => void;
};

// Figma's Place Row: a saved place, recent trip or search result.
export function PlaceRow({ icon, title, subtitle, meta, hasDivider = true, onPress }: Props) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={!onPress}
      className="flex w-full items-center gap-3.5 text-left enabled:active:opacity-60"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background-tertiary">
        <Icon name={icon} />
      </span>
      <span
        className={`flex min-w-0 flex-1 items-center gap-2 py-3.5 ${hasDivider ? 'border-b border-separator' : ''}`}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-body">{title}</span>
          <span className="truncate text-subheadline text-label-secondary">{subtitle}</span>
        </span>
        {meta ? <span className="text-subheadline text-label-tertiary">{meta}</span> : null}
      </span>
    </button>
  );
}
