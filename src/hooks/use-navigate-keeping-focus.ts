import { useNavigate } from 'react-router';

// Moves to the next sign-in step and puts the caret in its field within the same tap. A
// phone keeps its keyboard up only for a focus made during a tap, so the next page is drawn
// at once and focused before the tap ends; the page slides in without the browser scrolling
// to the field.
export function useNavigateKeepingFocus() {
  const navigate = useNavigate();
  return (to: string) => {
    navigate(to, { flushSync: true });
    const fields = document.querySelectorAll<HTMLInputElement>('[data-carry-focus]');
    const next = fields[fields.length - 1];
    if (next && next !== document.activeElement) next.focus({ preventScroll: true });
  };
}
