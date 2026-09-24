import { useEffect, useState } from 'react';

// The part of the page a phone browser actually shows: it shrinks when the keyboard opens.
export function useVisualViewport() {
  const [viewport, setViewport] = useState(() => ({
    height: window.visualViewport?.height ?? window.innerHeight,
    keyboardHeight: 0,
  }));

  useEffect(() => {
    const visual = window.visualViewport;
    if (!visual) return;
    function measure() {
      if (!visual) return;
      setViewport({
        height: visual.height,
        keyboardHeight: Math.max(0, window.innerHeight - visual.height),
      });
      // Safari scrolls the page up under the keyboard; the app already fits, so undo it.
      window.scrollTo(0, 0);
    }
    visual.addEventListener('resize', measure);
    visual.addEventListener('scroll', measure);
    return () => {
      visual.removeEventListener('resize', measure);
      visual.removeEventListener('scroll', measure);
    };
  }, []);

  return viewport;
}
