import type { CardBrand } from '@/mocks/profile';

export function cardDigits(input: string) {
  return input.replace(/\D/g, '');
}

export function cardBrand(input: string): CardBrand {
  const digits = cardDigits(input);
  if (digits.startsWith('4')) return 'visa';
  if (/^3[47]/.test(digits)) return 'amex';
  return 'card';
}

export function isValidCardNumber(input: string) {
  const digits = cardDigits(input);
  if (digits.length < 12 || digits.length > 19) return false;

  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let digit = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

export function isValidExpiry(input: string, now = new Date()) {
  const match = /^(\d{2})\/(\d{2})$/.exec(input);
  if (!match) return false;

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;

  const endOfMonth = new Date(year, month, 1);
  return endOfMonth > now;
}

export function isValidCvc(input: string) {
  return /^\d{3,4}$/.test(input);
}
