/**
 * CoachME Design System — Animation Tokens
 *
 * Reusable animation configs for react-native-reanimated.
 *
 * Usage:
 *   import { springs, durations } from '@/constants/animations';
 *   withSpring(value, springs.snappy);
 */

/** Spring animation presets for withSpring() */
export const springs = {
  /** Gentle — used for subtle transitions (fade, slide) */
  gentle: {
    damping: 20,
    stiffness: 150,
    mass: 1,
  },
  /** Snappy — used for interactive elements (buttons, chips) */
  snappy: {
    damping: 15,
    stiffness: 300,
    mass: 0.8,
  },
  /** Bouncy — used for delightful moments (tab switch, success) */
  bouncy: {
    damping: 12,
    stiffness: 200,
    mass: 0.6,
  },
  /** Stiff — used for scale press effects */
  press: {
    damping: 20,
    stiffness: 400,
    mass: 0.5,
  },
} as const;

/** Timing durations in ms for withTiming() */
export const durations = {
  fast:   150,
  normal: 250,
  slow:   400,
  slower: 600,
} as const;

/** Common easing curves */
export const easings = {
  /** Standard material easing */
  standard: { x1: 0.4, y1: 0.0, x2: 0.2, y2: 1.0 },
  /** Deceleration — entering elements */
  decelerate: { x1: 0.0, y1: 0.0, x2: 0.2, y2: 1.0 },
  /** Acceleration — exiting elements */
  accelerate: { x1: 0.4, y1: 0.0, x2: 1.0, y2: 1.0 },
} as const;

/** Stagger delay helper for list item entrance */
export const staggerDelay = (index: number, baseDelay = 50, maxDelay = 400) =>
  Math.min(index * baseDelay, maxDelay);
