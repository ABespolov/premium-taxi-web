const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export function formatPriceEur(priceEur: number) {
  return `€${Math.round(priceEur)}`;
}

export function formatDistanceKm(distanceKm: number) {
  return `${distanceKm.toFixed(1)} km`;
}

export function formatMinutes(minutes: number) {
  return `${Math.max(1, Math.round(minutes))} min`;
}

export function formatClock(date: Date) {
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function formatDay(date: Date) {
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function formatPickupTime(date: Date) {
  return `${WEEKDAYS[date.getDay()]} ${formatClock(date)}`;
}

export function formatCountdown(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

// Keeps what the rider typed readable: a leading plus, then digits grouped as they were spaced.
export function formatPhoneInput(input: string) {
  const cleaned = input
    .replace(/[^\d ]/g, '')
    .replace(/ {2,}/g, ' ')
    .trimStart();
  return `+${cleaned}`;
}

export function formatCardNumberInput(input: string) {
  const digits = input.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatExpiryInput(input: string) {
  const digits = input.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
