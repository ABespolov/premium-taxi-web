import { useState } from 'react';
import { useNavigate } from 'react-router';
import { saveProfile } from '@/api/profile';
import { Button } from '@/components/Button';
import { NavBar } from '@/components/NavBar';
import { FormFooter, Page, PageBody } from '@/components/Page';
import { TextField } from '@/components/TextField';
import { messageOf } from '@/hooks/use-request';
import { hideKeyboardThen } from '@/utils/keyboard';

export function Name() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [error, setError] = useState<string | null>(null);

  function save() {
    try {
      saveProfile({ firstName, lastName: '' });
      // The map opens full screen; it should not appear under a keyboard still going down.
      hideKeyboardThen(() => navigate('/home', { replace: true }));
    } catch (caught) {
      setError(messageOf(caught));
    }
  }

  return (
    <Page>
      <NavBar />
      <PageBody className="flex flex-col gap-2 px-5 pt-6">
        <h1 className="font-serif text-title1">What’s your name?</h1>
        <p className="text-subheadline text-label-secondary">
          Your driver will use it to greet you at pickup.
        </p>
        <div className="h-4 shrink-0" />
        <TextField
          label="First name"
          value={firstName}
          onChangeText={(text) => {
            setFirstName(text);
            setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && firstName.trim()) save();
          }}
          autoComplete="given-name"
          autoCapitalize="words"
          enterKeyHint="done"
        />
        {error ? <p className="text-footnote text-label-secondary">{error}</p> : null}
      </PageBody>
      <FormFooter>
        <Button label="Continue" onPress={save} isDisabled={firstName.trim() === ''} />
      </FormFooter>
    </Page>
  );
}
