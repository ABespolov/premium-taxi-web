import { isValidPhone } from '@/utils/phone';

export function requestCode(phone: string) {
  if (!isValidPhone(phone)) throw new Error('Enter a valid phone number');
}

// Any complete six-digit code is accepted: there is no SMS behind the demo.
export function verifyCode(code: string) {
  if (!/^\d{6}$/.test(code)) throw new Error('Enter the six‑digit code');
}
