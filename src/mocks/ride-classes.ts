import bentleyCabin from '@/assets/cars/bentley-cabin.jpg';
import bentleyCar from '@/assets/cars/bentley-car.jpg';
import eClass from '@/assets/cars/e-class.jpg';
import escaladeCabin from '@/assets/cars/escalade-cabin.jpg';
import escaladeCar from '@/assets/cars/escalade-car.jpg';
import ghostCabin from '@/assets/cars/ghost-cabin.jpg';
import ghostCar from '@/assets/cars/ghost-car.jpg';
import maybachCabin from '@/assets/cars/maybach-cabin.jpg';
import maybachCar from '@/assets/cars/maybach-car.jpg';

// The two services on Home: Business sends the nearest car that meets the standard;
// Premium lets the rider pick one particular car.
export type ServiceId = 'premium' | 'business';

export const serviceNames: Record<ServiceId, string> = { premium: 'Premium', business: 'Business' };

export type PremiumCar = {
  id: string;
  name: string;
  // How the order button names it: "Order the Maybach".
  shortName: string;
  details: string;
  carImage: string;
  cabinImage: string;
  priceEur: number;
  etaMinutes: number;
};

export const premiumCars: readonly PremiumCar[] = [
  {
    id: 'maybach',
    name: 'Mercedes-Maybach S 680',
    shortName: 'Maybach',
    details: 'Obsidian black, 2024',
    carImage: maybachCar,
    cabinImage: maybachCabin,
    priceEur: 120,
    etaMinutes: 40,
  },
  {
    id: 'bentley',
    name: 'Bentley Flying Spur',
    shortName: 'Bentley',
    details: 'Racing green, 2023',
    carImage: bentleyCar,
    cabinImage: bentleyCabin,
    priceEur: 140,
    etaMinutes: 25,
  },
  {
    id: 'ghost',
    name: 'Rolls-Royce Ghost',
    shortName: 'Ghost',
    details: 'Silver and black, 2023',
    carImage: ghostCar,
    cabinImage: ghostCabin,
    priceEur: 180,
    etaMinutes: 55,
  },
  {
    id: 'escalade',
    name: 'Cadillac Escalade',
    shortName: 'Escalade',
    details: 'Black, 2023, 6 seats',
    carImage: escaladeCar,
    cabinImage: escaladeCabin,
    priceEur: 110,
    etaMinutes: 15,
  },
];

export const business = {
  name: 'Business',
  car: 'Mercedes E‑Class',
  model: 'E‑Class',
  image: eClass,
  // The fare never drops below the minimum, which is what Home quotes.
  minimumFareEur: 35,
  baseFareEur: 20,
  perKmEur: 4,
  etaMinutes: 4,
  // Short, so they fit beside the photo.
  standards: [
    { icon: 'shield', text: 'E‑Class or similar' },
    { icon: 'clock', text: 'Under 3 years old' },
    { icon: 'luggage', text: '3 seats, 2 bags' },
    { icon: 'person', text: 'Chauffeur in a suit' },
  ],
} as const;

export const drivers = [
  { name: 'Tomas', plate: 'LTR 482', rating: 4.97 },
  { name: 'Rūta', plate: 'KMN 219', rating: 4.95 },
  { name: 'Mantas', plate: 'HBT 730', rating: 4.98 },
] as const;
