import { useState } from 'react';
import { useNavigate } from 'react-router';
import { getPreferences, savePreferences } from '@/api/profile';
import { Button } from '@/components/Button';
import { NavBar } from '@/components/NavBar';
import { FormFooter, Page, PageBody } from '@/components/Page';
import { TextField } from '@/components/TextField';
import { messageOf } from '@/hooks/use-request';
import {
  conversationOptions,
  musicOptions,
  type Preferences,
  temperatureOptions,
} from '@/mocks/profile';

export function RidePreferences() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(getPreferences);
  const [error, setError] = useState<string | null>(null);

  function change(changes: Partial<Preferences>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function save() {
    try {
      savePreferences(draft);
      navigate(-1);
    } catch (caught) {
      setError(messageOf(caught));
    }
  }

  return (
    <Page>
      <NavBar />
      <PageBody className="flex flex-col gap-6 px-5 pt-6 pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-title1">Ride preferences</h1>
          <p className="text-subheadline text-label-secondary">
            Your driver sees these before every ride.
          </p>
        </div>
        <ChipGroup
          title="Conversation"
          options={conversationOptions}
          value={draft.conversation}
          onChange={(conversation) => change({ conversation })}
        />
        <ChipGroup
          title="Temperature"
          options={temperatureOptions}
          value={draft.temperature}
          onChange={(temperature) => change({ temperature })}
        />
        <ChipGroup
          title="Music"
          options={musicOptions}
          value={draft.music}
          onChange={(music) => change({ music })}
        />
        <div>
          <p className="text-footnote font-semibold text-label-secondary">Service</p>
          <ToggleRow
            label="Help with luggage"
            value={draft.helpWithLuggage}
            onChange={(helpWithLuggage) => change({ helpWithLuggage })}
            hasDivider
          />
          <ToggleRow
            label="Open the door for me"
            value={draft.openDoor}
            onChange={(openDoor) => change({ openDoor })}
          />
        </div>
        <TextField
          label="Note for your driver"
          value={draft.note}
          onChangeText={(note) => change({ note })}
          placeholder="Anything your driver should know"
          maxLength={140}
        />
      </PageBody>
      <FormFooter>
        {error ? <p className="text-center text-footnote text-label-secondary">{error}</p> : null}
        <Button label="Save preferences" onPress={save} />
      </FormFooter>
    </Page>
  );
}

type ChipGroupProps<T extends string> = {
  title: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
};

function ChipGroup<T extends string>({ title, options, value, onChange }: ChipGroupProps<T>) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-footnote font-semibold text-label-secondary">{title}</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={title}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={option === value}
            onClick={() => onChange(option)}
            className={`flex h-11 items-center rounded-full px-4 text-subheadline font-semibold ${option === value ? 'bg-label-primary text-background-primary' : 'bg-background-tertiary active:opacity-60'}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

type ToggleRowProps = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  hasDivider?: boolean;
};

function ToggleRow({ label, value, onChange, hasDivider = false }: ToggleRowProps) {
  return (
    <label className={`flex items-center py-3 ${hasDivider ? 'border-b border-separator' : ''}`}>
      <span className="flex-1 text-body">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        className={`relative h-[31px] w-[51px] rounded-full transition-colors duration-200 ${value ? 'bg-label-primary' : 'bg-separator'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-[27px] rounded-full bg-white shadow-[0_3px_8px_rgb(0_0_0/0.15)] transition-transform duration-200 ${value ? 'translate-x-5' : ''}`}
        />
      </button>
    </label>
  );
}
