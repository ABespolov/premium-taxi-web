export const profile = {
  firstName: 'Claire',
  lastName: 'Laurent',
  rating: 4.92,
};

export type CardBrand = 'apple-pay' | 'visa' | 'amex' | 'card';

export type PaymentMethod = { id: string; brand: CardBrand; label: string };

export const paymentMethods: readonly PaymentMethod[] = [
  { id: 'apple-pay', brand: 'apple-pay', label: 'Apple Pay' },
  { id: 'visa', brand: 'visa', label: 'Visa •• 4242' },
  { id: 'amex', brand: 'amex', label: 'Amex •• 1005' },
];

export const defaultPaymentMethodId = 'visa';

export const conversationOptions = ['Quiet', 'Happy to chat', 'Any'] as const;
export const temperatureOptions = ['Cool', 'Any', 'Warm'] as const;
export const musicOptions = ['No music', 'Driver’s choice'] as const;

export type Preferences = {
  conversation: (typeof conversationOptions)[number];
  temperature: (typeof temperatureOptions)[number];
  music: (typeof musicOptions)[number];
  helpWithLuggage: boolean;
  openDoor: boolean;
  note: string;
};

export const preferences: Preferences = {
  conversation: 'Quiet',
  temperature: 'Any',
  music: 'No music',
  helpWithLuggage: true,
  openDoor: true,
  note: 'I’ll wait at the main entrance',
};
