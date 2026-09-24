import type { MouseEvent } from 'react';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'regular' | 'compact';
  isDisabled?: boolean;
};

const SIZE = { regular: 'h-14 w-full', compact: 'h-12 w-[180px]' } as const;

const VARIANT = {
  primary: 'bg-label-primary text-background-primary active:opacity-80',
  secondary: 'bg-background-tertiary text-label-primary active:opacity-70',
} as const;

// Keeps focus, and so the keyboard, in the field being filled when the button is tapped.
function keepFocus(event: MouseEvent) {
  event.preventDefault();
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'regular',
  isDisabled = false,
}: Props) {
  return (
    <button
      type="button"
      onClick={onPress}
      onMouseDown={keepFocus}
      disabled={isDisabled}
      className={`flex shrink-0 items-center justify-center rounded-[14px] text-headline font-semibold transition-opacity disabled:opacity-40 ${SIZE[size]} ${VARIANT[variant]}`}
    >
      {label}
    </button>
  );
}
