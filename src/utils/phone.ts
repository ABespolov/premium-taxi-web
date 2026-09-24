export function phoneDigits(input: string) {
  return input.replace(/\D/g, '');
}

export function isValidPhone(input: string) {
  const digits = phoneDigits(input);
  return digits.length >= 8 && digits.length <= 15;
}
