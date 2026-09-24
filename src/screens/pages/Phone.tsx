import { useState } from 'react';
import { requestCode } from '@/api/auth';
import { Button } from '@/components/Button';
import { NavBar } from '@/components/NavBar';
import { FormFooter, Page, PageBody } from '@/components/Page';
import { TextField } from '@/components/TextField';
import { useNavigateKeepingFocus } from '@/hooks/use-navigate-keeping-focus';
import { messageOf } from '@/hooks/use-request';
import { formatPhoneInput } from '@/utils/format';
import { isValidPhone } from '@/utils/phone';

export function Phone() {
  const navigate = useNavigateKeepingFocus();
  const [phone, setPhone] = useState('+');
  const [error, setError] = useState<string | null>(null);

  function sendCode() {
    try {
      requestCode(phone);
      navigate(`/code?phone=${encodeURIComponent(phone.trim())}`);
    } catch (caught) {
      setError(messageOf(caught));
    }
  }

  return (
    <Page>
      <NavBar />
      <PageBody className="flex flex-col gap-2 px-5 pt-6">
        <h1 className="font-serif text-title1">What’s your number?</h1>
        <p className="text-subheadline text-label-secondary">
          We’ll text you a code to confirm it.
        </p>
        <div className="h-4 shrink-0" />
        <TextField
          label="Phone number"
          value={phone}
          onChangeText={(text) => {
            setPhone(formatPhoneInput(text));
            setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && isValidPhone(phone)) sendCode();
          }}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={20}
          data-carry-focus
        />
        {error ? <p className="text-footnote text-label-secondary">{error}</p> : null}
      </PageBody>
      <FormFooter>
        <Button label="Continue" onPress={sendCode} isDisabled={!isValidPhone(phone)} />
      </FormFooter>
    </Page>
  );
}
