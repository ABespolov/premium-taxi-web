import { motion } from 'motion/react';
import { Icon, type IconName } from '@/components/Icon';

type Props = { icon: IconName; label: string; onPress: () => void };

// The round white control floating over the map: account, back, recenter. It fades in with
// its step.
export function FloatingButton({ icon, label, onPress }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      aria-label={label}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22 }}
      className="pointer-events-auto flex size-11 items-center justify-center rounded-full bg-background-secondary shadow-floating active:opacity-70"
    >
      <Icon name={icon} />
    </motion.button>
  );
}
