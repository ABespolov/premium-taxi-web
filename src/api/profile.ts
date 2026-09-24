import { signOutRides } from '@/api/rides';
import {
  defaultPaymentMethodId,
  paymentMethods as initialPaymentMethods,
  preferences as initialPreferences,
  profile as initialProfile,
  type PaymentMethod,
  type Preferences,
} from '@/mocks/profile';
import { cardBrand, cardDigits } from '@/utils/card';

const BRAND_LABELS = {
  visa: 'Visa',
  amex: 'Amex',
  card: 'Card',
  'apple-pay': 'Apple Pay',
} as const;

let profile = { ...initialProfile, phone: '' };
let paymentMethods = initialPaymentMethods;
let defaultMethodId = defaultPaymentMethodId;
let preferences = initialPreferences;

export function getProfile() {
  return profile;
}

export function saveProfile(changes: { firstName?: string; lastName?: string; phone?: string }) {
  const firstName = changes.firstName?.trim();
  if (changes.firstName !== undefined && !firstName) throw new Error('Enter your first name');
  profile = {
    ...profile,
    ...changes,
    firstName: firstName ?? profile.firstName,
    lastName: changes.lastName?.trim() ?? profile.lastName,
  };
  return profile;
}

export function getWallet() {
  return { methods: paymentMethods, defaultMethodId };
}

export function setDefaultPaymentMethod(methodId: string) {
  if (!paymentMethods.some((method) => method.id === methodId)) {
    throw new Error('That payment method was removed');
  }
  defaultMethodId = methodId;
}

export function addCard(cardNumber: string) {
  const brand = cardBrand(cardNumber);
  const method: PaymentMethod = {
    id: `card-${Date.now()}`,
    brand,
    label: `${BRAND_LABELS[brand]} •• ${cardDigits(cardNumber).slice(-4)}`,
  };
  paymentMethods = [...paymentMethods, method];
  defaultMethodId = method.id;
  return method;
}

export function getPreferences() {
  return preferences;
}

export function savePreferences(next: Preferences) {
  preferences = next;
  return preferences;
}

export function signOut() {
  profile = { ...initialProfile, phone: '' };
  paymentMethods = initialPaymentMethods;
  defaultMethodId = defaultPaymentMethodId;
  preferences = initialPreferences;
  signOutRides();
}
