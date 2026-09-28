import { useNavigate } from 'react-router';
import { Icon } from '@/components/Icon';

// `close` is for a page that slid in as a menu: an X rather than a back arrow.
type Props = { title?: string; onBack?: () => void; kind?: 'back' | 'close' };

export function NavBar({ title, onBack, kind = 'back' }: Props) {
  const navigate = useNavigate();

  function goBack() {
    if (onBack) {
      onBack();
      return;
    }
    navigate(-1);
  }

  return (
    <div className="relative flex h-11 shrink-0 items-center justify-center">
      <button
        type="button"
        onClick={goBack}
        aria-label={kind === 'close' ? 'Close' : 'Back'}
        className="absolute top-0 left-1 active:opacity-50"
      >
        <Icon name={kind} />
      </button>
      {title ? (
        <h1 className="w-60 truncate text-center text-headline font-semibold">{title}</h1>
      ) : null}
    </div>
  );
}
