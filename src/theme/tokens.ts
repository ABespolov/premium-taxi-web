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
