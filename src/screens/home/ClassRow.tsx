import type { Quote } from '@/api/rides';
import { Icon } from '@/components/Icon';
import type { RideClassId } from '@/mocks/ride-classes';
import { formatMinutes, formatPriceEur } from '@/utils/format';

// Each render is cropped into its 88×44 slot the way the Figma component frames it.
const CAR_CROP: Record<RideClassId, { width: number; height: number; left: number; top: number }> =
  {
    comfort: { width: 138, height: 79, left: -25.5, top: -21.6 },
    business: { width: 132.5, height: 75.7, left: -21.5, top: -19.3 },
  };

type Props = { quote: Quote; isSelected: boolean; onSelect: (id: RideClassId) => void };

// Figma's Class Row: the selected class is the one the primary button books.
export function ClassRow({ quote, isSelected, onSelect }: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => onSelect(quote.rideClassId)}
      className={`flex h-[72px] w-full items-center gap-3 rounded-[14px] border-[1.5px] bg-background-secondary pr-[14.5px] pl-[6.5px] text-left ${isSelected ? 'border-label-primary' : 'border-background-secondary active:opacity-60'}`}
    >
      <span className="relative h-11 w-[88px] shrink-0 overflow-hidden">
        <img
          src={quote.image}
          alt=""
          draggable={false}
          className="absolute max-w-none object-cover"
          style={CAR_CROP[quote.rideClassId]}
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-1.5">
          <span className="text-headline font-semibold">{quote.name}</span>
          <Icon name="seats" />
          <span className="text-footnote text-label-secondary">{quote.seats}</span>
        </span>
        <span className="truncate text-footnote text-label-secondary">
          {quote.car} · {formatMinutes(quote.etaMinutes)}
        </span>
      </span>
      <span className="text-headline font-semibold">{formatPriceEur(quote.priceEur)}</span>
    </button>
  );
}
