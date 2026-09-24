import type { ReactNode } from 'react';
import { Icon } from '@/components/Icon';

type Props = {
  leading: ReactNode;
  title: string;
  value?: string;
  hasDivider?: boolean;
  inset?: 'grouped' | 'plain';
  onPress?: () => void;
};

// Figma's Settings Row: grouped list row for settings, wallet and ride options.
export function SettingsRow({
  leading,
  title,
  value,
  hasDivider = true,
  inset = 'grouped',
  onPress,
}: Props) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={!onPress}
      className={`flex w-full items-center gap-3 py-[13px] text-left enabled:active:opacity-60 ${inset === 'grouped' ? 'pr-3.5 pl-4' : ''} ${hasDivider ? 'border-b border-separator' : ''}`}
    >
      <span className="flex h-[22px] w-8 items-center justify-center">{leading}</span>
      <span className="min-w-0 flex-1 truncate text-body">{title}</span>
      {value ? <span className="text-subheadline text-label-secondary">{value}</span> : null}
      <Icon name="chevron-right" />
    </button>
  );
}
