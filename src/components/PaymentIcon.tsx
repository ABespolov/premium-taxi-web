import { Icon } from '@/components/Icon';
import type { CardBrand } from '@/mocks/profile';

// The 32×22 card marks from Figma; a card we have no mark for gets the wallet glyph.
export function PaymentIcon({ brand }: { brand: CardBrand }) {
  if (brand === 'apple-pay') {
    return (
      <span className="flex h-[22px] w-8 items-center justify-center rounded bg-brand-apple-pay text-[10px] font-semibold tracking-[-0.2px] text-white">
        Pay
      </span>
    );
  }
  if (brand === 'visa') {
    return (
      <span className="flex h-[22px] w-8 items-center justify-center rounded border border-separator bg-white text-[10px] font-bold tracking-[0.2px] text-brand-visa italic">
        VISA
      </span>
    );
  }
  if (brand === 'amex') {
    return (
      <span className="flex h-[22px] w-8 items-center justify-center rounded bg-brand-amex text-[8px] font-black tracking-[0.32px] text-white">
        AMEX
      </span>
    );
  }
  return <Icon name="wallet" />;
}
