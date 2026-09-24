import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { requestCode, verifyCode } from '@/api/auth';
import { saveProfile } from '@/api/profile';
import { Button } from '@/components/Button';
import { NavBar } from '@/components/NavBar';
import { FormFooter, Page, PageBody } from '@/components/Page';
import { useNavigateKeepingFocus } from '@/hooks/use-navigate-keeping-focus';
import { messageOf } from '@/hooks/use-request';
import { formatCountdown } from '@/utils/format';

const CODE_LENGTH = 6;
const RESEND_AFTER_SECONDS = 30;
const SLOTS = Array.from({ length: CODE_LENGTH }, (_, index) => index);

export function Code() {
  const navigate = useNavigateKeepingFocus();
  const [params] = useSearchParams();
  const phone = params.get('phone') ?? '';
  const input = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_AFTER_SECONDS);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (secondsLeft === 0) return;
    const timer = setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  function verify(candidate: string) {
    try {
      verifyCode(candidate);
      saveProfile({ phone });
      navigate('/name');
    } catch (caught) {
      setError(messageOf(caught));
      setCode('');
      input.current?.focus();
    }
  }

  function handleChange(text: string) {
    const digits = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    setError(null);
    if (digits.length === CODE_LENGTH) verify(digits);
  }

  function resend() {
    try {
      requestCode(phone);
      setCode('');
      setError(null);
      setSecondsLeft(RESEND_AFTER_SECONDS);
    } catch (caught) {
      setError(messageOf(caught));
    }
  }

  return (
    <Page>
      <NavBar />
      <PageBody className="flex flex-col gap-2 px-5 pt-6">
        <h1 className="font-serif text-title1">Enter the code</h1>
        <p className="text-subheadline text-label-secondary">Sent to {phone}</p>
        <div className="h-4 shrink-0" />
        <div className="relative">
          <div className="flex gap-2" aria-hidden>
            {SLOTS.map((slot) => (
              <CodeDigit
                key={slot}
                digit={code[slot]}
                isActive={isFocused && slot === Math.min(code.length, CODE_LENGTH - 1)}
              />
            ))}
          </div>
          {/* The real field lies over the cells: a tap on any cell focuses it in place. */}
          <input
            ref={input}
            value={code}
            onChange={(event) => handleChange(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={CODE_LENGTH}
            data-carry-focus
            aria-label={`Verification code, ${code.length} of ${CODE_LENGTH} digits entered`}
            className="absolute inset-0 size-full opacity-0"
            style={{ caretColor: 'transparent' }}
          />
        </div>
        <div className="h-2 shrink-0" />
        <ResendLine error={error} secondsLeft={secondsLeft} onResend={resend} />
      </PageBody>
      <FormFooter>
        <Button
          label="Verify"
          onPress={() => verify(code)}
          isDisabled={code.length < CODE_LENGTH}
        />
      </FormFooter>
    </Page>
  );
}

function CodeDigit({ digit, isActive }: { digit: string | undefined; isActive: boolean }) {
  return (
    <div
      className={`flex h-[60px] flex-1 items-center justify-center rounded-xl border-[1.5px] bg-background-tertiary ${isActive ? 'border-label-primary' : 'border-background-tertiary'}`}
    >
      {digit ? <span className="font-serif text-title2">{digit}</span> : null}
      {isActive && !digit ? <span className="h-6 w-0.5 animate-pulse bg-label-primary" /> : null}
    </div>
  );
}

type ResendLineProps = { error: string | null; secondsLeft: number; onResend: () => void };

function ResendLine({ error, secondsLeft, onResend }: ResendLineProps) {
  if (error) {
    return (
      <p className="text-body" aria-live="polite">
        {error}
      </p>
    );
  }
  if (secondsLeft > 0) {
    return (
      <p className="py-[11px] text-body text-label-tertiary">
        Resend code in {formatCountdown(secondsLeft)}
      </p>
    );
  }
  return (
    <button
      type="button"
      onClick={onResend}
      className="self-start py-[11px] text-body font-semibold active:opacity-50"
    >
      Resend code
    </button>
  );
}
