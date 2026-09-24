import { motion } from 'motion/react';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { useBooking } from '@/hooks/use-booking';
import { WHEEL_ROW_HEIGHT, Wheel } from '@/screens/home/Wheel';
import { formatDay } from '@/utils/format';

const DAYS_AHEAD = 30;
const MINUTE_STEP = 15;
const MIN_LEAD_MINUTES = 30;
const DEFAULT_LEAD_MINUTES = 60;
const DAY_COLUMN_WIDTH = 186;
const HOUR_COLUMN_WIDTH = 60;
const MINUTE_COLUMN_WIDTH = 76;

const HOURS = Array.from({ length: 24 }, (_, hour) => String(hour));
const MINUTES = Array.from({ length: 60 / MINUTE_STEP }, (_, index) =>
  String(index * MINUTE_STEP).padStart(2, '0'),
);

// Days are counted on the rider's local calendar, so a pickup is always a local wall-clock time.
function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function dayAt(offset: number) {
  const today = startOfToday();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
}

function pickupAt(selection: Selection) {
  const day = dayAt(selection.dayIndex);
  return new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    selection.hourIndex,
    selection.minuteIndex * MINUTE_STEP,
  );
}

type Selection = { dayIndex: number; hourIndex: number; minuteIndex: number };

function selectionFor(date: Date): Selection {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayIndex = Math.round((day.getTime() - startOfToday().getTime()) / 86_400_000);
  return {
    dayIndex: Math.min(DAYS_AHEAD - 1, Math.max(0, dayIndex)),
    hourIndex: date.getHours(),
    minuteIndex: Math.floor(date.getMinutes() / MINUTE_STEP),
  };
}

function defaultPickup() {
  const soon = new Date(Date.now() + (DEFAULT_LEAD_MINUTES + MINUTE_STEP) * 60_000);
  soon.setMinutes(Math.floor(soon.getMinutes() / MINUTE_STEP) * MINUTE_STEP, 0, 0);
  return soon;
}

const DAY_LABELS = Array.from({ length: DAYS_AHEAD }, (_, offset) => formatDay(dayAt(offset)));

const SLIDE = { type: 'tween', ease: [0.32, 0.72, 0, 1], duration: 0.4 } as const;

// Figma's Schedule sheet, raised over the map with a scrim; a tap on the scrim closes it.
export function ScheduleSheet({ onClose }: { onClose: () => void }) {
  const { booking, update } = useBooking();
  const [selection, setSelection] = useState(() =>
    selectionFor(booking.scheduledAt ?? defaultPickup()),
  );

  const pickup = pickupAt(selection);
  const isTooSoon = pickup.getTime() < Date.now() + MIN_LEAD_MINUTES * 60_000;

  function confirm() {
    update({ scheduledAt: pickup });
    onClose();
  }

  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-end">
      <motion.button
        type="button"
        aria-label="Close"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-scrim"
      />
      <motion.div
        role="dialog"
        aria-label="Schedule a ride"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={SLIDE}
        className="relative flex flex-col gap-5 rounded-t-[20px] bg-background-secondary px-5 pt-9"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
      >
        <div className="absolute top-[11px] left-1/2 h-[5px] w-9 -translate-x-1/2 rounded-[3px] bg-label-tertiary" />
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-title2">Schedule a ride</h2>
          <p className="text-subheadline text-label-secondary">Up to 30 days ahead</p>
        </div>
        <div className="relative flex items-center" style={{ height: WHEEL_ROW_HEIGHT * 5 }}>
          <div
            className="absolute inset-x-0 h-10 rounded-[10px] bg-background-tertiary"
            style={{ top: WHEEL_ROW_HEIGHT * 2 - 2 }}
            aria-hidden
          />
          <div className="relative flex items-center">
            <Wheel
              labels={DAY_LABELS}
              selectedIndex={selection.dayIndex}
              onChange={(dayIndex) => setSelection((current) => ({ ...current, dayIndex }))}
              width={DAY_COLUMN_WIDTH}
              label="Day"
            />
            <Wheel
              labels={HOURS}
              selectedIndex={selection.hourIndex}
              onChange={(hourIndex) => setSelection((current) => ({ ...current, hourIndex }))}
              align="right"
              width={HOUR_COLUMN_WIDTH}
              label="Hour"
            />
            <span className="w-5 text-center text-title3 font-semibold">:</span>
            <Wheel
              labels={MINUTES}
              selectedIndex={selection.minuteIndex}
              onChange={(minuteIndex) => setSelection((current) => ({ ...current, minuteIndex }))}
              width={MINUTE_COLUMN_WIDTH}
              label="Minutes"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="shield" />
          <p className="flex-1 text-subheadline">
            {isTooSoon
              ? `Pick a time at least ${MIN_LEAD_MINUTES} minutes from now`
              : 'Free cancellation up to 1 hour before pickup'}
          </p>
        </div>
        <Button label="Set pickup time" onPress={confirm} isDisabled={isTooSoon} />
      </motion.div>
    </div>
  );
}
