import { useNavigate } from 'react-router';
import { Icon } from '@/components/Icon';

type Props = { title?: string; onBack?: () => void };

export function NavBar({ title, onBack }: Props) {
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
        aria-label="Back"
        className="absolute top-0 left-1 active:opacity-50"
      >
        <Icon name="back" />
      </button>
      {title ? (
        <h1 className="w-60 truncate text-center text-headline font-semibold">{title}</h1>
      ) : null}
    </div>
  );
}
