// How much of the layout the on-screen keyboard has to cover before it counts as open.
const OPEN_THRESHOLD = 80;
// Safari does not always report the keyboard settling; never wait longer than this.
const MAX_WAIT_MS = 600;

const keyboardHeight = (viewport: VisualViewport) => window.innerHeight - viewport.height;

// Closes the keyboard, and calls `next` once it has gone, so the next screen does not
// appear while the keyboard is still sliding down over it.
export function hideKeyboardThen(next: () => void) {
  const viewport = window.visualViewport;
  const isOpen = viewport !== null && keyboardHeight(viewport) > OPEN_THRESHOLD;
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  if (!viewport || !isOpen) {
    next();
    return;
  }

  let isDone = false;
  function finish() {
    if (isDone || !viewport) return;
    isDone = true;
    viewport.removeEventListener('resize', settle);
    clearTimeout(timer);
    next();
  }
  function settle() {
    if (viewport && keyboardHeight(viewport) <= OPEN_THRESHOLD) finish();
  }
  viewport.addEventListener('resize', settle);
  const timer = setTimeout(finish, MAX_WAIT_MS);
}
