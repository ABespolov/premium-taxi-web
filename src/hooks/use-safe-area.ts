import { useState } from 'react';

// The browser's safe-area insets in pixels, for layout done in script (the map's padding).
// CSS uses env() directly.
function measure() {
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)';
  document.body.appendChild(probe);
  const style = getComputedStyle(probe);
  const insets = { top: parseFloat(style.paddingTop), bottom: parseFloat(style.paddingBottom) };
  probe.remove();
  return insets;
}

export function useSafeArea() {
  const [insets] = useState(measure);
  return insets;
}
