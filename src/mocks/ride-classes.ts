import carBusiness from '@/assets/car-business.png';
import carComfort from '@/assets/car-comfort.png';

export type RideClassId = 'comfort' | 'business';

export type RideClass = {
  id: RideClassId;
  name: string;
  car: string;
  seats: number;
  image: string;
  baseFareEur: number;
  perKmEur: number;
  etaMinutes: number;
};

export const rideClasses: readonly RideClass[] = [
  {
    id: 'comfort',
    name: 'Comfort',
    car: 'Mercedes E‑Class',
    seats: 3,
    image: carComfort,
    baseFareEur: 22,
    perKmEur: 4,
    etaMinutes: 3,
  },
  {
    id: 'business',
    name: 'Business',
    car: 'Bentley Flying Spur',
    seats: 3,
    image: carBusiness,
    baseFareEur: 40,
    perKmEur: 7.5,
    etaMinutes: 4,
  },
];

export const drivers = [
  { name: 'Tomas', plate: 'LTR 482', rating: 4.97 },
  { name: 'Rūta', plate: 'KMN 219', rating: 4.95 },
  { name: 'Mantas', plate: 'HBT 730', rating: 4.98 },
] as const;
