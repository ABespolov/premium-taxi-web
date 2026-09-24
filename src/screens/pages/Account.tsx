import { useNavigate } from 'react-router';
import { getProfile, signOut } from '@/api/profile';
import { Icon, type IconName } from '@/components/Icon';
import { NavBar } from '@/components/NavBar';
import { Page } from '@/components/Page';
import { useBooking } from '@/hooks/use-booking';
import { initials } from '@/utils/format';

export function Account() {
  const navigate = useNavigate();
  const profile = getProfile();
  const { reset } = useBooking();

  function leave() {
    signOut();
    reset();
    navigate('/', { replace: true });
  }

  return (
    <Page>
      <NavBar />
      <div className="flex flex-col gap-5 px-5 pt-8">
        <div className="flex items-center gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="font-serif text-title1">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="text-subheadline text-label-secondary">★ {profile.rating.toFixed(2)}</p>
          </div>
          <div className="flex size-16 items-center justify-center rounded-full bg-background-tertiary text-title3 font-semibold">
            {initials(profile.firstName, profile.lastName)}
          </div>
        </div>
        <div className="flex gap-2.5">
          <Shortcut icon="clock" label="Trips" onPress={() => navigate('/trips')} />
          <Shortcut icon="wallet" label="Wallet" onPress={() => navigate('/wallet')} />
          <Shortcut icon="help" label="Help" />
        </div>
        <button
          type="button"
          onClick={leave}
          className="flex h-12 items-center rounded-[14px] bg-background-tertiary px-4 text-body active:opacity-60"
        >
          Sign out
        </button>
      </div>
    </Page>
  );
}

type ShortcutProps = { icon: IconName; label: string; onPress?: () => void };

function Shortcut({ icon, label, onPress }: ShortcutProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={!onPress}
      className="flex flex-1 flex-col items-start gap-2.5 rounded-[14px] bg-background-tertiary py-3.5 pl-3.5 enabled:active:opacity-60"
    >
      <Icon name={icon} />
      <span className="text-subheadline font-semibold">{label}</span>
    </button>
  );
}
