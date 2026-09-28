// Mirrors the Figma variables. The same values drive the Tailwind theme in index.css; these
// are for the few places that paint outside CSS classes, such as the map.
export const colors = {
  label: { primary: '#0A0A0B', secondary: '#5E5E63', tertiary: '#9B9BA1' },
  background: { primary: '#FFFFFF', secondary: '#FFFFFF', tertiary: '#F2F2F2' },
  separator: '#EBEBEB',
  accent: '#8A6A3B',
};

// Warms Mapbox Light towards the beige of the Figma map.
export const mapColors = { land: '#EDEAE3', water: '#C9CED1', park: '#E1E3D5' };

// Space under a sheet or a bottom button: 8px above the home indicator, as in Figma, and
// never less than 24px where there is none, such as a desktop browser.
export const BOTTOM_INSET = 'max(calc(env(safe-area-inset-bottom) + 8px), 24px)';
