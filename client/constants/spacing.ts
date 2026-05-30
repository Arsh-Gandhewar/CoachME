/**
 * CoachME Design System — Spacing & Layout Tokens
 *
 * Provides consistent spacing, border radius, and layout values.
 * Replaces the ad-hoc padding/margin values across screens.
 *
 * Usage:
 *   import { spacing, radius, layout } from '@/constants/spacing';
 */

/** Spacing scale (4px base) */
export const spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

/** Border radius scale */
export const radius = {
  xs:   6,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  full: 999,
} as const;

/** Layout constants */
export const layout = {
  /** Standard horizontal screen padding */
  screenPadding: 20,
  /** Bottom tab bar height */
  tabBarHeight: 72,
  /** Minimum touch target size (accessibility) */
  minTouchTarget: 44,
  /** Card padding */
  cardPadding: 16,
  /** Section gap between major sections */
  sectionGap: 28,
} as const;

/** Touch target hit slop presets */
export const hitSlop = {
  small: { top: 8, right: 8, bottom: 8, left: 8 },
  medium: { top: 12, right: 12, bottom: 12, left: 12 },
  large: { top: 16, right: 16, bottom: 16, left: 16 },
} as const;
