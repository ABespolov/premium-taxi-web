import { useState } from 'react';
import { useNavigate } from 'react-router';
import { addCard, getProfile } from '@/api/profile';
import { Button } from '@/components/Button';
import { NavBar } from '@/components/NavBar';
import { FormFooter, Page, PageBody } from '@/components/Page';
import { TextField } from '@/components/TextField';
import { messageOf } from '@/hooks/use-request';
import { isValidCardNumber, isValidCvc, isValidExpiry } from '@/utils/card';
import { formatCardNumberInput, formatExpiryInput } from '@/utils/format';

type Card = { number: string; expiry: string; cvc: string; name: string };

// The first problem the rider should fix, or null when the card can be saved.
function problemWith(card: Card) {
  if (!isValidCardNumber(card.number)) return 'Check the card number';
  if (!isValidExpiry(card.expiry)) return 'Check the expiry date';
  if (!isValidCvc(card.cvc)) return 'Check the security code';
  if (!card.name.trim()) return 'Enter the name on the card';
  return null;
}

export function AddCard() {
  const navigate = useNavigate();
  const [card, setCard] = useState<Card>(() => {
    const profile = getProfile();
    return {
      number: '',
      expiry: '',
      cvc: '',
      name: `${profile.firstName} ${profile.lastName}`.trim(),
    };
  });
  const [hasTriedSaving, setHasTriedSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const problem = problemWith(card);

  function change(changes: Partial<Card>) {
    setCard((current) => ({ ...current, ...changes }));
  }

  function save() {
    setHasTriedSaving(true);
    if (problem) return;
    try {
      addCard(card.number);
      navigate(-1);
    } catch (caught) {
      setSaveError(messageOf(caught));
    }
  }

  const message = hasTriedSaving ? (problem ?? saveError) : saveError;

  return (
    <Page>
      <NavBar title="Add card" />
      <PageBody className="flex flex-col gap-3 px-5 pt-8">
        <TextField
          label="Card number"
          value={card.number}
          onChangeText={(text) => change({ number: formatCardNumberInput(text) })}
          placeholder="1234 5678 9012 3456"
          inputMode="numeric"
          autoComplete="cc-number"
        />
        <div className="flex gap-3">
          <div className="min-w-0 flex-1">
            <TextField
              label="Expiry"
              value={card.expiry}
              onChangeText={(text) => change({ expiry: formatExpiryInput(text) })}
              placeholder="MM/YY"
              inputMode="numeric"
              autoComplete="cc-exp"
            />
          </div>
          <div className="min-w-0 flex-1">
            <TextField
              label="CVC"
              value={card.cvc}
              onChangeText={(text) => change({ cvc: text.replace(/\D/g, '').slice(0, 4) })}
              placeholder="•••"
              inputMode="numeric"
              autoComplete="cc-csc"
              type="password"
            />
          </div>
        </div>
        <TextField
          label="Name on card"
          value={card.name}
          onChangeText={(name) => change({ name })}
          autoComplete="cc-name"
          autoCapitalize="words"
        />
        {message ? (
          <p className="text-footnote text-label-secondary" aria-live="polite">
            {message}
          </p>
        ) : null}
      </PageBody>
      <FormFooter>
        <Button label="Save card" onPress={save} />
      </FormFooter>
    </Page>
  );
}
