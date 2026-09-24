import { useNavigate } from 'react-router';
import hero from '@/assets/hero.png';
import { Button } from '@/components/Button';

const HERO_FADE =
  'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 60%, #FFFFFF 100%)';

// The photo takes whatever height the copy and button leave; on the 874px frame that is 604.
export function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col bg-background-primary">
      <div className="relative min-h-0 flex-1">
        <img
          src={hero}
          alt="A black Mercedes waiting outside a hotel"
          className="absolute inset-0 size-full object-cover"
          draggable={false}
        />
        {/* Figma runs the fade 2px past the photo's bottom edge. */}
        <div
          className="absolute inset-x-0 -bottom-0.5 h-[120px]"
          style={{ backgroundImage: HERO_FADE }}
          aria-hidden
        />
      </div>
      <div
        className="relative flex flex-col gap-[30px] px-5 pt-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
      >
        <div className="flex flex-col gap-2.5">
          <h1 className="font-serif text-large-title">Premium rides, without the wait</h1>
          <p className="text-subheadline text-label-secondary">
            Business‑class cars and professional drivers. Book now or plan ahead.
          </p>
        </div>
        <Button label="Continue" onPress={() => navigate('/phone')} />
      </div>
    </div>
  );
}
