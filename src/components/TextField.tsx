import type { InputHTMLAttributes, Ref } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'onChange'> & {
  label: string;
  onChangeText: (text: string) => void;
  ref?: Ref<HTMLInputElement>;
};

// Figma's Text Field: caption label over a body value; the border marks focus.
export function TextField({ label, onChangeText, ref, ...inputProps }: Props) {
  return (
    <label className="flex flex-col gap-0.5 rounded-xl border-[1.5px] border-background-tertiary bg-background-tertiary px-[12.5px] pt-[7.5px] pb-[8.5px] focus-within:border-label-primary">
      <span className="text-caption text-label-secondary">{label}</span>
      <input
        ref={ref}
        onChange={(event) => onChangeText(event.target.value)}
        className="h-[22px] w-full border-0 bg-transparent p-0 text-body placeholder:text-label-tertiary"
        {...inputProps}
      />
    </label>
  );
}
