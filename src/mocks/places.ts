// [longitude, latitude], the order Mapbox uses.
export type Coord = readonly [number, number];

export type PlaceKind = 'home' | 'work' | 'airport' | 'place' | 'recent';

export type Place = {
  id: string;
  name: string;
  address: string;
  coord: Coord;
  kind: PlaceKind;
};

export const currentLocation: Place = {
  id: 'kempinski',
  name: 'Kempinski Cathedral Square',
  address: 'Universiteto g. 14, 01122',
  coord: [25.2859, 54.6848],
  kind: 'place',
};

export const savedPlaces: readonly Place[] = [
  {
    id: 'home',
    name: 'Home',
    address: 'Pilies g. 12, 01403',
    coord: [25.2896, 54.6836],
    kind: 'home',
  },
  {
    id: 'work',
    name: 'Work',
    address: 'Konstitucijos pr. 21, 08105',
    coord: [25.2712, 54.6983],
    kind: 'work',
  },
  {
    id: 'airport',
    name: 'Vilnius Airport',
    address: 'Rodūnios kl. 10A, 02187',
    coord: [25.2855, 54.6356],
    kind: 'airport',
  },
];

export const recentPlaces: readonly Place[] = [
  {
    id: 'astorija',
    name: 'Radisson Collection Astorija',
    address: 'Didžioji g. 35, 01128',
    coord: [25.2874, 54.6774],
    kind: 'recent',
  },
  {
    id: 'stikliai',
    name: 'Stikliai Hotel',
    address: 'Gaono g. 7, 01131',
    coord: [25.2863, 54.6807],
    kind: 'recent',
  },
  {
    id: 'tv-tower',
    name: 'Vilnius TV Tower',
    address: 'Sausio 13-osios g. 10, 04347',
    coord: [25.2147, 54.6871],
    kind: 'recent',
  },
];

// Searched before Mapbox, so these always come first and still answer offline.
export const knownPlaces: readonly Place[] = [
  currentLocation,
  {
    id: 'cathedral',
    name: 'Vilnius Cathedral',
    address: 'Katedros a. 2, 01143',
    coord: [25.2879, 54.6859],
    kind: 'place',
  },
  {
    id: 'town-hall',
    name: 'Town Hall Square',
    address: 'Rotušės a., 01128',
    coord: [25.2873, 54.6787],
    kind: 'place',
  },
  {
    id: 'gates-of-dawn',
    name: 'Gates of Dawn',
    address: 'Aušros Vartų g. 14, 01303',
    coord: [25.2897, 54.6749],
    kind: 'place',
  },
  {
    id: 'railway-station',
    name: 'Vilnius Railway Station',
    address: 'Geležinkelio g. 16, 02100',
    coord: [25.2844, 54.6703],
    kind: 'place',
  },
  {
    id: 'europa-tower',
    name: 'Europa Tower',
    address: 'Konstitucijos pr. 7A, 09308',
    coord: [25.278, 54.696],
    kind: 'place',
  },
  {
    id: 'lukiskes',
    name: 'Lukiškės Square',
    address: 'Gedimino pr., 01107',
    coord: [25.2709, 54.6895],
    kind: 'place',
  },
  {
    id: 'uzupis',
    name: 'Užupis',
    address: 'Užupio g., 01200',
    coord: [25.2985, 54.6811],
    kind: 'place',
  },
  {
    id: 'vingis-park',
    name: 'Vingis Park',
    address: 'M. K. Čiurlionio g. 100, 03100',
    coord: [25.2391, 54.6836],
    kind: 'place',
  },
  {
    id: 'akropolis',
    name: 'Akropolis Vilnius',
    address: 'Ozo g. 25, 07150',
    coord: [25.2627, 54.7103],
    kind: 'place',
  },
  ...savedPlaces,
  ...recentPlaces,
];
