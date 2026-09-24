import type { PlaceKind } from '@/mocks/places';

const sources = import.meta.glob<string>('../assets/*.svg', {
  eager: true,
  import: 'default',
  query: '?url',
});

const source = (file: string) => sources[`../assets/${file}.svg`];

// Glyphs exported from the Figma file, drawn at their frame size unless told otherwise.
const icons = {
  back: { file: 'back', width: 44, height: 44 },
  'center-pin': { file: 'center-pin', width: 40, height: 64 },
  'chevron-left': { file: 'chevron-left', width: 20, height: 20 },
  'chevron-right': { file: 'chevron-right', width: 14, height: 14 },
  clear: { file: 'clear', width: 32, height: 44 },
  clock: { file: 'clock', width: 20, height: 20 },
  'clock-large': { file: 'clock-large', width: 26, height: 26 },
  help: { file: 'help', width: 20, height: 20 },
  home: { file: 'home', width: 20, height: 20 },
  'map-pin': { file: 'map-pin', width: 20, height: 20 },
  person: { file: 'person', width: 20, height: 20 },
  'pickup-dot': { file: 'pickup-dot', width: 12, height: 12 },
  place: { file: 'place', width: 20, height: 20 },
  plane: { file: 'plane', width: 20, height: 20 },
  plus: { file: 'plus', width: 20, height: 20 },
  recent: { file: 'recent', width: 20, height: 20 },
  recenter: { file: 'recenter', width: 20, height: 20 },
  'remove-stop': { file: 'remove-stop', width: 32, height: 44 },
  search: { file: 'search', width: 20, height: 20 },
  seats: { file: 'seats', width: 12, height: 12 },
  shield: { file: 'shield', width: 20, height: 20 },
  'stop-dot': { file: 'stop-dot', width: 12, height: 12 },
  'summary-dropoff': { file: 'summary-dropoff', width: 12, height: 12 },
  'summary-pickup': { file: 'summary-pickup', width: 12, height: 12 },
  swap: { file: 'swap', width: 20, height: 20 },
  wallet: { file: 'wallet', width: 20, height: 20 },
  work: { file: 'work', width: 20, height: 20 },
} as const;

export type IconName = keyof typeof icons;

export const placeIcons: Record<PlaceKind, IconName> = {
  home: 'home',
  work: 'work',
  airport: 'plane',
  place: 'place',
  recent: 'recent',
};

type Props = { name: IconName; size?: number };

export function Icon({ name, size }: Props) {
  const icon = icons[name];
  return (
    <img
      src={source(icon.file)}
      width={size ?? icon.width}
      height={size ?? icon.height}
      alt=""
      aria-hidden
      draggable={false}
      className="block shrink-0"
    />
  );
}
